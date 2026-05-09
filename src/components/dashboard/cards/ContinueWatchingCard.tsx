"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Play, ChevronRight, MonitorPlay } from "lucide-react"
import { useToast } from "@/stores/toast.store"

const IN_PROGRESS = [
  { id: "demon-slayer",  title: "Demon Slayer",     ep: "S4 E02", next: "S4 E03", progress: 82, image: "/assets/png/tanjiro.png",         platform: "Crunchyroll" },
  { id: "jjk",          title: "Jujutsu Kaisen",   ep: "S2 E13", next: "S2 E14", progress: 60, image: "/assets/png/zoro.png",             platform: "Crunchyroll" },
  { id: "frieren",      title: "Frieren",           ep: "Ep. 20", next: "Ep. 21", progress: 71, image: "/assets/png/naruto.png",           platform: "Prime"       },
]

export default function ContinueWatchingCard() {
  const { push } = useToast()

  return (
    <div className="p-8 rounded-[2.5rem] border border-white/5 bg-[#0a0a0a] space-y-6 relative overflow-hidden">
      {/* Glow */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/5 blur-[50px] rounded-full pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <MonitorPlay size={14} className="text-indigo-400" />
          <h4 className="text-xs font-black uppercase tracking-[0.28em] text-white/30">Continue Watching</h4>
        </div>
        <Link href="/watchlist" className="text-[9px] font-black uppercase tracking-widest text-indigo-400/60 hover:text-indigo-400 transition-colors flex items-center gap-1">
          All <ChevronRight size={10} />
        </Link>
      </div>

      <div className="space-y-3 relative z-10">
        {IN_PROGRESS.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-white/[0.03] transition-colors cursor-pointer"
          >
            {/* Thumb */}
            <div className="relative h-14 w-10 rounded-xl overflow-hidden shrink-0">
              <Image src={item.image} alt={item.title} fill className="object-cover" sizes="40px" />
              {/* Play overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play size={14} fill="white" className="text-white" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-white/80 group-hover:text-white transition-colors truncate">{item.title}</p>
              <p className="text-[9px] text-white/30 uppercase tracking-widest mt-0.5">Up next: {item.next}</p>
              {/* Progress bar */}
              <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${item.progress}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full"
                />
              </div>
            </div>

            {/* Play button */}
            <button
              onClick={() => push(`Opening ${item.next} on ${item.platform}…`, "info")}
              className="shrink-0 w-9 h-9 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 hover:bg-indigo-600 hover:text-white hover:border-transparent transition-all opacity-0 group-hover:opacity-100"
            >
              <Play size={13} fill="currentColor" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
