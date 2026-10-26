# 🤖 OmniQuery-AI: Enterprise Hybrid RAG & Autonomous SQL Copilot

[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![React 19](https://img.shields.io/badge/Frontend-React%2019%20+%20Vite%208-61dafb.svg)](frontend/)
[![CI/CD Pipeline](https://github.com/avyak-labs/OmniQuery-AI/actions/workflows/ci.yml/badge.svg)](https://github.com/avyak-labs/OmniQuery-AI/actions)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111+-green.svg)](https://fastapi.tiangolo.com/)
[![PostgreSQL pgvector](https://img.shields.io/badge/PostgreSQL-pgvector-blue.svg)](https://github.com/pgvector/pgvector)
[![LangGraph](https://img.shields.io/badge/Orchestration-LangGraph-orange.svg)](https://langchain-ai.github.io/langgraph/)
[![RAGAS Evaluated](https://img.shields.io/badge/Evaluated%20with-RAGAS-purple.svg)](docs/RAGAS_BENCHMARK_SCORECARD.md)
[![Docker](https://img.shields.io/badge/Containerized-Docker%20Compose-blue)](docker-compose.yml)

[🚀 Launch 1-Click Live Hosted Demo](https://huggingface.co/spaces/avyak-labs/omniquery-ai-demo) | [📊 RAGAS Scorecard](docs/RAGAS_BENCHMARK_SCORECARD.md)

A production-grade applied GenAI microservice and enterprise web console demonstrating **Hybrid Search (Dense pgvector + Sparse BM25)**, **Cross-Encoder Re-ranking**, **LangGraph Dynamic Agent Routing**, **PostgreSQL Text-to-SQL**, **Server-Sent Events (SSE) Streaming**, and **Automated RAGAS Quality Evaluation**.

---

## 🎯 Quantitative RAGAS Benchmark Results

OmniQuery-AI is continuously evaluated using an automated RAGAS test harness (`app/eval/ragas_bench.py`) across 15 curated domain scenarios:

| Metric | Measured Score | Enterprise Threshold | Status | Architectural Guarantee |
| :--- | :---: | :---: | :---: | :--- |
| **Faithfulness** | **99.70%** | $\ge 90.0\%$ | ✅ PASSED | Zero hallucinations; claims mathematically grounded in retrieved context. |
| **Answer Relevance** | **88.00%** | $\ge 85.0\%$ | ✅ PASSED | Directly addresses user intent without rambling or topic evasion. |
| **Context Precision** | **86.00%** | $\ge 80.0\%$ | ✅ PASSED | FlashRank Cross-Encoder ranks the most relevant chunks at rank #1 and #2. |

---

## 🌟 Key Features

1. **Enterprise Web Console (React 19 + TypeScript + Tailwind CSS):**
   - High-performance, responsive UI with real-time SSE token streaming and Markdown rendering.
   - Dynamic **Intent Routing Badges** (`ROUTED: TEXT-TO-SQL ENGINE` in Cyan, `ROUTED: ENTERPRISE DOCUMENT RAG` in Violet).
   - Interactive **Safe SQL Sandbox Inspector** displaying generated read-only queries with latency metrics and tabular results.
   - **Grounded Provenance Citation Cards** with FlashRank cross-encoder relevance scores.
   - Full **Theme Engine** with instant toggle (`☀️ Light Mode` / `🌙 Dark Mode`).
   - Dynamic chronological session history (`Today`, `Previous 7 Days`) with local persistence.

2. **Live System Status & Catalog Inspector (`GET /api/v1/system/status`):**
   - Real-time polling reporting live PostgreSQL record counts (`products`, `customers`, `orders`) and indexed vector chunks.

3. **Hybrid Retrieval Engine:**
   - Vector similarity search via `pgvector` (Cosine distance, 384-d `all-MiniLM-L6-v2`).
   - Full-text keyword search via PostgreSQL `tsvector` (`BM25` with `ts_rank_cd`).
   - Blended ranking via **Reciprocal Rank Fusion (RRF, $k=60$)**.
   - Context compression via **FlashRank Cross-Encoder Re-ranking** (`ms-marco-TinyBERT-L-2-v2`).

4. **Autonomous Text-to-SQL Copilot Engine:**
   - Natural language to parameterized SQL generation grounded in relational schema.
   - 5-Layer defense-in-depth security sandbox blocking DDL/DML mutations.
   - Transaction-level kernel isolation with `SET TRANSACTION READ ONLY;` and `statement_timeout = '5000ms'`.

5. **LangGraph Agentic Router:**
   - Multi-agent state machine routing queries between Document RAG, Text-to-SQL, and direct LLM synthesis.

6. **FastAPI High-Concurrency Backend & SSE Streaming:**
   - Asynchronous endpoints emitting structured SSE events (`metadata`, `token`, `done`, `error`).

7. **Multi-Container Production Docker Architecture:**
   - Multi-stage Dockerfiles orchestrated with Docker Compose across PostgreSQL 16 pgvector, FastAPI, React Frontend, and Streamlit.

8. **Automated CI/CD Quality Verification:**
   - GitHub Actions pipeline spinning up containerized pgvector, seeding test data, and executing 28 automated tests and RAGAS regression gates on every commit.

---

## 🚀 Quick Start (Docker Compose Multi-Container Stack)

The fastest way to run the complete end-to-end OmniQuery-AI ecosystem:

```bash
# 1. Clone repository
git clone https://github.com/avyak-labs/OmniQuery-AI.git
cd OmniQuery-AI

# 2. Configure environment
cp .env.example .env

# 3. Launch all services (PostgreSQL pgvector, FastAPI, React Enterprise UI, Streamlit)
docker-compose up -d --build

# 4. Access services
# Enterprise Web Console: http://localhost:3000
# FastAPI Swagger Docs:   http://localhost:8000/docs
# Streamlit Web UI:       http://localhost:8501
# PostgreSQL pgvector:    localhost:5433
```

---

## 🛠️ Local Development Setup (Manual)

### 1. Start PostgreSQL with pgvector
```bash
docker-compose up -d postgres
```

### 2. Set Up Virtual Environment & Dependencies
```bash
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Seed Database Records
```bash
python -m app.db_seed
```

### 4. Run Pytest Regression Suite
```bash
pytest tests/ -v
```

### 5. Start Backend and Frontend
```bash
# Terminal 1 - FastAPI Backend:
uvicorn app.main:app --reload --port 8000

# Terminal 2 - React Enterprise Console:
cd frontend
npm install
npm run dev # Runs on http://localhost:5173
```

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    User["Enterprise User / Analyst"] --> ReactUI["Enterprise Web Console (Port 3000 / 5173)"]
    User --> StreamlitUI["Streamlit Secondary UI (Port 8501)"]
    ReactUI -->|SSE Stream / REST| API["FastAPI Backend (Port 8000)"]
    StreamlitUI -->|SSE Stream / REST| API
    
    subgraph Agentic_Layer ["LangGraph Orchestration"]
        API --> Router["LangGraph Intent Router"]
        Router -->|"Relational / Aggregate Query"| SQLAgent["Text-to-SQL Agent"]
        Router -->|"Unstructured Knowledge Query"| HybridRAG["Hybrid RAG Pipeline"]
    end

    subgraph Data_Layer ["PostgreSQL 16 + pgvector (Port 5433)"]
        SQLAgent -->|"5-Layer Sandbox + READ ONLY"| RelDB[("Relational Tables (orders, products, customers)")]
        HybridRAG --> Dense["Dense pgvector Cosine Search"]
        HybridRAG --> Sparse["Sparse tsvector BM25 Search"]
        Dense --> RRF["Reciprocal Rank Fusion (k=60)"]
        Sparse --> RRF
        RRF --> Reranker["FlashRank Cross-Encoder"]
    end

    Reranker --> Synthesizer["LLM Synthesizer (Gemini / Offline)"]
    Synthesizer --> API
    SQLAgent --> API
```

---

## 📂 Repository Structure

```
OmniQuery-AI/
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI/CD (pgvector service, 28 tests, RAGAS)
├── app/
│   ├── main.py                # FastAPI Application, SSE Streaming & Live System Status
│   ├── database.py            # PostgreSQL + pgvector async connection
│   ├── models.py              # SQLAlchemy ORM models (Vector & Relational)
│   ├── db_seed.py             # Database seeder for demo data
│   ├── rag/
│   │   ├── hybrid_retriever.py# Dense + Sparse BM25 + Cross-Encoder Reranker
│   │   ├── reranker.py        # FlashRank Cross-Encoder wrapper
│   │   ├── synthesizer.py     # Grounded LLM response synthesizer
│   │   └── ingest.py          # Document chunker & embedder
│   ├── agents/
│   │   ├── router.py          # LangGraph state machine router
│   │   └── sql_agent.py       # Safe Text-to-SQL generation & sandbox
│   └── eval/
│       ├── ground_truth.json  # 15 Curated domain evaluation Q&A pairs
│       └── ragas_bench.py     # Automated RAGAS evaluation runner
├── frontend/                  # Enterprise React 19 + TypeScript + Tailwind UI
│   ├── src/
│   │   ├── components/        # Sidebar, MessageList, SqlInspector, CitationCards, etc.
│   │   ├── api/               # SSE Stream client & System Status poller
│   │   ├── App.tsx            # Main copilot application & theme engine
│   │   └── index.css          # Enterprise theme custom tokens
│   ├── Dockerfile             # Multi-stage production build (Node -> Nginx)
│   └── vite.config.ts         # Vite proxy configuration
├── ui/
│   └── streamlit_app.py       # Secondary Streamlit interface
├── spaces/
│   └── app.py                 # Standalone entrypoint for Hugging Face Spaces
├── docs/
│   └── RAGAS_BENCHMARK_SCORECARD.md # Benchmark results scorecard
├── tests/
│   ├── test_hybrid_rag.py     # Hybrid retrieval unit tests
│   ├── test_text_to_sql.py    # Text-to-SQL & Security Sandbox tests
│   ├── test_edge_and_negative_cases.py # Boundary & negative scenario tests
│   └── test_ragas_bench.py    # RAGAS quality regression tests
├── Dockerfile                 # Multi-stage production backend container
├── docker-compose.yml         # 4-Service Multi-Container orchestration
├── pytest.ini                 # Pytest configuration
├── requirements.txt           # Production Python dependencies
└── README.md
```

---

## 📄 License & Attribution

Developed by **C Canishe** as part of the applied GenAI engineering mentorship track under Avyak Labs. Released under the [MIT License](LICENSE).
