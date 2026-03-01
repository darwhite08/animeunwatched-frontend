"use client"

import { motion } from "framer-motion"

export default function LeaderboardHeader() {
  return (
    <section className="relative flex h-[420px] items-center justify-center overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center"
      >
        <h1 className="bg-gradient-to-r from-white to-[#748298] bg-clip-text text-5xl font-bold text-transparent">
          Best Anime List
        </h1>
        <p className="mt-4 text-white/60">
          The top anime series to watch, ranked by the community.
        </p>
      </motion.div>
    </section>
  )
}