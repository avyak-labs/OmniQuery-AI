---
name: local-ollama
description: Offload simple routine generation tasks (commit/PR message drafting, log/diff summarization, synthetic test data generation, doc formatting, or bulk text classification) to the local Ollama model (llama3:latest or qwen3:30b) running on this Mac at zero cloud token cost.
---

# Local Ollama Helper

Use the local Ollama instance on this Mac (`http://localhost:11434`) for simple routine tasks to conserve cloud token usage and weekly quota.

## Available Local Models
- `llama3:latest` (default — fast, lightweight 8B model for routine text, summaries, commit messages, and simple structured output)
- `qwen3:30b` (larger local model for heavier local reasoning or code tasks)

## Usage

Run the helper script `~/.orca/bots/omniquery-ai/skills/local-ollama/scripts/ask_ollama.sh`:

```bash
# Default model (llama3:latest) with an inline prompt
~/.orca/bots/omniquery-ai/skills/local-ollama/scripts/ask_ollama.sh "Summarize this git diff in 3 bullet points"

# Pipe stdin content (e.g. git diff or log file) with a prompt
git diff | ~/.orca/bots/omniquery-ai/skills/local-ollama/scripts/ask_ollama.sh "Draft a conventional commit message for this diff:"

# Use qwen3:30b instead
~/.orca/bots/omniquery-ai/skills/local-ollama/scripts/ask_ollama.sh -m qwen3:30b "Generate 5 synthetic SQL test queries"
```
