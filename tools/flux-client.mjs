import { readFileSync } from 'node:fs';

/**
 * Shared MCP client for the flux CMS. Every tools/flux-*.mjs script imports
 * this instead of carrying its own copy of the handshake and error gate.
 *
 * The token comes from $FLUX_TOKEN, injected by a vault binding — never from a
 * file or the command line.
 */

// Production by default. --local points the same scripts at the local CMS
// instance for the bundle route: author there, review, export, import.
// (A flag, not an env var: vault bindings inject secrets only.)
const LOCAL_URL = 'http://127.0.0.1:8788/mcp';
const URL_ = process.argv.includes('--local') ? LOCAL_URL : 'https://flux.siaup.store/mcp';
export const TARGET = URL_;

let session = null;

// Local dev instance only: Gatis allows a plaintext dev token there (14 Nov).
// Production never reads a file — it stays vault-injected.
const LOCAL_TOKEN_FILE = 'D:/Work/redis-node-js-cloud/tools/mcp.dev.json';

/** Find the first mcpsk_ string anywhere in the dev-token file, whatever its key. */
function localDevToken() {
  try {
    const found = JSON.stringify(JSON.parse(readFileSync(LOCAL_TOKEN_FILE, 'utf8')))
      .match(/mcpsk_[A-Za-z0-9]+/);
    return found ? found[0] : null;
  } catch {
    return null;
  }
}

export function requireToken() {
  if (!process.env.FLUX_TOKEN && URL_ === LOCAL_URL) {
    const t = localDevToken();
    if (t) process.env.FLUX_TOKEN = t;
  }
  if (!process.env.FLUX_TOKEN) {
    console.error('FLUX_TOKEN is not set — run through a vault binding.');
    process.exit(2);
  }
}

async function rpc(method, params) {
  const headers = {
    Authorization: `Bearer ${process.env.FLUX_TOKEN}`,
    'Content-Type': 'application/json',
    Accept: 'application/json, text/event-stream',
  };
  if (session) headers['Mcp-Session-Id'] = session;
  const res = await fetch(URL_, {
    method: 'POST', headers,
    body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }),
  });
  if (!session) session = res.headers.get('mcp-session-id');
  const text = await res.text();
  const line = text.split('\n').find((l) => l.startsWith('data: '));
  const payload = JSON.parse(line ? line.slice(6) : text || '{}');
  if (payload.error) throw new Error(`${method}: ${JSON.stringify(payload.error)}`);
  return payload.result;
}

export async function connect(clientName) {
  requireToken();
  console.error(`target: ${URL_}`);
  await rpc('initialize', {
    protocolVersion: '2025-06-18', capabilities: {},
    clientInfo: { name: clientName, version: '1' },
  });
}

/**
 * Strict on purpose. Four ways a failed call reports itself, and each one has
 * fooled a script here at least once:
 *   isError          unknown tool / wrong argument shape (protocol level)
 *   ok:false         the documented failure shape
 *   code             structured errors such as VERSION_CONFLICT
 *   error            runMutation catches every throw and RESOLVES with
 *                    {"error": "..."} — a failed write that says nothing else
 */
export async function call(name, args = {}, attempt = 0) {
  const r = await rpc('tools/call', { name, arguments: args });
  const text = r?.content?.[0]?.text;
  const parsed = text ? JSON.parse(text) : r;

  // The server names its own back-off. Honour it rather than fail a long
  // batch halfway — a re-run recreates pages, but half-written is still worse.
  const err = parsed?.error;
  if (err?.code === 'RATE_LIMITED' && attempt < 5) {
    const wait = (err.retryAfterMs ?? 30000) + 500;
    console.error(`  rate limited on ${name}; waiting ${Math.round(wait / 1000)}s`);
    await new Promise((resolve) => setTimeout(resolve, wait));
    return call(name, args, attempt + 1);
  }

  const ok = r?.isError !== true && parsed?.ok !== false
    && !parsed?.code && !parsed?.error;
  if (!ok) throw new Error(`${name}: ${JSON.stringify(parsed).slice(0, 200)}`);
  return parsed?.data ?? parsed;
}

/** Find an operator-authored page by display name. */
export async function findPage(name) {
  const pages = await call('page.list', {});
  return pages.filter((p) => p.page === name && p.source !== 'system-page').pop();
}

/** Delete any page with this name, create it fresh, optionally parent it. */
export async function recreatePage(name, parentId) {
  const existing = await findPage(name);
  if (existing) await call('page.delete', { id: existing.id });
  await call('page.create', { page: name });
  const row = await findPage(name);
  if (!row) throw new Error(`page vanished after create: ${name}`);
  if (parentId) await call('page.setParent', { pageId: row.id, parentId });
  return row;
}
