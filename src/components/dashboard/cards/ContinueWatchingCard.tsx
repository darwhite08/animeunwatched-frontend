"use client"

import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Play, ChevronRight, MonitorPlay } from "lucide-react"
import { useToast } from "@/stores/toast.store"
import { useAuthStore } from "@/stores/auth.store"
import { useUserList } from "@/hooks/useLists"
import { useMemo } from "react"

export default function ContinueWatchingCard() {
  const { push } = useToast()
  const user = useAuthStore(s => s.user)
  const { data: listData } = useUserList(user?.username ?? "", "WATCHING" as const)

  const items = useMemo(() => {
    return (listData?.data ?? []).slice(0, 3).map(entry => {
      const total = entry.anime?.episodes ?? 0
      const seen  = entry.episodesSeen
      const progress = total > 0 ? Math.min(100, Math.round((seen / total) * 100)) : 50
      return {
        id: entry.id,
        malId: String(entry.anime?.malId ?? ""),
        title: entry.anime?.title ?? "Unknown",
        ep: seen > 0 ? `Ep. ${seen}` : "Not started",
        next: seen > 0 ? `Ep. ${seen + 1}` : "Ep. 1",
        progress,
        image: entry.anime?.imageUrl ?? "",
      }
    })
  }, [listData])

  return (
    <div className="p-8 rounded-[2.5rem] border border-white/5 bg-[#0a0a0a] space-y-6 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/5 blur-[50px] rounded-full pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <MonitorPlay size={14} className="text-amber-400" />
          <h4 className="text-xs font-black uppercase tracking-[0.28em] text-white/30">Continue Watching</h4>
        </div>
        <Link href="/watchlist" className="text-[9px] font-black uppercase tracking-widest text-amber-400/60 hover:text-amber-400 transition-colors flex items-center gap-1">
          All <ChevronRight size={10} />
        </Link>
      </div>

      <div className="space-y-3 relative z-10">
        {items.length === 0 && (
          <div className="py-6 text-center">
            <MonitorPlay size={20} className="mx-auto mb-2 text-white/10" />
            <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">Nothing in progress</p>
            <Link href="/bestanimelist" className="mt-2 block text-[9px] text-amber-400 hover:text-amber-300 font-black uppercase tracking-widest">
              Browse Anime →
            </Link>
          </div>
        )}
        {items.map((item, i) => (
          <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
            className="group flex items-center gap-4 p-3 rounded-2xl hover:bg-white/[0.03] transition-colors cursor-pointer">
            <div className="relative h-14 w-10 rounded-xl overflow-hidden shrink-0 bg-white/5">
              {item.image && <Image src={item.image} alt={item.title} fill className="object-cover" sizes="40px" />}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Play size={14} fill="white" className="text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-black text-white/80 group-hover:text-white transition-colors truncate">{item.title}</p>
              <p className="text-[9px] text-white/30 uppercase tracking-widest mt-0.5">Up next: {item.next}</p>
              <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${item.progress}%` }} transition={{ duration: 0.8, delay: i * 0.1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full" />
              </div>
            </div>
            <button onClick={() => push(`Opening ${item.next}…`, "info")}
              className="shrink-0 w-9 h-9 rounded-xl bg-amber-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400 hover:bg-amber-600 hover:text-white hover:border-transparent transition-all opacity-0 group-hover:opacity-100">
              <Play size={13} fill="currentColor" />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
