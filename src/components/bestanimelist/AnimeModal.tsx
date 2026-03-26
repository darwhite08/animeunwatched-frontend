"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Play, Plus, Share2, Star, Clock, Monitor } from "lucide-react"
import Image from "next/image"

interface AnimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  anime: any;
}

export default function AnimeModal({ isOpen, onClose, anime }: AnimeModalProps) {
  if (!anime) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-8">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-5xl bg-[#0a0a0a] rounded-[2.5rem] border border-white/10 overflow-hidden shadow-[0_0_100px_rgba(79,70,229,0.2)]"
          >
            <div className="grid lg:grid-cols-2">
              {/* Left: Visuals */}
              <div className="relative h-[300px] lg:h-[600px]">
                <Image
                  src={anime.image || "https://images.unsplash.com/photo-1578632292335-df3abbb0d586?q=80&w=1000"}
                  alt={anime.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#0a0a0a]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
              </div>

              {/* Right: Info */}
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <button 
                  onClick={onClose}
                  className="absolute top-8 right-8 p-2 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>

                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                      Neural Ranked #1
                    </span>
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star size={14} fill="currentColor" />
                      <span className="text-sm font-black">{anime.rating}</span>
                    </div>
                  </div>

                  <h2 className="text-5xl lg:text-6xl font-black text-white uppercase italic tracking-tighter leading-none">
                    {anime.title}
                  </h2>

                  <div className="flex flex-wrap gap-4 text-[10px] font-black text-white/40 uppercase tracking-widest">
                    <span className="flex items-center gap-2"><Clock size={12}/> 24 Episodes</span>
                    <span className="flex items-center gap-2"><Monitor size={12}/> TV Series</span>
                    <span className="text-indigo-500">Seinen</span>
                    <span>Studio MAPPA</span>
                  </div>

                  <p className="text-white/60 text-lg leading-relaxed font-medium line-clamp-4">
                    The world as we know it has collapsed. Amidst the ruins of Tokyo, 
                    humanity struggles against a new threat that defies the laws of physics. 
                    A cinematic masterpiece of psychological depth and visceral action.
                  </p>

                  <div className="flex flex-wrap gap-4 pt-8">
                    <button className="flex-1 min-w-[200px] py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-indigo-500 hover:text-white transition-all">
                      <Play size={18} fill="currentColor" /> Initialize Stream
                    </button>
                    <button className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all">
                      <Plus size={20} />
                    </button>
                    <button className="p-4 bg-white/5 border border-white/10 rounded-2xl text-white hover:bg-white/10 transition-all">
                      <Share2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}