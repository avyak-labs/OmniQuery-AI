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

