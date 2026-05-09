"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { TrendingUp, Hash, ArrowRight } from "lucide-react"

const TRENDING = [
  { tag: "frieren",       posts: 842,  hot: true  },
  { tag: "chainsaw-man",  posts: 671,  hot: true  },
  { tag: "solo-leveling", posts: 1204, hot: true  },
  { tag: "power-scaling", posts: 388,  hot: false },
  { tag: "monster",       posts: 217,  hot: false },
  { tag: "emotional",     posts: 193,  hot: false },
  { tag: "hidden-gems",   posts: 156,  hot: false },
  { tag: "mappa",         posts: 144,  hot: false },
]

export default function TrendingWidget() {
  return (
    <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/8 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-indigo-400" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Trending</h3>
        </div>
        <Link href="/trending" className="text-[9px] font-black uppercase tracking-widest text-indigo-400/60 hover:text-indigo-400 transition-colors flex items-center gap-1">
          All <ArrowRight size={10} />
        </Link>
      </div>

      <div className="space-y-1">
        {TRENDING.map(({ tag, posts, hot }, i) => (
          <motion.button
            key={tag}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => {/* future: filter community by tag */}}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/5 transition-colors group"
          >
            <div className="flex items-center gap-2">
              <Hash size={11} className="text-white/20 group-hover:text-indigo-400 transition-colors" />
              <span className="text-sm font-bold text-white/60 group-hover:text-white transition-colors">
                {tag}
              </span>
              {hot && (
                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-orange-500/15 text-orange-400 font-black uppercase tracking-wider">
                  hot
                </span>
              )}
            </div>
            <span className="text-[9px] text-white/20 font-mono">{posts.toLocaleString()}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
