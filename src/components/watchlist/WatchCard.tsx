// src/components/watchlist/WatchCard.tsx
import { motion } from "framer-motion"
import { ExternalLink, Play, MoreHorizontal, Layers, Star } from "lucide-react"
import Image from "next/image"

export const WatchCard = ({ anime }: { anime: any }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -10 }}
      className="group relative rounded-[3rem] border border-white/5 bg-[#080808] overflow-hidden flex flex-col h-full hover:border-indigo-500/40 transition-all duration-700 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.7)]"
    >
      {/* IMAGE CANVAS */}
      <div className="relative h-72 w-full overflow-hidden">
        <Image 
          src={anime.image} 
          alt={anime.title} 
          fill 
          className="object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:rotate-1 brightness-75 group-hover:brightness-100" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent opacity-90" />
        
        {/* TOP BADGES */}
        <div className="absolute top-6 inset-x-6 flex justify-between items-center z-20">
          <div className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 text-[9px] font-black uppercase tracking-widest text-indigo-400">
            {anime.status}
          </div>
          <div className="p-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-yellow-500">
            <Star size={14} fill="currentColor" />
          </div>
        </div>
      </div>

      {/* DATA AREA */}
      <div className="p-10 flex-1 flex flex-col justify-between space-y-10 relative">
        {/* Glow behind content */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

        <div className="space-y-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="text-3xl font-black text-white tracking-tighter leading-none group-hover:text-indigo-400 transition-colors">
                {anime.title}
              </h3>
              <p className="text-xs font-bold text-white/20 uppercase tracking-[0.2em] flex items-center gap-2">
                <Layers size={12} className="text-indigo-500/50" /> {anime.ep}
              </p>
            </div>
            <button className="text-white/10 hover:text-white transition-colors"><MoreHorizontal size={20} /></button>
          </div>

          {/* PROGRESS: OPTICAL FIDELITY */}
          <div className="space-y-3">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
              <span className="text-white/30 italic">Progress Sync</span>
              <span className="text-white font-black">{anime.progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-[2px]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${anime.progress}%` }}
                transition={{ duration: 1.5, ease: "circOut" }}
                className="h-full bg-gradient-to-r from-indigo-600 via-indigo-400 to-white/40 rounded-full shadow-[0_0_20px_rgba(79,70,229,0.6)]"
              />
            </div>
          </div>
        </div>

        {/* ACTION HUB: EXTERNAL LAUNCHERS */}
        <div className="flex gap-4">
          <button className="flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl bg-white/5 border border-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black hover:border-white transition-all duration-500">
            <ExternalLink size={14} /> Open {anime.platform}
          </button>
          <button className="h-12 w-12 flex items-center justify-center rounded-2xl bg-indigo-600/10 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all shadow-xl">
            <Play size={18} fill="currentColor" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}