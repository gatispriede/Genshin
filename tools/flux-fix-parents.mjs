/**
 * Sets the parent on every pushed page, which flux-push.mjs failed to do.
 *
 * Why it failed: that script's call() only treated {ok:false} as an error.
 * An argument-shape error comes back as isError at the MCP layer with a body
 * of {code, message} and no ok field, so page.update reported success while
 * doing nothing. Every page landed at the root and every nested URL 404'd.
 * The same blind spot is fixed here and in flux-clean-products.mjs.
 *
 *     secrets run flux-fix-parents            # show the plan
 *     secrets run flux-fix-parents -- --apply
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

/** Strict: an unknown tool or bad arg shape is a failure, not a success. */
async function call(name, args = {}) {
  const r = await rpc('tools/call', { name, arguments: args });
  const t = r?.content?.[0]?.text;
  const parsed = t ? JSON.parse(t) : r;
  const ok = r?.isError !== true && parsed?.ok !== false && !parsed?.code;
  if (!ok) throw new Error(`${name}: ${JSON.stringify(parsed).slice(0, 180)}`);
  return parsed?.data ?? parsed;
}

const main = async () => {
  await rpc('initialize', {
    protocolVersion: '2025-06-18', capabilities: {},
    clientInfo: { name: 'genshin-parents', version: '1' },
  });

  const pages = await call('page.list', {});
  const byName = (n) => pages.find((p) => p.page === n && p.source !== 'system-page');

  const root = byName('Genshin notes');
  const builds = byName('Builds');
  const teams = byName('Teams');
  if (!root || !builds || !teams) {
    console.error('missing structural pages — run flux-push first');
    process.exit(1);
  }

  const structural = new Set(['Genshin notes', 'Builds', 'Teams']);
  const teamNames = new Set(['Skirk freeze', 'Mizuki Stellar Swirl',
    'Varesa Electro-Charged', 'Pyro core (planned)']);

  const plan = [
    { page: builds, parent: root },
    { page: teams, parent: root },
  ];
  for (const p of pages) {
    if (p.source === 'system-page' || structural.has(p.page)) continue;
    plan.push({ page: p, parent: teamNames.has(p.page) ? teams : builds });
  }

  console.log(`${plan.length} pages to re-parent`);
  if (!APPLY) {
    plan.forEach((x) => console.log(`  ${x.page.page} -> ${x.parent.page}`));
    console.log('\ndry run — pass --apply');
    return;
  }

  // Probe the argument shape once rather than guessing, then use what works.
  const shapes = [
    ['page.setParent', (c, p) => ({ pageId: c.id, parentId: p.id })],
    ['page.setParent', (c, p) => ({ pageId: c.id, parent: p.id })],
    ['page.update', (c, p) => ({ pageId: c.id, parent: p.id })],
  ];

  let chosen = null;
  for (const [name, args] of shapes) {
    try {
      await call(name, args(plan[0].page, plan[0].parent));
      chosen = [name, args];
      console.log(`using ${name} ${JSON.stringify(Object.keys(args(plan[0].page, plan[0].parent)))}`);
      break;
    } catch (e) {
      console.log(`  rejected: ${e.message.slice(0, 110)}`);
    }
  }
  if (!chosen) { console.error('no working parent tool'); process.exit(1); }

  const [name, args] = chosen;
  let done = 1; const failed = [];
  for (const { page, parent } of plan.slice(1)) {
    try { await call(name, args(page, parent)); done++; }
    catch (e) { failed.push(`${page.page}: ${e.message.slice(0, 80)}`); }
  }

  console.log(`\nre-parented ${done}, failed ${failed.length}`);
  failed.forEach((f) => console.log('  ' + f));

  const after = await call('page.list', {});
  const nested = after.filter((p) => p.parent).length;
  console.log(`${nested} pages now carry a parent`);
};

main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
