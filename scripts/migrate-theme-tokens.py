#!/usr/bin/env python3
"""
One-shot migration: hardcoded Tailwind colors → semantic theme tokens.

Rules are conservative — only colors that ARE semantic (background, surface,
foreground, muted, subtle, border, accent) are migrated. Brand-specific
colors (orange streak flame, indigo gradients, logo blacks inside SVG) are
left alone.

Pass --dry to preview without writing.
"""
import argparse, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent / "src"

# Order matters: longer / more-specific patterns first.
# Each rule: (pattern, replacement, label)
# Use lookbehind/ahead to avoid eating parts of unrelated classes
# (e.g. divide-white, ring-white, decoration-white, fill-white).
NO_LEFT  = r'(?<![\w/\-])'        # not preceded by word char, slash, dash
NO_RIGHT = r'(?![\w\-])'          # not followed by word char or dash
                                  # slash IS allowed on right so we match
                                  # before the opacity modifier rules

RULES = [
    # ── text-white variants ────────────────────────────────────────────
    # Higher opacities = muted; lowest = subtle; bare = foreground
    (rf'{NO_LEFT}text-white/(?:40|45|50|55|60|65|70|75|80){NO_RIGHT}', 'text-muted',     'text-white/40-80 → text-muted'),
    (rf'{NO_LEFT}text-white/(?:5|10|15|20|25|30|35){NO_RIGHT}',       'text-subtle',    'text-white/5-35 → text-subtle'),
    (rf'{NO_LEFT}text-white{NO_RIGHT}(?!/)',                          'text-foreground','text-white → text-foreground'),

    # ── bg variants ─────────────────────────────────────────────────────
    # Card / panel backgrounds (low-opacity white) → surface token
    (rf'{NO_LEFT}bg-white/(?:5|7|8|10){NO_RIGHT}',                    'bg-surface',     'bg-white/5-10 → bg-surface'),
    (rf'{NO_LEFT}bg-white/(?:\[0\.02\]|\[0\.03\]|\[0\.05\]|\[0\.07\]){NO_RIGHT}', 'bg-surface', 'bg-white/[0.0X] → bg-surface'),
    (rf'{NO_LEFT}bg-black{NO_RIGHT}(?!/)',                            'bg-background',  'bg-black → bg-background'),
    (rf'{NO_LEFT}bg-\[#020202\]{NO_RIGHT}',                           'bg-background',  'bg-[#020202] → bg-background'),
    (rf'{NO_LEFT}bg-\[#050505\]{NO_RIGHT}',                           'bg-surface',     'bg-[#050505] → bg-surface'),
    (rf'{NO_LEFT}bg-\[#0a0a0a\]{NO_RIGHT}',                           'bg-surface',     'bg-[#0a0a0a] → bg-surface'),
    (rf'{NO_LEFT}bg-\[#111120\]{NO_RIGHT}',                           'bg-surface-2',   'bg-[#111120] → bg-surface-2'),

    # ── border ──────────────────────────────────────────────────────────
    (rf'{NO_LEFT}border-white/(?:5|6|8|10|12|15|20){NO_RIGHT}',       'border-border',  'border-white/5-20 → border-border'),

    # ── amber → accent  (with opacity modifier, keep the modifier) ──────
    (rf'{NO_LEFT}text-amber-(?:300|400)/(\d+){NO_RIGHT}',             r'text-accent-bright/\1', 'text-amber-300/400 + opacity → text-accent-bright/N'),
    (rf'{NO_LEFT}text-amber-(?:500|600|700)/(\d+){NO_RIGHT}',         r'text-accent/\1',        'text-amber-500/600 + opacity → text-accent/N'),
    (rf'{NO_LEFT}bg-amber-(?:300|400)/(\d+){NO_RIGHT}',               r'bg-accent-bright/\1',   'bg-amber-300/400 + opacity → bg-accent-bright/N'),
    (rf'{NO_LEFT}bg-amber-(?:500|600|700)/(\d+){NO_RIGHT}',           r'bg-accent/\1',          'bg-amber-500/600 + opacity → bg-accent/N'),
    (rf'{NO_LEFT}border-amber-(?:300|400|500|600|700)/(\d+){NO_RIGHT}', r'border-accent/\1',    'border-amber-N/X → border-accent/X'),

    # ── amber → accent  (bare, no opacity) ──────────────────────────────
    (rf'{NO_LEFT}text-amber-(?:300|400){NO_RIGHT}',                   'text-accent-bright', 'text-amber-300/400 → text-accent-bright'),
    (rf'{NO_LEFT}text-amber-(?:500|600|700){NO_RIGHT}',               'text-accent',        'text-amber-500/600 → text-accent'),
    (rf'{NO_LEFT}bg-amber-(?:300|400){NO_RIGHT}',                     'bg-accent-bright',   'bg-amber-300/400 → bg-accent-bright'),
    (rf'{NO_LEFT}bg-amber-(?:500|600|700){NO_RIGHT}',                 'bg-accent',          'bg-amber-500/600 → bg-accent'),
    (rf'{NO_LEFT}border-amber-(?:300|400|500|600|700){NO_RIGHT}',     'border-accent',      'border-amber-N → border-accent'),

    # ── ring / outline / divide → accent ────────────────────────────────
    (rf'{NO_LEFT}ring-amber-(?:400|500|600)(?:/(\d+))?{NO_RIGHT}',    r'ring-accent\g<0>',  'placeholder-keep-suffix'),  # handled below
    # (the ring rule above is too clever; do it explicitly:)
    (rf'{NO_LEFT}ring-amber-(?:300|400|500|600)/(\d+){NO_RIGHT}',     r'ring-accent/\1',    'ring-amber-N/X → ring-accent/X'),
    (rf'{NO_LEFT}ring-amber-(?:300|400|500|600){NO_RIGHT}',           'ring-accent',        'ring-amber-N → ring-accent'),

    # ── arbitrary hex (the specific brand amber pair) ───────────────────
    (r'text-\[#f59e0b\]',  'text-accent',        'text-[#f59e0b] → text-accent'),
    (r'text-\[#fbbf24\]',  'text-accent-bright', 'text-[#fbbf24] → text-accent-bright'),
    (r'bg-\[#f59e0b\]',    'bg-accent',          'bg-[#f59e0b] → bg-accent'),
    (r'bg-\[#fbbf24\]',    'bg-accent-bright',   'bg-[#fbbf24] → bg-accent-bright'),
    (r'border-\[#f59e0b\]','border-accent',      'border-[#f59e0b] → border-accent'),

    # ── gradient stops: from-amber-N / to-amber-N / via-amber-N ─────────
    (rf'{NO_LEFT}(from|to|via)-amber-(?:300|400){NO_RIGHT}',          r'\1-accent-bright', 'gradient amber-300/400 → accent-bright'),
    (rf'{NO_LEFT}(from|to|via)-amber-(?:500|600|700){NO_RIGHT}',      r'\1-accent',        'gradient amber-500/600 → accent'),
]

# Files whose hardcoded colors are intentional brand identity, not theme.
SKIP_PATTERNS = [
    # SVG-heavy logo / loader components — colors are baked into the svg
    'components/ui/PageLoader.tsx',
    'components/layout/Logo.tsx',
]

# Per-file regex that, if matched, exempts that file from migration
# (only if EVERY color in the file is brand identity — rare)
HARD_SKIP: set[str] = set()


def should_skip(path: Path) -> bool:
    rel = str(path.relative_to(ROOT))
    return any(s in rel for s in SKIP_PATTERNS)


def migrate(text: str) -> tuple[str, dict[str, int]]:
    counts: dict[str, int] = {}
    for pat, repl, label in RULES:
        if label == 'placeholder-keep-suffix':
            continue
        new_text, n = re.subn(pat, repl, text)
        if n:
            counts[label] = counts.get(label, 0) + n
            text = new_text
    return text, counts


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--dry', action='store_true', help='preview without writing')
    ap.add_argument('--summary', action='store_true', help='only print totals')
    args = ap.parse_args()

    files = sorted(p for p in ROOT.rglob('*.tsx') if not should_skip(p))
    total_changed = 0
    total_replacements: dict[str, int] = {}
    per_file: list[tuple[Path, int]] = []

    for f in files:
        src = f.read_text()
        new, counts = migrate(src)
        if not counts:
            continue
        total_changed += 1
        n_local = sum(counts.values())
        per_file.append((f, n_local))
        for k, v in counts.items():
            total_replacements[k] = total_replacements.get(k, 0) + v
        if not args.dry:
            f.write_text(new)

    if args.summary:
        print(f'{total_changed} files would change (of {len(files)} scanned)')
        print(f'{sum(total_replacements.values())} total replacements')
        return 0

    print(f'\n=== {"DRY-RUN: " if args.dry else ""}migration report ===')
    print(f'files scanned:   {len(files)}')
    print(f'files changed:   {total_changed}')
    print(f'total edits:     {sum(total_replacements.values())}\n')
    print('per-rule breakdown:')
    for k, v in sorted(total_replacements.items(), key=lambda kv: -kv[1]):
        print(f'  {v:>5}  {k}')
    print('\ntop 15 files by edit count:')
    per_file.sort(key=lambda x: -x[1])
    for p, n in per_file[:15]:
        print(f'  {n:>4}  {p.relative_to(ROOT)}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
