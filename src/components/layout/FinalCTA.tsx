"use client"

import { motion } from "framer-motion"
import { Zap, ArrowRight } from "lucide-react"

export default function FinalCTA() {
  return (
    <section className="py-40 px-8 relative overflow-hidden bg-black">
      {/* 1. THE "SUPER-GLOW" */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[400px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none" />
      
      <div className="max-w-4xl mx-auto text-center space-y-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="mx-auto w-20 h-20 rounded-[2rem] bg-indigo-600 flex items-center justify-center shadow-[0_0_50px_rgba(79,70,229,0.5)] mb-12"
        >
          <Zap size={40} className="text-white" fill="white" />
        </motion.div>

        <h2 className="text-7xl md:text-8xl font-black tracking-tighter text-white leading-[0.85] uppercase">
          Your Legend <br />
          <span className="italic text-indigo-500 text-glow-indigo">Starts Here.</span>
        </h2>

        <p className="text-white/40 text-xl font-medium max-w-xl mx-auto leading-relaxed">
          Stop losing track of your journey. Join the 12,000+ Shinobi already archiving their legacy.
        </p>

        <div className="pt-8">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative px-12 py-6 rounded-2xl bg-white text-black font-black text-sm uppercase tracking-[0.3em] overflow-hidden transition-all shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
          >
            <span className="relative z-10 flex items-center gap-3">
              Initialize Protocol <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
            </span>
            {/* Hover Shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </motion.button>
        </div>
      </div>
    </section>
  )
}