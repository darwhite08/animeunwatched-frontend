"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { AlertTriangle, RotateCcw, Home } from "lucide-react"
import Link from "next/link"

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-600/8 blur-[150px] rounded-full pointer-events-none" />

      <div className="relative z-10 text-center max-w-md space-y-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 mx-auto rounded-[2rem] bg-red-500/10 border border-red-500/20 flex items-center justify-center"
        >
          <AlertTriangle size={36} className="text-red-400" />
        </motion.div>

        <div className="space-y-3">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-black tracking-tighter uppercase italic text-foreground"
          >
            System Error<span className="text-red-500">.</span>
          </motion.h1>
          <p className="text-muted text-sm leading-relaxed">
            Something went wrong in the neural network. The error has been logged.
          </p>
          {error.digest && (
            <p className="text-[9px] font-mono text-subtle uppercase tracking-widest">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-3"
        >
          <button
            onClick={reset}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest text-black transition-all"
            style={{ background: "linear-gradient(135deg, var(--app-accent-bright), var(--app-accent))", boxShadow: "0 4px 16px color-mix(in srgb, var(--app-accent) 35%, transparent)" }}
          >
            <RotateCcw size={13} /> Try Again
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl border border-border bg-white/[0.04] text-xs font-black uppercase tracking-widest text-muted hover:text-foreground hover:bg-white/[0.08] transition-all"
          >
            <Home size={13} /> Go Home
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
