// 2026-06-11 説明文加筆マージ（Web調査エージェント4バッチの結果を反映）
// - verified: description/sources を更新
// - Tonkla 9件: 作出者ソースのみ確認 → sources付与＋notes「交配親は非公表」
// - 構造修正: 裏取りが確実な12件のみ（mount-lewis産地系統化、siamwillin=bifurcatum、lineage確定など）
import { readFileSync, writeFileSync } from 'node:fs';

const PATH = new URL('../src/data/varieties.json', import.meta.url);
const varieties = JSON.parse(readFileSync(PATH, 'utf-8'));
const byId = Object.fromEntries(varieties.map(v => [v.id, v]));

const batches = [1, 2, 3, 4].flatMap(n =>
  JSON.parse(readFileSync(`C:/Users/i2wal/Desktop/claude/_enrich_batch${n}.json`, 'utf-8'))
);

let descUpdated = 0, sourcesAdded = 0;
for (const e of batches) {
  const v = byId[e.id];
  if (!v) { console.error('id不明: ' + e.id); continue; }
  if (e.verified && e.suggestedDesc) {
    v.description = e.suggestedDesc;
    descUpdated++;
  }
  if (e.sources?.length) {
    v.sources = e.sources;
    sourcesAdded++;
  }
}

// トンクラ作出のみ確認（交配親非公表）の9件: notesを正確に
const tonklaUnknown = ['adaman','bambi','bling-bling','blue-bird','ice-age','jynx','moomin','summer-breeze','vanilla-ice-cream'];
for (const id of tonklaUnknown) {
  const v = byId[id];
  if (v && !/非公表/.test(v.notes ?? '')) {
    v.notes = 'タイ・トンクラ（Tonkla Chantaburi Garden）作出。交配親は非公表。';
  }
}

// --- 構造修正（裏取り済みのみ） ---

// マウントルイス: 豪クイーンズランドの産地系統（willinckiiではない）
Object.assign(byId['mount-lewis'], {
  scientificName: "Platycerium 'Mt. Lewis'",
  group: 'オーストラリア系',
  origin: 'オーストラリア・クイーンズランド州（マウントルイス産地系統）',
  lineage: ['bifurcatum'],
  tags: ['ビフルカツム系', '個性派'],
  notes: 'ビフルカツムの一型か独立種かは諸説あり、分類未確定。トライデント等の交配親。',
});

// サイアムウィリン: ビフルカツム系として記録（Tom's Staghorn Ferns）
Object.assign(byId['siamwillin'], {
  scientificName: "Platycerium bifurcatum 'Siam Willin'",
  group: 'オーストラリア系',
  origin: '園芸品種（タイ由来のビフルカツム系選抜）',
  lineage: ['bifurcatum'],
  tags: ['ビフルカツム系'],
  notes: '名前に反しウィリンキーではなく、ビフルカツム系の選抜として記録されている。',
});

// 交配親が確定したもの
byId['trident'].lineage = ['mount-lewis', 'hillii'];
byId['trident'].notes = '交配親は P. Mt. Lewis × P. hillii。メリクロン苗で流通。';

byId['wolverine'].lineage = ['veitchii', 'willinckii'];
byId['wolverine'].notes = "交配親は P. veitchii 'Auburn River' × P. willinckii。";

byId['blue-moon'].lineage = ['willinckii', 'diversifolium'];
byId['blue-moon'].notes = '交配親は P. willinckii × P. diversifolium。ムーンシリーズのひとつ。';

byId['pewchan'].lineage = ['veitchii', 'willinckii'];
byId['pewchan'].notes = "Tonkla（タイ）作出。P. veitchii 'Silver Frond' × P. willinckii とされる。F2〜F4など世代ごとの選抜があり、スノークイーン系・エルサ等の親系統。";

// カワイジェン: トンクラ矮性選抜ではなく東ジャワ・イジェン火山の野生フォーム
Object.assign(byId['kawah-ijen'], {
  origin: 'インドネシア・東ジャワ（イジェン火山周辺の野生フォーム）',
  tags: ['ウィリンキー系'],
  notes: '東ジャワ・バニュワンギのイジェン火山一帯から採集される野生系統。ロール状の葉のフォームが知られる。',
});

// ポールウェバー: 正しい綴りは Paul Webber
Object.assign(byId['poulwebber'], {
  nameEn: 'Paul Webber',
  scientificName: "Platycerium willinckii 'Paul Webber'",
  notes: "綴りは 'Paul Webber' が正しい（Poulwebber 表記でも流通）。'Narcissus'（× Mt. Lewis）等の交配親としても知られる。",
});

// ルアエンティ: 実在確認できず（要再確認フラグ）
byId['luaentii'].notes = "⚠ この名前の交配は一次情報で確認できていない。elephantotis × stemaria の交配は P. 'Neptune' として記録されており、stemaria 'Laurentii' との混同の可能性あり（要再確認）。";

// シルバーフロンド: 市場ではベイチー選抜扱いが多い（交配親表記に揺れ）
byId['silver-frond'].notes = "ベイチーの銀葉選抜として扱う資料が多く、willinckii × veitchii 交配とする表記もある（諸説あり）。";

// エレマリア: Kewは elephantotis × stemaria 説
byId['elemaria'].notes = 'Tropical Addictions は P. andinum × P. elephantotis、Kew POWO は P. elephantotis × P. stemaria とする（諸説あり）。';

// メイ: 原典の綴りは Mayii
byId['mayi'].notes = "原典の綴りは 'Mayii'（Tropical Addictions）。米国の故ジェリー・ホーン由来とされる。";

writeFileSync(PATH, JSON.stringify(varieties, null, 2) + '\n', 'utf-8');
console.log(`desc更新: ${descUpdated}件 / sources付与: ${sourcesAdded}件 / 構造修正: 12件`);
