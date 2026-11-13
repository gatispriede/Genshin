/**
 * Migrates the unblocked static pages to flux as CMS modules.
 *
 * Native modules where the markup maps onto one, RICH_TEXT where it does not —
 * which is almost entirely wide tables, the thing nothing native holds without
 * losing its shape.
 *
 *     secrets run flux-migrate-html                 # plan only
 *     secrets run flux-migrate-html -- --apply
 *     secrets run flux-migrate-html -- --only codes.html
 *
 * Only pages tools/classify-pages.py reports as blocker-free are listed here.
 * Build pages need their scripts run first; map pages need MAP_ANNOTATED.
 */

import { readFileSync } from 'node:fs';

const URL_ = 'https://flux.siaup.store/mcp';
const TOKEN = process.env.FLUX_TOKEN;
const APPLY = process.argv.includes('--apply');
const ONLY = (() => {
  const i = process.argv.indexOf('--only');
  return i === -1 ? null : process.argv[i + 1];
})();

/** Blocker-free pages, from tools/classify-pages.py. */
const PAGES = [
  ['character-roadmap.html', 'Character roadmap'],
  ['enemy-coverage.html', 'Enemy shields'],
  ['teams.html', 'The three teams'],
  ['build-coverage.html', 'Build coverage'],
  ['stellar.html', 'Stellar Glimmer'],
  ['talent-farming.html', 'Talent farming'],
  ['codes.html', 'Redeem codes'],
  ['collectibles-status.html', 'Collectibles status'],
  ['reputation-compass.html', 'Treasure Compasses'],
  ['reputation-quests.html', 'Reputation quests'],
  ['reaction-combos.html', 'Reaction combos'],
  ['theater.html', 'Imaginarium Theater'],
  ['tcg-swap.html', 'TCG swaps'],
  ['support-squad.html', 'Support squad'],
];

/* --------------------------------------------------------------- parse --- */

const VOID = new Set(['br', 'hr', 'img', 'input', 'meta', 'link', 'source']);

/** Split a fragment into its top-level elements, tracking nesting depth. */
function topLevelBlocks(html) {
  const blocks = [];
  const re = /<(\/?)([a-zA-Z][\w-]*)\b([^>]*)>/g;
  let depth = 0, start = -1, m;

  while ((m = re.exec(html))) {
    const [tag, closing, name, attrs] = m;
    if (VOID.has(name.toLowerCase()) || attrs.endsWith('/')) {
      if (depth === 0) blocks.push({ name: name.toLowerCase(), html: tag, attrs });
      continue;
    }
    if (!closing) {
      if (depth === 0) { start = m.index; blocks.push({ name: name.toLowerCase(), attrs, _s: start }); }
      depth++;
    } else {
      depth--;
      if (depth === 0 && blocks.length) {
        const b = blocks[blocks.length - 1];
        b.html = html.slice(b._s, m.index + tag.length);
        delete b._s;
      }
      if (depth < 0) depth = 0;
    }
  }
  return blocks.filter((b) => b.html);
}

const strip = (h) => h
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, '');

const text = (h) => h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const decode = (s) => s
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
  .replace(/&mdash;/g, '—').replace(/&rsquo;/g, '’').replace(/&nbsp;/g, ' ');

/* -------------------------------------------------------------- modules --- */

const json = (o) => JSON.stringify(o);

function tableModule(html) {
  const rows = html.match(/<tr[\s\S]*?<\/tr>/gi) || [];
  const widest = Math.max(...rows.map((r) => (r.match(/<t[dh]\b/gi) || []).length), 0);
  const merged = /colspan|rowspan/i.test(html);

  // Two plain columns are a label/value pair — that is what the dossier is for.
  if (widest === 2 && !merged) {
    const items = rows.map((r) => {
      const cells = (r.match(/<t[dh][\s\S]*?<\/t[dh]>/gi) || []).map((c) => decode(text(c)));
      return cells.length === 2 && cells[0] ? { label: cells[0], value: cells[1] } : null;
    }).filter(Boolean);
    if (items.length >= 2) {
      return { type: 'KEY_VALUE_DOSSIER', style: 'spec', content: json({ items }) };
    }
  }
  // Anything wider keeps its shape only as markup.
  return { type: 'RICH_TEXT', style: 'default', content: json({ value: html }) };
}

function listModule(html) {
  const items = (html.match(/<li[\s\S]*?<\/li>/gi) || [])
    .map((li) => decode(text(li))).filter(Boolean)
    .map((t) => ({ label: t }));
  if (items.length < 2) return { type: 'RICH_TEXT', style: 'default', content: json({ value: html }) };
  return { type: 'LIST', style: 'default', content: json({ items }) };
}

function headingModule(txt, eyebrow) {
  return { type: 'SECTION_HEADING', style: 'editorial',
           content: json({ eyebrow, heading: txt, align: 'left' }) };
}

/** Walk one page's blocks and produce an ordered module list. */
function pageModules(html, title) {
  const body = strip((html.match(/<body[^>]*>([\s\S]*)<\/body>/i) || [, html])[1]);
  const wrap = (body.match(/<div class="wrap"[^>]*>([\s\S]*)<\/div>/i) || [, body])[1];

  const mods = [];
  let pendingProse = [];

  const flushProse = () => {
    if (!pendingProse.length) return;
    mods.push({ type: 'RICH_TEXT', style: 'default',
                content: json({ value: pendingProse.join('\n') }) });
    pendingProse = [];
  };

  for (const b of topLevelBlocks(wrap)) {
    const cls = (b.attrs.match(/class="([^"]*)"/) || [, ''])[1];

    if (b.name === 'h1') { flushProse(); mods.push(headingModule(decode(text(b.html)), title)); continue; }
    if (b.name === 'h2') { flushProse(); mods.push(headingModule(decode(text(b.html)))); continue; }
    if (b.name === 'div' && /\bbar\b/.test(cls)) {
      flushProse();
      mods.push(headingModule(decode(text(b.html))));
      continue;
    }
    if (b.name === 'table') { flushProse(); mods.push(tableModule(b.html)); continue; }
    if (b.name === 'ul' || b.name === 'ol') { flushProse(); mods.push(listModule(b.html)); continue; }

    if (text(b.html)) pendingProse.push(b.html);
  }
  flushProse();
  return mods;
}

/* ------------------------------------------------------------------ mcp --- */

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
  const t = await res.text();
  const line = t.split('\n').find((l) => l.startsWith('data: '));
  const payload = JSON.parse(line ? line.slice(6) : t || '{}');
  if (payload.error) throw new Error(method + ': ' + JSON.stringify(payload.error));
  return payload.result;
}

async function call(name, args = {}) {
  const r = await rpc('tools/call', { name, arguments: args });
  const t = r?.content?.[0]?.text;
  const parsed = t ? JSON.parse(t) : r;
  const ok = r?.isError !== true && parsed?.ok !== false && !parsed?.code;
  if (!ok) throw new Error(`${name}: ${JSON.stringify(parsed).slice(0, 200)}`);
  return parsed?.data ?? parsed;
}

/* ------------------------------------------------------------------ run --- */

const main = async () => {
  const chosen = ONLY ? PAGES.filter(([f]) => f === ONLY) : PAGES;
  if (!chosen.length) { console.error('no matching page'); process.exit(1); }

  const plans = chosen.map(([file, title]) => {
    const mods = pageModules(readFileSync(file, 'utf8'), title);
    const counts = {};
    mods.forEach((m) => { counts[m.type] = (counts[m.type] || 0) + 1; });
    return { file, title, mods, counts };
  });

  // Coverage, because "it ran" is not the same as "the content arrived".
  // Compares visible text in the source against visible text across the
  // emitted modules. Anything well under 100% means blocks are being dropped.
  for (const p of plans) {
    const src = text(strip((readFileSync(p.file, 'utf8')
      .match(/<div class="wrap"[^>]*>([\s\S]*)<\/div>/i) || [, ''])[1]));
    const out = p.mods.map((m) => {
      const c = JSON.parse(m.content);
      return c.value ? text(c.value)
        : [c.heading, c.eyebrow, ...(c.items || []).flatMap((i) => [i.label, i.value])]
            .filter(Boolean).join(' ');
    }).join(' ');
    p.coverage = src.length ? Math.round(100 * out.length / src.length) : 100;
  }

  for (const p of plans) {
    const summary = Object.entries(p.counts).map(([k, v]) => `${k}×${v}`).join(' ');
    const flag = p.coverage < 90 ? '  ← CONTENT LOST' : '';
    console.log(`${p.title.padEnd(24)} ${String(p.mods.length).padStart(3)} mods  ${String(p.coverage).padStart(3)}% text  ${summary}${flag}`);
  }
  const totalRich = plans.reduce((n, p) => n + (p.counts.RICH_TEXT || 0), 0);
  const total = plans.reduce((n, p) => n + p.mods.length, 0);
  console.log(`\n${total} modules, ${totalRich} RICH_TEXT (${Math.round(100 * (total - totalRich) / total)}% native)`);

  if (!APPLY) { console.log('\ndry run — pass --apply to write'); return; }
  if (!TOKEN) { console.error('FLUX_TOKEN not set'); process.exit(2); }

  await rpc('initialize', {
    protocolVersion: '2025-06-18', capabilities: {},
    clientInfo: { name: 'genshin-migrate', version: '1' },
  });

  const pages = await call('page.list', {});
  const root = pages.find((p) => p.page === 'Genshin notes' && p.source !== 'system-page');
  if (!root) { console.error('no Genshin notes root — run flux-push first'); process.exit(1); }

  let guides = pages.find((p) => p.page === 'Guides' && p.source !== 'system-page');
  if (!guides) {
    await call('page.create', { page: 'Guides' });
    guides = (await call('page.list', {})).filter((p) => p.page === 'Guides').pop();
    await call('page.setParent', { pageId: guides.id, parentId: root.id });
  }

  for (const p of plans) {
    const existing = (await call('page.list', {}))
      .find((x) => x.page === p.title && x.source !== 'system-page');
    if (existing) await call('page.delete', { id: existing.id });

    await call('page.create', { page: p.title });
    const row = (await call('page.list', {})).filter((x) => x.page === p.title).pop();
    await call('page.setParent', { pageId: row.id, parentId: guides.id });
    const { sectionId } = await call('section.create', { pageId: row.id, type: 1 });
    await call('module.add', { items: p.mods.map((m) => ({ sectionId, module: m })) });
    console.log(`  /genshin-notes/${guides.slug}/${row.slug}  (${p.mods.length} modules)`);
  }
};

main().catch((e) => { console.error('FAILED:', e.message); process.exit(1); });
