import { readFileSync, writeFileSync } from 'node:fs';
const picks = JSON.parse(readFileSync(new URL('./picks.json', import.meta.url), 'utf8'));
const P = new URL('../../src/data/varieties.json', import.meta.url);
const vs = JSON.parse(readFileSync(P, 'utf8'));
const byId = Object.fromEntries(vs.map(v => [v.id, v]));
let applied = 0, skipped = 0;
const missing = [];
for (const [id, url] of Object.entries(picks)) {
  if (url === '__skip__') { skipped++; continue; }
  const v = byId[id];
  if (!v) { missing.push(id); continue; }
  v.instagramUrl = url;
  applied++;
}
writeFileSync(P, JSON.stringify(vs, null, 2) + '\n', 'utf8');
console.log(JSON.stringify({ applied, skipped, missing }));
