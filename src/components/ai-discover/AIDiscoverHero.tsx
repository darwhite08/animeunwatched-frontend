"use client"

import { motion } from "framer-motion"
import AIPromptInput from "@/components/ai-discover/AIPromptInput"

export default function AIDiscoverHero() {
  return (
    <section className="relative border-b border-white/10 overflow-hidden w-full ">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-600/10 via-transparent to-transparent pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 py-28 text-center">
        
        {/* Heading */}
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

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mt-6 text-white/60 max-w-2xl mx-auto text-lg"
        >
          Tell us your mood. We’ll match it with the perfect unwatched anime.
        </motion.p>

        {/* AI Input Component */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="-mt-32 max-w-4xl mx-auto"
        >
          <div className="static">
            <img className="h-72 relative top-12 rotate-9 right-[-450px]" src="assets/png/luffy_sleeping_on_bench.png" alt="" />
            <AIPromptInput />
          </div>
        </motion.div>

        {/* Footer Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-xs text-white/40"
        >
          By using AI Discover, you agree to our{" "}
          <span className="underline cursor-pointer hover:text-white transition">
            Terms
          </span>{" "}
          &{" "}
          <span className="underline cursor-pointer hover:text-white transition">
            Privacy Policy
          </span>
          .
        </motion.p>
      </div>

    </section>
  )
}