import affiliate from '../data/affiliate.json';

// /ads.txt を affiliate.json の adsenseClient から自動生成。
// 未設定の間は空（広告なし）。AdSense審査・収益化に必須のファイル。
export const prerender = true;

export function GET() {
  const raw = (affiliate.adsenseClient || '').trim();
  const pub = raw.replace(/^ca-/, ''); // ca-pub-xxxx -> pub-xxxx
  const body = pub
    ? `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n`
    : '';
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
