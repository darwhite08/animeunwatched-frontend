"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

export default function PageLoader() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // Hide after animation completes
    const t = setTimeout(() => setVisible(false), 1800)
    return () => clearTimeout(t)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="page-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.4, ease: "easeOut" } }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "#000",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* K mark — draws itself then pulses */}
          <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>

            {/* Outer white ring pulse */}
            <motion.div
              animate={{ scale: [1, 1.35, 1], opacity: [0.08, 0.18, 0.08] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{
                position: "absolute",
                width: 120,
                height: 120,
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.4)",
              }}
            />

            {/* K mark logo — scale in */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{
                boxShadow: "0 0 40px rgba(255,255,255,0.12)",
                borderRadius: 22,
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="72" height="72">
                <rect width="100" height="100" rx="22" fill="#0A0F1E" />
                {/* K path draws in via strokeDashoffset trick */}
                <motion.path
                  d="M 30 28 L 40 28 L 40 46 L 47 46 L 54 28 L 64 28 L 53 50 L 50 50 L 60 72 L 50 72 L 44 60 L 40 60 L 40 72 L 30 72 Z"
                  fill="none"
                  stroke="#F4F2EC"
                  strokeWidth={2}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 0.7, delay: 0.3, ease: "easeInOut" }}
                />
                {/* Filled K fades in after stroke */}
                <motion.path
                  d="M 30 28 L 40 28 L 40 46 L 47 46 L 54 28 L 64 28 L 53 50 L 50 50 L 60 72 L 50 72 L 44 60 L 40 60 L 40 72 L 30 72 Z"
                  fill="#F4F2EC"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: 1.0 }}
                />
              </svg>
            </motion.div>

            {/* Wordmark fades in below */}
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.9 }}
              style={{
                fontSize: 13,
                fontWeight: 900,
                letterSpacing: "0.35em",
                color: "rgba(255,255,255,0.55)",
                textTransform: "uppercase",
                fontStyle: "italic",
              }}
            >
              KAIVERON
            </motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
