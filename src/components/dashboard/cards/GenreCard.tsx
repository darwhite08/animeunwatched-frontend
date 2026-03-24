"use client"

import { motion } from "framer-motion"
import { Fingerprint } from "lucide-react"

export const GenreCard = () => {
  const genres = [
    { name: "Shonen", percent: 85, color: "from-indigo-600 to-blue-500" },
    { name: "Psychological", percent: 64, color: "from-purple-600 to-pink-500" },
    { name: "Seinen", percent: 42, color: "from-emerald-600 to-teal-500" },
    { name: "Fantasy", percent: 30, color: "from-orange-600 to-yellow-500" },
  ]

  return (
    <div className="p-10 rounded-[2.5rem] border border-white/5 bg-[#0a0a0a] h-full flex flex-col justify-between group">
      <div className="flex justify-between items-center mb-10">
        <h4 className="text-xs font-black uppercase tracking-[0.3em] text-white/30 italic">Anime DNA</h4>
        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:rotate-12 transition-transform">
          <Fingerprint size={20} />
        </div>
      </div>

      <div className="space-y-8">
        {genres.map((genre, i) => (
          <div key={genre.name} className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-[11px] font-black uppercase tracking-widest text-white/70">{genre.name}</span>
              <span className="text-[10px] font-medium text-white/20 italic">{genre.percent}% Saturation</span>
            </div>
            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[1px] border border-white/5">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: `${genre.percent}%` }}
                transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
                className={`h-full bg-gradient-to-r ${genre.color} rounded-full relative`}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse mix-blend-overlay" />
              </motion.div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}