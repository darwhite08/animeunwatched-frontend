"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function PageLoader() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 2000)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="page-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: "easeOut" } }}
          style={{
            position: "fixed", inset: 0, zIndex: 99999,
            background: "radial-gradient(ellipse at center, #05050f 0%, #000 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 28 }}>

            {/* Outer gold ring — slow pulse */}
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.06, 0.18, 0.06] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                width: 130, height: 130, borderRadius: "50%",
                border: "1px solid rgba(245,158,11,0.5)",
              }}
            />
            {/* Inner gold ring — faster pulse, offset */}
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.25, 0.1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
              style={{
                position: "absolute",
                width: 96, height: 96, borderRadius: "50%",
                border: "1px solid rgba(245,158,11,0.35)",
              }}
            />

            {/* K mark logo */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{
                borderRadius: 22,
                boxShadow: "0 0 50px rgba(245,158,11,0.2), 0 0 20px rgba(245,158,11,0.1)",
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="76" height="76">
                <rect width="100" height="100" rx="22"
                  fill="url(#kLoaderBg)" />
                <defs>
                  <linearGradient id="kLoaderBg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#0D0F1E" />
                    <stop offset="100%" stopColor="#060810" />
                  </linearGradient>
                  <linearGradient id="kGold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>
                {/* K stroke draws in */}
                <motion.path
                  d="M 30 28 L 40 28 L 40 46 L 47 46 L 54 28 L 64 28 L 53 50 L 50 50 L 60 72 L 50 72 L 44 60 L 40 60 L 40 72 L 30 72 Z"
                  fill="none"
                  stroke="url(#kGold)"
                  strokeWidth={1.5}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: "easeInOut" }}
                />
                {/* K filled after stroke */}
                <motion.path
                  d="M 30 28 L 40 28 L 40 46 L 47 46 L 54 28 L 64 28 L 53 50 L 50 50 L 60 72 L 50 72 L 44 60 L 40 60 L 40 72 L 30 72 Z"
                  fill="url(#kGold)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 1.1 }}
                />
              </svg>
            </motion.div>

            {/* Wordmark */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}
            >
              <span style={{
                fontSize: 14, fontWeight: 900, letterSpacing: "0.45em",
                color: "rgba(255,255,255,0.85)", textTransform: "uppercase", fontStyle: "italic",
              }}>
                KAIVERON
              </span>
              {/* Gold underline */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.4, delay: 1.3 }}
                style={{
                  height: 1, width: 60,
                  background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.8), transparent)",
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
