#!/usr/bin/env bash
# Probes the flux CMS MCP endpoint with a real JSON-RPC initialize handshake.
#
# The token comes from $FLUX_TOKEN, injected by the vault binding
# `flux-mcp-probe` — never from a file and never from the command line, where
# it would land in shell history and process listings.
#
#   secrets run flux-mcp-probe
#
# Prints the initialize result and the tool count, or the HTTP error.

set -u

URL="https://flux.siaup.store/mcp"

if [ -z "${FLUX_TOKEN:-}" ]; then
  echo "FLUX_TOKEN is not set — run this through the vault binding, not directly." >&2
  exit 2
fi

init_body='{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"genshin-notes-probe","version":"1"}}}'

# -D - keeps the headers so we can read Mcp-Session-Id out of them.
resp=$(curl -sS -D - --max-time 25 -X POST "$URL" \
  -H "Authorization: Bearer $FLUX_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -d "$init_body" 2>&1)

echo "--- initialize ---"
echo "$resp" | sed -n '1p'
echo "$resp" | grep -i '^mcp-session-id:' || echo "(no Mcp-Session-Id header returned)"
echo "$resp" | tail -n 1

session=$(echo "$resp" | grep -i '^mcp-session-id:' | tr -d '\r' | awk '{print $2}')
if [ -z "$session" ]; then
  echo "No session id — stopping before tools/list." >&2
  exit 1
fi

echo
echo "--- tools/list ---"
curl -sS --max-time 25 -X POST "$URL" \
  -H "Authorization: Bearer $FLUX_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Mcp-Session-Id: $session" \
  -d '{"jsonrpc":"2.0","method":"notifications/initialized"}' >/dev/null

curl -sS --max-time 25 -X POST "$URL" \
  -H "Authorization: Bearer $FLUX_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json, text/event-stream" \
  -H "Mcp-Session-Id: $session" \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/list"}' \
  | head -c 600
echo
