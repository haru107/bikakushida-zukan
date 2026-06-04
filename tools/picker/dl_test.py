# -*- coding: utf-8 -*-
import json, re, urllib.request, sys
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
arr = json.load(open('src/data/varieties.json', encoding='utf-8'))
by = {v['id']: v for v in arr}
ids = sys.argv[1:] or ['jade-girl', 'ss-foong', 'bacteria', 'netherlands', 'elsa', 'dragon']

def clean(u):
    return u.replace('&amp;', '&').replace(r'&', '&').replace('\\', '')

def dl(code, dst):
    req = urllib.request.Request(f"https://www.instagram.com/p/{code}/embed/", headers={"User-Agent": UA})
    h = urllib.request.urlopen(req, timeout=20).read().decode("utf-8", "ignore")
    urls = [clean(u) for u in re.findall(r'https://[^"\\ ]*scontent[^"\\ ]+\.(?:jpg|jpeg|webp)[^"\\ ]*', h) if 's150x150' not in u]
    if not urls:
        return 0
    data = urllib.request.urlopen(urllib.request.Request(urls[0], headers={"User-Agent": UA}), timeout=20).read()
    open(dst, 'wb').write(data)
    return len(data)

for i in ids:
    u = by.get(i, {}).get('instagramUrl') or ''
    m = re.search(r'/p/([^/]+)', u)
    if not m:
        print(i, 'no url'); continue
    try:
        print(f'{i}: {dl(m.group(1), f"public/_test_ig/{i}.jpg")} bytes')
    except Exception as e:
        print(i, 'ERR', e)
