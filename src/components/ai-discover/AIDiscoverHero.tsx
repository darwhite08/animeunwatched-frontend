"use client"

import { motion } from "framer-motion"

export default function AIDiscoverHero() {
  return (
    <section className="relative py-24 px-4 border-b border-white/10 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-600/10 via-transparent to-transparent" />

      <div className="max-w-5xl mx-auto text-center relative">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-6xl font-bold tracking-tight"
        >
          AI Anime Finder
          <span className="block bg-gradient-to-r from-white to-[#748298] bg-clip-text text-transparent">
            Describe What You Feel
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 text-white/60 max-w-2xl mx-auto"
        >
          Tell us your mood. We'll match it with the perfect unwatched anime.
        </motion.p>
      </div>
    </section>
  )
}