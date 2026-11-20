/**
 * Finds duplicated content between published pages: the share of each page's
 * 8-word passages that also appear on another page. Local build only, no network.
 *
 *     node tools/content-overlap.mjs     # prints pairs, worst first
 */
import { buildPlans } from './flux-build.mjs';
import { moduleText } from './flux-layout.mjs';

const N = 8;
const { plans } = buildPlans();
const pages = plans.map((p) => {
  const words = p.sections.flatMap((s) => s.modules).map(moduleText).join(' ')
    .toLowerCase().replace(/[^a-z0-9%★ ]+/g, ' ').split(/\s+/).filter(Boolean);
  const grams = new Set();
  for (let i = 0; i + N <= words.length; i++) grams.add(words.slice(i, i + N).join(' '));
  return { href: p.entry.href, title: p.entry.title, words: words.length, grams };
});

const pairs = [];
for (let i = 0; i < pages.length; i++) for (let j = i + 1; j < pages.length; j++) {
  const [a, b] = [pages[i], pages[j]];
  let shared = 0;
  for (const g of a.grams) if (b.grams.has(g)) shared++;
  if (shared < 5) continue;
  pairs.push({ a: a.title, b: b.title, shared,
    ofA: Math.round((100 * shared) / a.grams.size), ofB: Math.round((100 * shared) / b.grams.size) });
}
pairs.sort((x, y) => Math.max(y.ofA, y.ofB) - Math.max(x.ofA, x.ofB));
for (const p of pairs) console.log(`${String(Math.max(p.ofA, p.ofB)).padStart(3)}%  ${p.a}  <->  ${p.b}  (${p.shared} passages; ${p.ofA}% / ${p.ofB}%)`);
console.log(`${pairs.length} pairs share 5+ passages, of ${pages.length} pages`);
