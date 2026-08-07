#!/bin/sh
# Re-stamp css/js URLs with their content hash. Run after ANY edit to
# css/lotara.css or js/lotara.js, otherwise pages keep pointing at the old
# hash and visitors keep the cached file.
cd "$(dirname "$0")"
python3 - <<'PY'
import glob, re, hashlib
css_v = hashlib.md5(open("css/lotara.css","rb").read()).hexdigest()[:8]
js_v  = hashlib.md5(open("js/lotara.js","rb").read()).hexdigest()[:8]
n = 0
for f in ["index.html"] + sorted(glob.glob("*/index.html")):
    s = open(f).read(); before = s
    s = re.sub(r'(href="(?:\.\./)?css/lotara\.css)(\?v=[a-f0-9]+)?"', rf'\1?v={css_v}"', s)
    s = re.sub(r'(src="(?:\.\./)?js/lotara\.js)(\?v=[a-f0-9]+)?"',  rf'\1?v={js_v}"',  s)
    if s != before: open(f,"w").write(s); n += 1
print(f"stamped css={css_v} js={js_v} across {n} pages")
PY
