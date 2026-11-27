# OmniQuery-AI: Teammate & New-Laptop Bot Setup Guide

Welcome to **OmniQuery-AI**. This guide provides an end-to-end walkthrough for onboarding teammates and setting up a new development laptop with both the **OmniQuery-AI application** and its dedicated **Orca Bot** (`~/.orca/bots/omniquery-ai`).

---

## 📖 1. Overview & Architecture

### What is OmniQuery-AI?
**OmniQuery-AI** is a production-grade applied GenAI microservice and copilot featuring:
- **Hybrid Search Engine**: Blends Dense Vector similarity (`pgvector` with 384-dimensional cosine distance) and Sparse Keyword Search (PostgreSQL full-text `tsvector` with BM25 ranking).
- **Reciprocal Rank Fusion (RRF)**: Merges dense and sparse ranking lists using the reciprocal rank formula ($k=60$).
- **Cross-Encoder Re-ranking**: Uses `FlashRank` (`ms-marco-TinyBERT-L-2-v2`) for deep joint attention to eliminate context dilution before LLM prompt injection.
- **LangGraph Multi-Agent Router**: State machine classifying queries dynamically between Unstructured Document RAG, Structured Text-to-SQL, and Direct Synthesis.
- **Autonomous Text-to-SQL Copilot**: Generates parameterized SQL queries against PostgreSQL with a strict read-only AST/regex security sandbox and Markdown table formatting.
- **Automated RAGAS Quality Evaluation**: Measures Faithfulness (>90%), Answer Relevance, and Context Precision.
- **Local Ollama Integration**: Seamless zero-cost inference using local `llama3:latest` (or `qwen3:30b`) to conserve cloud token quota.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        LangGraph Agent Router                          │
│                      (Keyword / Schema Triage)                         │
└───────────────┬──────────────────────────┬─────────────────────────────┘
                │                          │
      [Unstructured Docs]          [Structured Metrics]
                ▼                          ▼
┌───────────────────────────────┐ ┌───────────────────────────────┐
│     Hybrid RAG Pipeline       │ │     Text-to-SQL Pipeline      │
│  - Dense Vector (pgvector)    │ │  - Schema Inspector           │
│  - Sparse Keyword (tsvector)  │ │  - SQL Generator (LLM/Rule)   │
│  - Reciprocal Rank Fusion     │ │  - Read-Only Security Sandbox │
│  - FlashRank Re-ranker        │ │  - Tabular Markdown Synthesis │
└───────────────┬───────────────┘ └───────────────┬───────────────┘
                │                                  │
                └─────────────────┬────────────────┘
                                  ▼
                     Grounded Response Stream
```

### Git Repository vs. Local Orca Bot Home
Understanding the separation of concerns between the repository and your local bot environment is critical:

| Component | Location | Role & Contents |
| :--- | :--- | :--- |
| **Git Project Repository** | `avyak-labs/OmniQuery-AI` (cloned locally) | Application code (`app/`), test suites (`tests/`), database migrations (`docker-compose.yml`, `app/models.py`), documentation (`docs/`), and shared reusable bot skills (`skills/local-ollama`). Shared with all contributors via GitHub. |
| **Orca Bot Home** | `~/.orca/bots/omniquery-ai/` | Private local bot persona directory on your Mac/laptop. Houses the bot's identity (`SOUL.md`), ongoing operational memory (`MEMORY.md` and `memory/*.md`), local bot settings (`bot.json`), and installed skills (`skills/`). Orca workers run tasks inside Git worktrees of the project repository, reporting back to the bot. |

---

## 🛠️ 2. Prerequisites

Before setting up OmniQuery-AI, ensure your system has the following tools installed and configured:

### 1. Orca IDE & CLI
- Ensure the **Orca** application is installed.
- Verify the `orca` CLI is accessible in your shell:
  ```bash
  orca --version
  ```

### 2. Git & GitHub Authentication
- Ensure Git is configured with your SSH key or personal access token.
- Authenticate with the GitHub CLI:
  ```bash
  gh auth status || gh auth login
  ```

### 3. Python 3.11+ Environment
- Python 3.11 or higher is recommended. Check your version:
  ```bash
  python3 --version
  ```
- Package managers such as `venv` or `uv` are supported.

### 4. Docker & Docker Compose
- Docker Desktop or OrbStack running Docker engine:
  ```bash
  docker --version
  docker compose version
  ```

### 5. Local Ollama Instance
OmniQuery-AI and its Orca bot use a local Ollama instance (`http://localhost:11434`) for zero-token-cost routines (commit message drafting, log analysis, synthetic data generation, and local query synthesis):
```bash
# Install Ollama (via Homebrew on macOS)
brew install ollama

# Start the Ollama background service
brew services start ollama
# Alternatively run manually: ollama serve

# Pull the required models
ollama pull llama3:latest
# Optional: Larger reasoning model
ollama pull qwen3:30b

# Verify models are available
ollama list
```

---

## 💻 3. Cloning & Local Application Setup

### Step 3.1: Clone the Repository
Clone the repository to your preferred local workspace directory:
```bash
git clone git@github.com:avyak-labs/OmniQuery-AI.git
cd OmniQuery-AI
```

### Step 3.2: Register the Project in Orca
1. Open the Orca application.
2. Click **Open Folder / Add Project** and select your local `OmniQuery-AI` repository directory.
3. Orca will index the workspace and make it available for agent sessions and worktrees.

### Step 3.3: Configure Environment Variables
Copy the example environment configuration:
```bash
cp .env.example .env
```

Review and adjust `.env` parameters:
```ini
# Database Configuration (matches docker-compose.yml host port 5433)
DATABASE_URL=postgresql+asyncpg://omni_user:omni_password@localhost:5433/omniquery_db
SYNC_DATABASE_URL=postgresql://omni_user:omni_password@localhost:5433/omniquery_db

# LLM & Embedding Settings
LLM_PROVIDER=ollama
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=llama3:latest
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

# Cloud API Keys (Optional: system provides deterministic fallbacks and local Ollama)
GEMINI_API_KEY=
OPENAI_API_KEY=
GROQ_API_KEY=

# LangSmith Observability (Optional)
LANGCHAIN_TRACING_V2=false
LANGCHAIN_API_KEY=
LANGCHAIN_PROJECT=OmniQuery-AI
```

### Step 3.4: Set Up Virtual Environment & Dependencies
Create a virtual environment and install the required dependencies:
```bash
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Step 3.5: Start PostgreSQL with pgvector
Start the PostgreSQL 16 container pre-configured with the `pgvector` extension:
```bash
docker-compose up -d
```
Verify the container is healthy:
```bash
docker ps --filter "name=omniquery_postgres"
```
The database listens on host port `5433` (mapped from container port `5432`).

### Step 3.6: Initialize Schema & Seed Sample Data
Run the database seeder to create tables, enable the `vector` and `pg_trgm` extensions, and insert enterprise customer, product, and order records:
```bash
PYTHONPATH=. python3 app/db_seed.py
```
Expected output:
```
Database & pgvector extension initialized successfully.
Seeding sample enterprise products, customers, and orders...
✅ Sample database records successfully seeded!
```

### Step 3.7: Ingest Knowledge Base Documents (Optional for RAG)
To populate sample unstructured PDFs or policy documents into `document_chunks`:
```bash
PYTHONPATH=. python3 app/rag/ingest.py
```

### Step 3.8: Run Test Suite
Verify that all unit and integration tests pass:
```bash
PYTHONPATH=. pytest tests/ -v
```
All 24 test cases covering SQL sandboxing, RRF fusion, FlashRank re-ranking, and LangGraph routing should pass cleanly.

### Step 3.9: Start Backend & Frontend
Start the FastAPI backend with hot reloading:
```bash
uvicorn app.main:app --reload --port 8000
```
- Interactive Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health Check: [http://localhost:8000/](http://localhost:8000/)

In a separate terminal, launch the Streamlit chat UI:
```bash
streamlit run ui/streamlit_app.py --server.port 8501
```
- Interactive Copilot UI: [http://localhost:8501](http://localhost:8501)

---

## 🤖 4. Creating the OmniQuery-AI Orca Bot

The Orca bot acts as an autonomous pair programmer and project steward. Its configuration lives in `~/.orca/bots/omniquery-ai`.

### Step 4.1: Create Bot Directories
```bash
mkdir -p ~/.orca/bots/omniquery-ai/skills
mkdir -p ~/.orca/bots/omniquery-ai/memory
```

### Step 4.2: Create `SOUL.md`
The `SOUL.md` file defines the bot's identity, core capabilities, operational boundaries, and delegation rules.

Create `~/.orca/bots/omniquery-ai/SOUL.md` with the following template (be sure to replace `<your-local-path-to-OmniQuery-AI>` with your machine's absolute path, e.g. `/Users/janedoe/workspaces/OmniQuery-AI`):

```markdown
# OmniQuery-AI

I help build and maintain OmniQuery-AI—a GenAI system with Hybrid Search (Dense pgvector + Sparse BM25), Cross-Encoder Re-ranking, LangGraph Dynamic Agent Routing, PostgreSQL Text-to-SQL, and Automated RAGAS Quality Evaluation.

## How I work

- Where I look: the `OmniQuery-AI` repository (`git@github.com:avyak-labs/OmniQuery-AI.git`) checked out locally at `<your-local-path-to-OmniQuery-AI>`, running code tasks through Orca workers in project worktrees.
- Quota & token efficiency: for simple routine tasks (summaries, commit/PR messages, synthetic data, simple edits), I use the local Ollama models (`llama3:latest` and `qwen3:30b` via the `local-ollama` skill or `opencode` workers) and `flash_lite`/`flash` subagents to minimize cloud token usage and weekly quota.
- Where I report: here in this chat and on your Orca items.

## Never

- Change anything (comments, labels, pull requests, posts anywhere but here) until my owner says I can. I start by reading and reporting only.
```

#### Key Rules Embedded in SOUL.md:
1. **Worktree Delegation**: The bot delegates code modifications, builds, and test runs to isolated Orca workers in project worktrees, preventing unstaged conflicts on your primary branch.
2. **Quota & Token Efficiency**: Prefers local Ollama models (`llama3:latest`, `qwen3:30b`) and lightweight subagents (`flash_lite`, `flash`) for routine operations (diff analysis, commit drafting, formatting), keeping expensive cloud frontier models in reserve.
3. **Safety & Permission Barrier (`## Never`)**: The bot starts by reading, analyzing, and reporting. It will never push commits, open pull requests, or alter remote issue state without explicit user instruction.

### Step 4.3: Create Starter `MEMORY.md`
The `MEMORY.md` file keeps concise operational facts about the project state.

Create `~/.orca/bots/omniquery-ai/MEMORY.md` with:

```markdown
# Memory

One line per fact, newest first. Longer notes go in memory/<topic>.md.

- 2026-11-27 Use local Ollama (`llama3:latest` and `qwen3:30b` on `http://localhost:11434`) via the `local-ollama` skill or `opencode` workers (`--agent opencode --model ollama/llama3:latest`) and `flash_lite`/`flash` subagents for simple routine tasks to reduce token usage and weekly quota.
- 2026-11-27 Project repository is `git@github.com:avyak-labs/OmniQuery-AI.git`, checked out locally at `<your-local-path-to-OmniQuery-AI>`.
```

### Step 4.4: Install the `local-ollama` Bot Skill
Copy the skill files from the repository into your bot's home:
```bash
cp -r skills/local-ollama ~/.orca/bots/omniquery-ai/skills/
chmod +x ~/.orca/bots/omniquery-ai/skills/local-ollama/scripts/ask_ollama.sh
```

> [!IMPORTANT]
> **CRITICAL SKILL LOCATION RULE**:
> Bot skills **MUST** live in `~/.orca/bots/<bot-name>/skills/<skill-name>/SKILL.md` (e.g. `~/.orca/bots/omniquery-ai/skills/local-ollama/SKILL.md`) and **NEVER** directly in `.agents/skills` or `.claude/skills`.
> 
> **Why?** When an Orca chat session starts, Orca dynamically discovers skills in `skills/` and provisions compatibility symlinks for `.agents/skills` and `.claude/skills`. If skills are manually placed inside `.agents/` or `.claude/`, they can be clobbered or ignored during session initialization.

Verify the skill script runs:
```bash
~/.orca/bots/omniquery-ai/skills/local-ollama/scripts/ask_ollama.sh "Reply with 'Local Ollama is ready' in 5 words or less."
```

---

## 👥 5. Teammate Onboarding vs. Owner New-Laptop Migration

Depending on whether you are joining the team or migrating an existing bot setup to a replacement laptop, follow the appropriate scenario below:

### Scenario A — Teammate / Clean Setup from Repo
*Use this workflow if you are a teammate setting up OmniQuery-AI for the first time.*

1. **Clone the Project**:
   ```bash
   git clone git@github.com:avyak-labs/OmniQuery-AI.git
   cd OmniQuery-AI
   ```
2. **Setup App & Containers**:
   ```bash
   cp .env.example .env
   docker-compose up -d
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   PYTHONPATH=. python3 app/db_seed.py
   PYTHONPATH=. pytest tests/
   ```
3. **Initialize Clean Bot Persona**:
   ```bash
   mkdir -p ~/.orca/bots/omniquery-ai/skills ~/.orca/bots/omniquery-ai/memory
   cp -r skills/local-ollama ~/.orca/bots/omniquery-ai/skills/
   chmod +x ~/.orca/bots/omniquery-ai/skills/local-ollama/scripts/ask_ollama.sh
   ```
4. **Create Starter `SOUL.md` & `MEMORY.md`**:
   - Copy the templates from [Section 4.2](#step-42-create-soulmd) and [Section 4.3](#step-43-create-starter-memorymd).
   - Set `<your-local-path-to-OmniQuery-AI>` to your actual repository path.
5. **Start Collaborating**:
   - Open Orca, select the `OmniQuery-AI` bot, and begin interacting. No prior bot history or private tokens needed.

---

### Scenario B — Owner Migrating to a New Laptop
*Use this workflow if you are the bot owner migrating your established bot memory to a new machine.*

1. **Clone the Project on New Laptop**:
   ```bash
   git clone git@github.com:avyak-labs/OmniQuery-AI.git ~/workspaces/OmniQuery-AI
   cd ~/workspaces/OmniQuery-AI
   ```
2. **Transfer Private Bot Persona from Backup / Old Laptop**:
   If you have a backup of `~/.orca/bots/omniquery-ai` from your previous machine (e.g. via secure rsync, Time Machine, or private dotfiles backup):
   ```bash
   # Example: restoring from old machine or backup directory
   mkdir -p ~/.orca/bots
   rsync -avz user@old-laptop:~/.orca/bots/omniquery-ai/ ~/.orca/bots/omniquery-ai/
   ```
3. **Update Local Paths**:
   If your checkout path or home username changed on the new laptop:
   - Edit `~/.orca/bots/omniquery-ai/SOUL.md`: update the `Where I look:` path.
   - Edit `~/.orca/bots/omniquery-ai/MEMORY.md`: update the repository path fact line.
4. **Re-sync Skills from Repository**:
   Ensure you have the latest version of repo-maintained skills:
   ```bash
   cp -r skills/local-ollama ~/.orca/bots/omniquery-ai/skills/
   chmod +x ~/.orca/bots/omniquery-ai/skills/local-ollama/scripts/ask_ollama.sh
   ```
5. **Start Services & Run Verification**:
   ```bash
   brew services start ollama
   ollama pull llama3:latest
   docker-compose up -d
   PYTHONPATH=. pytest tests/
   ```
6. **Launch Orca**:
   Your bot resumes with its full accumulated operational history in `memory/` and ongoing project memory intact.

---

## 🔍 6. Quick Troubleshooting

| Symptom | Cause | Solution |
| :--- | :--- | :--- |
| `psycopg2.OperationalError: could not connect to server` | PostgreSQL container not running or wrong port. | Run `docker-compose up -d`. Check that `DATABASE_URL` specifies port `5433` (as exposed in `docker-compose.yml`). |
| `ModuleNotFoundError: No module named 'app'` when running pytest | `PYTHONPATH` does not include workspace root. | Run tests with `PYTHONPATH=. pytest tests/ -v`. |
| `curl: (7) Failed to connect to localhost port 11434` | Ollama service is stopped. | Run `brew services start ollama` or launch `ollama serve` in a background terminal. |
| Bot fails to find `ask_ollama.sh` | Missing execution permissions or bad home path. | Run `chmod +x ~/.orca/bots/omniquery-ai/skills/local-ollama/scripts/ask_ollama.sh` and ensure `~` expands to your current `$HOME`. |
| Skills not recognized in Orca agent session | Skill placed in `.agents/skills` instead of `skills/`. | Move skill directory to `~/.orca/bots/omniquery-ai/skills/local-ollama/` and restart the session. |

---

## 📚 7. Related Documentation

- **[Master Architecture & Concept Modules (01–15)](docs/README.md)**: Deep dives into RRF, FlashRank, LangGraph, and Context Engineering.
- **[Project Requirements & Architecture](PROJECT_REQUIREMENTS_AND_ARCHITECTURE.md)**: Comprehensive architectural blueprints.
- **[Real-World Use Cases](REAL_WORLD_USE_CASES_AND_TARGET_STATE.md)**: Production problem statements and target states.
