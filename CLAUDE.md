# ビカク図鑑 プロジェクト（Claude Code 引き継ぎ）

ビカクシダ（コウモリラン）の品種図鑑サイト。会話は日本語。

## 基本情報
- パス: `C:\Users\user\Desktop\bikakushida-zukan`
- 構成: Astro 静的サイト / Cloudflare Pages 公開（月額0円）
- リポジトリ: https://github.com/haru107/bikakushida-zukan （default: main）
- 公開URL: **https://bikakushida-zukan.pages.dev**
- 現在 **195種**（原種18 / 選抜品種114 / 交配種63）。写真72種設定済み、残り約116種は「画像募集中」（写真選定で順次設定）

## デプロイ（手動 wrangler 運用）
```
cd C:\Users\user\Desktop\bikakushida-zukan
npm run build
npx wrangler pages deploy dist --project-name=bikakushida-zukan --branch=main --commit-dirty=true --commit-message="english message here"
```
- ⚠️ 日本語コミットメッセージはwranglerが誤読してエラー → `--commit-message` は**英語必須**
- git は別途 commit/push（gh CLI: `C:\Program Files\GitHub CLI\gh.exe`、haru107ログイン済み）
- wrangler は OAuth ログイン済み（pages:write 権限あり）。Cloudflare アカウントID: `32097f848771b1bdf08f190b23648e7b`
- デプロイ直後はトップ掲載数がCDNキャッシュで古く出る → デプロイ専用URL（`https://<hash>.bikakushida-zukan.pages.dev`）で最新確認

## データ: `src/data/varieties.json`（1件の全フィールド）
```json
{
  "id": "jade-girl", "name": "ジェイドガール", "nameEn": "Jade Girl",
  "scientificName": "Platycerium willinckii 'Jade Girl'",
  "group": "東南アジア系",            // 地理5系統 or "交配種"
  "type": "選抜品種",                 // 原種 / 選抜品種 / 交配種
  "origin": "園芸品種（…）", "size": "小型（…）",
  "shieldFrond": "貯水葉の説明", "foliarFrond": "胞子葉の説明",
  "rarity": 3, "difficulty": 3,       // 1〜5
  "coldResistance": "弱〜中（最低10℃前後）", "light": "明るい日陰〜半日向",
  "watering": "…", "humidity": "高め",
  "image": null, "imageCredit": null, "instagramUrl": null, "iNatUrl": null,
  "tags": ["ウィリンキー系","白毛"],
  "description": "…", "notes": "…",
  "lineage": ["willinckii"]           // 親speciesのid配列。原種=[自分], 選抜=[親1], 交配=[親1,親2]
}
```
- group地理: オーストラリア系 / 東南アジア系 / アフリカ系 / マダガスカル系 / 南米系。交配種は group="交配種"
- 機能: 検索 / 種別フィルタ / 産地・系統フィルタ / 血統(親種lineage)フィルタ / タグ / ソート
- 詳細ページは Instagram 公式埋め込み(embed.js)で写真表示。カードは「📷 画像募集中」or CC写真

## ⭐ ルーチン1「ビカク品種追加」
**呼び出し:** 「**ビカク品種追加：〔品種名・複数可〕**」（例:「ビカク品種追加 コロナリウム系の交配いくつか」）
1. 対象品種を確定（ユーザー指定 or 提案）
2. **Web検索で実在・素性を裏取り**（捏造しない。不明な交配親は「諸説あり」と明記）
3. `src/data/varieties.json` に追記（上のスキーマ。lineage を正確に。image/instagramUrl は null）
4. `npm run build` → git commit/push → wrangler deploy
5. 写真はルーチン2で別途付ける
- 品質方針: 公開情報の無い店の個体名（「ノーネーム」等）は不採用。bandlaqua等の無名トレード名も入れない

## ⭐ ルーチン2「ビカク写真選定」
**呼び出し:** 「**ビカク写真選定**」（画像募集中の品種にInstagram写真を付ける）
**流れ = Claudeが各品種5候補を出す → ユーザーが選ぶ（or「代わりに選んで」でClaude代行）**
1. 画像なし品種を抽出（`type!=原種` かつ `instagramUrl` が null）
2. **Claude in Chrome**（ユーザーのログイン済みIG）で各品種のハッシュタグ上位を取得
   - `list_connected_browsers` → AskUserQuestionでブラウザ選択 → `select_browser`
   - `https://www.instagram.com/explore/tags/platycerium{名前}/` を開き wait3s、JSで `a[href*="/p/"]` から投稿コードを抽出（上位8件）
   - ※固有タグが無い品種（交配A×B / bali-spider 等）は機械収集不可 → URL直貼り対応
3. 候補生成（`tools/picker/build_*` 相当の処理）
   - 除外: 複数タグ横断の汎用投稿 / 既に他品種で使用中のコード / 非公開・写真なし（`/p/{code}/embed/` をcurlして scontent画像有無＆PrivateMedia判定）
   - 各品種 最大5候補。`tools/picker/candidates.json` を生成（`[{id,name,candidates:[{url}]}]`）
4. **ピッカー起動**: `node tools/picker/server.mjs`（バックグラウンド, port 4399）→ http://localhost:4399
   - **画像中継版**: サーバーがIG画像を取得して `/img?code=` で中継（直リンク不可問題を回避）。**5枚横並び・スクロールなし**
   - 直リンクが「Bad URL hash」になるのは `&amp;`→`&` 未変換が原因（server.mjsで処理済み）
5. ユーザーが写真クリック or キー1〜5で選択（Sスキップ）→ `tools/picker/picks.json` に保存
6. 反映: picks の url を `instagramUrl` に設定（`__skip__`は除く）→ build → deploy
7. 終わったらピッカー停止（ポート4399のプロセスをkill）

## URL直貼り（タグが無い品種用）
ユーザーが「品種名 + Instagram URL」を貼ったら、`/p/{code}/embed/` をcurl検証（公開・写真あり）してから `instagramUrl` に設定 → build → deploy。

## 著作権メモ
- 写真は **Instagram公式埋め込みのみ**（DLして自前ホスト＝転載はNG）。一覧カードへの埋め込みは重い・巨大なため不採用（詳細ページのみ）
- 将来カードに写真を出すなら「自分で撮った株」or「許可取得」or「CC画像」

## 未完タスク（2026-06-05時点）
- 画像募集中13種: 交配10種（A×B）＋ バリスパイダー / スノーフレーク / セーラーマーズ（固有タグ無し→URL直貼り待ち）
- favicon は 🦌 で設定済み。自動デプロイは手動運用（将来Actions化可）
- 将来: 1ドメイン統合（softcream/ramen/agave/bikaku）
