# -*- coding: utf-8 -*-
import json
p = 'src/data/varieties.json'
arr = json.load(open(p, encoding='utf-8'))
ex = {v['id'] for v in arr}

def base(**k):
    d = dict(rarity=3, difficulty=3, coldResistance='弱〜中（最低10℃前後）',
             light='明るい日陰〜半日向', watering='生育期はたっぷり。風通しよく', humidity='高め',
             image=None, imageCredit=None, instagramUrl=None, iNatUrl=None)
    d.update(k)
    return d

def wil(id_, name, en, desc, notes, tags=None):
    return base(id=id_, name=name, nameEn=en, scientificName=f"Platycerium willinckii '{en}'",
        group='東南アジア系', type='選抜品種', origin='園芸品種（ウィリンキー系の選抜）',
        size='中型', shieldFrond='上部が裂けて立ち上がり白い毛をまとう',
        foliarFrond='白毛をまとい分岐して展開する', lineage=['willinckii'],
        tags=tags or ['ウィリンキー系', '白毛'], description=desc, notes=notes)

new = [
  # ---- 交配種（親が文献で確認できたもの）----
  base(id='hornes-surprise', name='ホーンズサプライズ', nameEn="Horne's Surprise",
       scientificName="Platycerium 'Horne's Surprise'", group='交配種', type='交配種',
       origin='園芸交配種（P. madagascariense × P. alcicorne）', size='中型',
       shieldFrond='マダガスカリエンセ譲りの網目状の凹凸を帯びる', foliarFrond='細めの胞子葉が分岐して展開',
       lineage=['madagascariense', 'alcicorne'], tags=['交配種', '網目葉', '希少', '個性派'],
       description='マダガスカリエンセとアルシコルネの交配で、米フロリダの故ジェリー・ホーン氏の温室で偶発的に生まれた珍しい品種。マダガスカリエンセ譲りの網目状の質感を受け継ぎつつ、より育てやすいとされる。マダガスカリエンセの血を引く数少ない交配のひとつ。',
       notes='交配親は P. madagascariense × P. alcicorne。Jerry Horne（フロリダ）由来の偶発実生。'),
  base(id='charles-alford', name='シャルル・アルフォード', nameEn='Charles Alford',
       scientificName="Platycerium 'Charles Alford'", group='交配種', type='交配種',
       origin='園芸交配種（P. wandae × P. ridleyi）', size='大型',
       shieldFrond='リドレイ譲りの造形とワンダエ譲りの大型感を併せ持つ', foliarFrond='大きく分岐して伸びる',
       lineage=['wandae', 'ridleyi'], tags=['交配種', '大型', '希少', '個性派'],
       description='属中最大級のワンダエと、造形的なリドレイの交配。両親の迫力と造形美を受け継いだ大型の人気交配品種で、植物探検家チャールズ・アルフォード氏の名を冠する。高温多湿を好む。',
       notes='交配親は P. wandae × P. ridleyi。'),
  base(id='durval-nunes', name='ダーバル・ヌネス', nameEn='Durval Nunes',
       scientificName="Platycerium 'Durval Nunes'", group='交配種', type='交配種',
       origin='園芸交配種（P. stemaria × P. madagascariense、諸説あり）', size='中型',
       shieldFrond='波状の凹みと網目質感を帯びる', foliarFrond='楔形〜二又に分かれて展開',
       lineage=['stemaria', 'madagascariense'], tags=['交配種', '網目葉', '希少'],
       description='ブラジルで作出された珍しい交配品種。ステマリアとマダガスカリエンセの交配とされ（第二親には諸説あり）、両親の独特な葉質を受け継ぐ。マダガスカリエンセ系の数少ない交配のひとつ。',
       notes='交配親は P. stemaria × P. madagascariense とされるが諸説あり。'),

  # ---- 種の選抜・フォーム ----
  base(id='auburn-river', name='オーバンリバー', nameEn='Auburn River',
       scientificName="Platycerium veitchii 'Auburn River'", group='オーストラリア系', type='選抜品種',
       origin='園芸品種（ベイチーのオーストラリア・オーバンリバー国立公園産フォーム）', size='中型',
       shieldFrond='銀白色で頑丈、上部の先が高く細く尖るのが特徴', foliarFrond='銀白の星状毛をまとい直立気味に伸びる',
       lineage=['veitchii'], coldResistance='やや強（5℃前後）', light='強光を好む',
       watering='乾かし気味も許容。過湿に注意', humidity='低〜普通',
       tags=['ベイチー系', '銀葉', '強光向け', '丈夫'],
       description='オーストラリアのオーバンリバー国立公園に由来するベイチーの銘フォーム。荒々しく銀白色に輝く貯水葉と、高く細く尖る上部が特徴。強光・高温・乾燥に強く非常に丈夫で、ベイチー系の中でも人気が高い。',
       notes='P. veitchii の産地フォーム。乾燥・強光に強い。'),
  base(id='drummond', name='ドラモンド', nameEn='Drummond',
       scientificName="Platycerium hillii 'Drummond'", group='オーストラリア系', type='選抜品種',
       origin='園芸品種（ヒリーの選抜）', size='中型', shieldFrond='丸く縁が滑らかで濃緑',
       foliarFrond='濃い緑で光沢があり幅広い', lineage=['hillii'], coldResistance='中（5℃前後）',
       tags=['ヒリー系', '濃緑', '丈夫'],
       description='ヒリーの選抜品種で、濃い緑と光沢のある幅広い胞子葉が特徴。丈夫で育てやすく、コレクションや植物園でも見られる定番のヒリー系選抜。',
       notes='P. hillii の選抜。'),
  base(id='hillii-panama', name='パナマ', nameEn='Panama',
       scientificName="Platycerium hillii 'Panama'", group='オーストラリア系', type='選抜品種',
       origin='園芸品種（ヒリーの選抜）', size='中型', shieldFrond='丸く立ち上がり濃緑',
       foliarFrond='濃緑で幅広く、整って分岐する', lineage=['hillii'], coldResistance='中（5℃前後）',
       tags=['ヒリー系', '濃緑', '丈夫'],
       description='ヒリーの選抜品種のひとつで、整った濃緑の草姿が美しい。ヒリー譲りの丈夫さを持ち、観賞価値の高い定番選抜として流通する。',
       notes='P. hillii の選抜。'),
  base(id='san-diego', name='サンディエゴ', nameEn='San Diego',
       scientificName="Platycerium bifurcatum 'San Diego'", group='オーストラリア系', type='選抜品種',
       origin='園芸品種（ビフルカツムの選抜）', size='大型（株張り60cm前後）',
       shieldFrond='丸い盾形で群生株を作る', foliarFrond='細めの胞子葉が二又に分岐して横〜上向きに展開',
       lineage=['bifurcatum'], coldResistance='強（0〜5℃まで耐える）',
       tags=['ビフルカツム系', '入門向け', '丈夫', '大型'],
       description='ビフルカツムの大型になる定番栽培品種。丈夫で子株もよく出し、大きな群生株に育つ。エルクホーンファーンの名で広く流通し、屋外栽培にも向く強健種。',
       notes='P. bifurcatum の選抜。丈夫で大型化する。'),

  # ---- ウィリンキー系 選抜 ----
  wil('totoro', 'トトロ', 'Totoro',
      'ウィリンキーの矮性選抜（イエロームーンドワーフ系）。黄緑を帯びた小型でこんもりとした草姿が愛らしく、近年人気の高いドワーフ品種。',
      "P. willinckii の矮性選抜。'Yellow Moon Dwarf' 系として流通する。",
      tags=['ウィリンキー系', '矮性', '人気']),
  wil('snowflake', 'スノーフレーク', 'Snowflake',
      '白毛が雪の結晶のように際立つウィリンキー系の白系選抜。明るく白い草姿が美しい人気品種。',
      "P. willinckii の白毛選抜。", tags=['ウィリンキー系', '白毛']),
  wil('white-swan', 'ホワイトスワン', 'White Swan',
      '白鳥を思わせる優美で白いウィリンキー系選抜。長く垂れる白毛の胞子葉が上品な印象を与える。',
      "P. willinckii の白毛選抜。", tags=['ウィリンキー系', '白毛', '垂れ葉']),
  wil('leonids', 'レオニズ', 'Leonids',
      'ウィリンキー系の選抜品種。白毛をまとった整った草姿で流通する人気種。',
      "P. willinckii の選抜。"),
  wil('ginka', 'ギンカ', 'Ginka',
      '銀花（ギンカ）の名のとおり銀白色が美しいウィリンキー系選抜。白毛が際立つ草姿が魅力。',
      "P. willinckii の選抜。", tags=['ウィリンキー系', '白毛', '銀葉']),
  wil('bogor', 'ボゴール', 'Bogor',
      'ジャワ島ボゴール地域に由来するとされるウィリンキー系統。白毛をまとった整った草姿で知られる。',
      "P. willinckii のジャワ産系統。"),
  wil('celso', 'セルソ', 'Celso',
      'ウィリンキー系の代表的な選抜のひとつ。白毛の美しい草姿で広く親しまれ、多くの派生品種の元にもなっている。',
      "P. willinckii の選抜。セルソタツタ等の関連系統がある。", tags=['ウィリンキー系', '白毛', '人気']),
  wil('snow-queen', 'スノークイーン', 'Snow Queen',
      'タイのトンクラ作出の白系名ライン。雪の女王の名のとおり白く美しい草姿で、エルサなど多くの白雪系選抜を生んだ。',
      "P. willinckii 系の白系ライン（Tonkla）。エルサ等の母体。", tags=['ウィリンキー系', '白毛', '人気']),
  wil('blue-boy', 'ブルーボーイ', 'Blue Boy',
      '青みを帯びた銀葉が美しいウィリンキー系選抜。ブルークイーンと対で語られることもあるクールな色合いの人気品種。',
      "P. willinckii の選抜。青みのある銀葉が身上。", tags=['ウィリンキー系', '銀葉', '人気']),
  wil('jewel', 'ジュエル', 'Jewel',
      '宝石（ジュエル）の名を冠したウィリンキー系選抜。白毛の美しい整った草姿で流通する。',
      "P. willinckii の選抜。"),
  wil('sailor-mars', 'セーラーマーズ', 'Sailor Mars',
      'ウィリンキー系の選抜品種で、セーラーシリーズと呼ばれる系統のひとつ。白毛をまとった個性的な草姿で人気。',
      "P. willinckii の選抜（セーラーシリーズ）。", tags=['ウィリンキー系', '白毛', '個性派']),
  wil('yellow-moon', 'イエロームーン', 'Yellow Moon',
      '黄緑がかった明るい草姿が特徴のウィリンキー系選抜（ムーンシリーズ）。矮性のトトロ（YMD）はこの系統の小型選抜。',
      "P. willinckii の選抜（ムーンシリーズ）。トトロ(YMD)の母系。", tags=['ウィリンキー系', '黄緑']),
  wil('sailor-moon', 'セーラームーン', 'Sailor Moon',
      'セーラーシリーズのウィリンキー系選抜のひとつ。白毛をまとった美しい草姿で流通する人気品種。',
      "P. willinckii の選抜（セーラーシリーズ）。", tags=['ウィリンキー系', '白毛', '人気']),
]

add = [x for x in new if x['id'] not in ex]
arr.extend(add)
json.dump(arr, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
open(p, 'a', encoding='utf-8').write('\n')

from collections import Counter
print('added:', len(add), '/ requested 20')
print('total:', len(arr))
print('types:', dict(Counter(v['type'] for v in arr)))
idn = {v['id']: v['name'] for v in arr}
chips = sorted({pid for v in arr if v['type'] != '原種' for pid in v.get('lineage', [])})
print('lineage chips:', len(chips), [idn[c] for c in chips])
