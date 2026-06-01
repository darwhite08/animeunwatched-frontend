#!/usr/bin/env python3
"""Add loading="lazy" + decoding="async" to raw <img> tags missing it."""
import re, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "src"
files = [p for p in ROOT.rglob("*.tsx")]
changed = 0
def fix_tag(m: re.Match) -> str:
    tag = m.group(0)
    if 'loading=' in tag:
        return tag
    return tag.replace('<img', '<img loading="lazy" decoding="async"', 1)

for f in files:
    src = f.read_text()
    new = re.sub(r'<img\s[^>]*>', fix_tag, src)
    if new != src:
        f.write_text(new)
        changed += 1
        print(f'fixed {f.relative_to(ROOT)}')
print(f'\n{changed} files updated')
