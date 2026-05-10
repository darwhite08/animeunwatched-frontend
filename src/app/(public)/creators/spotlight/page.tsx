"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import {
  Star,
  BookOpen,
  Users,
  Eye,
  ExternalLink,
  ChevronRight,
  Pen,
} from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Creator {
  id: number
  username: string
  displayName: string
  avatarLetter: string
  avatarGradient: string
  bio: string
  articles: number
  followers: number
  totalReads: number
  bestArticleTitle: string
  bestArticleSlug: string
  joinedMonth: string
  specialty: string
}

// ─── Mock data — 6 creators ───────────────────────────────────────────────────

const CREATORS: Creator[] = [
  {
    id: 1,
    username: "Otaku_Arch",
    displayName: "Otaku Arch",
    avatarLetter: "O",
    avatarGradient: "from-indigo-500 to-violet-600",
    bio: "Power-scaling theorist and animation analyst. I write deep-dives on magic systems, villain psychology, and why certain anime transcend their medium. 4 years covering the industry.",
    articles: 84,
    followers: 12400,
    totalReads: 892000,
    bestArticleTitle: "Why Frieren's Mana Concealment is the Best Magic System in a Decade",
    bestArticleSlug: "frieren-mana-concealment-analysis",
    joinedMonth: "March 2023",
    specialty: "Analysis",
  },
  {
    id: 2,
    username: "ShadowWatcher",
    displayName: "Shadow Watcher",
    avatarLetter: "S",
    avatarGradient: "from-slate-600 to-zinc-800",
    bio: "Cinephile turned anime critic. I evaluate anime through the lens of film theory — composition, color grading, sound design. If it's beautiful, I'll tell you why.",
    articles: 61,
    followers: 9800,
    totalReads: 511000,
    bestArticleTitle: "MAPPA's Cinematic Language in Chainsaw Man: A Frame-by-Frame Study",
    bestArticleSlug: "mappa-chainsaw-man-cinematics",
    joinedMonth: "June 2022",
    specialty: "Cinematography",
  },
  {
    id: 3,
    username: "NeuralBot_X",
    displayName: "NeuralBot",
    avatarLetter: "N",
    avatarGradient: "from-emerald-500 to-teal-600",
    bio: "Data-driven anime takes. I track ratings trends, studio output, and seasonal data to find what the algorithms miss. Unapologetically pro-Monster and pro-Mushishi.",
    articles: 47,
    followers: 7200,
    totalReads: 388000,
    bestArticleTitle: "Monster in 2026: Why Johan Liebert is Still the GOAT Villain",
    bestArticleSlug: "monster-johan-liebert-2026",
    joinedMonth: "January 2024",
    specialty: "Data & Lists",
  },
  {
    id: 4,
    username: "VoidSeeker",
    displayName: "Void Seeker",
    avatarLetter: "V",
    avatarGradient: "from-violet-600 to-purple-800",
    bio: "Emotional storytelling and grief narratives in anime. Your Lie in April broke me and I've been writing about it ever since. Specializing in romance, tragedy, and music anime.",
    articles: 39,
    followers: 5600,
    totalReads: 276000,
    bestArticleTitle: "Color Theory as Emotional Language: Your Lie in April Decoded",
    bestArticleSlug: "your-lie-in-april-color-theory",
    joinedMonth: "September 2023",
    specialty: "Emotional Narratives",
  },
  {
    id: 5,
    username: "Cipher_Ronin",
    displayName: "Cipher Ronin",
    avatarLetter: "C",
    avatarGradient: "from-amber-500 to-orange-600",
    bio: "Hype merchant and seasonal anime hunter. I cover manhwa adaptations, power fantasy done right, and why Solo Leveling changed the game. First to hype the next big thing.",
    articles: 55,
    followers: 18300,
    totalReads: 1204000,
    bestArticleTitle: "Solo Leveling and the Manhwa Invasion: Why Japanese Studios Should Be Worried",
    bestArticleSlug: "solo-leveling-manhwa-invasion",
    joinedMonth: "November 2022",
    specialty: "Seasonal & Hype",
  },
  {
    id: 6,
    username: "MushiMaster",
    displayName: "Mushi Master",
    avatarLetter: "M",
    avatarGradient: "from-green-600 to-emerald-800",
    bio: "Hidden gem archaeologist. Iyashikei, folk horror, and contemplative anime are my bread and butter. I find the titles nobody talks about and make you want to watch them immediately.",
    articles: 28,
    followers: 4100,
    totalReads: 198000,
    bestArticleTitle: "Mushishi: How Anime Can Be Literature",
    bestArticleSlug: "mushishi-anime-as-literature",
    joinedMonth: "April 2024",
    specialty: "Hidden Gems",
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return String(n)
}

// ─── Featured creator card (large) ───────────────────────────────────────────

function FeaturedCard({ creator }: { creator: Creator }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-950/20 to-zinc-900/60 p-8 md:p-10"
    >
      {/* Decorative glow */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-amber-500/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row gap-8">
        {/* Avatar */}
        <div className="shrink-0 flex flex-col items-center gap-3">
          <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${creator.avatarGradient} flex items-center justify-center text-4xl font-black text-white shadow-2xl`}>
            {creator.avatarLetter}
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/20">
            <Star size={10} className="text-amber-400 fill-amber-400" />
            <span className="text-amber-400 text-[10px] font-black uppercase tracking-widest">
              Creator of the Month
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 space-y-4">
          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-amber-400/60 mb-1">
              Featured — May 2026
            </p>
            <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-white">
              {creator.displayName}
            </h2>
            <p className="text-white/40 text-sm font-bold">@{creator.username}</p>
          </div>

          <p className="text-white/55 text-sm leading-relaxed max-w-2xl">{creator.bio}</p>

          {/* Stats */}
          <div className="flex flex-wrap gap-6">
            {[
              { label: "Articles", value: creator.articles, icon: <BookOpen size={12} /> },
              { label: "Followers", value: formatNum(creator.followers), icon: <Users size={12} /> },
              { label: "Total Reads", value: formatNum(creator.totalReads), icon: <Eye size={12} /> },
            ].map(({ label, value, icon }) => (
              <div key={label} className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-white/30 text-[10px] font-bold">
                  {icon} {label}
                </div>
                <p className="text-xl font-black text-white">{value}</p>
              </div>
            ))}
          </div>

          {/* Best article */}
          <Link
            href={`/blog/${creator.bestArticleSlug}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 hover:bg-amber-500/20 hover:border-amber-500/40 text-xs font-black transition-all group"
          >
            <Pen size={12} />
            <span className="line-clamp-1">{creator.bestArticleTitle}</span>
            <ExternalLink size={11} className="shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
          </Link>

          <div className="flex items-center gap-4 pt-1">
            <Link
              href={`/u/${creator.username}`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 text-white/60 hover:text-white text-[11px] font-black uppercase tracking-widest transition-all"
            >
              View Profile <ChevronRight size={12} />
            </Link>
            <span className="text-[10px] text-white/20 font-bold">Member since {creator.joinedMonth}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Creator grid card (smaller) ──────────────────────────────────────────────

function CreatorGridCard({ creator, index }: { creator: Creator; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.07 }}
      className="p-5 rounded-2xl border border-white/5 bg-zinc-900/40 hover:border-white/12 hover:bg-zinc-900/60 transition-all space-y-4 group"
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${creator.avatarGradient} flex items-center justify-center text-xl font-black text-white shrink-0`}>
          {creator.avatarLetter}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-black text-white uppercase italic tracking-tight truncate group-hover:text-indigo-300 transition-colors">
            {creator.displayName}
          </p>
          <p className="text-[10px] text-white/30 font-bold">@{creator.username}</p>
          <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/15 text-[9px] font-black text-indigo-400 uppercase tracking-wider">
            {creator.specialty}
          </span>
        </div>
      </div>

      {/* Bio */}
      <p className="text-[11px] text-white/40 leading-relaxed line-clamp-3">{creator.bio}</p>

      {/* Stats */}
      <div className="flex gap-4">
        {[
          { label: "Articles", value: creator.articles },
          { label: "Followers", value: formatNum(creator.followers) },
          { label: "Reads", value: formatNum(creator.totalReads) },
        ].map(({ label, value }) => (
          <div key={label} className="space-y-0">
            <p className="text-[10px] text-white/20 font-bold">{label}</p>
            <p className="text-sm font-black text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Best article */}
      <Link
        href={`/blog/${creator.bestArticleSlug}`}
        className="block text-[10px] text-indigo-400/70 hover:text-indigo-300 font-bold transition-colors line-clamp-2 leading-relaxed"
      >
        → {creator.bestArticleTitle}
      </Link>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-white/5">
        <span className="text-[9px] text-white/15 font-bold">{creator.joinedMonth}</span>
        <Link
          href={`/u/${creator.username}`}
          className="text-[9px] font-black uppercase tracking-widest text-white/25 hover:text-indigo-400 transition-colors flex items-center gap-1"
        >
          Profile <ChevronRight size={9} />
        </Link>
      </div>
    </motion.div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CreatorSpotlightPage() {
  const [featured, ...others] = CREATORS

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">
      {/* Header */}
      <div className="relative border-b border-white/5 py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-amber-950/15 to-transparent" />
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-400 mb-4"
          >
            AnimeUnwatched — Community
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none text-white"
          >
            Creator<span className="text-amber-500">.</span>
            <br />
            <span className="text-white/20">Spotlight</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mt-6 text-white/40 text-sm max-w-xl leading-relaxed"
          >
            Celebrating the voices behind AnimeUnwatched's best content — May 2026 edition.
            These creators write the takes, analyses, and guides that keep the community sharp.
          </motion.p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-12 space-y-12">

        {/* Featured creator */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Star size={14} className="text-amber-400 fill-amber-400" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">
              Featured Creator
            </h2>
          </div>
          <FeaturedCard creator={featured} />
        </div>

        {/* Creator grid */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Users size={14} className="text-indigo-400" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">
              Rising Creators
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {others.map((creator, i) => (
              <CreatorGridCard key={creator.id} creator={creator} index={i} />
            ))}
          </div>
        </div>

        {/* Become a creator CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-6 p-8 rounded-3xl bg-gradient-to-br from-indigo-600/15 to-violet-600/10 border border-indigo-500/20"
        >
          <div className="space-y-2">
            <h3 className="text-2xl font-black uppercase italic tracking-tight text-white">
              Become a Creator<span className="text-indigo-400">.</span>
            </h3>
            <p className="text-white/40 text-sm max-w-md leading-relaxed">
              Got hot takes, deep analyses, or hidden gems to share? Publish on AnimeUnwatched
              and reach thousands of fans who actually care.
            </p>
          </div>
          <Link
            href="/creators"
            className="flex items-center gap-2 px-7 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-[11px] font-black uppercase tracking-widest text-white transition-all whitespace-nowrap"
          >
            Apply Now <ChevronRight size={14} />
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
