// 2026-06-11 写真選定バッチ: IGタグ収集結果 → embed検証 → candidates.json
import { readFileSync, writeFileSync } from 'node:fs';

const varieties = JSON.parse(readFileSync(new URL('../../src/data/varieties.json', import.meta.url), 'utf-8'));
const usedCodes = new Set(
  varieties.map(v => (v.instagramUrl || '').match(/\/p\/([A-Za-z0-9_-]+)/)?.[1]).filter(Boolean)
);

// Chrome収集結果（2026-06-11）。複数タグに出た汎用投稿はこの後の crossCodes で除外
const raw = {
  'polar-bear':      ['CukwDpRrgve','Cukp0xjuLgq','DNHfx8uSXWC','CyKJHbfPxFB','C2qsQoYtchX'],
  'kaguya':          ['DJwYo2dzdoe','DI59irUSNKV','DPRlyNIEn4Q','DT10CCmka2I','CrTQQPDrc8N'],
  'monkey-north':    ['Co5zxlAyUd2','DS7k-PEk-3u','DQ9j-W9Egt5','DT7tsPQEuW2','DPlOqICjxg3'],
  'monkey-king':     ['CyYsYYQPxe8','CzYsu09rfQG','DS7k-PEk-3u','Ct8mDzfrcvL','C14E5NvrHd3'],
  'ellisotis':       ['CqCrbSyPAsi','CzcTTp1hZUZ','CkKbYGiBR6W','CvWFF9BPUeb','C7MF0YpRDMJ'],
  'paul-vespa':      ['Cn0WbolPXbX','C2LyIJpvxBF','DNXY264zBfJ','DTaIROhD-P6','CgPXWFWLxRs'],
  'south-pole-star': ['DS7k-PEk-3u','DBsGIJ9zgUS','DQ9j-W9Egt5','DX-6Dy9kSyT','DLhJQYyT47X'],
  'popcorn':         ['DQVVjE1jyi_','DPtMZjMEqQi','DU-yEzliUKm','DYFJpNfj0qq','DKj323GzJYz'],
  'silver-frond':    ['DODc9VOEq6a','DS7k-PEk-3u','DBsGIJ9zgUS','DQ9j-W9Egt5','B0k_qgVFpCz'],
  'unicorn':         ['DUKDrnDkjiw','DKjm2dxz0a4','DNp0uhFRymd','DKWy27Nz1d4','DGa5wq7zoAn'],
  'bambi':           ['DDW06yuTGmy','DH7qDNByK6p','DS7k-PEk-3u','DYe6VkYmNjV','DQ9j-W9Egt5'],
  'moomin':          ['DAaX5TGy_H0','C5uUt2avSAp','C1rcHEiLlos','C78H6otv24j','DWMnGmjD-8B'],
  'kitshakood-thin': ['DS7k-PEk-3u','DQ9j-W9Egt5','DBsGIJ9zgUS','DT7tsPQEuW2','DXxt2FLEze-'],
};

// 複数品種のタグに登場するコード＝汎用横断投稿として除外
const seen = {};
Object.values(raw).flat().forEach(c => seen[c] = (seen[c] || 0) + 1);
const crossCodes = new Set(Object.entries(seen).filter(([, n]) => n > 1).map(([c]) => c));
console.log('横断除外:', [...crossCodes].join(', '));

async function checkEmbed(code) {
  try {
    const res = await fetch(`https://www.instagram.com/p/${code}/embed/`, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
    });
    if (!res.ok) return false;
    const html = await res.text();
    if (/PrivateMedia|WatchOnInstagram/.test(html)) return false;
    return /scontent/.test(html);
  } catch { return false; }
}

const out = [];
for (const [id, codes] of Object.entries(raw)) {
  const v = varieties.find(x => x.id === id);
  const ok = [];
  for (const code of codes) {
    if (crossCodes.has(code) || usedCodes.has(code)) continue;
    if (await checkEmbed(code)) ok.push({ url: `https://www.instagram.com/p/${code}/` });
    if (ok.length >= 5) break;
  }
  out.push({ id, name: v?.name ?? id, candidates: ok });
  console.log(`${id}: ${ok.length}候補`);
}

writeFileSync(new URL('./candidates.json', import.meta.url), JSON.stringify(out, null, 1), 'utf-8');
console.log('candidates.json 保存完了');
