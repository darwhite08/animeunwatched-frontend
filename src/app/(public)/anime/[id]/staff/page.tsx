"use client"

import { use } from "react"
import { notFound } from "next/navigation"
import { ANIME_DB } from "@/lib/data/anime"
import { motion } from "framer-motion"
import Link from "next/link"
import { Users2, ChevronLeft } from "lucide-react"

const ROLES = ["Director", "Series Composition", "Character Design", "Music", "Art Director", "Animation Director"]
const NAMES = ["Hiroyuki Imaishi", "Kazuhiro Furuhashi", "Yusuke Takeda", "Yoshihisa Hirano", "Shigeto Koyama", "Atsushi Nishigori"]

export default function AnimeStaffPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const anime = ANIME_DB.find(a => a.id === id)
  if (!anime) notFound()

  const seed = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0)
  const staff = ROLES.map((role, i) => ({
    role,
    name: NAMES[(seed + i) % NAMES.length],
    dept: ["Direction", "Script", "Art", "Sound", "Art", "Animation"][i],
  }))

  return (
    <div className="min-h-screen bg-[#020202] text-white pb-32">
      <div className="max-w-4xl mx-auto px-6 pt-32 space-y-8">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">
          <Link href={`/anime/${id}`} className="hover:text-white transition-colors">{anime.title}</Link>
          <span>·</span>
          <span className="text-white/60">Staff</span>
        </div>

        <div className="flex items-center gap-3">
          <Users2 size={18} className="text-indigo-400" />
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-white">
            Staff<span className="text-indigo-500">.</span>
          </h1>
        </div>

        {/* Studio card */}
        <div className="p-5 rounded-2xl bg-indigo-600/10 border border-indigo-500/20">
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400/60 mb-1">Production Studio</p>
          <p className="text-lg font-black text-white">{anime.studio}</p>
        </div>

        {/* Staff list */}
        <div className="space-y-3">
          {staff.map((s, i) => (
            <motion.div key={s.role} initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }} transition={{ delay: i*0.07 }}
              className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/8 hover:border-white/15 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600/30 to-violet-600/30 flex items-center justify-center font-black text-indigo-400 shrink-0">
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

        <Link href={`/anime/${id}`} className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors justify-center mt-6">
          <ChevronLeft size={14} /> Back to {anime.title}
        </Link>
      </div>
    </div>
  )
}
