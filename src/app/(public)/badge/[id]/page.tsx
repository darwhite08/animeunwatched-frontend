"use client"

import { use } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, Trophy, Star, Zap, Target, Award, Brain, Tv2 } from "lucide-react"
import Link from "next/link"

/* ── Types ── */
type Rarity = "Common" | "Rare" | "Epic" | "Legendary"

type BadgeData = {
  id: string
  emoji: string
  name: string
  description: string
  rarity: Rarity
  rarityColor: string
  rarityBg: string
  requirement: string
  requirementProgress: number   // 0–100 visual bar
  earnedCount: number
  icon: typeof Trophy
  steps: string[]
}

type Earner = {
  id: string
  username: string
  avatar: string
  avatarColor: string
  earnedDate: string
  level: number
}

/* ── Badge DB ── */
const BADGE_DB: Record<string, BadgeData> = {
  "fire-walker": {
    id: "fire-walker",
    emoji: "🔥",
    name: "Fire Walker",
    description: "Maintained an unbroken watch streak of 7 consecutive days without missing a single daily check-in.",
    rarity: "Common",
    rarityColor: "text-emerald-400",
    rarityBg: "bg-emerald-500/10 border-emerald-500/25",
    requirement: "7-day watch streak",
    requirementProgress: 28,
    earnedCount: 18420,
    icon: Zap,
    steps: [
      "Log in every day for 7 days straight.",
      "Mark at least one episode or activity as watched per day.",
      "Don't break your streak — no day can be skipped.",
      "Badge is awarded automatically at midnight on day 7.",
    ],
  },
  "centurion": {
    id: "centurion",
    emoji: "💯",
    name: "Centurion",
    description: "Added 100 anime titles to your list. A true collector who understands the breadth of the medium.",
    rarity: "Rare",
    rarityColor: "text-blue-400",
    rarityBg: "bg-blue-500/10 border-blue-500/25",
    requirement: "100 anime on your list",
    requirementProgress: 42,
    earnedCount: 7830,
    icon: Trophy,
    steps: [
      "Add anime to any status: Watching, Completed, Dropped, Plan to Watch.",
      "Every unique title counts toward the total.",
      "Reach 100 entries on your combined list.",
      "Badge is granted instantly when the 100th title is added.",
    ],
  },
  "critic": {
    id: "critic",
    emoji: "✍️",
    name: "Critic",
    description: "Wrote 25 reviews with a minimum length of 100 words each. Your words shape how others discover anime.",
    rarity: "Rare",
    rarityColor: "text-blue-400",
    rarityBg: "bg-blue-500/10 border-blue-500/25",
    requirement: "25 reviews (100+ words each)",
    requirementProgress: 38,
    earnedCount: 3410,
    icon: Star,
    steps: [
      "Navigate to any anime detail page and open the Review tab.",
      "Write a review of at least 100 words — quality matters.",
      "Submit and repeat for 25 different titles.",
      "Badge is awarded after your 25th qualifying review is published.",
    ],
  },
  "social-butterfly": {
    id: "social-butterfly",
    emoji: "🦋",
    name: "Social Butterfly",
    description: "Joined 5 clubs, followed 20 users, and had 50 posts liked by the community. The connective tissue of this platform.",
    rarity: "Epic",
    rarityColor: "text-violet-400",
    rarityBg: "bg-violet-500/10 border-violet-500/25",
    requirement: "5 clubs + 20 follows + 50 post likes",
    requirementProgress: 62,
    earnedCount: 1240,
    icon: Award,
    steps: [
      "Join at least 5 community clubs from the Clubs page.",
      "Follow 20 other Shinobi — explore the community feed to discover people.",
      "Post in the community feed until your posts accumulate 50 total likes.",
      "All three conditions must be met simultaneously — badge unlocks automatically.",
    ],
  },
  "neural-oracle": {
    id: "neural-oracle",
    emoji: "🧠",
    name: "Neural Oracle",
    description: "Used the AI Discovery engine 50 times and saved at least 10 AI-recommended anime to your list.",
    rarity: "Epic",
    rarityColor: "text-violet-400",
    rarityBg: "bg-violet-500/10 border-violet-500/25",
    requirement: "50 AI discoveries + 10 saves",
    requirementProgress: 71,
    earnedCount: 892,
    icon: Brain,
    steps: [
      "Open the AI Discover page from the navigation.",
      "Enter prompts and explore AI-generated recommendations — each search counts.",
      "Reach 50 total AI discovery sessions.",
      "Add at least 10 AI-recommended titles to your watchlist.",
      "Badge unlocks when both milestones are achieved.",
    ],
  },
  "binge-master": {
    id: "binge-master",
    emoji: "📺",
    name: "Binge Master",
    description: "Marked 500 or more episodes as watched. You don't just watch anime — you live it.",
    rarity: "Legendary",
    rarityColor: "text-accent-bright",
    rarityBg: "bg-accent/10 border-accent/25",
    requirement: "500 episodes watched",
    requirementProgress: 15,
    earnedCount: 284,
    icon: Tv2,
    steps: [
      "Track your watching through the Watchlist — mark episodes as watched.",
      "Episode count accumulates across all completed and in-progress series.",
      "Reach a cumulative total of 500 episodes.",
      "This is a rare badge — fewer than 300 Shinobi have earned it.",
      "Badge grants permanently and cannot be lost.",
    ],
  },
}

const FALLBACK_BADGE: BadgeData = {
  id: "unknown",
  emoji: "🏅",
  name: "Unknown Badge",
  description: "This badge does not exist yet — or you may have followed a broken link.",
  rarity: "Common",
  rarityColor: "text-muted",
  rarityBg: "bg-surface border-border",
  requirement: "Unknown",
  requirementProgress: 0,
  earnedCount: 0,
  icon: Award,
  steps: ["This badge has no steps defined."],
}

/* ── Earners (per badge) ── */
const EARNERS_DB: Record<string, Earner[]> = {
  "fire-walker": [
    { id: "e1", username: "Otaku_Arch",    avatar: "O", avatarColor: "from-indigo-500 to-violet-600", earnedDate: "May 1, 2026",  level: 42 },
    { id: "e2", username: "ShadowWatcher", avatar: "S", avatarColor: "from-violet-500 to-purple-600", earnedDate: "Apr 28, 2026", level: 37 },
    { id: "e3", username: "NeuralBot_X",   avatar: "N", avatarColor: "from-cyan-500 to-blue-600",     earnedDate: "Apr 22, 2026", level: 55 },
    { id: "e4", username: "VoidSeeker",    avatar: "V", avatarColor: "from-fuchsia-500 to-pink-600",  earnedDate: "Apr 18, 2026", level: 29 },
    { id: "e5", username: "Cipher_Ronin",  avatar: "C", avatarColor: "from-accent to-orange-600",  earnedDate: "Apr 10, 2026", level: 61 },
    { id: "e6", username: "SakuraFrame",   avatar: "S", avatarColor: "from-pink-500 to-rose-600",     earnedDate: "Apr 5, 2026",  level: 18 },
  ],
  "centurion": [
    { id: "e1", username: "NeuralBot_X",   avatar: "N", avatarColor: "from-cyan-500 to-blue-600",     earnedDate: "May 3, 2026",  level: 55 },
    { id: "e2", username: "Cipher_Ronin",  avatar: "C", avatarColor: "from-accent to-orange-600",  earnedDate: "Apr 30, 2026", level: 61 },
    { id: "e3", username: "Otaku_Arch",    avatar: "O", avatarColor: "from-indigo-500 to-violet-600", earnedDate: "Apr 24, 2026", level: 42 },
    { id: "e4", username: "GriffinSeer",   avatar: "G", avatarColor: "from-lime-500 to-green-600",    earnedDate: "Apr 20, 2026", level: 33 },
    { id: "e5", username: "AnimationNerd", avatar: "A", avatarColor: "from-teal-500 to-emerald-600",  earnedDate: "Apr 14, 2026", level: 47 },
    { id: "e6", username: "VoidSeeker",    avatar: "V", avatarColor: "from-fuchsia-500 to-pink-600",  earnedDate: "Apr 8, 2026",  level: 29 },
  ],
}

function defaultEarners(badge: BadgeData): Earner[] {
  return [
    { id: "e1", username: "Otaku_Arch",    avatar: "O", avatarColor: "from-indigo-500 to-violet-600", earnedDate: "May 4, 2026",  level: 42 },
    { id: "e2", username: "NeuralBot_X",   avatar: "N", avatarColor: "from-cyan-500 to-blue-600",     earnedDate: "Apr 29, 2026", level: 55 },
    { id: "e3", username: "Cipher_Ronin",  avatar: "C", avatarColor: "from-accent to-orange-600",  earnedDate: "Apr 25, 2026", level: 61 },
    { id: "e4", username: "ShadowWatcher", avatar: "S", avatarColor: "from-violet-500 to-purple-600", earnedDate: "Apr 20, 2026", level: 37 },
    { id: "e5", username: "AnimationNerd", avatar: "A", avatarColor: "from-teal-500 to-emerald-600",  earnedDate: "Apr 15, 2026", level: 47 },
    { id: "e6", username: "VoidSeeker",    avatar: "V", avatarColor: "from-fuchsia-500 to-pink-600",  earnedDate: "Apr 10, 2026", level: 29 },
  ]
}

const RARITY_ORDER: Rarity[] = ["Common", "Rare", "Epic", "Legendary"]

/* ── Page ── */
export default function BadgeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const badge  = BADGE_DB[id] ?? { ...FALLBACK_BADGE, id }
  const earners: Earner[] = EARNERS_DB[id] ?? defaultEarners(badge)

  const BadgeIcon = badge.icon

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <div className="max-w-4xl mx-auto px-6 pt-8 space-y-12">

        {/* Back */}
        <Link
          href="/achievements"
          className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-subtle hover:text-foreground transition-colors"
        >
          <ChevronLeft size={13} /> Badges
        </Link>

        {/* ── Badge Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-3xl border border-border bg-surface-2 p-8 md:p-12"
        >
          {/* Background glow */}
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-accent/8 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-violet-500/6 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-8">
            {/* Emoji badge */}
            <div className="h-28 w-28 rounded-3xl bg-gradient-to-br from-indigo-900/80 to-violet-900/80 border border-accent/20 flex items-center justify-center text-6xl shrink-0 shadow-[0_0_48px_rgba(99,102,241,0.2)]">
              {badge.emoji}
            </div>

            <div className="flex-1 space-y-3">
              {/* Rarity */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${badge.rarityBg} ${badge.rarityColor}`}>
                <BadgeIcon size={9} />
                {badge.rarity}
                {" · "}
                Rank {RARITY_ORDER.indexOf(badge.rarity) + 1}/4
              </span>

              {/* Name */}
              <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-foreground leading-none">
                {badge.name}
              </h1>

              {/* Description */}
              <p className="text-sm text-muted leading-relaxed max-w-xl">
                {badge.description}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Two-column layout ── */}
        <div className="grid md:grid-cols-[1fr_340px] gap-8">
          <div className="space-y-8">

            {/* Earners count */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="p-6 rounded-2xl bg-surface border border-border flex items-center gap-5"
            >
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-accent/20 to-orange-500/20 border border-accent/25 flex items-center justify-center shrink-0">
                <Trophy size={22} className="text-accent-bright" />
              </div>
              <div>
                <p className="text-3xl font-black text-foreground">
                  {badge.earnedCount.toLocaleString()}
                </p>
                <p className="text-[11px] text-subtle mt-0.5 uppercase tracking-widest font-black">
                  Shinobi have earned this badge
                </p>
              </div>
            </motion.div>

            {/* Requirement bar */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="p-6 rounded-2xl bg-surface border border-border space-y-4"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-subtle">
                Requirement
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-muted">{badge.requirement}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-subtle">
                  {badge.requirementProgress}% of users qualify
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-surface overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${badge.requirementProgress}%` }}
                  transition={{ delay: 0.4, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                />
              </div>
              <p className="text-[10px] text-subtle">
                The lower this number, the rarer the badge.
              </p>
            </motion.div>

            {/* Earners grid */}
            <div className="space-y-4">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-subtle">
                Recent Earners
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {earners.map((earner, i) => (
                  <motion.div
                    key={earner.id}
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 + i * 0.06 }}
                    className="p-4 rounded-2xl bg-surface border border-border hover:border-accent/20 hover:bg-surface transition-all flex flex-col items-center gap-3 text-center group"
                  >
                    <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${earner.avatarColor} flex items-center justify-center font-black text-lg text-foreground group-hover:scale-105 transition-transform`}>
                      {earner.avatar}
                    </div>
                    <div>
                      <p className="text-xs font-black text-foreground">{earner.username}</p>
                      <p className="text-[9px] text-subtle mt-0.5">Lv. {earner.level}</p>
                      <p className="text-[8px] text-subtle mt-1">{earner.earnedDate}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Sidebar: How to Earn ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4 lg:sticky lg:top-24 self-start"
          >
            <div className="p-6 rounded-2xl bg-surface border border-border space-y-5">
              <div className="flex items-center gap-2">
                <Target size={14} className="text-accent-bright" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">
                  How to Earn This
                </p>
              </div>

              <ol className="space-y-4">
                {badge.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted leading-relaxed">
                    <span className="shrink-0 mt-0.5 h-5 w-5 rounded-full bg-accent/15 border border-accent/25 flex items-center justify-center text-[9px] font-black text-accent-bright">
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>

              <div className={`mt-4 flex items-center gap-2 px-4 py-3 rounded-xl border text-[10px] font-black uppercase tracking-wider ${badge.rarityBg} ${badge.rarityColor}`}>
                <BadgeIcon size={11} />
                {badge.rarity} badge — {badge.earnedCount.toLocaleString()} earned
              </div>
            </div>

            {/* All badges link */}
            <Link
              href="/achievements"
              className="block p-5 rounded-2xl bg-surface border border-border hover:border-accent/20 transition-all group text-center"
            >
              <p className="text-xs font-black uppercase italic tracking-tight text-muted group-hover:text-foreground transition-colors">
                View All Badges
              </p>
              <p className="text-[10px] text-subtle mt-1">
                6 total · collect them all
              </p>
            </Link>
          </motion.div>
        </div>

      </div>
    </div>
  )
}
