# GenAI Agentic Engineering: Claude & Google Antigravity Architecture Guide
**Universal Concepts, Cross-Platform Compatibility, and Dual Learning Roadmap for Canishe & Rahul**

- **Target Audience:** 
  - **Canishe:** SRM ECE Graduate (9.03 CGPA), targeting **Track C (Junior GenAI / LLM Application Engineer)** roles in Bangalore (target: ₹10–16 LPA).
  - **Rahul:** 1st Year SRM ECE Student (Canishe's younger brother), building foundational agentic architecture and software engineering skills 3–4 years ahead of campus placement.
  - **Janar:** Mentor & AI Architect (Dallas, TX).
- **Core Question Addressed:** *"If Canishe and Rahul take the Claude Partner Network courses, is it specific only to Claude, or is it useful for Google Antigravity as well? Can concepts like Agent Skills, MCP, and autonomous agents be used across both?"*
- **Verdict:** **100% Yes.** The concepts taught in the Claude Partner curriculum are not proprietary walled-garden tricks; they are **open industry standards and fundamental agent architectures** that run identically in **Google Antigravity**, Cursor, Claude Code, and modern enterprise AI systems.

---

## 1. Executive Architecture Summary: Why Skills & MCP are Universal

Modern AI application engineering has shifted away from simple "chat prompts" toward **Agentic Systems** that reason, call tools, inspect data, and take autonomous actions.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Universal Agentic Application Stack                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  [Frontends / Agents]       Claude Code    │   Google Antigravity   │ Cursor │
│                                  │                   │                 │    │
│  [Open Standard 1]               ▼                   ▼                 ▼    │
│  Agent Skills (SKILL.md)  ───► Reusable Markdown Instructions & Workflows   │
│                                  │                   │                 │    │
│  [Open Standard 2]               ▼                   ▼                 ▼    │
│  Model Context Protocol   ───► Unified JSON-RPC Tool & Resource Standard    │
│  (MCP Servers)                   │                   │                 │    │
│                                  ▼                   ▼                 ▼    │
│  [Backends / Services]     PostgreSQL / pgvector │ REST APIs │ Local CLI    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

Both Claude and Google Antigravity share the exact same architectural primitives:
1. **Model Context Protocol (MCP):** Open protocol standard initiated by Anthropic, adopted across the AI industry including Google Antigravity.
2. **Agent Skills (`SKILL.md`):** Portable, modular instruction folders equipped with YAML frontmatter that agents read dynamically on-demand.
3. **Tool Calling & Function Calling:** Structured JSON Schema tool declarations and multi-turn execution loops.
4. **Plan-and-Execute Workflows:** Plan modes, context compaction, state machine routers, and test-driven verification hooks.

---

## 2. Concept-by-Concept Matrix: Claude vs. Google Antigravity

| Architectural Primitive | How Claude Implements It | How Google Antigravity Implements It | Compatibility Level |
| :--- | :--- | :--- | :---: |
| **Model Context Protocol (MCP)** | Clients connect to servers via `claude_desktop_config.json` or CLI flags; servers written in Python (`FastMCP` or `mcp`) or TypeScript. | **Natively supported.** Antigravity loads MCP servers (e.g. Docker MCP, Chrome DevTools, ArXiv, Context7, Serena) and treats their tools as first-class agent capabilities. | **100% Identical** *(Write once, run in both)* |
| **Agent Skills** | Folders containing `SKILL.md` with YAML frontmatter (`name`, `description`), progressive loading, and optional `scripts/` or `references/`. | **Identical structure.** Antigravity discovers and loads `SKILL.md` files dynamically using description matching to avoid context token bloating. | **100% Identical** *(Drop-in portable)* |
| **Tool Calling & Schema** | JSON Schema definitions with typed parameters (`properties`, `required`, `type`). Model outputs structured JSON tool calls. | Exact same JSON Schema format. Antigravity translates tool declarations directly into function calls. | **100% Identical** |
| **Steering & Plan Mode** | Plan mode for architecture scoping, context compaction, and session rewinds. | Antigravity uses task planning, meta-judges, and subagent delegation for structured execution before code modification. | **100% Identical** |
| **Automated Verification & Hooks** | Pre-tool and post-tool JSON hooks, exit code gating, running `pytest` / linters before completion. | Test-driven development (TDD) gates, lint verification, and subagent review phases. | **100% Identical** |
| **Hybrid RAG & Retrieval** | Dense vector search + Sparse BM25 (`tsvector`) + Reciprocal Rank Fusion (RRF) + Cross-Encoder rerankers. | Exact same architecture implemented in `OmniQuery-AI` (`pgvector` + FlashRank + RRF $k=60$). | **100% Identical** |

---

## 3. Concrete Code Examples: Cross-Platform in Action

### Example A: Model Context Protocol (MCP) Server
Canishe and Rahul write a single Python MCP server that queries their `OmniQuery-AI` PostgreSQL database:

```python
# inventory_mcp_server.py (FastMCP)
from mcp.server.fastmcp import FastMCP
import psycopg2

mcp = FastMCP("OmniQueryInventory")

@mcp.tool()
def search_product_stock(sku: str) -> str:
    """Check live warehouse stock for a specific alphanumeric product SKU."""
    # Queries PostgreSQL database
    return f"SKU {sku}: 42 units in Bangalore Central Warehouse."

if __name__ == "__main__":
    mcp.run()
```

* **Running in Claude:** Claude Desktop connects via its configuration file. Claude queries inventory when asked: *"Do we have SKU-8821 in stock?"*
* **Running in Google Antigravity:** Antigravity connects to `inventory_mcp_server.py` as an MCP server. Antigravity calls `search_product_stock(sku="SKU-8821")` using the exact same tool call.
* **Code changes needed between Claude and Antigravity:** **Zero lines.**

---

### Example B: Portable Agent Skill (`SKILL.md`)
Canishe and Rahul package an automated database verification routine into a skill:

```markdown
---
name: verify-omni-database
description: Verifies PostgreSQL pgvector connection, table migrations, and runs pytest test suite. Use when testing database integrity.
---

# Database Verification Procedure

Whenever the user asks to verify the database or test the RAG engine:
1. Run `docker compose ps` to ensure PostgreSQL is active on port 5433.
2. Execute `pytest tests/test_hybrid_rag.py -v`.
3. If any test fails, inspect `app/rag/hybrid_retriever.py` and report the exact traceback.
```

* **In Claude Code:** Placed in `.claude/skills/verify-omni-database/SKILL.md`. Claude triggers it automatically when database verification is mentioned.
* **In Google Antigravity:** Placed in `.agents/skills/verify-omni-database/SKILL.md`. Antigravity triggers it automatically using the same frontmatter description.
* **Code changes needed:** **Zero.**

---

## 4. Why This is a Multi-Year Advantage for Rahul (1st Year College)

Rahul is currently in his **1st year of college** (SRM ECE). Understanding these concepts now creates a massive career differentiator:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Rahul's 4-Year Advantage                           │
├───────────────────────┬─────────────────────────────────────────────────────┤
│ College Year          │ What Typical Students Do vs. What Rahul Will Master │
├───────────────────────┼─────────────────────────────────────────────────────┤
│ Year 1 (Current)      │ Others: Basic C/Python syntax, loops, toy apps.     │
│                       │ Rahul: MCP servers, Agent Skills, Git, Docker, RAG. │
├───────────────────────┼─────────────────────────────────────────────────────┤
│ Year 2                │ Others: Data Structures & Algorithms theory only.   │
│                       │ Rahul: Full-stack LLM pipelines, FastAPI, pgvector. │
├───────────────────────┼─────────────────────────────────────────────────────┤
│ Year 3                │ Others: Scrambling to learn web frameworks for CVs. │
│                       │ Rahul: Production multi-agent systems, internships. │
├───────────────────────┼─────────────────────────────────────────────────────┤
│ Year 4 (Placements)   │ Others: Applying for generic entry-level IT jobs.   │
│                       │ Rahul: Top-tier AI Application Engineer roles        │
│                       │ (Google, Microsoft, Amazon, Cisco, Sarvam, Bosch).  │
└───────────────────────┴─────────────────────────────────────────────────────┘
```

### Strategic Benefits for Rahul:
1. **Ahead by 3–4 Years:** When tech companies visit SRM for 3rd/4th-year placements, generic coding will be table stakes. Companies will aggressively recruit students who know how to build **autonomous agents, tool protocols, and eval pipelines**.
2. **Mentorship with Canishe:** Rahul doesn't have to learn in isolation. He can watch Canishe build and troubleshoot `OmniQuery-AI`, learning industry-grade Git branching, pull requests, and live pair programming.
3. **Strong Academic Standing:** Understanding hardware-software interfaces and systems protocols (like JSON-RPC and stdio streaming) directly reinforces his ECE coursework in microprocessors, computer networks, and embedded systems.

---

## 5. Strategic Benefits for Canishe (Track C Job Hunt)

For Canishe (SRM ECE Graduate, 9.03 CGPA), completing this curriculum provides immediate commercial value:
1. **Credibility & Official Partner Certification:** Having completed the Anthropic Claude Partner Network curriculum immediately validates his profile to recruiters in Bangalore (Sarvam AI, Yellow.ai, Krutrim, Fractal, Bosch).
2. **Interview Preparedness:** He will be able to answer deep architectural questions on:
   - Why pure vector search drops recall on alphanumeric SKUs (and why hybrid BM25 + pgvector + RRF is required).
   - How MCP differs from legacy custom REST wrappers.
   - How to prevent agent hallucinations using test-gated hooks and evaluation benchmarks (RAGAS).
3. **Live Demonstration in `OmniQuery-AI`:** He can showcase a running, multi-container system combining PostgreSQL, FastAPI, LangGraph, and MCP live during technical interviews.

---

## 6. Joint Action Plan for Canishe & Rahul

### Phase 1: Foundations & Skills (Weeks 1 & 2)
- [ ] **Both:** Complete *Course 1: Introduction to Agent Skills* on the Skilljar portal.
- [ ] **Canishe:** Guide Rahul through creating his first `SKILL.md` file in VS Code.
- [ ] **Hands-on Exercise:** Build a shared git helper skill that automates branch creation and commit formatting.

### Phase 2: Model Context Protocol (MCP) Mastery (Weeks 3 & 4)
- [ ] **Both:** Complete *Course 3: Introduction to Model Context Protocol (MCP)*.
- [ ] **Canishe:** Implement a Python FastMCP server exposing `OmniQuery-AI` data.
- [ ] **Rahul:** Connect that MCP server to both Claude Desktop and Google Antigravity to observe identical behavior across both platforms.

### Phase 3: Production API & Agents (Weeks 5 & 6)
- [ ] **Canishe:** Deep dive into *Course 2: Building with the Claude API* (focusing on Function Calling, Hybrid RAG, and Agent Routing).
- [ ] **Rahul:** Focus on understanding structured JSON output, prompt evaluation, and error handling.
- [ ] **Joint Project:** Wire `OmniQuery-AI`'s LangGraph router to invoke custom MCP tools.

### Phase 4: Claude Code & Automated Development (Weeks 7 & 8)
- [ ] **Both:** Complete *Course 4: Claude Code in Action*.
- [ ] **Hands-on Exercise:** Set up automated test hooks in their repository so that neither an agent nor a developer can push code that breaks `pytest`.
- [ ] **Canishe:** Finalize Claude Partner Network certification assessment and update LinkedIn / CV.

---

## 7. Summary Conclusion

Learning these concepts through Anthropic's Claude Partner curriculum is **100% transferable to Google Antigravity** and represents the best current standard in AI engineering.

* **For Rahul:** It provides a multi-year head start, setting him apart from his SRM peers from day one.
* **For Canishe:** It provides the enterprise pedigree, partner certification, and architectural depth needed to command ₹10–16 LPA offers in Bangalore.
* **For Janar:** It unifies the mentoring framework, ensuring that both Canishe and Rahul learn the exact same architectural standards used in top-tier US enterprise AI systems.
