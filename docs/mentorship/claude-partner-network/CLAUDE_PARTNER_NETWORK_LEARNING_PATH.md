# Anthropic Claude Partner Network (CPN) Learning Path
**Official Skilljar Curriculum Breakdown, Syllabus, & Implementation Guide**

- **Source URL:** [Claude Partner Network Learning Path](https://anthropic-partners.skilljar.com/page/claude-partner-network-learning-path)
- **Target Audience:** Solution Architects, Enterprise Partners, and GenAI / LLM Application Engineers.
- **Strategic Purpose:** Gateway foundational curriculum for the Claude Partner Network, serving as the required milestone toward official Anthropic Partner Certification.
- **Context & Application:** Directly reinforces Canishe's preparation for **Track C (Junior GenAI / LLM Application Engineer)** roles in Bangalore, while providing production agentic architecture patterns for Janar's mentoring and enterprise implementations.

---

## 1. Executive Summary & Core Pillars

The **Claude Partner Network Learning Path** is designed by Anthropic to train certified implementation partners. It moves developers past simple single-prompt chat interactions into building robust, unsupervised, enterprise-ready AI applications.

The curriculum is built around **four essential pillars**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│              Anthropic Claude Partner Network Learning Path              │
├────────────────────┬────────────────────┬───────────────────────────────┤
│ 1. Agent Skills    │ 2. Claude API      │ 3. Model Context Protocol     │ 4. Claude Code in Action
│                    │    Deep-Dive       │    (MCP)                      │
│ - Markdown specs   │ - Function Calling │ - Open integration standard   │ - Plan mode & steering
│ - Context loading  │ - Hybrid RAG       │ - Python SDK servers/clients  │ - Lean CLAUDE.md
│ - Team sharing     │ - Agentic Routing  │ - Tools, Resources, Prompts   │ - Headless runs & Hooks
│ - Troubleshooting  │ - Evals & Bench    │ - MCP Inspector debugging     │ - Test gating & CI/CD
└────────────────────┴────────────────────┴───────────────────────────────┴─────────────────────────┘
```

---

## 2. Detailed Course Breakdown & Syllabus

### Course 1: Introduction to Agent Skills
- **URL Path:** `/introduction-to-agent-skills`
- **Format:** Modular text-based curriculum with hands-on exercises.
- **Course Focus:** How to build, configure, and distribute modular **Agent Skills** in Claude Code — structured markdown instructions that Claude discovers and applies dynamically when relevant tasks are triggered.

#### Module Outline:
1. **What are Skills?**
   - Concept of agent skills vs. monolithic system prompts.
   - How Claude scans skill descriptions and loads detailed instructions on-demand to save context tokens.
2. **Creating Your First Skill:**
   - Defining `SKILL.md` with YAML frontmatter (`name`, `description`, trigger conditions).
   - Structuring instructions with clear examples, input expectations, and constraints.
3. **Configuration and Multi-File Skills:**
   - Organizing complex skills with subdirectories (`scripts/`, `references/`, `examples/`).
   - Referencing external files without blowing up the context window.
4. **Skills vs. Other Claude Code Features:**
   - When to use **Skills** (task-specific reusable procedural knowledge).
   - When to use **`CLAUDE.md`** (global project rules, coding standards, architecture constraints).
   - When to use **Hooks** (deterministic gating scripts and security enforcement).
   - When to use **Subagents** (isolated, parallel execution contexts).
5. **Sharing Skills:**
   - Distributing team skills via shared repositories, plugins, or organization-level configurations.
6. **Troubleshooting Skills:**
   - Diagnosing why a skill didn't trigger (underspecified `description`).
   - Debugging over-eager triggers and conflicting skill instructions.

---

### Course 2: Building with the Claude API
- **URL Path:** `/claude-with-the-anthropic-api`
- **Format:** 84 Lectures | ~8.1 Video Hours | 10 Quizzes | Code Exercises.
- **Course Focus:** The complete engineering manual for working with Anthropic Claude models (Claude 3.5 Sonnet, Claude 3.5 Haiku, Claude 3 Opus) in production software.

#### Module Outline:
1. **Getting Started with Claude:**
   - API authentication, client SDK setup (Python/TypeScript), rate limiting, error handling.
   - Message streaming via Server-Sent Events (`SSE`).
   - Multi-turn conversation management and system prompt optimization.
   - Structured JSON generation via JSON mode / tool schema enforcement.
2. **Prompt Engineering & Evaluation:**
   - Clear thinking techniques (XML tag structuring, Chain-of-Thought, few-shot demonstration).
   - Automated evaluation pipelines with programmatic assertions and LLM-as-a-judge scoring.
   - Measuring drift, latency, and token economics across model tiers.
3. **Tool Use with Claude (Function Calling):**
   - Defining JSON schema specifications for custom functions.
   - Handling multi-turn tool execution loops (model asks -> client executes -> returns response -> model synthesizes).
   - Batch tool calling and handling external API failures gracefully.
4. **Retrieval-Augmented Generation (RAG):**
   - High-precision text chunking strategies (semantic chunking, markdown-aware, recursive).
   - Dense embeddings combined with sparse BM25 (`tsvector`) full-text indexing.
   - Hybrid Search with Reciprocal Rank Fusion (RRF) and Cross-Encoder Re-ranking.
   - Contextual Retrieval: Prepending chunk-specific context summaries to minimize vector retrieval drop-off.
5. **Model Context Protocol (MCP) Foundations:**
   - Overview of MCP client/server integration inside API workflows.
6. **Claude Code & Computer Use:**
   - Using Claude for terminal task execution.
   - Anthropic Computer Use API: Screenshot analysis, mouse clicks, keypresses, and coordinate planning.
7. **Agents & Workflows:**
   - Multi-step workflow patterns: Prompt Chaining, Routing, Parallelization, Orchestrator-Workers, Evaluator-Optimizer.
   - State machine design for autonomous agents with rollback capabilities.

---

### Course 3: Introduction to Model Context Protocol (MCP)
- **URL Path:** `/introduction-to-model-context-protocol`
- **Format:** 16 Lectures | ~1.0 Video Hour | 1 Quiz | Hands-on Project.
- **Course Focus:** Mastering Anthropic's open standard for connecting AI models to external tools, databases, and third-party APIs without proprietary, brittle glue code.

#### The Three Core MCP Primitives:
| Primitive | Direction | Purpose | Example |
| :--- | :--- | :--- | :--- |
| **Tools** | Model $\rightarrow$ Server | Dynamic actions the model can invoke with arguments | Query database, make HTTP request, execute script |
| **Resources** | Server $\rightarrow$ Model | Read-only contextual data feeds and files | Read log files, fetch schema, stream API state |
| **Prompts** | Server $\rightarrow$ Client | Parameterized pre-defined workflow templates | Code review template, incident diagnosis prompt |

#### Module Outline:
1. **MCP Fundamentals & Server Development:**
   - Architecture of the Client-Host-Server relationship.
   - Creating an MCP server from scratch using the official `mcp` Python SDK / FastMCP.
   - Exposing typed tools with Pydantic schemas and docstrings.
   - Inspecting, testing, and debugging servers using the interactive **MCP Inspector** tool.
2. **MCP Client Implementation & Advanced Features:**
   - Writing custom client connectors to interact with multiple MCP servers simultaneously.
   - Managing connection lifecycles (stdio pipes vs. HTTP / Server-Sent Events).
   - Security, permissions, and file-system sandbox roots.
   - End-to-end Project: Implementing a document management system accessed through Claude via MCP.

---

### Course 4: Claude Code in Action
- **URL Path:** `/claude-code-in-action`
- **Format:** 9 Practical Lessons | 4 Production Modules | Workflow Demos.
- **Course Focus:** How to conduct long, reliable, autonomous development sessions with Claude Code. Transitioning from simple prompts to high-trust, unsupervised background pipelines.

#### Module Outline:
1. **Steer the Work (Session Management):**
   - **Plan Mode:** Scoping architectural changes before touching any code.
   - **Context Compaction:** Controlling how context summarization retains critical test results and file paths.
   - **Rewind Menu:** Rolling back unintended model turns without restarting sessions.
   - **Hands-on vs. Autonomous:** Knowing when to pair program vs. launching autonomous `goal` and `loop` runs.
2. **Configure Claude (Instruction Surfaces):**
   - **Lean `CLAUDE.md`:** Writing concise, high-signal project guidelines that Claude follows without hallucinating.
   - **Custom Skills:** Packaging complex multi-step routines into standalone skills.
   - **Permission Tiers:** Fine-tuning file edit, bash command, and tool execution approval modes.
   - **Hooks:** Enforcing strict, unskippable policies using pre-tool and post-tool JSON exit codes.
3. **Automate Repeat Work (Headless & CI/CD):**
   - Scheduling recurring prompts and routines on automated pipelines.
   - Running Claude Code in headless non-interactive mode (`-p` prompt execution with JSON structured output).
   - Integrating Claude into GitHub Actions for automated pull request code reviews and bug checks.
4. **Verify and Share (Team Reliability):**
   - Verifying unsupervised runs in proportion to oversight level.
   - Test-gating turns: Hooking test runners (`pytest`, `npm test`) so Claude cannot claim completion without passing tests.
   - Distributing team settings, custom skills, and MCP connectors as installable plugins.

---

## 3. Direct Mapping to OmniQuery-AI & Canishe's Career Roadmap

The topics taught in the Claude Partner Network directly align with Canishe's **Track C (Junior GenAI / LLM Application Engineer)** learning milestones and the **OmniQuery-AI** flagship project:

| Partner Course Topic | OmniQuery-AI Implementation | Interview & Resume Takeaway |
| :--- | :--- | :--- |
| **Hybrid Search & RRF** | `app/rag/hybrid_retriever.py` (Dense `pgvector` + Sparse `tsvector` + RRF $k=60$) | Explaining why pure vector search fails on product SKUs and how RRF solves it. |
| **Cross-Encoder Reranker** | `app/rag/reranker.py` (FlashRank lightweight local cross-encoder) | Optimizing precision while keeping inference latency sub-second. |
| **Intent Classification & Routing** | `app/agents/router.py` (LangGraph conditional state machine) | Demonstrating agentic routing between Document RAG, Text-to-SQL, and direct answering. |
| **Model Context Protocol (MCP)** | Turning OmniQuery-AI into an MCP Server | Enabling any LLM (Claude, ChatGPT, IDE agents) to query the enterprise inventory. |
| **Automated Testing & Evals** | `tests/test_hybrid_rag.py` & `app/eval/ragas_bench.py` | Proving RAG accuracy with Faithfulness, Context Recall, and Answer Relevance metrics. |
| **Claude Code & Dev Workflow** | Shared VS Code Live Share, automated Git branches, PR reviews | Demonstrating senior-level developer hygiene and multi-agent pairing workflows. |

---

## 4. Recommended Action Plan for Canishe

1. **Phase 1: Foundations (Week 1)**
   - Complete *Course 1: Introduction to Agent Skills* on Skilljar.
   - Create a custom skill in `OmniQuery-AI` for running database seeds and verifying test suites.
2. **Phase 2: Protocol Mastery (Week 2)**
   - Complete *Course 3: Introduction to Model Context Protocol (MCP)*.
   - Build a simple Python MCP server exposing OmniQuery's SQL catalog to Claude Desktop.
3. **Phase 3: Agentic API & Claude Code (Weeks 3 & 4)**
   - Complete *Course 4: Claude Code in Action* and key modules of *Course 2: Building with the Claude API*.
   - Setup automated pre-commit test hooks and GitHub Action PR reviewers.
4. **Phase 4: Certification & Portfolio Polish**
   - Attempt the official Claude Partner Network certification assessment.
   - Feature the certification and OmniQuery-AI case study prominently on LinkedIn and resume for Bangalore GenAI recruiter reach-outs.
