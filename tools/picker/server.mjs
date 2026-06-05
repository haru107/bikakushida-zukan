// ローカル専用：Instagram投稿の選定ツール（依存ゼロ・Node標準のみ）
// 使い方: node tools/picker/server.mjs  →  http://localhost:4399 を開く
// 画像はサーバーが取得して /img?code=XXX で中継（クロスオリジン制限を回避）
import http from 'node:http';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../');
const CAND = path.join(__dirname, 'candidates.json');
const PICKS = path.join(__dirname, 'picks.json');
const DATA = path.join(ROOT, 'src/data/varieties.json');
const PORT = Number(process.env.PICKER_PORT) || 4399;
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

const readJSON = (p, def) => { try { return JSON.parse(fs.readFileSync(p, 'utf-8')); } catch { return def; } };

function buildState() {
  const candidates = readJSON(CAND, []);
  const varieties = readJSON(DATA, []);
  const cur = Object.fromEntries(varieties.map(v => [v.id, v.instagramUrl || null]));
  const sci = Object.fromEntries(varieties.map(v => [v.id, v.scientificName || '']));
  const picks = readJSON(PICKS, {});
  const norm = (c) => (typeof c === 'string' ? { url: c } : c);
  return {
    items: candidates.map(c => ({ ...c, candidates: (c.candidates || []).map(norm), current: cur[c.id] || null, sci: sci[c.id] || '' })),
    picks,
  };
}

const httpsGet = (u) => new Promise((resolve, reject) => {
  https.get(u, { headers: { 'User-Agent': UA } }, resolve).on('error', reject);
});
const fetchText = (u) => httpsGet(u).then(r => new Promise((res) => {
  let d = ''; r.setEncoding('utf-8'); r.on('data', c => d += c); r.on('end', () => res(d));
}));

const imgCache = new Map(); // code -> {type, buf}
async function getImage(code) {
  if (imgCache.has(code)) return imgCache.get(code);
  const html = await fetchText(`https://www.instagram.com/p/${code}/embed/`);
  const urls = (html.match(/https:\/\/[^"\\ ]*scontent[^"\\ ]+\.(?:jpg|jpeg|webp)[^"\\ ]*/g) || [])
    .filter(u => !u.includes('s150x150'))
    .map(u => u.replace(/&amp;/g, '&').replace(/\\u0026/g, '&').replace(/\\/g, ''));
  if (!urls.length) throw new Error('no image');
  let r = await httpsGet(urls[0]);
  // リダイレクト追従
  let hop = 0;
  while (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location && hop < 3) {
    r.resume();
    r = await httpsGet(r.headers.location);
    hop++;
  }
  if (r.statusCode !== 200) { r.resume(); throw new Error('status ' + r.statusCode); }
  const type = r.headers['content-type'] || 'image/jpeg';
  const chunks = [];
  await new Promise((res, rej) => { r.on('data', c => chunks.push(c)); r.on('end', res); r.on('error', rej); });
  const out = { type, buf: Buffer.concat(chunks) };
  imgCache.set(code, out);
  return out;
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
  .col .num{position:absolute;top:8px;left:8px;width:30px;height:30px;line-height:30px;text-align:center;background:rgba(29,53,40,.85);color:#fff;border-radius:8px;font-weight:700;font-size:16px;z-index:2}
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
const codeOf=(u)=>{const m=u.match(/\\/p\\/([^/]+)/);return m?m[1]:'';};
async function load(){ STATE=await (await fetch('/api/state')).json(); idx=firstUnpicked(); render(); }
function firstUnpicked(){ const i=STATE.items.findIndex(it=>!(it.id in STATE.picks)); return i<0?STATE.items.length:i; }
function render(){
  const total=STATE.items.length, doneN=Object.keys(STATE.picks).length;
  $('prog').textContent='選択済み '+doneN+' / '+total;
  if(idx>=total){ renderDone(); return; }
  const it=STATE.items[idx];
  const cols=it.candidates.map((c,i)=>{
    const isCur=it.current&&c.url.replace(/\\/$/,'')===it.current.replace(/\\/$/,'');
    const code=codeOf(c.url);
    const inner='<div class="imgwrap"><span class="num">'+(i+1)+'</span><img class="cand" src="/img?code='+code+'" loading="eager"></div>';
    return '<div class="col'+(isCur?' curbadge':'')+'" onclick="choose(\\''+c.url+'\\')">'+inner+'<div class="cap">'+(i+1)+(isCur?'（現在）':'')+'</div></div>';
  }).join('');
  $('app').innerHTML='<div class="head"><span class="name">'+it.name+'</span> <span class="sci">'+it.sci+'</span>'+
    '<div class="hint">写真をクリック、または キー '+it.candidates.map((_,i)=>i+1).join('/')+' で選択 ・ S=スキップ ・ ←戻る</div></div>'+
    '<div class="row">'+(cols||'<div class="noimg">候補なし（Sでスキップ）</div>')+'</div>'+
    '<div class="actions"><button onclick="skip()">→ スキップ (S)</button>'+(idx>0?'<button onclick="idx--;render()">← 前へ</button>':'')+'</div>';
  document.querySelectorAll('img.cand').forEach(img=>{
    img.onerror=function(){ this.onerror=null; this.style.display='none'; this.parentElement.insertAdjacentHTML('beforeend','<div class="noimg">画像読込不可<br>クリックで選択</div>'); };
  });
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

const server = http.createServer(async (req, res) => {
  if (req.url === '/') { res.writeHead(200, {'content-type':'text/html; charset=utf-8'}); res.end(HTML); return; }
  if (req.url === '/api/state') { res.writeHead(200, {'content-type':'application/json'}); res.end(JSON.stringify(buildState())); return; }
  if (req.url.startsWith('/img')) {
    const code = new URL(req.url, 'http://x').searchParams.get('code');
    if (!code) { res.writeHead(400); res.end(); return; }
    try {
      const { type, buf } = await getImage(code);
      res.writeHead(200, { 'content-type': type, 'cache-control': 'max-age=86400' });
      res.end(buf);
    } catch (e) { res.writeHead(502); res.end(); }
    return;
  }
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
server.listen(PORT, () => console.log(`\n  🦌 選定ツール（画像中継版）:  http://localhost:${PORT}\n`));
