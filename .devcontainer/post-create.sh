#!/usr/bin/env bash
# Prepares a squad's Codespace: tools, the Context Nexus cloned next to the starter, assembled context.
# Also usable locally on macOS / Linux from the starter folder: bash .devcontainer/post-create.sh
set -euo pipefail

NEXUS_URL="${NEXUS_URL:-https://github.com/zenika-dev/kolecto-context-nexus.git}"
STARTER_DIR="$(pwd)"
SQUAD="${SQUAD:-$(cat .hackathon/squad 2>/dev/null || basename "$STARTER_DIR" | sed 's/^starter-//')}"
export PATH="$HOME/.local/bin:$PATH"

echo "▸ uv and Graphify"
command -v uv >/dev/null || curl -LsSf https://astral.sh/uv/install.sh | env UV_NO_MODIFY_PATH=1 sh
uv tool install --quiet "graphifyy==0.9.99" || echo "⚠ Graphify not installed: uv tool install graphifyy==0.9.99"

echo "▸ Claude Code"
command -v claude >/dev/null || curl -fsSL https://claude.ai/install.sh | bash

# PATH, and empty secrets removed, for every new terminal.
grep -q 'AI-PDLC hackathon' "$HOME/.bashrc" 2>/dev/null || cat >> "$HOME/.bashrc" <<'RC'
# AI-PDLC hackathon
export PATH="$HOME/.local/bin:$PATH"
for v in ANTHROPIC_API_KEY ANTHROPIC_AUTH_TOKEN ANTHROPIC_BASE_URL; do [ -z "${!v:-}" ] && unset "$v"; done
RC

echo "▸ Context Nexus"
# A real folder inside the project (visible in the explorer), ignored by git; ../context-nexus links to it,
# so every command and instruction uses the same path, in a Codespace or locally.
NEXUS_REAL="$STARTER_DIR/context-nexus"
NEXUS_LINK="$(dirname "$STARTER_DIR")/context-nexus"
if [ -d "$NEXUS_LINK/teams" ] && [ ! -e "$NEXUS_REAL" ]; then
  echo "  using the existing $NEXUS_LINK"
else
  [ -d "$NEXUS_REAL/.git" ] || git clone --quiet "$NEXUS_URL" "$NEXUS_REAL"
  [ -e "$NEXUS_LINK" ] || ln -s "$NEXUS_REAL" "$NEXUS_LINK"
fi

if [ -f package.json ]; then echo "▸ npm install"; npm install --silent; fi

echo "▸ Context of $SQUAD"
npm run --silent context | tail -2

echo
echo "✓ Ready."
echo "  1. Connect Claude to the account you were given: claude auth login"
echo "  2. Run claude in the terminal (trust the folder), then type /welcome"
