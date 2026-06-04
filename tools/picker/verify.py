# -*- coding: utf-8 -*-
import json, re, urllib.request, time

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"

def check(path):
    url = f"https://www.instagram.com/{path}/embed/"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA})
        html = urllib.request.urlopen(req, timeout=20).read().decode("utf-8", "ignore")
    except Exception as e:
        return None
    scont = len(re.findall(r'scontent[^"\ ]+\.(?:jpg|webp|jpeg)', html))
    priv = 'PrivateMedia' in html or 'isPrivate":true' in html
    ok = scont > 0 and not priv
    return ok

with open("tools/picker/_raw_candidates.json", encoding="utf-8") as f:
    raw = json.load(f)
with open("src/data/varieties.json", encoding="utf-8") as f:
    arr = json.load(f)
idname = {v["id"]: v["name"] for v in arr}

result = []
for cid, paths in raw.items():
    good = []
    for p in paths:
        ok = check(p)
        print(f"  {cid:14} {p:40} -> {'OK' if ok else 'NG'}")
        if ok:
            good.append("https://www.instagram.com/" + p + "/")
        if len(good) >= 5:
            break
        time.sleep(0.3)
    result.append({"id": cid, "name": idname.get(cid, cid), "candidates": good})

with open("tools/picker/candidates.json", "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)
print("\n=== summary ===")
for r in result:
    print(f"  {r['id']:14} {len(r['candidates'])} candidates")
