"use client"

import { useState, useMemo, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, MonitorPlay, Plus, X, Share2, Loader2, LogIn } from "lucide-react"
import Link from "next/link"
import { WatchCard } from "@/components/watchlist/WatchCard"
import { useToast } from "@/stores/toast.store"
import ListShareCard from "@/components/social/ListShareCard"
import { useUserList } from "@/hooks/useLists"
import { useAuthStore } from "@/stores/auth.store"
import type { WatchStatus } from "@/lib/api/types"

const SHARE_KEY = "aw_share_dismissed"

const STATUS_MAP: Record<WatchStatus, string> = {
  PLAN_TO_WATCH: "Plan to Watch",
  WATCHING: "Watching",
  COMPLETED: "Completed",
  ON_HOLD: "On Hold",
  DROPPED: "Dropped",
}

const TABS = ["All", "Watching", "Plan to Watch", "Completed", "On Hold", "Dropped"]

type WatchItem = { id: string; title: string; ep: string; progress: number; platform: string; status: string; image: string }

export default function WatchlistPage() {
  const { push } = useToast()
  const user = useAuthStore(s => s.user)
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)

  const [query, setQuery] = useState("")
  const [tab, setTab] = useState("All")
  const [bannerVisible, setBannerVisible] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(SHARE_KEY)) setBannerVisible(true)
  }, [])

  const { data, isLoading, isError } = useUserList(user?.username ?? "", undefined)

  const items: WatchItem[] = useMemo(() => {
    if (!data?.data) return []
    return data.data.map(entry => {
      const anime = entry.anime
      const total = anime?.episodes ?? 0
      const seen = entry.episodesSeen
      const progress = entry.status === "COMPLETED" ? 100 : total > 0 ? Math.min(100, Math.round((seen / total) * 100)) : 0
      const ep = seen > 0 ? `Ep. ${seen}${total ? ` / ${total}` : ""}` : "Not started"
      return {
        id: entry.id,
        title: anime?.title ?? "Unknown Anime",
        ep,
        progress,
        platform: "",
        status: STATUS_MAP[entry.status],
        image: anime?.imageUrl ?? "/assets/png/tanjiro.png",
      }
    })
  }, [data])

  const filtered = useMemo(() =>
    items.filter(item => {
      const matchQ = item.title.toLowerCase().includes(query.toLowerCase())
      const matchTab = tab === "All" || item.status === tab
      return matchQ && matchTab
    }), [items, query, tab])

  const COUNTS = TABS.reduce((acc, t) => {
    acc[t] = t === "All" ? items.length : items.filter(i => i.status === t).length
    return acc
  }, {} as Record<string, number>)

  if (!isAuthenticated) {
    return (
      <div className="max-w-[1440px] mx-auto px-8 py-32 flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <MonitorPlay size={48} className="text-white/10" />
        <h2 className="text-3xl font-black text-white tracking-tighter">Your Archives Await</h2>
        <p className="text-white/40 text-sm max-w-xs text-center">Sign in to track your anime journey, manage your watchlist, and sync across devices.</p>
        <Link href="/login"
          className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm uppercase tracking-widest transition-all">
          <LogIn size={15} /> Sign In
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-[1440px] mx-auto px-8 py-12 pb-32 space-y-10">
      {/* Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div className="space-y-3">
          <motion.p initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-indigo-400 font-black uppercase tracking-[0.4em] text-[10px]">
            <MonitorPlay size={13} /> Neural Transmission • Active
          </motion.p>
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter text-white leading-none">
            Archives<span className="text-indigo-500">.</span>
          </h1>
          <p className="text-white/35 text-sm">{items.length} anime tracked</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          <div className="relative group flex-1 sm:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors" size={16} />
            <input type="text" placeholder="Search watchlist…"
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/40 transition-all text-sm"
              value={query} onChange={e => setQuery(e.target.value)} />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                <X size={14} />
              </button>
            )}
          </div>
          <button onClick={() => push("Use the Browse page to add anime to your list!", "info")}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-black font-black text-[11px] uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95">
            <Plus size={15} /> Add Anime
          </button>
        </div>
      </header>

      {/* Share banner */}
      <AnimatePresence>
        {bannerVisible && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="flex items-center justify-between gap-4 px-5 py-3.5 rounded-2xl bg-indigo-600/10 border border-indigo-500/25">
              <div className="flex items-center gap-3 min-w-0">
                <Share2 size={15} className="text-indigo-400 shrink-0" />
                <p className="text-sm font-bold text-white/80 truncate">Share your anime list and grow the community ↗</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => setShareModalOpen(true)}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-[11px] font-black uppercase tracking-widest text-white transition-all">
                  Share List
                </button>
                <button onClick={() => { localStorage.setItem(SHARE_KEY, "1"); setBannerVisible(false) }}
                  className="p-1.5 rounded-lg text-white/30 hover:text-white/70 transition-colors">
                  <X size={14} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share modal */}
      <AnimatePresence>
        {shareModalOpen && (
          <motion.div key="share-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setShareModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.80)", backdropFilter: "blur(8px)" }}>
            <motion.div initial={{ opacity: 0, scale: 0.93, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.93, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="relative w-full max-w-md bg-[#0a0a0a] border border-zinc-800 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-black uppercase text-base text-white tracking-tight">Share Your List</h2>
                  <p className="text-zinc-500 text-xs mt-0.5">Let the world see your taste</p>
                </div>
                <button onClick={() => setShareModalOpen(false)}
                  className="w-8 h-8 rounded-xl border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ListShareCard />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4">
            <Loader2 size={28} className="animate-spin text-indigo-400" />
            <p className="text-white/30 text-xs font-black uppercase tracking-widest">Loading your archives…</p>
          </div>
        </div>
      )}

      {/* Error */}
      {isError && !isLoading && (
        <div className="py-24 text-center">
          <p className="text-white/30 font-black uppercase tracking-widest text-xs">Failed to load watchlist</p>
        </div>
      )}

      {/* Content */}
      {!isLoading && !isError && (
        <>
          {/* Tabs */}
          <nav className="flex gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-white/5">
            {TABS.map(t => (
              (COUNTS[t] > 0 || t === "All") && (
                <button key={t} onClick={() => setTab(t)}
                  className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                    tab === t ? "bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)]" : "bg-white/5 text-white/40 hover:bg-white/8 border border-white/5"
                  }`}>
                  {t}
                  {COUNTS[t] > 0 && (
                    <span className={`text-[8px] font-black ${tab === t ? "text-indigo-200" : "text-white/20"}`}>{COUNTS[t]}</span>
                  )}
                </button>
              )
            ))}
          </nav>

          {/* Empty state */}
          {items.length === 0 && (
            <div className="py-24 text-center border border-dashed border-white/5 rounded-[3rem]">
              <MonitorPlay size={28} className="mx-auto mb-3 text-white/15" />
              <p className="text-white/20 font-black uppercase tracking-widest text-xs mb-4">Your archive is empty</p>
              <Link href="/bestanimelist"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-black uppercase tracking-widest">
                Browse Anime →
              </Link>
            </div>
          )}

          {/* Grid */}
          {filtered.length > 0 && (
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              <AnimatePresence mode="popLayout">
                {filtered.map(anime => (
                  <WatchCard key={anime.id} anime={anime} onRemove={() => push(`"${anime.title}" removed`, "info")} />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {filtered.length === 0 && items.length > 0 && (
            <div className="py-24 text-center border border-dashed border-white/5 rounded-[3rem]">
              <MonitorPlay size={28} className="mx-auto mb-3 text-white/15" />
              <p className="text-white/20 font-black uppercase tracking-widest text-xs">
                {query ? `No anime matched "${query}"` : "No anime in this category"}
              </p>
              {query && (
                <button onClick={() => setQuery("")} className="mt-4 text-xs text-indigo-400 hover:text-indigo-300 font-black uppercase tracking-widest transition-colors">
                  Clear search
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
