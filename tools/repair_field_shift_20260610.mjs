// 2026-06-10 一括追加バッチのフィールドずれ修復（33件）
// 症状: nameEn=説明文 / scientificName=説明文入り / size=オブジェクト / description=サイズ文字列
// 修復: name(英)→nameEn, カタカナ名→name, 説明文→description, サイズ文字列→size,
//        size.rarity→rarity, size.tags→tagsへ統合, size.note→notes
import { readFileSync, writeFileSync } from 'node:fs';

const PATH = new URL('../src/data/varieties.json', import.meta.url);
const varieties = JSON.parse(readFileSync(PATH, 'utf-8'));

const kana = {
  'java': 'ジャワ',
  'payton': 'ペイトン',
  'bloomei': 'ブルーメイ',
  'schofield': 'スコフィールド',
  'king-boko': 'キングボコ',
  'little-will': 'リトルウィル',
  'weeks': 'ウィークス',
  'piti': 'ピティ',
  'mount-lewis': 'マウントルイス',
  'little-moon': 'リトルムーン',
  'new-moon': 'ニュームーン',
  'river-moon': 'リバームーン',
  'siamwillin': 'サイアムウィリン',
  'typhoon': 'タイフーン',
  'copperwill': 'コッパーウィル',
  'pygmaeum': 'ピグマエウム',
  'scissorhands': 'シザーハンズ',
  'trex': 'ティーレックス',
  'bali': 'バリ',
  'timun-emas': 'ティムンマス',
  'little-angel': 'リトルエンジェル',
  'smurf': 'スマーフ',
  'antler-crown': 'アントラークラウン',
  'lucky-girl': 'ラッキーガール',
  'wild-indonesia': 'ワイルドインドネシア',
  'sawangensis': 'サワンゲンシス',
  'chin-chuck': 'チンチャック',
  'fairchild': 'フェアチャイルド',
  'kingii': 'キンギー',
  'miami': 'マイアミ',
  'balee': 'バリー',
  'doc': 'ドック',
  'zion': 'ザイオン',
};

const hasJa = s => /[぀-ヿ一-鿿]/.test(s || '');
let fixed = 0;

for (const v of varieties) {
  const broken = hasJa(v.nameEn) && typeof v.size === 'object' && v.size !== null;
  if (!broken) continue;
  if (!kana[v.id]) {
    console.error(`カタカナ名未定義: ${v.id}`);
    process.exitCode = 1;
    continue;
  }
  const englishName = v.name;          // 英名が name に入っている
  const realDesc    = v.nameEn;        // 説明文が nameEn に入っている
  const sizeObj     = v.size;          // {rarity?, tags?, note?}
  const sizeText    = v.description;   // サイズ文字列が description に入っている

  v.name           = kana[v.id];
  v.nameEn         = englishName;
  v.scientificName = `Platycerium willinckii '${englishName}'`;
  v.description    = realDesc;
  v.size           = sizeText;
  if (sizeObj.rarity) v.rarity = sizeObj.rarity;
  if (sizeObj.tags)   v.tags   = [...new Set([...(v.tags ?? []), ...sizeObj.tags])];
  if (sizeObj.note)   v.notes  = sizeObj.note;
  fixed++;
}

writeFileSync(PATH, JSON.stringify(varieties, null, 2) + '\n', 'utf-8');
console.log(`修復完了: ${fixed}件`);
