"use client"

import { motion } from "framer-motion"
import Image from "next/image"

export default function AIDiscoverHero() {
  return (
    <section className="relative min-h-[90vh] flex flex-col items-center justify-center border-b border-white/5 overflow-hidden w-full bg-[#030303]">
      {/* Dynamic Background Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-40 text-center">
        
        {/* Futuristic Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.4em]"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          Neural Engine v4.0
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl md:text-8xl font-black tracking-tighter text-white leading-[0.9]"
        >
          Find Your Next <br />
          <span className="bg-gradient-to-b from-white via-white to-neutral-600 bg-clip-text text-transparent italic">Obsession.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-white/40 max-w-xl mx-auto text-lg font-medium leading-relaxed tracking-tight"
        >
          Our AI analyzes your emotional profile to bridge the gap between "what's next" and "must watch."
        </motion.p>

        {/* Floating characters */}
        <div className="relative mt-12 max-w-4xl mx-auto h-32">
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute -top-36 -right-20 hidden lg:block"
          >
            <Image
              src="/assets/png/luffy_sleeping_on_bench.png"
              alt="Luffy"
              width={220}
              height={220}
              className="rotate-12 drop-shadow-[0_20px_50px_rgba(99,102,241,0.2)] opacity-60 hover:opacity-100 transition-opacity"
            />
          </motion.div>
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
            className="absolute -top-24 -left-28 hidden lg:block"
          >
            <Image
              src="/assets/png/zoro_on_ponoglif.png"
              alt="Zoro"
              width={260}
              height={260}
              className="-rotate-6 drop-shadow-[0_20px_50px_rgba(34,197,94,0.15)] opacity-40 hover:opacity-100 transition-opacity"
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}