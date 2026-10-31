#!/usr/bin/env python3
"""Static smoke tests for Navodayan Chat package; no external services required."""
from pathlib import Path
import re, subprocess, sys
ROOT = Path(__file__).resolve().parents[1]
errors=[]
for page in (ROOT/'index.html', ROOT/'desktop.html', ROOT/'mobile.html'):
    text=page.read_text(encoding='utf-8')
    for attr in ('src','href'):
        for value in re.findall(rf'\b{attr}=[\"\']([^\"\']+)', text, re.I):
            if value.startswith(('http://','https://','//','#','data:','mailto:')): continue
            target=(page.parent/value.split('#',1)[0].split('?',1)[0])
            if value and not target.exists(): errors.append(f'{page.name}: missing {attr} target {value}')
    if text.lower().count('<html') != 1: errors.append(f'{page.name}: expected one html root')
    if text.lower().count('</body>') != 1: errors.append(f'{page.name}: expected one closing body tag')
index=(ROOT/'index.html').read_text(encoding='utf-8')
for frame in ('desktop.html','mobile.html'):
    if not re.search(r'<iframe\b[^>]*\bsrc=[\"\']'+re.escape(frame)+r'[\"\']', index): errors.append(f'index.html: iframe src missing for {frame}')
# Check JS syntax with node, when available.
node=subprocess.run(['bash','-lc','command -v node >/dev/null 2>&1'],capture_output=True).returncode==0
if node:
    for script in sorted((ROOT/'js').glob('*.js')):
        result=subprocess.run(['node','--check',str(script)],capture_output=True,text=True)
        if result.returncode: errors.append(f'{script.relative_to(ROOT)} syntax: {result.stderr.strip()}')
else: print('NOTE: Node.js unavailable; skipped JavaScript syntax checks')
if errors:
    print('FAIL')
    print('\n'.join('- '+e for e in errors))
    sys.exit(1)
print('PASS: local references, iframe markup, document closing tags'+(' and JavaScript syntax' if node else ''))

