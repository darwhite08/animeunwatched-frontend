"use client"

import { motion } from "framer-motion"
import { Star, Zap } from "lucide-react"

export default function AIResultsGrid() {
  const cards = [1, 2, 3, 4, 5, 6]

  return (
    <section className="py-24 bg-[#030303] px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-16">
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter">
            Neural Matches<span className="text-indigo-600">.</span>
          </h2>
          <div className="h-px flex-1 mx-8 bg-white/10 hidden md:block" />
          <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">
            Results Processed: 0.0042s
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {cards.map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{ y: -10 }}
              className="group relative aspect-[16/10] bg-white/5 rounded-[2rem] border border-white/5 overflow-hidden p-1"
            >
              {/* Internal Glow on Hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative h-full w-full rounded-[1.8rem] overflow-hidden flex flex-col justify-end p-6">
                <img 
                  src="https://images.unsplash.com/photo-1578632292335-df3abbb0d586?q=80&w=1000&auto=format&fit=crop" 
                  className="absolute inset-0 w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700 brightness-50 group-hover:brightness-75"
                />
                
                {/* Scanner Line Animation */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-indigo-500/40 shadow-[0_0_15px_rgba(99,102,241,0.5)] animate-[scanner_4s_ease-in-out_infinite]" />

                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-white uppercase italic leading-none">Cyberpunk Edgerunners</h3>
                    <p className="text-[10px] font-bold text-indigo-400 mt-2 tracking-widest uppercase">98% Synch Rate</p>
                  </div>
                  <div className="flex flex-col items-center gap-1 bg-black/40 backdrop-blur-md p-2 rounded-xl border border-white/10">
                    <Star size={14} fill="#6366f1" className="text-indigo-500" />
                    <span className="text-[10px] font-black text-white">8.6</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}