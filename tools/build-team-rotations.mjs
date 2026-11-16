/**
 * Writes each team's rotation (src/data/teams.ts `rotation`) into teams.html,
 * right after that team's line-up, between markers so a re-run replaces it:
 *
 *     <!-- ROTATION:mizuki -->  …generated…  <!-- /ROTATION:mizuki -->
 *
 *     node tools/build-team-rotations.mjs
 *
 * teams.ts stays the single source: flux-push.mjs renders the same steps on
 * each flux team page.
 */

import { build } from 'esbuild';
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { resolve } from 'node:path';

const PAGE = 'teams.html';

const tmp = resolve('tools/.rotation-data.mjs');
await build({ entryPoints: [resolve('src/data/index-for-push.ts')], bundle: true, format: 'esm',
              platform: 'node', outfile: tmp, logLevel: 'silent' });
const { teams } = await import('file://' + tmp + '?t=' + Date.now());
unlinkSync(tmp);

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function block(t) {
  const rows = t.rotation.map((s, i) =>
    `    <tr><td><b>${i + 1}</b></td><td><b>${esc(s.who)}</b></td><td>${esc(s.does)}</td></tr>`).join('\n');
  return `<!-- ROTATION:${t.id} -->
  <h3>Rotation</h3>
  <table>
    <tr><th>#</th><th>Who</th><th>What</th></tr>
${rows}
  </table>
  ${t.rotationNote ? `<p class="sub">${esc(t.rotationNote)}</p>` : ''}
  <!-- /ROTATION:${t.id} -->`;
}

let html = readFileSync(PAGE, 'utf8');
for (const t of teams.filter((x) => x.rotation?.length)) {
  const marked = new RegExp(`<!-- ROTATION:${t.id} -->[\\s\\S]*?<!-- /ROTATION:${t.id} -->`);
  if (marked.test(html)) { html = html.replace(marked, block(t)); continue; }
  // First run: after the closing </div> of the team's line-up box, found from
  // its heading ("<h2>N · Team name</h2>").
  const h = html.indexOf(`· ${t.name}</h2>`);
  if (h < 0) throw new Error(`no heading for ${t.name} in ${PAGE}`);
  const end = html.indexOf('</div>', html.indexOf('class="lineup"', h)) + '</div>'.length;
  html = html.slice(0, end) + '\n\n  ' + block(t) + html.slice(end);
}
writeFileSync(PAGE, html);
console.log(`rotations written for ${teams.filter((x) => x.rotation?.length).map((x) => x.id).join(', ')}`);
