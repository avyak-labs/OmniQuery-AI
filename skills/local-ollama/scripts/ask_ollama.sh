#!/usr/bin/env bash
set -euo pipefail

MODEL="llama3:latest"
if [[ "${1:-}" == "-m" || "${1:-}" == "--model" ]]; then
  MODEL="${2:-llama3:latest}"
  shift 2
fi

PROMPT="${*:-}"
STDIN_DATA=""
if [ ! -t 0 ]; then
  STDIN_DATA="$(cat)"
fi

if [[ -n "$STDIN_DATA" && -n "$PROMPT" ]]; then
  FULL_PROMPT="${PROMPT}"$'\n\n'"${STDIN_DATA}"
elif [[ -n "$STDIN_DATA" ]]; then
  FULL_PROMPT="$STDIN_DATA"
else
  FULL_PROMPT="$PROMPT"
fi

if [[ -z "$FULL_PROMPT" ]]; then
  echo "Usage: ask_ollama.sh [-m model] <prompt> (or pipe stdin)" >&2
  exit 1
fi

if ! curl -sf http://localhost:11434/api/tags >/dev/null 2>&1; then
  brew services start ollama >/dev/null 2>&1 || (nohup ollama serve >/dev/null 2>&1 &)
  for _ in {1..15}; do
    curl -sf http://localhost:11434/api/tags >/dev/null 2>&1 && break
    sleep 1
  done
fi

python3 -c '
import json, sys, urllib.request
model = sys.argv[1]
prompt = sys.argv[2]
req = urllib.request.Request(
    "http://localhost:11434/api/generate",
    data=json.dumps({"model": model, "prompt": prompt, "stream": False}).encode("utf-8"),
    headers={"Content-Type": "application/json"},
)
with urllib.request.urlopen(req, timeout=180) as resp:
    data = json.loads(resp.read().decode("utf-8"))
    sys.stdout.write(data.get("response", "").strip() + "\n")
' "$MODEL" "$FULL_PROMPT"
