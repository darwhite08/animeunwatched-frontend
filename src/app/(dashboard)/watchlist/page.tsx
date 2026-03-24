"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, MonitorPlay, Plus } from "lucide-react"
// Fixed import path based on your file structure
import { WatchCard } from "@/components/watchlist/WatchCard"

const WATCHLIST_DATA = [
  { id: 1, title: "Demon Slayer", ep: "S4 E02", progress: 82, platform: "Crunchyroll", status: "Watching", image: "/assets/png/tanjiro.png" },
  { id: 2, title: "One Piece", ep: "Ep. 1100", progress: 95, platform: "Netflix", status: "Watching", image: "/assets/png/luffy_sitting.png" },
  { id: 3, title: "Monster", ep: "Ep. 01", progress: 0, platform: "Prime", status: "Plan to Watch", image: "/assets/png/zoro_on_ponoglif.png" },
]

export default function WorldClassWatchlist() {
  const [query, setQuery] = useState("")
  const [activeTab, setActiveTab] = useState("All")

  const filtered = useMemo(() => {
    return WATCHLIST_DATA.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(query.toLowerCase())
      const matchesTab = activeTab === "All" || item.status === activeTab
      return matchesSearch && matchesTab
    })
  }, [query, activeTab])

  return (
    <div className="max-w-[1440px] mx-auto px-8 py-16 space-y-16 pb-40">
      
      {/* CINEMATIC HEADER */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12">
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-indigo-400 font-black uppercase tracking-[0.4em] text-[10px]"
          >
            <MonitorPlay size={14} /> Neural Transmission • Active
          </motion.div>
          <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-white leading-none">
            Archives<span className="text-indigo-500 shadow-indigo-500/50" style={{ textShadow: '0 0 20px rgba(99, 102, 241, 0.5)' }}>.</span>
          </h1>
        </div>

        <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
          <div className="relative group flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Query database..."
              className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/[0.03] border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-95 shadow-2xl">
            <Plus size={18} /> New Entry
          </button>
        </div>
      </header>

      {/* DYNAMIC FILTERS */}
      <nav className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide border-b border-white/5">
        {["All", "Watching", "Plan to Watch", "Completed"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === tab 
              ? "bg-indigo-600 text-white shadow-[0_0_30px_rgba(79,70,229,0.4)]" 
              : "bg-white/5 text-white/40 hover:bg-white/10 border border-white/5"
            }`}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* THE GRID: MICRO-INTERACTION READY */}
      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        <AnimatePresence mode="popLayout">
          {filtered.map((anime) => (
            <WatchCard key={anime.id} anime={anime} />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* EMPTY STATE */}
      {filtered.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-20 text-center border border-dashed border-white/10 rounded-[3rem]"
        >
          <p className="text-white/20 font-black uppercase tracking-widest text-xs">No records found in current frequency</p>
        </motion.div>
      )}
    </div>
  )
}