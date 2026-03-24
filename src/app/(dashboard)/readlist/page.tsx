"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Filter, BookOpen, Clock, CheckCircle2 } from "lucide-react"
import { ReadCard } from "@/components/readlist/ReadCard"

// Mock Data - In a real app, this would come from your DB
const INITIAL_READLIST = [
  { id: 1, title: "Berserk", author: "Kentaro Miura", status: "Reading", progress: 85, image: "/assets/png/berserk-cover.png", category: "Seinen" },
  { id: 2, title: "Vagabond", author: "Takehiko Inoue", status: "Completed", progress: 100, image: "/assets/png/vagabond-cover.png", category: "Seinen" },
  { id: 3, title: "Monster", author: "Naoki Urasawa", status: "Plan to Read", progress: 0, image: "/assets/png/monster-cover.png", category: "Psychological" },
]

export default function ReadlistPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("All")

  const filteredList = useMemo(() => {
    return INITIAL_READLIST.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesTab = activeTab === "All" || item.status === activeTab
      return matchesSearch && matchesTab
    })
  }, [searchQuery, activeTab])

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10 pb-32">
      {/* HEADER & SEARCH BAR */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div className="space-y-2">
          <h1 className="text-6xl font-black tracking-tighter text-white">
            Library<span className="text-indigo-500">.</span>
          </h1>
          <p className="text-white/40 text-lg font-medium tracking-wide italic">Your sanctuary for legendary stories.</p>
        </div>

        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Search your archives..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/[0.03] border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-indigo-500/50 focus:bg-white/[0.05] transition-all"
          />
        </div>
      </header>

      {/* TABS / FILTERS */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {["All", "Reading", "Completed", "Plan to Read"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
              activeTab === tab 
              ? "bg-indigo-600 text-white shadow-[0_0_20px_rgba(79,70,229,0.3)]" 
              : "bg-white/5 text-white/40 hover:bg-white/10"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* THE GRID */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredList.map((manga) => (
            <ReadCard key={manga.id} manga={manga} />
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}