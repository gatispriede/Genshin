#!/usr/bin/env bash
# stdio <-> http bridge for the flux CMS MCP endpoint.
#
# --transport http-only is load-bearing, not a preference. Measured:
#
#   flux.siaup.store/mcp   SSE GET -> 400   POST -> 200
#   funisimo.pro/mcp       SSE GET -> 401   POST -> 401
#
# flux does not implement the SSE transport at all. mcp-remote tries SSE
# first, reads the 400 as an auth problem, falls into OAuth discovery, gets
# the Next.js 404 page from /.well-known/oauth-authorization-server and dies
# parsing HTML as JSON. That is the crash filling mcp-server-flux-prod.log.
# funisimo still speaks SSE, which is why the identical invocation works there.
#
# The token arrives as $FLUX_TOKEN from the vault binding flux-mcp-bridge —
# never on the command line, where Claude Desktop's config currently puts it
# and where it lands in process listings.
#
# stdio is passed straight through, so this must print nothing of its own.

set -u

URL="https://flux.siaup.store/mcp"

if [ -z "${FLUX_TOKEN:-}" ]; then
  echo "FLUX_TOKEN is not set — run via the vault binding flux-mcp-bridge." >&2
  exit 2
fi

exec npx -y mcp-remote "$URL" \
  --transport http-only \
  --header "Authorization: Bearer ${FLUX_TOKEN}"
