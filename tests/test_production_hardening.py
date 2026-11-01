"""
Production Hardening & Scalability Test Suite (Week 5 Mission 1)
Validates:
1. Citation Provenance & Schema Fidelity (Fixes Silent Citation Bug)
2. SSE Markdown Whitespace & Newline Stream Fidelity
3. HNSW Vector Index Definition on pgvector Embedding Column
4. Environment-Driven CORS Whitelisting
5. Non-Blocking ML Inference Execution on Event Loop
"""

import json
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

from app.models import DocumentChunk


def test_stream_citation_schema_mapping():
    """
    Challenge 1.1: Verifies that /api/v1/stream accurately maps:
    - document_name -> source
    - metadata_json.page_number -> page
    - rerank_score (or rrf_score) -> score
    instead of falling back to default dummy values ('Enterprise Knowledge Base', 1, 0.0).
    """
    from app.main import app

    mock_result = {
        "query": "What is the MFA policy?",
        "query_type": "rag",
        "retrieved_chunks": [
            {
                "id": 101,
                "document_id": "it_sec_01",
                "document_name": "OmniCorp_IT_Security_Policy.pdf",
                "chunk_index": 4,
                "content": "All employees must enable MFA within 24 hours.",
                "metadata_json": {"page_number": 4, "department": "IT"},
                "rerank_score": 0.8921,
            }
        ],
        "sql_query": None,
        "sql_result": None,
        "response": "Employees must enable MFA within 24 hours.",
    }

    with patch("app.main.agent_app.ainvoke", new_callable=AsyncMock) as mock_invoke:
        mock_invoke.return_value = mock_result
        client = TestClient(app)
        response = client.post("/api/v1/stream", json={"query": "What is the MFA policy?"})

        assert response.status_code == 200
        events = response.text.strip().split("\n\n")

        metadata_event = None
        for evt in events:
            if "event: metadata" in evt:
                lines = evt.split("\n")
                for line in lines:
                    if line.startswith("data: "):
                        metadata_event = json.loads(line[6:])
                        break

        assert metadata_event is not None, "Metadata event not found in SSE stream."
        chunks = metadata_event.get("retrieved_chunks", [])
        assert len(chunks) == 1
        chunk = chunks[0]

        # Invariant Assertions
        assert chunk["source"] == "OmniCorp_IT_Security_Policy.pdf"
        assert chunk["page"] == 4
        assert chunk["score"] == 0.8921


def test_stream_markdown_whitespace_fidelity():
    """
    Challenge 1.4: Verifies that SSE streaming preserves exact markdown formatting:
    newlines (\n\n), list indentation, code blocks, and does not alter spacing.
    """
    from app.main import app

    expected_markdown = (
        "# Security Policy\n\n"
        "Here are the rules:\n"
        "1. Enable MFA\n"
        "2. Rotate passwords every 90 days\n\n"
        "```bash\ngit status\n```"
    )

    mock_result = {
        "query": "Show security rules",
        "query_type": "rag",
        "retrieved_chunks": [],
        "sql_query": None,
        "sql_result": None,
        "response": expected_markdown,
    }

    with patch("app.main.agent_app.ainvoke", new_callable=AsyncMock) as mock_invoke:
        mock_invoke.return_value = mock_result
        client = TestClient(app)
        response = client.post("/api/v1/stream", json={"query": "Show security rules"})

        assert response.status_code == 200
        events = response.text.strip().split("\n\n")

        reconstructed_tokens = []
        for evt in events:
            if "event: token" in evt:
                lines = evt.split("\n")
                for line in lines:
                    if line.startswith("data: "):
                        payload = json.loads(line[6:])
                        reconstructed_tokens.append(payload.get("token", ""))

        reconstructed_text = "".join(reconstructed_tokens)
        assert reconstructed_text == expected_markdown


def test_hnsw_index_defined_on_document_chunks():
    """
    Challenge 1.3: Verifies that DocumentChunk defines an HNSW index on the embedding
    column with vector_cosine_ops for fast ANN cosine similarity search.
    """
    indexes = [idx for idx in DocumentChunk.__table_args__ if hasattr(idx, "name")]
    hnsw_index = next(
        (idx for idx in indexes if idx.name == "ix_document_chunks_embedding_hnsw"), None
    )

    assert hnsw_index is not None, "Missing HNSW index 'ix_document_chunks_embedding_hnsw' in DocumentChunk."
    assert hnsw_index.dialect_kwargs.get("postgresql_using") == "hnsw"
    assert hnsw_index.dialect_options["postgresql"]["ops"]["embedding"] == "vector_cosine_ops"


def test_cors_origins_configured_from_env(monkeypatch):
    """
    Challenge 1.5: Verifies that CORS allows explicit origins and does not use wildcard
    when credentials are permitted.
    """
    from starlette.middleware.cors import CORSMiddleware

    from app.main import app

    cors_middleware = next(
        (m for m in app.user_middleware if m.cls == CORSMiddleware), None
    )
    assert cors_middleware is not None

    allow_origins = cors_middleware.kwargs.get("allow_origins", [])
    allow_credentials = cors_middleware.kwargs.get("allow_credentials", False)

    if allow_credentials:
        assert "*" not in allow_origins, "CORS allow_origins cannot be ['*'] when allow_credentials is True."
    assert "http://localhost:3000" in allow_origins or "http://localhost:5173" in allow_origins


@pytest.mark.asyncio
async def test_retrieve_context_uses_to_thread():
    """
    Challenge 1.2: Verifies that retrieve_context offloads CPU-bound PyTorch/ONNX
    inference (model.encode and rerank_passages) to worker threads via asyncio.to_thread.
    """
    import asyncio
    from unittest.mock import MagicMock

    from app.rag import hybrid_retriever

    mock_model = MagicMock()
    mock_model.encode.return_value = MagicMock(tolist=lambda: [0.1] * 384)

    with (
        patch("app.rag.hybrid_retriever.get_embedding_model", return_value=mock_model),
        patch("app.rag.hybrid_retriever.hybrid_search_raw", new_callable=AsyncMock) as mock_raw,
        patch("app.rag.hybrid_retriever.rerank_passages", return_value=[{"id": 1}]),
        patch("asyncio.to_thread", wraps=asyncio.to_thread) as spy_to_thread,
    ):
        mock_raw.return_value = [{"id": 1, "content": "test passage"}]

        res = await hybrid_retriever.retrieve_context("MFA policy", top_k=1)
        assert len(res) == 1
        # asyncio.to_thread should be called for both model.encode and rerank_passages
        assert spy_to_thread.call_count >= 2


def test_router_does_not_hijack_from_preposition():
    """
    Challenge 2.1: Verifies that natural English prepositions like 'from' do not
    misroute document RAG queries to Text-to-SQL.
    """
    from app.agents.router import classify_intent_node

    q1 = "What is the remote work policy when working from home?"
    res1 = classify_intent_node({"query": q1, "query_type": None})
    assert res1["query_type"] == "rag", f"Query '{q1}' misrouted to '{res1['query_type']}'"

    q2 = "How many days from delivery is the return policy?"
    res2 = classify_intent_node({"query": q2, "query_type": None})
    assert res2["query_type"] == "rag", f"Query '{q2}' misrouted to '{res2['query_type']}'"


def test_sql_sandbox_blocks_system_catalogs():
    """
    Challenge 2.2: Verifies that SQL sandbox blocks access to PostgreSQL system
    catalogs (pg_shadow, pg_catalog, information_schema).
    """
    from app.agents.sql_agent import SQLSecurityViolation, validate_and_sanitize_sql

    with pytest.raises(SQLSecurityViolation, match=r"system catalog|prohibited"):
        validate_and_sanitize_sql("SELECT usename, passwd FROM pg_shadow")

    with pytest.raises(SQLSecurityViolation, match=r"system catalog|prohibited"):
        validate_and_sanitize_sql("SELECT table_name FROM information_schema.tables")

    with pytest.raises(SQLSecurityViolation, match=r"system catalog|prohibited"):
        validate_and_sanitize_sql("SELECT * FROM pg_catalog.pg_tables")


@pytest.mark.asyncio
async def test_sql_execution_error_is_sanitized():
    """
    Challenge 2.2: Verifies that unhandled database execution exceptions are sanitized
    and do not leak raw SQL error stack or internal connection details to client.
    """
    from app.agents.sql_agent import run_text_to_sql_pipeline

    with (
        patch("app.agents.sql_agent.generate_sql_query", new_callable=AsyncMock) as mock_gen,
        patch("app.agents.sql_agent.execute_safe_sql", new_callable=AsyncMock) as mock_exec,
    ):
        mock_gen.return_value = "SELECT * FROM orders LIMIT 50"
        mock_exec.side_effect = Exception(
            "asyncpg.exceptions.ConnectionFailure: password auth failed for user omni_admin"
        )

        _sql_query, response, _rows = await run_text_to_sql_pipeline("Show orders")
        assert "password auth failed" not in response
        assert "omni_admin" not in response
        assert "unexpected error occurred" in response.lower() or "please try again" in response.lower()


def test_database_pool_pre_ping_configured():
    """
    Challenge 2.3: Verifies that SQLAlchemy async engine enables pool_pre_ping=True
    to avoid stale connection drops during container/server restarts.
    """
    from app.database import engine

    assert engine.pool._pre_ping is True, "engine.pool._pre_ping must be enabled (True)"


def test_no_deprecated_utcnow_in_codebase():
    """
    Challenge 2.3: Python 3.12+ deprecates datetime.utcnow() in favor of
    datetime.now(timezone.utc). Verify no deprecated calls exist in app modules.
    """
    import inspect

    import app.eval.ragas_bench as ragas_mod
    import app.rag.ingest as ingest_mod

    assert "datetime.utcnow()" not in inspect.getsource(ingest_mod)
    assert "datetime.utcnow()" not in inspect.getsource(ragas_mod)



