"use client"

import { useState } from "react"
import { motion, AnimatePresence, type Variants } from "framer-motion"
import { Lock } from "lucide-react"

type Badge = {
  id: string
  name: string
  description: string
  icon: string
  rarity: "common" | "rare" | "legendary"
  earned: boolean
  earnedAt?: string
  requirement: string
  progress?: number
}

const BADGES: Badge[] = [
  // Common
  {
    id: "first-blood",
    name: "First Blood",
    description: "Added your first anime to the list.",
    icon: "🎯",
    rarity: "common",
    earned: true,
    earnedAt: "Jan 12, 2026",
    requirement: "Add your first anime",
  },
  {
    id: "social-butterfly",
    name: "Social Butterfly",
    description: "Built your first community connections.",
    icon: "🦋",
    rarity: "common",
    earned: true,
    earnedAt: "Jan 18, 2026",
    requirement: "Follow 5 users",
  },
  {
    id: "voice-of-the-people",
    name: "Voice of the People",
    description: "Made your opinion heard across 10 polls.",
    icon: "🗳️",
    rarity: "common",
    earned: false,
    requirement: "Vote in 10 polls",
    progress: 70,
  },
  {
    id: "critic",
    name: "Critic",
    description: "Penned your very first review.",
    icon: "📝",
    rarity: "common",
    earned: true,
    earnedAt: "Feb 3, 2026",
    requirement: "Write your first review",
  },
  // Rare
  {
    id: "centurion",
    name: "Centurion",
    description: "A true veteran — 100 anime archived.",
    icon: "⚔️",
    rarity: "rare",
    earned: true,
    earnedAt: "Mar 15, 2026",
    requirement: "Archive 100 anime",
  },
  {
    id: "fire-walker",
    name: "Fire Walker",
    description: "Kept the flame alive for 10 straight days.",
    icon: "🔥",
    rarity: "rare",
    earned: true,
    earnedAt: "Apr 2, 2026",
    requirement: "Maintain a 10-day streak",
  },
  {
    id: "the-dedicated",
    name: "The Dedicated",
    description: "A month of unwavering dedication.",
    icon: "💎",
    rarity: "rare",
    earned: false,
    requirement: "Maintain a 30-day streak",
    progress: 60,
  },
  {
    id: "binge-master",
    name: "Binge Master",
    description: "12 episodes in a single legendary session.",
    icon: "📺",
    rarity: "rare",
    earned: false,
    requirement: "Watch 12 episodes in one day",
    progress: 40,
  },
  // Legendary
  {
    id: "neural-oracle",
    name: "Neural Oracle",
    description: "You have transcended. Level 9 achieved.",
    icon: "🧠",
    rarity: "legendary",
    earned: false,
    requirement: "Reach level 9",
  },
  {
    id: "legendary-shinobi",
    name: "Legendary Shinobi",
    description: "Reputation of a thousand — feared and respected.",
    icon: "👑",
    rarity: "legendary",
    earned: false,
    requirement: "Reach 1000 reputation",
  },
  {
    id: "completionist",
    name: "Completionist",
    description: "500 anime archived. There are no more worlds to conquer.",
    icon: "🏆",
    rarity: "legendary",
    earned: false,
    requirement: "Archive 500 anime",
  },
  {
    id: "first-reviewer",
    name: "First Reviewer",
    description: "100 people found your review helpful. You matter.",
    icon: "🌟",
    rarity: "legendary",
    earned: false,
    requirement: "Get 100 helpful votes on a review",
  },
]

const RARITY_CONFIG = {
  common: {
    label: "Common",
    color: "text-muted",
    borderEarned: "border-border",
    borderLocked: "border-border",
    glow: "hover:shadow-slate-500/25",
    bg: "bg-surface-2",
    bar: "bg-slate-400",
    pill: "bg-surface-2 text-muted",
  },
  rare: {
    label: "Rare",
    color: "text-accent-bright",
    borderEarned: "border-accent/60",
    borderLocked: "border-indigo-800/30",
    glow: "hover:shadow-indigo-500/20",
    bg: "bg-accent/10",
    bar: "bg-accent-bright",
    pill: "bg-indigo-900/60 text-accent-bright",
  },
  legendary: {
    label: "Legendary",
    color: "text-accent-bright",
    borderEarned: "border-accent/60",
    borderLocked: "border-amber-800/30",
    glow: "hover:shadow-amber-500/20",
    bg: "bg-accent/10",
    bar: "bg-accent-bright",
    pill: "bg-amber-900/60 text-accent-bright",
  },
}

type FilterTab = "all" | "common" | "rare" | "legendary" | "earned"

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "common", label: "Common" },
  { key: "rare", label: "Rare" },
  { key: "legendary", label: "Legendary" },
  { key: "earned", label: "Earned" },
]

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 260, damping: 22 } },
}

export default function BadgeShowcase() {
  const [activeTab, setActiveTab] = useState<FilterTab>("all")

  const earnedCount = BADGES.filter((b) => b.earned).length
  const totalCount = BADGES.length

  const filtered = BADGES.filter((b) => {
    if (activeTab === "all") return true
    if (activeTab === "earned") return b.earned
    return b.rarity === activeTab
  })

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tighter italic text-foreground">
            Your Badges
          </h2>
          <p className="text-muted text-sm font-bold mt-1 tracking-tight uppercase">
            {earnedCount} / {totalCount} Earned
          </p>
        </div>
        {/* mini legend */}
        <div className="hidden sm:flex items-center gap-4 text-xs font-bold uppercase tracking-tighter">
          <span className="text-muted">Common</span>
          <span className="text-accent-bright">Rare</span>
          <span className="text-accent-bright">Legendary</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-tight transition-all ${
              activeTab === tab.key
                ? "text-foreground"
                : "text-subtle hover:text-muted"
            }`}
          >
            {activeTab === tab.key && (
              <motion.span
                layoutId="tab-pill"
                className="absolute inset-0 rounded-full bg-surface border border-border"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Badge Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {filtered.map((badge) => {
            const cfg = RARITY_CONFIG[badge.rarity]
            const isInProgress = !badge.earned && badge.progress !== undefined
            const isLocked = !badge.earned && badge.progress === undefined

            return (
              <motion.div
                key={badge.id}
                variants={cardVariants}
                whileHover={{ scale: 1.04 }}
                className={`relative p-5 rounded-[1.75rem] border transition-all duration-300 cursor-default group ${
                  badge.earned
                    ? `${cfg.borderEarned} ${cfg.bg} hover:shadow-xl ${cfg.glow}`
                    : isInProgress
                    ? `border-border bg-surface hover:bg-surface`
                    : `border-border bg-white/[0.01] opacity-50`
                }`}
              >
                {/* Locked overlay icon */}
                {isLocked && (
                  <div className="absolute top-3 right-3">
                    <Lock size={12} className="text-subtle" />
                  </div>
                )}

                {/* Rarity pill */}
                <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter mb-3 ${cfg.pill}`}>
                  {cfg.label}
                </span>

                {/* Icon */}
                <div
                  className={`text-3xl mb-3 transition-transform duration-300 ${
                    badge.earned ? "group-hover:scale-110" : "grayscale opacity-50"
                  }`}
                >
                  {badge.icon}
                </div>

                {/* Name */}
                <p className={`font-black tracking-tight text-sm mb-0.5 ${badge.earned ? "text-foreground" : "text-muted"}`}>
                  {badge.name}
                </p>

                {/* Description / requirement */}
                <p className="text-[11px] text-subtle leading-snug mb-3">
                  {badge.earned ? badge.description : badge.requirement}
                </p>

                {/* Earned date */}
                {badge.earned && badge.earnedAt && (
                  <p className={`text-[10px] font-bold uppercase tracking-tighter ${cfg.color}`}>
                    Earned {badge.earnedAt}
                  </p>
                )}

                {/* Progress bar */}
                {isInProgress && (
                  <div className="space-y-1.5">
                    <div className="h-1.5 w-full rounded-full bg-surface overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${cfg.bar}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${badge.progress}%` }}
                        transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
                      />
                    </div>
                    <p className={`text-[10px] font-black uppercase tracking-tighter ${cfg.color}`}>
                      {badge.progress}% complete
                    </p>
                  </div>
                )}
              </motion.div>
            )
          })}
        </motion.div>
      </AnimatePresence>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-subtle font-black tracking-tighter italic text-xl">
          No badges here yet.
        </div>
      )}
    </section>
  )
}
