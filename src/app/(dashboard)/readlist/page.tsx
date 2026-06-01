"use client"

import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search } from "lucide-react"
import { ReadCard } from "@/components/readlist/ReadCard"

// Enhanced Mock Data with your actual asset paths
const INITIAL_READLIST = [
  { id: 1, title: "Berserk",                 author: "Kentaro Miura",      status: "Reading",       progress: 85,  image: "/assets/png/zoro_on_ponoglif.png",   category: "Seinen"        },
  { id: 2, title: "Vagabond",                author: "Takehiko Inoue",     status: "Completed",     progress: 100, image: "/assets/png/luffy_sitting.png",      category: "Seinen"        },
  { id: 3, title: "Monster",                 author: "Naoki Urasawa",      status: "Plan to Read",  progress: 0,   image: "/assets/png/zoro.png",               category: "Psychological" },
  { id: 4, title: "Attack on Titan",         author: "Hajime Isayama",     status: "Completed",     progress: 100, image: "/assets/png/tanjiro.png",            category: "Shonen"        },
  { id: 5, title: "Fullmetal Alchemist",     author: "Hiromu Arakawa",     status: "Reading",       progress: 62,  image: "/assets/png/goku.png",               category: "Shonen"        },
  { id: 6, title: "Chainsaw Man",            author: "Tatsuki Fujimoto",   status: "Reading",       progress: 48,  image: "/assets/png/naruto.png",             category: "Seinen"        },
  { id: 7, title: "Vinland Saga",            author: "Makoto Yukimura",    status: "Plan to Read",  progress: 0,   image: "/assets/png/luffy.png",              category: "Historical"    },
  { id: 8, title: "20th Century Boys",       author: "Naoki Urasawa",      status: "Plan to Read",  progress: 0,   image: "/assets/png/rengoku_with_sword.png", category: "Thriller"      },
]

export default function ReadlistPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("All")

  const filteredList = useMemo(() => {
    return INITIAL_READLIST.filter((item) => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           item.author.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesTab = activeTab === "All" || item.status === activeTab
      return matchesSearch && matchesTab
    })
  }, [searchQuery, activeTab])

  return (
    <div className="max-w-[1440px] mx-auto px-8 py-16 space-y-16 pb-40">
      {/* HEADER & SEARCH BAR */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12">
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-accent-bright font-black uppercase tracking-[0.4em] text-[10px]"
          >
            Archives Repository • Sync Active
          </motion.div>
          <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-foreground leading-none">
            Library<span className="text-accent" style={{ textShadow: '0 0 25px rgba(99, 102, 241, 0.8)' }}>.</span>
          </h1>
        </div>

        <div className="relative w-full lg:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-subtle group-focus-within:text-accent-bright transition-colors" size={20} />
          <input 
            type="text"
            placeholder="Search your chronicles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-4 rounded-2xl bg-surface border border-border text-foreground placeholder:text-subtle focus:outline-none focus:border-accent/50 focus:bg-surface transition-all"
          />
        </div>
      </header>

      {/* TABS / FILTERS */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide border-b border-border">
        {["All", "Reading", "Completed", "Plan to Read"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
              activeTab === tab 
              ? "bg-accent text-black shadow-[0_0_30px_color-mix(in srgb, var(--app-accent) 40%, transparent)]" 
              : "bg-surface text-muted hover:bg-surface border border-border"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* THE GRID */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        <AnimatePresence mode="popLayout">
          {filteredList.map((manga) => (
            <ReadCard key={manga.id} manga={manga} />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* EMPTY STATE */}
      {filteredList.length === 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-32 text-center border border-dashed border-border rounded-[3rem] bg-white/[0.01]"
        >
          <p className="text-subtle font-black uppercase tracking-[0.3em] text-xs italic">
            No entries matching your query found in library.
          </p>
        </motion.div>
      )}
    </div>
  )
}