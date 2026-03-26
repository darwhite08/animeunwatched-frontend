"use client"

import { motion } from "framer-motion"
import { Star, Play, Plus } from "lucide-react"
import Image from "next/image"

export default function AnimeCard({ anime, index }: { anime: any; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      className="group relative aspect-[2/3] w-full cursor-pointer"
    >
      {/* Outer Glow */}
      <div className="absolute -inset-1 bg-gradient-to-b from-indigo-500/20 to-purple-500/20 rounded-[2rem] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative h-full w-full bg-[#0a0a0a] rounded-[1.8rem] overflow-hidden border border-white/5">
        <Image
          src={anime.image || "https://images.unsplash.com/photo-1578632292335-df3abbb0d586?q=80&w=1000"}
          alt={anime.title}
          fill
          className="object-cover transition-all duration-700 scale-105 group-hover:scale-110 group-hover:rotate-1 brightness-[0.7] group-hover:brightness-50"
        />

        {/* HUD Elements */}
        <div className="absolute top-4 left-4 flex flex-col gap-2">
          <div className="px-2 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg text-[9px] font-black text-indigo-400 uppercase italic">
            #{index + 1}
          </div>
        </div>

        <div className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center bg-indigo-600 rounded-full opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
          <Plus size={16} className="text-white" />
        </div>

        {/* Bottom Metadata */}
        <div className="absolute inset-x-0 bottom-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
          <div className="flex items-center gap-2 mb-2">
            <Star size={12} fill="#6366f1" className="text-indigo-500" />
            <span className="text-xs font-black text-white">{anime.rating}</span>
            <div className="h-1 w-1 rounded-full bg-white/20" />
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-tighter">{anime.year || "2024"}</span>
          </div>
          
          <h3 className="text-lg font-black text-white uppercase italic tracking-tighter leading-none mb-4">
            {anime.title}
          </h3>

          <button className="w-full py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity delay-100 hover:bg-indigo-400">
            <Play size={12} fill="black" /> Access Archive
          </button>
        </div>
      </div>
    </motion.div>
  )
}