"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Activity, Play, Star, Bookmark, MessageCircle, Trophy, Heart, Filter } from "lucide-react"
import Link from "next/link"

type EventType = "watch" | "rate" | "add" | "review" | "badge" | "like" | "follow"

type Event = {
  id: number; type: EventType; title: string
  detail: string; time: string; link: string
}

const EVENTS: Event[] = [
  { id:1,  type:"watch",  title:"Watched",        detail:"Demon Slayer S4 E03",           time:"2h ago",   link:"/watchlist"      },
  { id:2,  type:"rate",   title:"Rated 10/10",    detail:"Monster",                       time:"5h ago",   link:"/reviews"        },
  { id:3,  type:"badge",  title:"Badge Earned",   detail:"Fire Walker — 10-day streak",   time:"1d ago",   link:"/achievements"   },
  { id:4,  type:"add",    title:"Added to List",  detail:"Frieren: Beyond Journey's End", time:"1d ago",   link:"/watchlist"      },
  { id:5,  type:"review", title:"Wrote a Review", detail:"Attack on Titan — 9/10",        time:"2d ago",   link:"/reviews"        },
  { id:6,  type:"like",   title:"Liked a Post",   detail:"Otaku_Arch's theory post",      time:"2d ago",   link:"/community"      },
  { id:7,  type:"follow", title:"Followed",        detail:"@ShadowWatcher",               time:"3d ago",   link:"/following"      },
  { id:8,  type:"watch",  title:"Watched",        detail:"Jujutsu Kaisen S2 E14",         time:"3d ago",   link:"/watchlist"      },
  { id:9,  type:"rate",   title:"Rated 9/10",     detail:"Steins;Gate",                   time:"4d ago",   link:"/reviews"        },
  { id:10, type:"add",    title:"Added to List",  detail:"Cowboy Bebop",                  time:"5d ago",   link:"/watchlist"      },
  { id:11, type:"badge",  title:"Badge Earned",   detail:"Centurion — 100 anime archived",time:"1w ago",   link:"/achievements"   },
  { id:12, type:"review", title:"Wrote a Review", detail:"Fullmetal Alchemist: Brotherhood — 10/10", time:"1w ago", link:"/reviews" },
]

const TYPE_CONFIG: Record<EventType, { icon: typeof Activity; color: string; bg: string }> = {
  watch:  { icon: Play,          color:"text-emerald-400", bg:"bg-emerald-500/10" },
  rate:   { icon: Star,          color:"text-amber-400",   bg:"bg-amber-500/10"   },
  add:    { icon: Bookmark,      color:"text-indigo-400",  bg:"bg-indigo-500/10"  },
  review: { icon: MessageCircle, color:"text-blue-400",    bg:"bg-blue-500/10"    },
  badge:  { icon: Trophy,        color:"text-purple-400",  bg:"bg-purple-500/10"  },
  like:   { icon: Heart,         color:"text-rose-400",    bg:"bg-rose-500/10"    },
  follow: { icon: Activity,      color:"text-teal-400",    bg:"bg-teal-500/10"    },
}

const ALL_TYPES: EventType[] = ["watch","rate","add","review","badge","like","follow"]

export default function ActivityPage() {
  const [filter, setFilter] = useState<EventType | "all">("all")
  const filtered = filter==="all" ? EVENTS : EVENTS.filter(e => e.type === filter)

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 pb-32 space-y-8">
      <div>
        <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-indigo-400/60 mb-2">Your History</p>
        <h1 className="text-3xl font-black tracking-tighter uppercase italic text-white">
          Activity<span className="text-indigo-500">.</span>
        </h1>
        <p className="text-white/35 text-sm mt-1">{EVENTS.length} events tracked</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center">
        <Filter size={13} className="text-white/30" />
        <button onClick={() => setFilter("all")}
          className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${filter==="all"?"bg-indigo-600 text-white":"bg-white/5 text-white/40 border border-white/5"}`}
        >All</button>
        {ALL_TYPES.map(t => {
          const cfg = TYPE_CONFIG[t]
          return (
            <button key={t} onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                filter===t ? `${cfg.bg} ${cfg.color} border border-current/20` : "bg-white/5 text-white/40 border border-white/5"
              }`}
            >{t}</button>
          )
        })}
      </div>

      {/* Event list */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {filtered.map((ev, i) => {
            const cfg = TYPE_CONFIG[ev.type]
            const Icon = cfg.icon
            return (
              <motion.div key={ev.id} layout initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} transition={{ delay:i*0.03 }}>
                <Link href={ev.link} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-white/15 hover:bg-white/[0.04] transition-all group">
                  <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon size={15} className={cfg.color} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-white/80 group-hover:text-white transition-colors">{ev.title}</p>
                    <p className="text-[10px] text-white/35 truncate mt-0.5">{ev.detail}</p>
                  </div>
                  <span className="text-[9px] font-mono text-white/20 shrink-0">{ev.time}</span>
                </Link>
              </motion.div>
            )
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="py-12 text-center border border-dashed border-white/5 rounded-[2rem]">
            <p className="text-white/20 text-xs font-black uppercase tracking-widest">No {filter} events yet</p>
          </div>
        )}
      </div>
    </div>
  )
}
