"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BookOpen, Search, Plus, X, ChevronRight } from "lucide-react"
import { useToast } from "@/stores/toast.store"

// ─── Types ────────────────────────────────────────────────────────────────────

type MangaStatus = "Reading" | "Completed" | "Plan to Read" | "On Hold"
type MangaCategory = "Seinen" | "Shonen" | "Psychological"

interface MangaEntry {
  id: number
  title: string
  author: string
  status: MangaStatus
  progress: number
  totalChapters: number
  coverGradient: string
  category: MangaCategory
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MANGA_LIST: MangaEntry[] = [
  {
    id: 1,
    title: "Berserk",
    author: "Kentaro Miura",
    status: "Reading",
    progress: 267,
    totalChapters: 374,
    coverGradient: "from-slate-800 to-black",
    category: "Seinen",
  },
  {
    id: 2,
    title: "Vagabond",
    author: "Takehiko Inoue",
    status: "Reading",
    progress: 120,
    totalChapters: 327,
    coverGradient: "from-amber-900 to-amber-950",
    category: "Seinen",
  },
  {
    id: 3,
    title: "Oyasumi Punpun",
    author: "Inio Asano",
    status: "Reading",
    progress: 34,
    totalChapters: 147,
    coverGradient: "from-neutral-800 to-neutral-950",
    category: "Seinen",
  },
  {
    id: 4,
    title: "Chainsaw Man",
    author: "Tatsuki Fujimoto",
    status: "Reading",
    progress: 98,
    totalChapters: 200,
    coverGradient: "from-red-900 to-red-950",
    category: "Shonen",
  },
  {
    id: 5,
    title: "Fullmetal Alchemist",
    author: "Hiromu Arakawa",
    status: "Completed",
    progress: 116,
    totalChapters: 116,
    coverGradient: "from-orange-900 to-orange-950",
    category: "Shonen",
  },
  {
    id: 6,
    title: "Monster",
    author: "Naoki Urasawa",
    status: "Completed",
    progress: 162,
    totalChapters: 162,
    coverGradient: "from-stone-800 to-stone-950",
    category: "Seinen",
  },
  {
    id: 7,
    title: "20th Century Boys",
    author: "Naoki Urasawa",
    status: "Completed",
    progress: 249,
    totalChapters: 249,
    coverGradient: "from-blue-900 to-blue-950",
    category: "Seinen",
  },
  {
    id: 8,
    title: "Dungeon Meshi",
    author: "Ryoko Kui",
    status: "Plan to Read",
    progress: 0,
    totalChapters: 97,
    coverGradient: "from-emerald-900 to-emerald-950",
    category: "Seinen",
  },
  {
    id: 9,
    title: "Homunculus",
    author: "Hideo Yamamoto",
    status: "Plan to Read",
    progress: 0,
    totalChapters: 166,
    coverGradient: "from-purple-900 to-purple-950",
    category: "Psychological",
  },
  {
    id: 10,
    title: "Biomega",
    author: "Tsutomu Nihei",
    status: "Plan to Read",
    progress: 0,
    totalChapters: 48,
    coverGradient: "from-cyan-900 to-cyan-950",
    category: "Seinen",
  },
]

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS: Array<"All" | MangaStatus> = [
  "All",
  "Reading",
  "Completed",
  "Plan to Read",
  "On Hold",
]

const STATUS_STYLE: Record<MangaStatus, string> = {
  Reading:        "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
  Completed:      "bg-amber-500/15 text-amber-400 border-amber-500/20",
  "Plan to Read": "bg-white/5 text-white/40 border-white/10",
  "On Hold":      "bg-amber-500/15 text-amber-400 border-amber-500/20",
}

const CATEGORY_STYLE: Record<MangaCategory, string> = {
  Seinen:        "bg-blue-500/10 text-blue-400 border-blue-500/15",
  Shonen:        "bg-orange-500/10 text-orange-400 border-orange-500/15",
  Psychological: "bg-purple-500/10 text-purple-400 border-purple-500/15",
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function MangaPage() {
  const { push } = useToast()
  const [entries, setEntries] = useState<MangaEntry[]>(MANGA_LIST)
  const [activeTab, setActiveTab] = useState<"All" | MangaStatus>("All")
  const [query, setQuery] = useState("")

  const filtered = useMemo(() => {
    return entries.filter((m) => {
      const matchTab = activeTab === "All" || m.status === activeTab
      const matchQ = m.title.toLowerCase().includes(query.toLowerCase())
      return matchTab && matchQ
    })
  }, [entries, activeTab, query])

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: entries.length }
    for (const t of TABS.slice(1)) {
      c[t] = entries.filter((m) => m.status === t).length
    }
    return c
  }, [entries])

  const stats = useMemo(() => ({
    total:     entries.length,
    reading:   entries.filter((m) => m.status === "Reading").length,
    completed: entries.filter((m) => m.status === "Completed").length,
    planned:   entries.filter((m) => m.status === "Plan to Read").length,
  }), [entries])

  const handleIncrementChapter = (id: number) => {
    setEntries((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m
        const next = Math.min(m.progress + 1, m.totalChapters)
        const newStatus: MangaStatus =
          next >= m.totalChapters ? "Completed" : m.status
        push(
          next >= m.totalChapters
            ? `Marked "${m.title}" as completed!`
            : `Chapter ${next} logged for "${m.title}"`,
          next >= m.totalChapters ? "success" : "info"
        )
        return { ...m, progress: next, status: newStatus }
      })
    )
  }

  const handleContinue = (title: string) => {
    push(`Opening "${title}" — feature coming soon!`, "info")
  }

  const handleAddManga = () => {
    push("Add manga — feature coming soon!", "info")
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 pb-32 space-y-10">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-3">
          <motion.p
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-violet-400 font-black uppercase tracking-[0.4em] text-[10px]"
          >
            <BookOpen size={13} /> Reading List
          </motion.p>
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-white italic leading-none">
            Manga<span className="text-violet-500">.</span>
            <br />
            <span className="text-white/20">Light Novels</span>
          </h1>
        </div>

        <button
          onClick={handleAddManga}
          className="self-start sm:self-auto flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-black font-black text-[10px] uppercase tracking-widest hover:bg-violet-50 transition-all active:scale-95"
        >
          <Plus size={14} /> Add Manga
        </button>
      </header>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-3"
      >
        {[
          { label: "Total",         value: stats.total,     color: "text-white" },
          { label: "Reading",       value: stats.reading,   color: "text-emerald-400" },
          { label: "Completed",     value: stats.completed, color: "text-amber-400" },
          { label: "Plan to Read",  value: stats.planned,   color: "text-white/40" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-2xl border border-white/5 bg-white/[0.02] p-5"
          >
            <p className="text-[9px] font-black text-white/25 uppercase tracking-widest mb-1">
              {label}
            </p>
            <p className={`text-3xl font-black italic ${color}`}>{value}</p>
          </div>
        ))}
      </motion.div>

      {/* Search + Filter tabs */}
      <div className="space-y-4">
        {/* Search */}
        <div className="relative group max-w-sm">
          <Search
            size={14}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-violet-400 transition-colors"
          />
          <input
            type="text"
            placeholder="Search manga…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-3 rounded-2xl bg-white/[0.03] border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-violet-500/40 transition-all text-sm"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Tabs */}
        <nav className="flex gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-white/5">
          {TABS.map((tab) => {
            const count = counts[tab] ?? 0
            const isActive = activeTab === tab
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-violet-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                    : "bg-white/5 text-white/40 hover:bg-white/8 border border-white/5"
                }`}
              >
                {tab}
                {count > 0 && (
                  <span
                    className={`text-[8px] font-black ${
                      isActive ? "text-violet-200" : "text-white/20"
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-24 text-center border border-dashed border-white/5 rounded-[2rem]"
        >
          <BookOpen size={28} className="mx-auto mb-3 text-white/10" />
          <p className="text-white/20 font-black uppercase tracking-widest text-xs">
            {query ? `No manga matched "${query}"` : "Nothing in this category yet"}
          </p>
          {query && (
            <button
              onClick={() => setQuery("")}
              className="mt-4 text-xs text-violet-400 hover:text-violet-300 font-black uppercase tracking-widest"
            >
              Clear search
            </button>
          )}
        </motion.div>
      ) : (
        <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((manga, i) => (
              <MangaCard
                key={manga.id}
                manga={manga}
                index={i}
                onIncrement={handleIncrementChapter}
                onContinue={handleContinue}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  )
}

// ─── Manga card ───────────────────────────────────────────────────────────────

function MangaCard({
  manga,
  index,
  onIncrement,
  onContinue,
}: {
  manga: MangaEntry
  index: number
  onIncrement: (id: number) => void
  onContinue: (title: string) => void
}) {
  const pct =
    manga.totalChapters > 0
      ? Math.round((manga.progress / manga.totalChapters) * 100)
      : 0
  const isComplete = manga.status === "Completed"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: Math.min(index * 0.04, 0.5) }}
      className="group relative flex flex-col rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300"
    >
      {/* Cover */}
      <div
        className={`relative h-36 bg-gradient-to-br ${manga.coverGradient} flex items-center justify-center`}
      >
        <BookOpen size={32} className="text-white/10" />

        {/* Status badge */}
        <span
          className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider border ${STATUS_STYLE[manga.status]}`}
        >
          {manga.status}
        </span>

        {/* Category badge */}
        <span
          className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-wider border ${CATEGORY_STYLE[manga.category]}`}
        >
          {manga.category}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="min-h-0">
          <h3 className="text-sm font-black text-white uppercase italic tracking-tight leading-tight line-clamp-2">
            {manga.title}
          </h3>
          <p className="text-[10px] font-bold text-white/30 mt-0.5 truncate">
            {manga.author}
          </p>
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black text-white/25 uppercase tracking-widest">
              {manga.progress}/{manga.totalChapters} Ch.
            </span>
            <span className="text-[9px] font-black text-white/25 uppercase tracking-widest">
              {pct}%
            </span>
          </div>
          <div className="h-1 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
              className={`h-full rounded-full ${
                isComplete
                  ? "bg-amber-500"
                  : pct > 50
                  ? "bg-emerald-500"
                  : "bg-white/30"
              }`}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <button
            onClick={() => onContinue(manga.title)}
            className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest"
          >
            Continue <ChevronRight size={10} />
          </button>
          {!isComplete && (
            <button
              onClick={() => onIncrement(manga.id)}
              className="px-3 py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/40 text-violet-400 hover:text-violet-300 transition-all text-[9px] font-black uppercase tracking-widest border border-violet-600/20 whitespace-nowrap"
              title="Increment chapter"
            >
              +1 Ch
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
