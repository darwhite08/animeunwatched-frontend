import type { Transition } from "framer-motion"

/**
 * Kaiveron mobile design language.
 *
 * These are ELEVATION tokens — consistent rhythm, shape, and motion layered on
 * the EXISTING identity (dark base #020202, six swappable accents via
 * --app-accent, Plus Jakarta Sans, bold-italic display type). They do not
 * introduce a new look; they make the current one consistent and premium.
 *
 * Use:
 *   • motion → spread onto framer-motion components
 *   • ui.*   → cn()-friendly className tokens for rhythm/shape
 */

// ── Motion ───────────────────────────────────────────────────────────────
// ease-out-expo: a confident, native-feeling deceleration.
export const EASE = {
  out: [0.22, 1, 0.36, 1] as [number, number, number, number],
  inOut: [0.65, 0, 0.35, 1] as [number, number, number, number],
}

export const DURATION = { fast: 0.15, base: 0.22, slow: 0.32 }

export const SPRING = {
  snappy: { type: "spring", stiffness: 380, damping: 30 } as Transition, // tab indicator, toggles
  soft: { type: "spring", stiffness: 260, damping: 28 } as Transition, // cards, hovers
  sheet: { type: "spring", stiffness: 300, damping: 34 } as Transition, // bottom sheets
}

/** Staggered list-item entrance — spread onto a motion element. */
export const fadeUp = (i = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DURATION.base, ease: EASE.out, delay: i * 0.04 } as Transition,
})

// ── Shape & rhythm (className tokens) ──────────────────────────────────────
export const ui = {
  /** Horizontal screen padding — roomy on phones, generous on desktop. */
  screenX: "px-4 sm:px-6",
  /** Centered reading column for the feed / single-column screens. */
  column: "mx-auto w-full max-w-2xl px-4 sm:px-6",
  /** Standard card surface + padding. */
  card: "rounded-2xl border border-border bg-surface",
  cardPad: "p-4 sm:p-5",
  /** Minimum 44×44px touch target (Apple HIG / Material). */
  touch: "min-h-11 min-w-11",
  /** Display screen title (bold italic, responsive). */
  screenTitle: "text-2xl sm:text-3xl font-black uppercase italic tracking-tighter text-foreground",
  /** Small section eyebrow label. */
  eyebrow: "text-[10px] font-black uppercase tracking-[0.3em] text-muted",
  /** Body copy. */
  body: "text-[15px] leading-[1.6]",
}
