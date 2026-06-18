/**
 * Client-side badge catalog — mirrors app/src/lib/badges.ts on the backend.
 * Badges exist ONLY for rare / first-time / completion actions (engagement
 * research: common-action badges measured no effect). Earned badges are shown;
 * unearned ones are deliberately NOT advertised as a checklist — surprise is
 * the active ingredient (reward-prediction-error).
 */
export const BADGE_META: Record<string, { name: string; desc: string; tier: string; emoji: string }> = {
  FIRST_LIST_ADD: { name: "First Scroll",    desc: "Added your first anime to the archive", tier: "first",      emoji: "📜" },
  FIRST_SHOT:     { name: "First Frame",     desc: "Posted your first Shot",                tier: "first",      emoji: "🎬" },
  FIRST_BLOG:     { name: "Ink Initiate",    desc: "Published your first blog",             tier: "first",      emoji: "🖋️" },
  FIRST_REVIEW:   { name: "First Verdict",   desc: "Wrote your first review",               tier: "first",      emoji: "⚖️" },
  FIRST_CLUB:     { name: "Found the Dojo",  desc: "Joined your first community",           tier: "first",      emoji: "⛩️" },
  ARC_CLEARED:    { name: "Arc Cleared",     desc: "Completed your first series",           tier: "completion", emoji: "🏁" },
  ARC_CLEARED_10: { name: "Ten Arcs Deep",   desc: "Completed 10 series",                   tier: "completion", emoji: "🗂️" },
  ARC_CLEARED_50: { name: "Archive Master",  desc: "Completed 50 series",                   tier: "rare",       emoji: "🏯" },
  STREAK_7:       { name: "One Week Strong", desc: "Kept a 7-day streak",                   tier: "milestone",  emoji: "🔥" },
  STREAK_30:      { name: "Thirty Days",     desc: "Kept a 30-day streak",                  tier: "rare",       emoji: "🌙" },
  DAY_ONE:        { name: "Day One",         desc: "Here from the beginning — one of the first 1,000 members", tier: "founding", emoji: "⚡" },
}

export const TIER_COLOR: Record<string, string> = {
  first:      "oklch(0.72 0.16 282)", // indigo
  completion: "oklch(0.75 0.14 162)", // mint
  milestone:  "oklch(0.78 0.14 75)",  // amber
  rare:       "oklch(0.80 0.13 90)",  // gold
  founding:   "oklch(0.74 0.18 300)", // violet — prestige
}
