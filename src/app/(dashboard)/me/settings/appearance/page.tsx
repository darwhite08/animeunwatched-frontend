"use client"

import { motion } from "framer-motion"
import { Palette } from "lucide-react"
import ThemePicker from "@/components/ui/ThemePicker"

export default function AppearancePage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12 space-y-8 pb-32">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-accent/70 mb-2">
          Settings · Appearance
        </p>
        <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic leading-none">
          Appearance
        </h1>
        <p className="text-xs text-subtle mt-2 flex items-center gap-2">
          <Palette size={11} className="text-accent" />
          Customize your display mode and accent colour.
        </p>
      </motion.div>

      {/* Theme picker */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-6 rounded-2xl bg-surface border border-border space-y-2"
      >
        <ThemePicker />
        <p className="text-[9px] text-subtle pt-2">
          Changes apply instantly and are saved to your browser.
        </p>
      </motion.div>
    </div>
  )
}
