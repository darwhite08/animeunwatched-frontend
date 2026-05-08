"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, MonitorPlay, Plus, X } from "lucide-react"
import { WatchCard } from "@/components/watchlist/WatchCard"
import { useToast } from "@/stores/toast.store"

type WatchItem = {
  id: number; title: string; ep: string; progress: number
  platform: string; status: string; image: string
}

const INITIAL_WATCHLIST: WatchItem[] = [
  { id:1,  title:"Demon Slayer: Kimetsu no Yaiba", ep:"S4 E02",   progress:82, platform:"Crunchyroll", status:"Watching",       image:"/assets/png/tanjiro.png"            },
  { id:2,  title:"One Piece",                       ep:"Ep. 1100", progress:95, platform:"Netflix",     status:"Watching",       image:"/assets/png/luffy_sitting.png"       },
  { id:3,  title:"Monster",                          ep:"Ep. 01",  progress:0,  platform:"Prime",       status:"Plan to Watch",  image:"/assets/png/zoro_on_ponoglif.png"    },
  { id:4,  title:"Attack on Titan",                  ep:"S4 Final",progress:100,platform:"Crunchyroll", status:"Completed",      image:"/assets/png/tanjiro.png"             },
  { id:5,  title:"Jujutsu Kaisen",                   ep:"S2 E13",  progress:60, platform:"Crunchyroll", status:"Watching",       image:"/assets/png/zoro.png"                },
  { id:6,  title:"Frieren: Beyond Journey's End",    ep:"Ep. 20",  progress:71, platform:"Prime",       status:"Watching",       image:"/assets/png/naruto.png"              },
  { id:7,  title:"Fullmetal Alchemist: Brotherhood", ep:"Ep. 64",  progress:100,platform:"Netflix",     status:"Completed",      image:"/assets/png/goku.png"                },
  { id:8,  title:"Death Note",                       ep:"Ep. 01",  progress:0,  platform:"Netflix",     status:"Plan to Watch",  image:"/assets/png/luffy.png"               },
]

const TABS = ["All", "Watching", "Plan to Watch", "Completed", "On Hold", "Dropped"]

export default function WatchlistPage() {
  const { push } = useToast()
  const [items,  setItems]  = useState<WatchItem[]>(INITIAL_WATCHLIST)
  const [query,  setQuery]  = useState("")
  const [tab,    setTab]    = useState("All")

  const filtered = useMemo(() =>
    items.filter(item => {
      const matchQ   = item.title.toLowerCase().includes(query.toLowerCase())
      const matchTab = tab === "All" || item.status === tab
      return matchQ && matchTab
    })
  , [items, query, tab])

  const remove = (id: number) => setItems(prev => prev.filter(i => i.id !== id))

  const COUNTS = TABS.reduce((acc, t) => {
    acc[t] = t === "All" ? items.length : items.filter(i => i.status === t).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="max-w-[1440px] mx-auto px-8 py-12 pb-32 space-y-10">

      {/* Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
        <div className="space-y-3">
          <motion.p
            initial={{ opacity:0, x:-16 }}
            animate={{ opacity:1, x:0 }}
            className="flex items-center gap-2 text-indigo-400 font-black uppercase tracking-[0.4em] text-[10px]"
          >
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
            <input
              type="text"
              placeholder="Search watchlist…"
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl bg-white/[0.03] border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/40 transition-all text-sm"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors">
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => push("Add anime feature coming soon!", "info")}
            className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white text-black font-black text-[11px] uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95"
          >
            <Plus size={15} /> New Entry
          </button>
        </div>
      </header>

      {/* Tabs */}
      <nav className="flex gap-2 overflow-x-auto pb-2 no-scrollbar border-b border-white/5">
        {TABS.map(t => (
          COUNTS[t] > 0 || t === "All" ? (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                tab === t
                  ? "bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)]"
                  : "bg-white/5 text-white/40 hover:bg-white/8 border border-white/5"
              }`}
            >
              {t}
              {COUNTS[t] > 0 && (
                <span className={`text-[8px] font-black ${tab === t ? "text-indigo-200" : "text-white/20"}`}>
                  {COUNTS[t]}
                </span>
              )}
            </button>
          ) : null
        ))}
      </nav>

      {/* Grid */}
      {filtered.length > 0 ? (
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {filtered.map(anime => (
              <WatchCard key={anime.id} anime={anime} onRemove={remove} />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity:0 }}
          animate={{ opacity:1 }}
          className="py-24 text-center border border-dashed border-white/5 rounded-[3rem]"
        >
          <MonitorPlay size={28} className="mx-auto mb-3 text-white/15" />
          <p className="text-white/20 font-black uppercase tracking-widest text-xs">
            {query ? `No anime matched "${query}"` : "No anime in this category"}
          </p>
          {query && (
            <button onClick={() => setQuery("")} className="mt-4 text-xs text-indigo-400 hover:text-indigo-300 font-black uppercase tracking-widest transition-colors">
              Clear search
            </button>
          )}
        </motion.div>
      )}
    </div>
  )
}
