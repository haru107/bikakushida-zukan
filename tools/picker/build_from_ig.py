# -*- coding: utf-8 -*-
import json, re, urllib.request, time
from collections import Counter
UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"

raw=json.load(open("tools/picker/ig_top.json",encoding="utf-8"))
arr=json.load(open("src/data/varieties.json",encoding="utf-8"))
idname={v["id"]:v["name"] for v in arr}

# 横断出現（3タグ以上）= 汎用投稿として除外
freq=Counter(code for codes in raw.values() for code in set(codes))
generic={c for c,n in freq.items() if n>=3}
print("除外(横断3+):", generic)

def has_photo(code):
    try:
        req=urllib.request.Request(f"https://www.instagram.com/p/{code}/embed/",headers={"User-Agent":UA})
        html=urllib.request.urlopen(req,timeout=20).read().decode("utf-8","ignore")
    except Exception: return False
    scont=len(re.findall(r'scontent[^"\ ]+\.(?:jpg|webp|jpeg)',html))
    priv='PrivateMedia' in html or 'isPrivate":true' in html
    return scont>0 and not priv

result=[]
for cid,codes in raw.items():
    good=[]
    for c in codes:
        if c in generic: continue
        if has_photo(c):
            good.append(f"https://www.instagram.com/p/{c}/")
            print(f"  {cid:14} {c:16} OK ({len(good)})")
        else:
            print(f"  {cid:14} {c:16} NG")
        if len(good)>=5: break
        time.sleep(0.25)
    result.append({"id":cid,"name":idname.get(cid,cid),"candidates":good})

json.dump(result,open("tools/picker/candidates.json","w",encoding="utf-8"),ensure_ascii=False,indent=2)
print("\n=== summary ===")
for r in result: print(f"  {r['id']:14} {len(r['candidates'])}枚")
