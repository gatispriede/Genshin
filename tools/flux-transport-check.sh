#!/usr/bin/env bash
# Why does mcp-remote work against funisimo.pro but fail against
# flux.siaup.store with the same invocation?
#
# mcp-remote's stack trace shows SSEClientTransport._authThenStart -> OAuth
# registerClient -> a Next.js 404 page. That happens when the SSE endpoint
# does not answer as expected: mcp-remote concludes the server wants OAuth.
#
# This checks both transports on both hosts. Tokens come from the vault as
# $FLUX_TOKEN; the funisimo check runs unauthenticated, since we only need the
# status code that decides mcp-remote's path.
#
#   secrets run flux-transport-check

set -u

check_sse() {
  printf '%-34s SSE  GET -> ' "$1"
  curl -sS -o /dev/null -w '%{http_code}\n' --max-time 15 \
    -H "Accept: text/event-stream" \
    ${2:+-H "Authorization: Bearer $2"} \
    "$1"
}

check_http() {
  printf '%-34s HTTP POST -> ' "$1"
  curl -sS -o /dev/null -w '%{http_code}\n' --max-time 15 -X POST \
    -H "Content-Type: application/json" \
    -H "Accept: application/json, text/event-stream" \
    ${2:+-H "Authorization: Bearer $2"} \
    -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"probe","version":"1"}}}' \
    "$1"
}

echo "=== flux (authenticated) ==="
check_sse  "https://flux.siaup.store/mcp" "${FLUX_TOKEN:-}"
check_http "https://flux.siaup.store/mcp" "${FLUX_TOKEN:-}"

echo
echo "=== funisimo (unauthenticated — status code is what matters) ==="
check_sse  "https://funisimo.pro/mcp" ""
check_http "https://funisimo.pro/mcp" ""

echo
echo "=== OAuth discovery endpoints mcp-remote probes ==="
for host in flux.siaup.store funisimo.pro; do
  printf '%-34s -> ' "$host/.well-known/oauth-authorization-server"
  curl -sS -o /dev/null -w '%{http_code}\n' --max-time 15 \
    "https://$host/.well-known/oauth-authorization-server"
done
