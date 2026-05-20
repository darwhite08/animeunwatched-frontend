"use client"

import { use } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Users2, ChevronLeft } from "lucide-react"
import { useBrowseAnime } from "@/hooks/useAnime"
import type { AnimeDTO } from "@/lib/api/types"
import type { Anime } from "@/lib/data/anime"

function mapDTO(a: AnimeDTO, i: number): Anime {
  return { id: String(a.malId), title: a.title, titleJapanese: a.titleJapanese ?? "", rating: a.score ?? 0, year: a.year ?? 0, episodes: a.episodes, type: (["TV","Movie","OVA"] as const).includes(a.type as any) ? a.type as any : "TV", status: a.status?.toLowerCase().includes("airing") ? "airing" : "finished", studio: a.studios[0] ?? "Unknown", genres: a.genres, synopsis: a.synopsis ?? "", image: a.imageUrl ?? "", tags: a.genres.map(g => g.toLowerCase().replace(/\s/g, "-")), category: "all", rank: i+1 }
}

const ROLES = ["Director", "Series Composition", "Character Design", "Music", "Art Director", "Animation Director"]
const NAMES = ["Hiroyuki Imaishi", "Kazuhiro Furuhashi", "Yusuke Takeda", "Yoshihisa Hirano", "Shigeto Koyama", "Atsushi Nishigori"]

export default function AnimeStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { data: browseData, isLoading } = useBrowseAnime({ limit: 1 })
  const anime = (browseData?.data ?? []).map(mapDTO)[0] ?? null

  const seed = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
  const staff = ROLES.map((role, i) => ({
    role,
    name: NAMES[(seed + i) % NAMES.length],
    dept: ["Direction", "Script", "Art", "Sound", "Art", "Animation"][i],
  }))

  if (isLoading) return <div className="min-h-screen bg-[#020202] text-white flex items-center justify-center text-white/30">Loading…</div>

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">
      <div className="max-w-4xl mx-auto px-6 pt-32 space-y-8">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">
          <Link href={`/anime/${id}`} className="hover:text-white transition-colors">{anime?.title ?? id}</Link>
          <span>·</span>
          <span className="text-white/60">Staff</span>
        </div>

        <div className="flex items-center gap-3">
          <Users2 size={18} className="text-amber-400" />
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-white">
            Staff<span style={{color:"#f59e0b"}}>.</span>
          </h1>
        </div>

        {/* Studio card */}
        <div className="p-5 rounded-2xl bg-indigo-600/10 border border-indigo-500/20">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-400/60 mb-1">Production Studio</p>
          <p className="text-lg font-black text-white">{anime?.studio ?? "Unknown"}</p>
        </div>

        {/* Staff list */}
        <div className="space-y-3">
          {staff.map((s, i) => (
            <motion.div key={s.role} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.07 }}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-white/15 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600/30 to-violet-600/30 flex items-center justify-center font-black text-amber-400 shrink-0">
                {s.name[0]}
              </div>
              <div className="flex-1">
                <p className="font-black text-white/80">{s.name}</p>
                <p className="text-[9px] text-white/30 uppercase tracking-wider">{s.dept}</p>
              </div>
              <span className="text-[10px] font-black text-white/40 bg-white/5 px-3 py-1 rounded-full border border-white/8">{s.role}</span>
            </motion.div>
          ))}
        </div>

        <Link href={`/anime/${id}`} className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-amber-400 hover:text-amber-300 transition-colors justify-center mt-6">
          <ChevronLeft size={14} /> Back to {anime?.title ?? id}
        </Link>
      </div>
    </div>
  )
}
