"use client"

import { motion } from "framer-motion"
import { ShieldCheck, ListFilter, Activity } from "lucide-react"

export default function BestAnimeListHeader() {
  return (
    <div className="relative pt-32 pb-12 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-indigo-400 font-black text-[10px] uppercase tracking-[0.4em]"
          >
            <ShieldCheck size={14} className="animate-pulse" /> 
            Verified Neural Rankings // v.4.0
          </motion.div>
          
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase italic leading-[0.8]">
            The <span className="text-transparent bg-clip-text bg-gradient-to-t from-indigo-500 to-white">Vault.</span>
          </h1>
          
          <p className="text-white/40 max-w-md font-medium text-lg leading-tight uppercase tracking-tighter">
            Curated archives of the greatest cinematic achievements in animation history.
          </p>
        </div>

        <div className="flex flex-col items-end gap-4">
           <div className="flex gap-8 mb-4">
            <div className="text-right">
              <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Global Synch</p>
              <p className="text-sm font-bold text-white font-mono">99.9%</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Active Nodes</p>
              <p className="text-sm font-bold text-white font-mono">1,242</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-12 h-px w-full bg-gradient-to-r from-indigo-500/50 via-white/10 to-transparent" />
    </div>
  )
}