#!/usr/bin/env python3
"""
Second pass: replace inline-style amber colors in .tsx files with
CSS variables so they react to the accent toggle.

Targets JS string literals inside style={{...}} (or anywhere a color
literal appears as a string), not Tailwind classNames — those were
handled by migrate-theme-tokens.py.

Conversions:
  #f59e0b                 → var(--app-accent)
  #fbbf24                 → var(--app-accent-bright)
  #fcd34d                 → var(--app-accent-bright)
  rgba(245,158,11,A)      → color-mix(in srgb, var(--app-accent) Apct%, transparent)
  rgba(251,191,36,A)      → color-mix(in srgb, var(--app-accent-bright) Apct%, transparent)
"""
import argparse, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "src"

SKIP_PATTERNS = [
    'components/ui/PageLoader.tsx',
    'components/layout/Logo.tsx',
]

def alpha_pct(a: str) -> str:
    f = float(a)
    return f'{f * 100:g}'

def repl_rgba_accent(m: re.Match) -> str:
    return f'color-mix(in srgb, var(--app-accent) {alpha_pct(m.group(1))}%, transparent)'

def repl_rgba_bright(m: re.Match) -> str:
    return f'color-mix(in srgb, var(--app-accent-bright) {alpha_pct(m.group(1))}%, transparent)'

def repl_rgba_fg(m: re.Match) -> str:
    """rgba(255,255,255,A) → foreground tint that flips in light theme."""
    return f'color-mix(in srgb, var(--app-fg) {alpha_pct(m.group(1))}%, transparent)'

# Each rule: (compiled pattern, repl callable-or-string, label)
RULES = [
    # Hex literals — case-insensitive
    (re.compile(r'#[fF]59[eE]0[bB]\b'),  'var(--app-accent)',         '#f59e0b → var(--app-accent)'),
    (re.compile(r'#[fF][bB][bB][fF]24\b'), 'var(--app-accent-bright)', '#fbbf24 → var(--app-accent-bright)'),
    (re.compile(r'#[fF][cC][dD]34[dD]\b'), 'var(--app-accent-bright)', '#fcd34d → var(--app-accent-bright)'),
    # rgba with the literal amber RGB triples
    (re.compile(r'rgba\(\s*245\s*,\s*158\s*,\s*11\s*,\s*([0-9.]+)\s*\)'), repl_rgba_accent, 'rgba(245,158,11,A) → color-mix accent'),
    (re.compile(r'rgba\(\s*251\s*,\s*191\s*,\s*36\s*,\s*([0-9.]+)\s*\)'), repl_rgba_bright, 'rgba(251,191,36,A) → color-mix accent-bright'),

    # White → foreground-tint (flips in light theme; black overlays/shadows left alone)
    (re.compile(r'rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*([0-9.]+)\s*\)'), repl_rgba_fg, 'rgba(255,255,255,A) → color-mix fg-tint'),
    (re.compile(r'#[fF]{6}\b'),  'var(--app-fg)', '#ffffff → var(--app-fg)'),
    (re.compile(r'#[fF]{3}(?![\dA-Fa-f])'), 'var(--app-fg)', '#fff → var(--app-fg)'),
]

def should_skip(path: Path) -> bool:
    rel = str(path.relative_to(ROOT))
    return any(s in rel for s in SKIP_PATTERNS)

def migrate(text: str) -> tuple[str, dict[str, int]]:
    counts: dict[str, int] = {}
    for pat, repl, label in RULES:
        new_text, n = pat.subn(repl, text)
        if n:
            counts[label] = counts.get(label, 0) + n
            text = new_text
    return text, counts

def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--dry', action='store_true')
    args = ap.parse_args()

    files = sorted(p for p in ROOT.rglob('*.tsx') if not should_skip(p))
    changed = 0
    totals: dict[str, int] = {}
    per_file: list[tuple[Path, int]] = []

    for f in files:
        src = f.read_text()
        new, counts = migrate(src)
        if not counts:
            continue
        changed += 1
        per_file.append((f, sum(counts.values())))
        for k, v in counts.items():
            totals[k] = totals.get(k, 0) + v
        if not args.dry:
            f.write_text(new)

    print(f'\n=== {"DRY-RUN" if args.dry else "APPLIED"} ===')
    print(f'files scanned: {len(files)}')
    print(f'files changed: {changed}')
    print(f'total edits:   {sum(totals.values())}\n')
    print('per-rule:')
    for k, v in sorted(totals.items(), key=lambda kv: -kv[1]):
        print(f'  {v:>4}  {k}')
    print('\ntop 10 files:')
    per_file.sort(key=lambda x: -x[1])
    for p, n in per_file[:10]:
        print(f'  {n:>3}  {p.relative_to(ROOT)}')
    return 0

if __name__ == '__main__':
    sys.exit(main())
