#!/usr/bin/env bash
# Calls one MCP tool on the flux CMS and prints the result.
#
# Claude Desktop's own flux-prod client is broken (it uses mcp-remote, which
# negotiates SSE first and crashes — see cms-migration-plan.md). This drives
# the endpoint directly over streamable HTTP instead, which flux does support.
#
# The token comes from $FLUX_TOKEN, injected by a vault binding. Never put it
# on the command line.
#
#   TOOL=page.list ARGS='{}' secrets run flux-mcp-call
#
# TOOL  - MCP tool name, e.g. page.list, page.create, module.add
# ARGS  - JSON object of arguments, default {}

set -u

URL="https://flux.siaup.store/mcp"
# Tool name and JSON arguments come in as positional args, so the caller can
# be driven by `secrets run flux-mcp-call <tool> <json>`.
TOOL="${1:-page.list}"
ARGS="${2:-{\}}"
[ -z "$ARGS" ] && ARGS='{}'

if [ -z "${FLUX_TOKEN:-}" ]; then
  echo "FLUX_TOKEN is not set — run through a vault binding." >&2
  exit 2
fi

hdr=(-H "Authorization: Bearer $FLUX_TOKEN"
     -H "Content-Type: application/json"
     -H "Accept: application/json, text/event-stream")

# 1. initialize, and keep the session id off the response headers.
init=$(curl -sS -D - -o /dev/null --max-time 25 -X POST "${hdr[@]}" \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"genshin-notes","version":"1"}}}' \
  "$URL")

session=$(printf '%s' "$init" | grep -i '^mcp-session-id:' | tr -d '\r' | awk '{print $2}')
if [ -z "$session" ]; then
  echo "No session id. First line of response:" >&2
  printf '%s' "$init" | sed -n '1p' >&2
  exit 1
fi

# 2. complete the handshake.
curl -sS -o /dev/null --max-time 25 -X POST "${hdr[@]}" \
  -H "Mcp-Session-Id: $session" \
  -d '{"jsonrpc":"2.0","method":"notifications/initialized"}' "$URL"

# 3. the actual call. Responses come back SSE-framed as "data: {...}" lines,
#    but fall back to raw output if that framing is absent.
echo "calling $TOOL $ARGS" >&2

raw=$(curl -sS --max-time 60 -X POST "${hdr[@]}" \
  -H "Mcp-Session-Id: $session" \
  -d "{\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"tools/call\",\"params\":{\"name\":\"$TOOL\",\"arguments\":$ARGS}}" \
  "$URL")

if printf '%s' "$raw" | grep -q '^data: '; then
  printf '%s' "$raw" | sed -n 's/^data: //p'
else
  printf '%s' "$raw"
fi
