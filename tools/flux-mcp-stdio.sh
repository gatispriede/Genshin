#!/usr/bin/env bash
# stdio <-> http bridge for the flux CMS MCP endpoint.
#
# Why this exists: .mcp.json cannot hold the token (plaintext) and the
# "${FLUX_PROD_MCP_TOKEN}" form only resolves if Claude Code itself was
# launched through the vault. This bridge moves the credential one process
# down — the vault injects $FLUX_TOKEN here, so Claude Code needs nothing in
# its own environment and does not have to be relaunched.
#
# Wired up as:
#   .mcp.json  "flux-prod": { "command": "secrets.exe", "args": ["launch","flux-mcp-bridge"] }
#   vault      binding flux-mcp-bridge -> FLUX_TOKEN = flux-mcp.token
#
# stdio is passed straight through, so this must print nothing of its own.

set -u

URL="https://flux.siaup.store/mcp"

if [ -z "${FLUX_TOKEN:-}" ]; then
  echo "FLUX_TOKEN is not set — run via the vault binding flux-mcp-bridge." >&2
  exit 2
fi

exec npx -y mcp-remote "$URL" --header "Authorization: Bearer ${FLUX_TOKEN}"
