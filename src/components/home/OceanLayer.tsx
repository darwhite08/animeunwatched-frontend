"use client"
import { motion, MotionValue, useTransform, useMotionValue } from "framer-motion"
import { memo } from "react"

const WAVE_BACK = "M0,60 C150,20 300,90 450,50 C600,10 750,80 900,45 C1050,10 1200,70 1350,40 C1500,10 1650,75 1800,50 L1800,200 L0,200 Z"
const WAVE_MID  = "M0,50 C120,80 240,30 360,60 C480,90 600,25 720,55 C840,85 960,20 1080,50 C1200,80 1320,30 1440,60 C1560,90 1680,35 1800,65 L1800,200 L0,200 Z"
const WAVE_FORE = "M0,40 C100,65 200,20 300,50 C400,80 500,15 600,45 C700,75 800,10 900,42 C1000,74 1100,18 1200,48 C1300,78 1400,22 1500,52 C1600,82 1700,30 1800,55 L1800,200 L0,200 Z"

interface OceanLayerProps {
  mouseX?: MotionValue<number>
  scrollProgress?: MotionValue<number>
}

const OceanLayer = memo(function OceanLayer({ mouseX }: OceanLayerProps) {
  const fallbackMX = useMotionValue(0)
  const mx = mouseX ?? fallbackMX
  const waterX = useTransform(mx, v => v * 6)

  return (
    <div className="absolute bottom-0 left-0 right-0 pointer-events-none" style={{ height: "48%" }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div animate={{ opacity: [0.08, 0.16, 0.08], scaleX: [1, 1.04, 1] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-1/2 -translate-x-1/2 w-24 bottom-0 bg-gradient-to-b from-blue-200/20 via-indigo-200/10 to-transparent blur-sm" />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-[var(--app-bg)] via-[#061428] to-transparent" />

      <motion.div className="absolute inset-0" style={{ x: waterX }}>
        <motion.svg viewBox="0 0 1800 200" preserveAspectRatio="none" className="absolute bottom-[52%] left-0 w-[200%] h-[30%]"
          animate={{ x: [0, -900] }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }}>
          <path d={WAVE_BACK} fill="rgba(10,30,60,0.7)" />
        </motion.svg>
        <motion.svg viewBox="0 0 1800 200" preserveAspectRatio="none" className="absolute bottom-[52%] left-[100%] w-[200%] h-[30%]"
          animate={{ x: [0, -900] }} transition={{ duration: 18, repeat: Infinity, ease: "linear" }}>
          <path d={WAVE_BACK} fill="rgba(10,30,60,0.7)" />
        </motion.svg>

        <div className="absolute bottom-0 top-[55%] left-0 right-0 bg-gradient-to-b from-[#0a1e3c]/90 to-[var(--app-bg)]" />

        <motion.svg viewBox="0 0 1800 200" preserveAspectRatio="none" className="absolute bottom-[35%] left-0 w-[200%] h-[28%]"
          animate={{ x: [0, -900] }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }}>
          <path d={WAVE_MID} fill="rgba(14,40,82,0.85)" />
        </motion.svg>
        <motion.svg viewBox="0 0 1800 200" preserveAspectRatio="none" className="absolute bottom-[35%] left-[100%] w-[200%] h-[28%]"
          animate={{ x: [0, -900] }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }}>
          <path d={WAVE_MID} fill="rgba(14,40,82,0.85)" />
        </motion.svg>

        <motion.svg viewBox="0 0 1800 200" preserveAspectRatio="none" className="absolute bottom-[18%] left-0 w-[200%] h-[26%]"
          animate={{ x: [0, -900] }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}>
          <path d={WAVE_FORE} fill="rgba(16,48,96,0.9)" />
        </motion.svg>
        <motion.svg viewBox="0 0 1800 200" preserveAspectRatio="none" className="absolute bottom-[18%] left-[100%] w-[200%] h-[26%]"
          animate={{ x: [0, -900] }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }}>
          <path d={WAVE_FORE} fill="rgba(16,48,96,0.9)" />
        </motion.svg>

        <motion.svg viewBox="0 0 1800 60" preserveAspectRatio="none" className="absolute bottom-[16%] left-0 w-[200%] h-[8%] opacity-20"
          animate={{ x: [0, -900] }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }}>
          <path d="M0,30 C80,15 160,45 240,25 C320,5 400,40 480,20 C560,0 640,35 720,18 C800,1 880,38 960,20 C1040,2 1120,36 1200,18 C1280,0 1360,34 1440,16 C1520,-2 1600,35 1800,15"
            fill="none" stroke="rgba(180,210,255,0.6)" strokeWidth="2" />
        </motion.svg>
        <motion.svg viewBox="0 0 1800 60" preserveAspectRatio="none" className="absolute bottom-[16%] left-[100%] w-[200%] h-[8%] opacity-20"
          animate={{ x: [0, -900] }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }}>
          <path d="M0,30 C80,15 160,45 240,25 C320,5 400,40 480,20 C560,0 640,35 720,18 C800,1 880,38 960,20 C1040,2 1120,36 1200,18 C1280,0 1360,34 1440,16 C1520,-2 1600,35 1800,15"
            fill="none" stroke="rgba(180,210,255,0.6)" strokeWidth="2" />
        </motion.svg>
      </motion.div>

      <div className="absolute bottom-[14%] top-0 left-0 right-0 bg-gradient-to-t from-[#0a1529]/60 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-[18%] bg-gradient-to-t from-[var(--app-bg)] to-[#0a1e3c]/80" />

      {Array.from({ length: 10 }).map((_, i) => (
        <motion.div key={i}
          className="absolute w-1 h-1 rounded-full bg-blue-200/40"
          style={{ bottom: `${20 + (i * 3.1) % 25}%`, left: `${(i * 11.3) % 95}%` }}
          animate={{ opacity: [0, 0.6, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 2 + (i % 3), repeat: Infinity, ease: "easeInOut", delay: i * 0.6 }}
        />
      ))}
    </div>
  )
})

export default OceanLayer
