/**
 * Clears the Products collection on flux.
 *
 * Deleting the navigation pages left the catalogue untouched — 34 PC parts
 * from the demo tenant still answer at /products and the system shop routes.
 * Those live in a separate collection, so page.delete never reached them.
 *
 *     secrets run flux-clean-products            # list what would go
 *     secrets run flux-clean-products -- --apply
 */

const URL_ = 'https://flux.siaup.store/mcp';
const TOKEN = process.env.FLUX_TOKEN;
const APPLY = process.argv.includes('--apply');

if (!TOKEN) { console.error('FLUX_TOKEN not set — run via the vault.'); process.exit(2); }

let session = null;

async function rpc(method, params) {
  const headers = {
    Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json',
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
  if (payload.error) throw new Error(method + ': ' + JSON.stringify(payload.error));
  return payload.result;
}

async function call(name, args = {}) {
  const r = await rpc('tools/call', { name, arguments: args });
  const t = r?.content?.[0]?.text;
  const parsed = t ? JSON.parse(t) : r;
  // An unknown tool comes back as isError at the MCP layer with no ok:false
  // in the body — checking only parsed.ok reports success for a call that
  // never ran. Both have to be checked.
  const ok = r?.isError !== true && parsed?.ok !== false && !parsed?.code;
  return { ok, data: parsed?.data ?? parsed, raw: parsed };
}

const main = async () => {
  await rpc('initialize', {
    protocolVersion: '2025-06-18', capabilities: {},
    clientInfo: { name: 'genshin-clean', version: '1' },
  });

  const { data: products } = await call('product.list', {});
  console.log(`${products.length} products in the catalogue`);
  if (!APPLY) {
    console.log(products.map((p) => '  ' + p.title).join('\n'));
    console.log('\ndry run — pass --apply to remove');
    return;
  }

  // There is no product.delete on this build. Try each candidate once on the
  // first product and use whichever actually works, rather than assuming.
  const candidates = [
    ['catalogue.unpublish', (p) => ({ id: p.id })],
    ['catalogue.archive', (p) => ({ id: p.id })],
    ['product.update', (p) => ({ id: p.id, draft: true })],
  ];

  let chosen = null;
  for (const [name, args] of candidates) {
    const probe = await call(name, args(products[0])).catch(() => ({ ok: false }));
    if (probe.ok) { chosen = [name, args]; break; }
    console.log(`  ${name} unavailable`);
  }
  if (!chosen) { console.error('no working removal tool — stopping'); process.exit(1); }

  const [name, args] = chosen;
  console.log(`using ${name}`);
  let done = 1, failed = [];
  for (const p of products.slice(1)) {
    const r = await call(name, args(p)).catch(() => ({ ok: false }));
    if (r.ok) done++; else failed.push(p.title);
  }
  console.log(`${name}: ${done} ok, ${failed.length} failed`);
  if (failed.length) console.log('  failed: ' + failed.slice(0, 5).join(', '));

  const { data: after } = await call('product.list', {});
  console.log(`catalogue now holds ${after.length} products`);
};

main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
