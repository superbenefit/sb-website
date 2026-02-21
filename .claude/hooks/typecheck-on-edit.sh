#!/usr/bin/env bash
# PostToolUse hook: async astro check after .ts/.astro edits.
# Backgrounds the check and exits immediately (non-blocking).
# Results written to .claude/typecheck.log.
set -euo pipefail

FILE_PATH=$(node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));console.log(d.tool_input?.file_path||'')")

if [ -z "$FILE_PATH" ]; then
  exit 0
fi

# Only typecheck for TypeScript and Astro files
case "$FILE_PATH" in
  *.ts|*.astro) ;;
  *) exit 0 ;;
esac

# Run astro check in the background, write output to log
LOG="$CLAUDE_PROJECT_DIR/.claude/typecheck.log"
(
  cd "$CLAUDE_PROJECT_DIR"
  echo "--- $(date -Iseconds) checking after edit: $(basename "$FILE_PATH") ---" > "$LOG"
  npx astro check >> "$LOG" 2>&1 || true
) &

exit 0
