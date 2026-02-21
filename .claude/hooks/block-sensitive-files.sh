#!/usr/bin/env bash
# PreToolUse hook: block edits to sensitive files.
# Receives JSON on stdin with tool_input.file_path.
# Exit 0 = allow, Exit 2 = block (stderr shown to Claude).
set -euo pipefail

FILE_PATH=$(node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log(d.tool_input?.file_path||'')")

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

BASENAME=$(basename "$FILE_PATH")

case "$BASENAME" in
  .env|.dev.vars|package-lock.json)
    echo "Blocked: $BASENAME is a protected file. Edit it manually." >&2
    exit 2
    ;;
esac

# Catch .env.* variants (e.g. .env.local, .env.production)
if [[ "$BASENAME" == .env.* && "$BASENAME" != ".env.example" ]]; then
  echo "Blocked: $BASENAME is a protected file. Edit it manually." >&2
  exit 2
fi

exit 0
