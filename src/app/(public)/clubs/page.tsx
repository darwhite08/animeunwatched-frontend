"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import {
  Users,
  MessageSquare,
  Plus,
  Search,
  ChevronRight,
  Shield,
  Flame,
  Star,
  BookOpen,
  Zap,
} from "lucide-react"
import { useToast } from "@/stores/toast.store"
import { useClubs, useJoinClub } from "@/hooks/useClubs"
import { ui } from "@/lib/design/tokens"

/* ── Types ── */
type Club = {
  id: string
  slug: string
  name: string
  description: string
  memberCount: number
  threadCount: number
  category: string
  coverGradient: string
  bannerUrl?: string | null
  reputation: number
  isJoined: boolean
}

const CATEGORIES = [
  "All",
  "Series Discussion",
  "Rankings",
  "Recommendations",
  "Studio Fan Club",
  "Genre Focus",
]

const CATEGORY_ICONS: Record<string, typeof Users> = {
  "Series Discussion": MessageSquare,
  Rankings: Flame,
  Recommendations: Star,
  "Studio Fan Club": Shield,
  "Genre Focus": BookOpen,
}

/* ── ClubCard ── */
function ClubCard({
  club,
  onToggleJoin,
}: {
  club: Club
  onToggleJoin: (id: string) => void
}) {
  const Icon = CATEGORY_ICONS[club.category] ?? Zap

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="group relative overflow-hidden rounded-3xl border border-border bg-surface-2 hover:border-border transition-all duration-300"
    >
      {/* Cover — uploaded banner if present, otherwise the gradient strip */}
      <div
        className={`h-24 w-full bg-gradient-to-br ${club.coverGradient} relative overflow-hidden`}
      >
        {club.bannerUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={club.bannerUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,color-mix(in srgb, var(--app-fg) 6%, transparent),transparent_60%)]" />
        <div className="absolute bottom-3 left-4">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur border border-border text-[9px] font-black uppercase tracking-widest text-muted">
            <Icon size={9} />
            {club.category}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Name */}
        <h3 className="text-base font-black uppercase italic tracking-tight text-foreground leading-snug group-hover:text-foreground transition-colors line-clamp-2">
          {club.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-muted leading-relaxed line-clamp-2">
          {club.description}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted">
            <Users size={11} />
            {club.memberCount.toLocaleString()} members
          </span>
          <span className="flex items-center gap-1.5 text-[10px] font-bold text-muted">
            <MessageSquare size={11} />
            {club.threadCount} threads
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-border">
          <button
            onClick={() => onToggleJoin(club.id)}
            className={`flex-1 min-h-11 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 active:scale-95 ${
              club.isJoined
                ? "bg-surface border border-border text-muted hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
                : "text-black shadow-[0_0_20px_color-mix(in_srgb,var(--app-accent)_30%,transparent)]"
            }`}
            style={!club.isJoined ? { background: "linear-gradient(135deg, var(--app-accent-bright), var(--app-accent))" } : undefined}
          >
            {club.isJoined ? "Joined" : "Join Den"}
          </button>
          <Link
            href={`/clubs/${club.slug}`}
            className="flex items-center justify-center gap-1 min-h-11 px-4 rounded-xl bg-surface border border-border text-[10px] font-black uppercase tracking-widest text-muted hover:text-foreground hover:border-border active:scale-95 transition-all"
          >
            View <ChevronRight size={11} />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Page ── */
export default function ClubsPage() {
  const { push } = useToast()
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("All")

  const { data: clubsData } = useClubs()

  // Merge real API clubs with mock fallback
  const apiClubs: Club[] = (clubsData?.data ?? []).map(c => ({
    id: c.id, slug: c.slug, name: c.name,
    description: c.description ?? "A community for anime fans.",
    memberCount: c._count.members, threadCount: c._count.threads,
    category: c.category ?? "Other", coverGradient: "from-indigo-800/30 to-violet-800/20",
    bannerUrl: c.bannerUrl ?? null,
    reputation: c.reputation, isJoined: false,
  }))

  // API-only. Empty list is rendered as an empty-state below.
  const clubs: Club[] = apiClubs

  const toggleJoin = (id: string) => {
    const c = clubs.find(x => x.id === id)
    if (c) push(c.isJoined ? `Left ${c.name}` : `Joined ${c.name}!`, c.isJoined ? "info" : "success")
  }

  const filtered = clubs.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
    const matchCategory =
      activeCategory === "All" || c.category === activeCategory
    return matchSearch && matchCategory
  })

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      {/* Hero header */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-30%] right-[-5%] w-[40%] h-[200%] bg-indigo-700/15 blur-[120px] rounded-full" />
          <div className="absolute bottom-[-20%] left-[-10%] w-[35%] h-[150%] bg-violet-900/10 blur-[100px] rounded-full" />
        </div>
        <div className={`relative z-10 max-w-6xl mx-auto ${ui.screenX} py-10 sm:py-16`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            <div className="flex items-end justify-between gap-4 flex-wrap">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent-bright/70 mb-3">
                  Community
                </p>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black uppercase italic tracking-tighter text-foreground leading-none">
                  Dens<span style={{color:"var(--app-accent)"}}>.</span>
                </h1>
                <p className="mt-3 text-muted text-sm max-w-md">
                  Join the conversation, build your community. Find your people.
                </p>
              </div>
              <Link
                href="/clubs/new"
                className="flex items-center gap-2 px-5 sm:px-6 min-h-11 rounded-2xl text-sm font-black uppercase tracking-widest text-black transition-all hover:-translate-y-0.5 active:scale-95" style={{background:"linear-gradient(135deg,var(--app-accent-bright),var(--app-accent))",boxShadow:"0 0 32px color-mix(in srgb, var(--app-accent) 35%, transparent)"}}
              >
                <Plus size={14} /> Create Den
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <div className={`max-w-6xl mx-auto ${ui.screenX} pt-8`}>
        {/* Search + filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="flex flex-col gap-3 mb-8"
        >
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle pointer-events-none"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search dens…"
              className="w-full pl-10 pr-4 min-h-11 rounded-xl bg-surface border border-border text-base sm:text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent/40 focus:bg-surface transition-all"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                aria-pressed={activeCategory === cat}
                className={`shrink-0 px-4 min-h-11 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 ${
                  activeCategory === cat
                    ? "text-black border border-accent/60 shadow-[0_4px_16px_color-mix(in_srgb,var(--app-accent)_35%,transparent)]"
                    : "bg-surface border border-border text-muted hover:text-foreground hover:border-white/30 hover:bg-surface-2"
                }`}
                style={activeCategory === cat ? {
                  background: "linear-gradient(135deg, var(--app-accent-bright), var(--app-accent))",
                } : undefined}
              >
                {cat}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Results count */}
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-subtle mb-6">
          {filtered.length} den{filtered.length !== 1 ? "s" : ""} found
        </p>

        {/* Grid */}
        <AnimatePresence mode="popLayout">
          {filtered.length > 0 ? (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filtered.map((club) => (
                <ClubCard key={club.id} club={club} onToggleJoin={toggleJoin} />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 space-y-4"
            >
              <div className="h-20 w-20 rounded-3xl bg-surface border border-border flex items-center justify-center">
                <Users size={28} className="text-subtle" />
              </div>
              <p className="text-lg font-black uppercase italic text-subtle">
                No dens found
              </p>
              <p className="text-xs text-subtle">
                Try a different search or category
              </p>
              <button
                onClick={() => {
                  setSearch("")
                  setActiveCategory("All")
                }}
                className="mt-2 px-5 min-h-11 rounded-xl bg-accent/20 border border-accent/20 text-xs font-black uppercase tracking-widest text-accent-bright hover:bg-white/30 active:scale-95 transition-all"
              >
                Clear filters
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
