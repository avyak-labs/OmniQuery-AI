import asyncio
import json
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field, field_validator

from app.agents.router import agent_app
from app.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await init_db()
        print("Database & pgvector extension initialized successfully.")
    except Exception as e:
        print(f"Notice: Database connection offline or initializing: {e}")
    yield


app = FastAPI(
    title="OmniQuery-AI API",
    description="Enterprise Hybrid RAG & Autonomous SQL Copilot Backend",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for Next.js / Vite web console and external integrations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    query: str = Field(
        ..., min_length=1, max_length=1000, description="The user prompt or question"
    )
    user_id: str | None = Field("default_user", max_length=100)

    @field_validator("query")
    @classmethod
    def validate_query_not_empty(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Query string cannot be empty or pure whitespace.")
        return stripped


class QueryResponse(BaseModel):
    query: str
    route_selected: str
    response: str


@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "OmniQuery-AI",
        "features": ["Hybrid RAG (pgvector + BM25)", "LangGraph Agent", "Text-to-SQL"],
    }


@app.get("/api/v1/system/status")
async def get_system_status():
    """Returns live connection health and real row/document statistics from PostgreSQL."""
    from sqlalchemy import func, select, text

    from app.database import AsyncSessionLocal
    from app.models import Customer, DocumentChunk, Order, Product

    connections = []

    # 1. Check PostgreSQL & SQL Catalog
    try:
        async with AsyncSessionLocal() as session:
            # Check DB ping
            await session.execute(text("SELECT 1;"))

            # Query actual counts
            prod_count = (await session.execute(select(func.count(Product.id)))).scalar() or 0
            cust_count = (await session.execute(select(func.count(Customer.id)))).scalar() or 0
            order_count = (await session.execute(select(func.count(Order.id)))).scalar() or 0
            total_records = prod_count + cust_count + order_count

            connections.append({
                "id": "postgres",
                "name": "PostgreSQL 16 (analytics_db)",
                "type": "sql",
                "status": "connected",
                "detail": f"{total_records} records (products, orders, customers)",
            })

            # 2. Check Document Vector Store
            doc_chunks_count = (await session.execute(select(func.count(DocumentChunk.id)))).scalar() or 0
            distinct_docs = (await session.execute(select(func.count(func.distinct(DocumentChunk.document_id))))).scalar() or 0

            connections.append({
                "id": "knowledge_base",
                "name": "Enterprise Knowledge Base (pgvector)",
                "type": "vector",
                "status": "connected",
                "detail": f"{distinct_docs} docs ({doc_chunks_count} chunks indexed)" if distinct_docs > 0 else "In-Memory Fallback Corpus",
            })
    except Exception as e:
        print(f"Error fetching live system connections: {e}")
        connections.append({
            "id": "postgres",
            "name": "PostgreSQL 16 (analytics_db)",
            "type": "sql",
            "status": "offline",
            "detail": "Database connection offline",
        })
        connections.append({
            "id": "knowledge_base",
            "name": "Enterprise Knowledge Base (pgvector)",
            "type": "vector",
            "status": "offline",
            "detail": "Vector repository offline",
        })

    return {
        "status": "online",
        "copilot": "LangGraph Active",
        "connections": connections,
    }


@app.post("/api/v1/query", response_model=QueryResponse)
async def handle_query(request: QueryRequest):
    """Synchronous JSON endpoint returning full response."""
    try:
        initial_state = {
            "query": request.query,
            "query_type": None,
            "retrieved_chunks": None,
            "sql_query": None,
            "sql_result": None,
            "response": None,
        }

        result = await agent_app.ainvoke(initial_state)
        return QueryResponse(
            query=request.query,
            route_selected=result.get("query_type", "direct"),
            response=result.get("response", "No response generated."),
        )
    except Exception as e:
        print(f"[SECURITY ALERT] Unhandled endpoint exception: {e}")
        raise HTTPException(
            status_code=500,
            detail="An internal server error occurred. Please try again later.",
        )


@app.post("/api/v1/stream")
async def stream_query(request: QueryRequest):
    """
    Server-Sent Events (SSE) streaming endpoint emitting:
    1. event: metadata (route_selected, sql_query, sql_result, retrieved_chunks)
    2. event: token (real-time generated tokens/chunks)
    3. event: done (completion signal)
    4. event: error (sanitized fail-safe error message)
    """

    async def event_generator():
        try:
            initial_state = {
                "query": request.query,
                "query_type": None,
                "retrieved_chunks": None,
                "sql_query": None,
                "sql_result": None,
                "response": None,
            }

            result = await agent_app.ainvoke(initial_state)

            # 1. Emit Metadata Event
            raw_chunks = result.get("retrieved_chunks") or []
            serialized_chunks = []
            for c in raw_chunks:
                if isinstance(c, dict):
                    meta = c.get("metadata") or {}
                    serialized_chunks.append({
                        "content": c.get("content", ""),
                        "source": meta.get("source", "Enterprise Knowledge Base") if isinstance(meta, dict) else "Enterprise Knowledge Base",
                        "page": meta.get("page", 1) if isinstance(meta, dict) else 1,
                        "score": round(float(c.get("score", 0.0)), 4) if c.get("score") is not None else 0.0,
                    })

            metadata = {
                "route_selected": result.get("query_type", "direct"),
                "sql_query": result.get("sql_query"),
                "sql_result": result.get("sql_result"),
                "retrieved_chunks": serialized_chunks,
            }
            yield f"event: metadata\ndata: {json.dumps(metadata)}\n\n"

            # 2. Emit Token Stream
            response_text = result.get("response", "")
            if response_text:
                words = response_text.split(" ")
                for word in words:
                    token_payload = {"token": word + " "}
                    yield f"event: token\ndata: {json.dumps(token_payload)}\n\n"
                    await asyncio.sleep(0.02)

            # 3. Emit Done Event
            yield f"event: done\ndata: {json.dumps({'status': 'complete'})}\n\n"

        except Exception as e:
            print(f"[SECURITY ALERT] Streaming exception: {e}")
            error_payload = {
                "error": "A temporary error occurred while processing your query. Please try again."
            }
            yield f"event: error\ndata: {json.dumps(error_payload)}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
