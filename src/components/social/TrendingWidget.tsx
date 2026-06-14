"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { TrendingUp, Hash, ArrowRight } from "lucide-react"
import { useDiscover } from "@/hooks/usePosts"
import { useMemo } from "react"

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
  const { data: postsData } = useDiscover()
  const posts = postsData?.pages[0]?.data ?? []

  // Build trending tags from real post anime titles
  const realTrending = useMemo(() => {
    const tagCount: Record<string, number> = {}
    for (const p of posts) {
      if (p.anime?.title) {
        const tag = p.anime.title.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").slice(0, 20)
        tagCount[tag] = (tagCount[tag] ?? 0) + 1
      }
    }
    const apiTags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([tag, count]) => ({ tag, posts: count * 15, hot: count >= 2 }))
    return apiTags.length > 0 ? apiTags : TRENDING
  }, [posts])
  return (
    <div className="p-5 rounded-2xl bg-surface border border-border space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-accent-bright" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">Trending</h3>
        </div>
        <Link href="/community/trending" className="text-[9px] font-black uppercase tracking-widest text-accent-bright/60 hover:text-white transition-colors flex items-center gap-1">
          All <ArrowRight size={10} />
        </Link>
      </div>

      <div className="space-y-1">
        {realTrending.map(({ tag, posts, hot }, i) => (
          <motion.button
            key={tag}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => {/* future: filter community by tag */}}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-surface transition-colors group"
          >
            <div className="flex items-center gap-2">
              <Hash size={11} className="text-subtle group-hover:text-white transition-colors" />
              <span className="text-sm font-bold text-muted group-hover:text-foreground transition-colors">
                {tag}
              </span>
              {hot && (
                <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-orange-500/15 text-orange-400 font-black uppercase tracking-wider">
                  hot
                </span>
              )}
            </div>
            <span className="text-[9px] text-subtle font-mono">{posts.toLocaleString()}</span>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
