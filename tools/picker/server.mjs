// ローカル専用：Instagram投稿の選定ツール（依存ゼロ・Node標準のみ）
// 使い方: node tools/picker/server.mjs  →  http://localhost:4399 を開く
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
  return {
    items: candidates.map(c => ({ ...c, current: cur[c.id] || null, sci: sci[c.id] || '' })),
    picks,
  };
}

const HTML = `<!doctype html><html lang="ja"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>ビカクシダ図鑑 — Instagram選定ツール</title>
<style>
  *{box-sizing:border-box} body{font-family:system-ui,'Noto Sans JP',sans-serif;margin:0;background:#f3f1e9;color:#222}
  header{background:#1d3528;color:#fff;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:10}
  header h1{font-size:16px;margin:0;font-weight:700}
  .progress{font-size:13px;color:#b5d8c2}
  main{max-width:1180px;margin:0 auto;padding:20px}
  .name{font-size:24px;font-weight:700;color:#1d3528}
  .sci{font-style:italic;color:#666;font-size:13px;margin-bottom:4px}
  .hint{font-size:12px;color:#777;margin:6px 0 16px}
  .cols{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;align-items:start}
  .col{background:#fff;border:1px solid #d9d4c6;border-radius:12px;padding:10px;display:flex;flex-direction:column;gap:8px}
  .col.cur{border-color:#b5743a;box-shadow:0 0 0 2px #b5743a33}
  .badge{align-self:flex-start;font-size:11px;font-weight:700;background:#b5743a;color:#fff;border-radius:10px;padding:2px 8px}
  .igwrap{min-height:420px}
  .choose{margin-top:auto;padding:10px;border:none;border-radius:8px;background:#356048;color:#fff;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit}
  .choose:hover{background:#2a4d3a}
  .num{display:inline-block;width:22px;height:22px;line-height:22px;text-align:center;background:#fff3;border-radius:6px;margin-right:6px}
  .actions{display:flex;gap:10px;margin:18px 0;flex-wrap:wrap}
  .actions button{padding:8px 16px;border:1.5px solid #d9d4c6;border-radius:8px;background:#fff;cursor:pointer;font-size:14px;font-family:inherit}
  .actions button:hover{border-color:#5aa873;background:#f0f9f4}
  .done{text-align:center;padding:60px 20px}
  .done h2{color:#1d3528}
  pre{background:#fff;border:1px solid #d9d4c6;border-radius:8px;padding:14px;text-align:left;overflow:auto;font-size:12px}
  a{color:#356048}
</style></head><body>
<header><h1>🦌 Instagram 選定ツール</h1><div class="progress" id="prog"></div></header>
<main id="app">読み込み中…</main>
<script async src="https://www.instagram.com/embed.js"></script>
<script>
let STATE=null, idx=0;
const $=(id)=>document.getElementById(id);
async function load(){ STATE=await (await fetch('/api/state')).json(); idx=firstUnpicked(); render(); }
function firstUnpicked(){ const i=STATE.items.findIndex(it=>!(it.id in STATE.picks)); return i<0?STATE.items.length:i; }
function igEmbed(url){ return '<blockquote class="instagram-media" data-instgrm-permalink="'+url+'" data-instgrm-version="14" style="margin:0;width:100%;min-width:auto;background:#fff"></blockquote>'; }
function render(){
  const total=STATE.items.length, doneN=Object.keys(STATE.picks).length;
  $('prog').textContent='選択済み '+doneN+' / '+total;
  if(idx>=total){ renderDone(); return; }
  const it=STATE.items[idx];
  let cols=it.candidates.map((u,i)=>{
    const isCur=it.current&&u.replace(/\\/$/,'')===it.current.replace(/\\/$/,'');
    return '<div class="col'+(isCur?' cur':'')+'">'+(isCur?'<span class="badge">現在採用中</span>':'')+
      '<div class="igwrap">'+igEmbed(u)+'</div>'+
      '<button class="choose" onclick="choose(\\''+u+'\\')"><span class="num">'+(i+1)+'</span>これにする</button></div>';
  }).join('');
  $('app').innerHTML='<div class="name">'+it.name+'</div><div class="sci">'+it.sci+'</div>'+
    '<div class="hint">キー: '+it.candidates.map((_,i)=>i+1).join('/')+' で選択 ・ K=現状維持 ・ S=スキップ</div>'+
    '<div class="cols">'+cols+'</div>'+
    '<div class="actions">'+
      (it.current?'<button onclick="choose(\\''+it.current+'\\')">⏎ 現状維持 (K)</button>':'')+
      '<button onclick="skip()">→ スキップ (S)</button>'+
      (idx>0?'<button onclick="idx--;render()">← 前へ</button>':'')+
    '</div>';
  if(window.instgrm) window.instgrm.Embeds.process();
}
function renderDone(){
  const lines=STATE.items.filter(it=>STATE.picks[it.id]).map(it=>'  "'+it.id+'": "'+STATE.picks[it.id]+'"').join(',\\n');
  $('app').innerHTML='<div class="done"><h2>✅ 完了！</h2><p>選択結果は自動保存されました（tools/picker/picks.json）。<br>チャットに戻って「選定おわった」と伝えてください。反映＆デプロイします。</p>'+
    '<pre>{\\n'+lines+'\\n}</pre><button class="choose" style="max-width:200px;margin:0 auto" onclick="idx=0;render()">最初から見直す</button></div>';
}
async function choose(url){ const it=STATE.items[idx]; await fetch('/api/pick',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:it.id,url})}); STATE.picks[it.id]=url; idx++; render(); }
async function skip(){ const it=STATE.items[idx]; await fetch('/api/pick',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:it.id,skip:true})}); STATE.picks[it.id]='__skip__'; idx++; render(); }
document.addEventListener('keydown',e=>{
  if(idx>=STATE?.items.length) return;
  const it=STATE.items[idx]; if(!it) return;
  if(e.key>='1'&&e.key<='9'){ const n=+e.key-1; if(it.candidates[n]) choose(it.candidates[n]); }
  else if(e.key.toLowerCase()==='k'&&it.current){ choose(it.current); }
  else if(e.key.toLowerCase()==='s'){ skip(); }
});
load();
</script></body></html>`;

const server = http.createServer((req, res) => {
  if (req.url === '/' ) { res.writeHead(200, {'content-type':'text/html; charset=utf-8'}); res.end(HTML); return; }
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
server.listen(PORT, () => console.log(`\n  🦌 選定ツール起動:  http://localhost:${PORT}\n`));
