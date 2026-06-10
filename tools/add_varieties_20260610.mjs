// 2026-06-10 品種追加7種＋lineage補完3件（Web裏取り済み）
// 出典: SapphireChild/Paraiso(Polar Bear), plantswith.com(Kaguya), Greenboog/platyandco(Kitshakood Thin),
//        Instagram platydjoemah_/Carousell(Elisotis=fernSiam), Greenboog/HCorchids(Monkey North=Banna),
//        orchids-shop/orchideeen-shop(Monkey King), Augustfame/オザキ(Paul Vespa),
//        Tonkla公式FB(DW=diversifolium×willinckii / White Hawk=willinckii×diversifolium)
import { readFileSync, writeFileSync } from 'node:fs';

const PATH = new URL('../src/data/varieties.json', import.meta.url);
const varieties = JSON.parse(readFileSync(PATH, 'utf-8'));

const additions = [
  {
    id: 'polar-bear', name: 'ポーラーベア', nameEn: 'Polar Bear',
    scientificName: "Platycerium Omo 'Polar Bear'",
    group: '交配種', type: '交配種',
    origin: '園芸品種（OMO系の白系選抜）', size: '中型',
    shieldFrond: '白い星状毛を濃くまとい、淡い銀白色に見える',
    foliarFrond: '白毛に覆われた胞子葉が分岐しながら広がり、株全体が白く霞んで見える',
    rarity: 4, difficulty: 3,
    coldResistance: '弱〜中（最低10℃前後）', light: '明るい日陰〜半日向',
    watering: '生育期はたっぷり。風通しよく', humidity: '高め',
    image: null, imageCredit: null, instagramUrl: null,
    tags: ['交配種', '白毛', '銀葉', '希少'],
    description: 'OMO（ディバーシフォリウム × ウィリンキー）系から選抜された白系の人気品種。シロクマの名のとおり株全体が濃密な白毛に覆われ、淡いミントグリーン〜銀白の幻想的な草姿になる。',
    notes: 'P. Omo（diversifolium × willinckii）ラインの白系選抜。',
    iNatUrl: null, lineage: ['diversifolium', 'willinckii'],
  },
  {
    id: 'kaguya', name: 'カグヤ（迦具夜）', nameEn: 'Kaguya',
    scientificName: "Platycerium willinckii 'Kaguya'",
    group: '東南アジア系', type: '選抜品種',
    origin: '園芸品種（ウィリンキー系の矮性選抜・日本）', size: '小型（矮性）',
    shieldFrond: '上部が細かく裂けて立ち上がり、白毛をまとう',
    foliarFrond: '細かく枝分かれした胞子葉が銀白色に輝く。分岐数の多さはビカクシダ随一とされる',
    rarity: 5, difficulty: 3,
    coldResistance: '弱〜中（最低10℃前後）', light: '明るい日陰〜半日向',
    watering: '生育期はたっぷり。風通しよく', humidity: '高め',
    image: null, imageCredit: null, instagramUrl: null,
    tags: ['ウィリンキー系', '矮性', '白毛', '希少'],
    description: '日本で選抜されたウィリンキーの矮性品種。胞子葉の分岐数の多さはビカクシダでも随一とされ、星状毛をまとった銀白の葉が細かく枝分かれする様子は圧巻。流通量が少なく、小苗でも高価な最高級品種のひとつ。',
    notes: '竹取物語のかぐや姫にちなむ名。流通株の多くは日本国内で殖やされたもの。',
    iNatUrl: null, lineage: ['willinckii'],
  },
  {
    id: 'kitshakood-thin', name: 'キッチャクード・シン', nameEn: 'Kitshakood Thin Form',
    scientificName: "Platycerium 'Mt. Kitshakood Thin Form'",
    group: '交配種', type: '交配種',
    origin: '園芸品種（Mt. キッチャクードの細葉フォーム）', size: '中〜大型（胞子葉が長く垂れる）',
    shieldFrond: 'リドレイ譲りの隆起した葉脈が入り、王冠状に立ち上がる',
    foliarFrond: '標準フォームより細く長い胞子葉がリボン状に垂れ下がり、1m近くに達することもある',
    rarity: 4, difficulty: 3,
    coldResistance: '弱（最低12℃以上が安心）', light: '明るい日陰〜半日向',
    watering: '生育期はたっぷり。風通しよく', humidity: '高め',
    image: null, imageCredit: null, instagramUrl: null,
    tags: ['交配種', '垂れ葉', '個性派'],
    description: 'リドレイ×コロナリウムの人気交配キッチャクードのうち、胞子葉が際立って細長いフォーム。細いリボン状の葉が滝のように流れ落ちる姿が魅力で、標準フォームとはかなり印象が異なる。',
    notes: 'Mt. Kitshakood（P. ridleyi × P. coronarium）の選抜フォーム。',
    iNatUrl: null, lineage: ['ridleyi', 'coronarium'],
  },
  {
    id: 'ellisotis', name: 'エレソティス', nameEn: 'Elisotis',
    scientificName: "Platycerium 'Elisotis'",
    group: '交配種', type: '交配種',
    origin: '園芸品種（タイ・fernSiam 作出）', size: '中〜大型',
    shieldFrond: 'エレファントティス譲りの幅広い貯水葉が立ち上がる',
    foliarFrond: '幅広で切れ込みの少ない胞子葉がゆったり広がる',
    rarity: 4, difficulty: 3,
    coldResistance: '弱（最低12℃以上が安心）', light: '明るい日陰〜半日向',
    watering: '生育期はたっぷり。乾かしすぎない', humidity: '高め',
    image: null, imageCredit: null, instagramUrl: null,
    tags: ['交配種', '個性派'],
    description: 'マダガスカル系のエリシーとアフリカ系のエレファントティスという珍しい組み合わせの交配。両親譲りの幅広い葉が悠然と広がる。生育は安定していて、見た目のわりに気難しくないとされる。',
    notes: 'P. ellisii × P. elephantotis。タイの fernSiam 作出。Ellisotis の表記もある。',
    iNatUrl: null, lineage: ['ellisii', 'elephantotis'],
  },
  {
    id: 'monkey-north', name: 'モンキーノース', nameEn: 'Monkey North',
    scientificName: "Platycerium 'Monkey North'",
    group: '交配種', type: '交配種',
    origin: '園芸品種（タイ・Banna 作出）', size: '中型',
    shieldFrond: '高く立ち上がる多裂の貯水葉（ハイシールド）が王冠状になる',
    foliarFrond: 'ベイチー譲りの白い星状毛と銀の葉脈、ウィリンキー譲りの多分岐',
    rarity: 4, difficulty: 3,
    coldResistance: '弱〜中（最低10℃前後）', light: '明るい日陰〜半日向（ベイチー譲りで光を好む）',
    watering: '生育期はたっぷり。風通しよく', humidity: '高め',
    image: null, imageCredit: null, instagramUrl: null,
    tags: ['交配種', '白毛', '銀葉', '人気'],
    description: 'ウィリンキーとベイチー野生型（オーストラリアンシルバー）の交配。白い毛をまとった銀葉に、高く立ち上がる貯水葉（ハイシールド）が組み合わさった存在感のある人気品種。',
    notes: 'P. willinckii × P. veitchii wild。タイの育種家 Banna 作出。',
    iNatUrl: null, lineage: ['willinckii', 'veitchii'],
  },
  {
    id: 'monkey-king', name: 'モンキーキング', nameEn: 'Monkey King',
    scientificName: "Platycerium 'Monkey King'",
    group: '交配種', type: '交配種',
    origin: '園芸品種（Banna の willinckii×veitchii 系）', size: '中〜大型（胞子葉が長く垂れる）',
    shieldFrond: '幅広く波打つ貯水葉が皿状に基部を覆う',
    foliarFrond: '非常に長く細かく枝分かれする胞子葉が、鹿角のように雄大に垂れ下がる',
    rarity: 4, difficulty: 3,
    coldResistance: '弱〜中（最低10℃前後）', light: '明るい日陰〜半日向',
    watering: '生育期はたっぷり。風通しよく', humidity: '高め',
    image: null, imageCredit: null, instagramUrl: null,
    tags: ['交配種', '垂れ葉', '個性派'],
    description: '孫悟空（モンキーキング）の名を持つ、彫刻のような草姿の品種。典型的なウィリンキーよりさらに長く・細かく・複雑に分岐する胞子葉が見事で、コレクターから「王冠の宝石」とも評される。',
    notes: 'Banna の willinckii × veitchii 系統の選抜とされる。',
    iNatUrl: null, lineage: ['willinckii', 'veitchii'],
  },
  {
    id: 'paul-vespa', name: 'ポールベスパ', nameEn: 'Paul Vespa',
    scientificName: "Platycerium willinckii 'Paul Vespa'",
    group: '東南アジア系', type: '選抜品種',
    origin: '園芸品種（ウィリンキー系の選抜）', size: '中型',
    shieldFrond: '上部が裂けて立ち上がり、白い毛をまとう',
    foliarFrond: '白毛をまとい分岐して展開する',
    rarity: 3, difficulty: 3,
    coldResistance: '弱〜中（最低10℃前後）', light: '明るい日陰〜半日向',
    watering: '生育期はたっぷり。風通しよく', humidity: '高め',
    image: null, imageCredit: null, instagramUrl: null,
    tags: ['ウィリンキー系', '白毛'],
    description: '東南アジア〜台湾を中心に流通するウィリンキーの選抜。日本のショップにも入荷する定番の流通名のひとつだが、作出経緯など素性の公開情報は少ない。',
    notes: 'P. willinckii の選抜（流通名）。',
    iNatUrl: null, lineage: ['willinckii'],
  },
];

// 重複チェック
for (const a of additions) {
  if (varieties.some(v => v.id === a.id)) {
    console.error(`既存idと重複: ${a.id}`);
    process.exit(1);
  }
}
varieties.push(...additions);

// lineage補完（Tonkla公式FBの一次情報。descにも既記載あり）
const linFix = {
  'xoxo':       ['diversifolium', 'willinckii'],
  'hanabi':     ['diversifolium', 'willinckii'],
  'white-hawk': ['willinckii', 'diversifolium'],
};
for (const [id, lin] of Object.entries(linFix)) {
  const v = varieties.find(x => x.id === id);
  v.lineage = lin;
  console.log(`lineage補完: ${id} -> ${lin.join(' x ')}`);
}

writeFileSync(PATH, JSON.stringify(varieties, null, 2) + '\n', 'utf-8');
const t = {};
varieties.forEach(v => t[v.type] = (t[v.type] || 0) + 1);
console.log(`追加${additions.length}種 → 計${varieties.length}種`, JSON.stringify(t));
