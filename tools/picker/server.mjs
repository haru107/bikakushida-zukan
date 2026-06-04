// ローカル専用：Instagram投稿の選定ツール（依存ゼロ・Node標準のみ）
// 使い方: node tools/picker/server.mjs  →  http://localhost:4399 を開く
// candidates.json の各候補は {url, thumb} 形式（thumb=投稿写真のサムネURL）
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../');
const CAND = path.join(__dirname, 'candidates.json');
const PICKS = path.join(__dirname, 'picks.json');
const DATA = path.join(ROOT, 'src/data/varieties.json');
const PORT = 4399;

const readJSON = (p, def) => { try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return def; } };

function buildState() {
  const candidates = readJSON(CAND, []);
  const varieties = readJSON(DATA, []);
  const cur = Object.fromEntries(varieties.map(v => [v.id, v.instagramUrl || null]));
  const sci = Object.fromEntries(varieties.map(v => [v.id, v.scientificName || '']));
  const picks = readJSON(PICKS, {});
  // candidates: 文字列配列でも {url,thumb} 配列でも受ける
  const norm = (c) => (typeof c === 'string' ? { url: c, thumb: null } : c);
  return {
    items: candidates.map(c => ({ ...c, candidates: (c.candidates || []).map(norm), current: cur[c.id] || null, sci: sci[c.id] || '' })),
    picks,
  };
}

const HTML = `<!doctype html><html lang="ja"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ビカクシダ図鑑 — Instagram選定ツール</title>
<style>
  *{box-sizing:border-box} html,body{height:100%}
  body{margin:0;font-family:system-ui,'Noto Sans JP',sans-serif;background:#f3f1e9;color:#222;display:flex;flex-direction:column;height:100vh;overflow:hidden}
  header{background:#1d3528;color:#fff;padding:10px 20px;display:flex;align-items:center;justify-content:space-between;flex:none}
  header h1{font-size:15px;margin:0;font-weight:700}
  .progress{font-size:13px;color:#b5d8c2}
  main{flex:1;min-height:0;display:flex;flex-direction:column;padding:14px 20px;gap:10px}
  .head{flex:none}
  .name{font-size:22px;font-weight:700;color:#1d3528}
  .sci{font-style:italic;color:#666;font-size:12px}
  .hint{font-size:12px;color:#777;margin-top:2px}
  .row{flex:1;min-height:0;display:flex;gap:12px;align-items:stretch}
  .col{flex:1 1 0;min-width:0;background:#fff;border:1px solid #d9d4c6;border-radius:12px;overflow:hidden;display:flex;flex-direction:column;cursor:pointer;transition:transform .1s,box-shadow .1s}
  .col:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,.15);border-color:#5aa873}
  .col .imgwrap{flex:1;min-height:0;position:relative;background:#eee}
  .col img{width:100%;height:100%;object-fit:cover;display:block}
  .col .num{position:absolute;top:8px;left:8px;width:30px;height:30px;line-height:30px;text-align:center;background:rgba(29,53,40,.85);color:#fff;border-radius:8px;font-weight:700;font-size:16px}
  .col .cap{flex:none;padding:8px;text-align:center;font-size:13px;font-weight:700;color:#356048;background:#fff}
  .col.curbadge .num{background:#b5743a}
  .noimg{display:flex;align-items:center;justify-content:center;height:100%;color:#999;font-size:12px;padding:10px;text-align:center}
  .actions{flex:none;display:flex;gap:10px;align-items:center}
  .actions button{padding:8px 16px;border:1.5px solid #d9d4c6;border-radius:8px;background:#fff;cursor:pointer;font-size:14px;font-family:inherit}
  .actions button:hover{border-color:#5aa873;background:#f0f9f4}
  .done{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:10px}
  .done h2{color:#1d3528;margin:0}
  pre{background:#fff;border:1px solid #d9d4c6;border-radius:8px;padding:14px;text-align:left;overflow:auto;font-size:12px;max-width:90vw;max-height:40vh}
  a{color:#356048}
</style></head><body>
<header><h1>🦌 Instagram 選定ツール（5枚横並び）</h1><div class="progress" id="prog"></div></header>
<main id="app">読み込み中…</main>
<script>
let STATE=null, idx=0;
const $=(id)=>document.getElementById(id);
async function load(){ STATE=await (await fetch('/api/state')).json(); idx=firstUnpicked(); render(); }
function firstUnpicked(){ const i=STATE.items.findIndex(it=>!(it.id in STATE.picks)); return i<0?STATE.items.length:i; }
function render(){
  const total=STATE.items.length, doneN=Object.keys(STATE.picks).length;
  $('prog').textContent='選択済み '+doneN+' / '+total;
  if(idx>=total){ renderDone(); return; }
  const it=STATE.items[idx];
  const cols=it.candidates.map((c,i)=>{
    const isCur=it.current&&c.url.replace(/\\/$/,'')===it.current.replace(/\\/$/,'');
    const inner=c.thumb
      ? '<div class="imgwrap"><span class="num">'+(i+1)+'</span><img src="'+c.thumb+'" loading="lazy" referrerpolicy="no-referrer" onerror="this.style.display=\\'none\\';this.parentElement.insertAdjacentHTML(\\'beforeend\\',\\'<div class=noimg>画像読込不可<br>クリックで選択</div>\\')"></div>'
      : '<div class="imgwrap"><span class="num">'+(i+1)+'</span><div class="noimg">サムネ無し<br>クリックで選択</div></div>';
    return '<div class="col'+(isCur?' curbadge':'')+'" onclick="choose(\\''+c.url+'\\')">'+inner+'<div class="cap">'+(i+1)+(isCur?'（現在）':'')+'</div></div>';
  }).join('');
  $('app').innerHTML='<div class="head"><span class="name">'+it.name+'</span> <span class="sci">'+it.sci+'</span>'+
    '<div class="hint">写真をクリック、または キー '+it.candidates.map((_,i)=>i+1).join('/')+' で選択 ・ S=スキップ ・ ←戻る</div></div>'+
    '<div class="row">'+(cols||'<div class="noimg">候補なし（Sでスキップ）</div>')+'</div>'+
    '<div class="actions"><button onclick="skip()">→ スキップ (S)</button>'+(idx>0?'<button onclick="idx--;render()">← 前へ</button>':'')+'</div>';
}
function renderDone(){
  const lines=STATE.items.filter(it=>STATE.picks[it.id]&&STATE.picks[it.id]!=='__skip__').map(it=>'  "'+it.id+'": "'+STATE.picks[it.id]+'"').join(',\\n');
  $('app').innerHTML='<div class="done"><h2>✅ 完了！</h2><p>選択結果は tools/picker/picks.json に保存済み。<br>チャットで「おわった」と伝えてください。</p><pre>{\\n'+lines+'\\n}</pre><button onclick="idx=0;render()">最初から見直す</button></div>';
}
async function choose(url){ const it=STATE.items[idx]; await fetch('/api/pick',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:it.id,url})}); STATE.picks[it.id]=url; idx++; render(); }
async function skip(){ const it=STATE.items[idx]; await fetch('/api/pick',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:it.id,skip:true})}); STATE.picks[it.id]='__skip__'; idx++; render(); }
document.addEventListener('keydown',e=>{
  if(!STATE||idx>=STATE.items.length) return;
  const it=STATE.items[idx]; if(!it) return;
  if(e.key>='1'&&e.key<='9'){ const n=+e.key-1; if(it.candidates[n]) choose(it.candidates[n].url); }
  else if(e.key.toLowerCase()==='s'){ skip(); }
});
load();
</script></body></html>`;

const server = http.createServer((req, res) => {
  if (req.url === '/') { res.writeHead(200, {'content-type':'text/html; charset=utf-8'}); res.end(HTML); return; }
  if (req.url === '/api/state') { res.writeHead(200, {'content-type':'application/json'}); res.end(JSON.stringify(buildState())); return; }
  if (req.url === '/api/pick' && req.method === 'POST') {
    let body=''; req.on('data',c=>body+=c); req.on('end',()=>{
      try {
        const { id, url, skip } = JSON.parse(body||'{}');
        const picks = readJSON(PICKS, {});
        picks[id] = skip ? '__skip__' : url;
        fs.writeFileSync(PICKS, JSON.stringify(picks, null, 2));
        console.log(`pick: ${id} -> ${picks[id]}`);
        res.writeHead(200, {'content-type':'application/json'}); res.end('{"ok":true}');
      } catch(e){ res.writeHead(400); res.end('{"ok":false}'); }
    });
    return;
  }
  res.writeHead(404); res.end('not found');
});
server.listen(PORT, () => console.log(`\n  🦌 選定ツール（5枚横並び）:  http://localhost:${PORT}\n`));
