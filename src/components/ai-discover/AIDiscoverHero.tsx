"use client"

import { motion } from "framer-motion"

export default function AIDiscoverHero() {
  return (
    <section className="relative pt-32 pb-16 flex flex-col items-center justify-center overflow-hidden w-full bg-background">
      {/* Background glows */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[400px] blur-[140px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(ellipse, color-mix(in srgb, var(--app-accent) 8%, transparent) 0%, rgba(99,102,241,0.06) 50%, transparent 70%)" }} />
      <div className="absolute bottom-0 right-0 w-[400px] h-[300px] blur-[120px] rounded-full pointer-events-none"
        style={{ background: "rgba(139,92,246,0.05)" }} />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.4em]"
          style={{
            background: "color-mix(in srgb, var(--app-accent) 10%, transparent)",
            border: "1px solid color-mix(in srgb, var(--app-accent) 25%, transparent)",
            color: "var(--app-accent-bright)",
          }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "var(--app-accent-bright)" }} />
            <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "var(--app-accent)" }} />
          </span>
          Neural Engine v4.0
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="text-6xl md:text-8xl font-black tracking-tighter text-foreground leading-[0.9] mb-8"
        >
          Find Your Next{" "}
          <span className="italic" style={{
            backgroundImage: "linear-gradient(135deg, var(--app-accent-bright) 0%, var(--app-accent) 40%, var(--app-fg) 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
            Obsession.
          </span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="text-muted max-w-xl mx-auto text-lg font-medium leading-relaxed tracking-tight"
        >
          Describe what you're in the mood for — our AI searches 30,000+ anime to find your perfect match.
        </motion.p>

        {/* Feature chips */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-2 mt-8"
        >
          {["Mood-based search", "Genre matching", "Hidden gems", "Studio filtering", "Era selection"].map((chip, i) => (
            <span key={chip}
              className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-subtle"
              style={{ border: "1px solid color-mix(in srgb, var(--app-fg) 7%, transparent)", background: "color-mix(in srgb, var(--app-fg) 3%, transparent)" }}>
              {chip}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
