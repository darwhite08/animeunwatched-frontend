"use client"
import { useEffect, useRef, memo } from "react"
import { motion, MotionValue, useTransform, useMotionValue } from "framer-motion"

function StarCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener("resize", resize)

    type Star = { x: number; y: number; r: number; a: number; da: number }
    const stars: Star[] = Array.from({ length: 220 }, () => ({
      x:  Math.random() * canvas.width,
      y:  Math.random() * canvas.height * 0.72,
      r:  Math.random() * 1.5 + 0.3,
      a:  Math.random(),
      da: (Math.random() - 0.5) * 0.008,
    }))

    let raf: number
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const s of stars) {
        s.a = Math.max(0.05, Math.min(1, s.a + s.da))
        if (s.a <= 0.05 || s.a >= 1) s.da *= -1
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(220,230,255,${s.a})`
        ctx.fill()
        if (s.r > 1.2) {
          ctx.beginPath()
          ctx.strokeStyle = `rgba(190,210,255,${s.a * 0.4})`
          ctx.lineWidth = 0.6
          ctx.moveTo(s.x - s.r * 3, s.y); ctx.lineTo(s.x + s.r * 3, s.y)
          ctx.moveTo(s.x, s.y - s.r * 3); ctx.lineTo(s.x, s.y + s.r * 3)
          ctx.stroke()
        }
      }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(raf) }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
}

function Moon({ mouseX, mouseY }: { mouseX: MotionValue<number>; mouseY: MotionValue<number> }) {
  const mx = useTransform(mouseX, v => v * -8)
  const my = useTransform(mouseY, v => v * -6)
  return (
    <motion.div className="absolute top-[8%] right-[18%] pointer-events-none" style={{ x: mx, y: my }}>
      <motion.div animate={{ scale: [1, 1.06, 1], opacity: [0.18, 0.28, 0.18] }} transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 -m-16 rounded-full bg-indigo-300/20 blur-[40px]" />
      <motion.div animate={{ scale: [1, 1.04, 1], opacity: [0.3, 0.45, 0.3] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute inset-0 -m-8 rounded-full bg-blue-200/25 blur-[20px]" />
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 shadow-[0_0_40px_rgba(148,163,255,0.5),0_0_80px_rgba(99,102,241,0.2)]" />
      <div className="absolute top-4 left-5 w-5 h-5 rounded-full bg-slate-200/30" />
      <div className="absolute top-8 right-4 w-3 h-3 rounded-full bg-slate-200/20" />
      <div className="absolute bottom-5 left-8 w-4 h-4 rounded-full bg-slate-200/25" />
    </motion.div>
  )
}

function Aurora({ mouseX }: { mouseX: MotionValue<number> }) {
  const ax = useTransform(mouseX, v => v * -12)
  return (
    <motion.div className="absolute top-0 left-0 right-0 h-[65%] pointer-events-none overflow-hidden" style={{ x: ax }}>
      <motion.div animate={{ scale: [1, 1.08, 1], opacity: [0.12, 0.2, 0.12], x: [0, 15, 0] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[5%] left-[-10%] w-[55%] h-[70%] rounded-full bg-purple-800/40 blur-[90px]" />
      <motion.div animate={{ scale: [1, 1.12, 1], opacity: [0.15, 0.25, 0.15], x: [0, -20, 0] }} transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        className="absolute top-[-10%] left-[25%] w-[50%] h-[80%] rounded-full bg-indigo-900/50 blur-[80px]" />
      <motion.div animate={{ scale: [1, 1.06, 1], opacity: [0.1, 0.18, 0.1], y: [0, 20, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 8 }}
        className="absolute top-[0%] right-[-5%] w-[40%] h-[60%] rounded-full bg-blue-900/40 blur-[100px]" />
      <motion.div animate={{ opacity: [0.04, 0.1, 0.04] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute top-[20%] left-[40%] w-[30%] h-[40%] rounded-full bg-pink-900/30 blur-[70px]" />
    </motion.div>
  )
}

const CLOUD_CFG = [
  { top: "8%",  dur: 120, delay: 0,  op: 0.12, scale: 1.6 },
  { top: "15%", dur: 90,  delay: 20, op: 0.08, scale: 1.0 },
  { top: "22%", dur: 150, delay: 40, op: 0.06, scale: 1.3 },
  { top: "5%",  dur: 200, delay: 60, op: 0.05, scale: 0.8 },
  { top: "28%", dur: 110, delay: 80, op: 0.07, scale: 1.1 },
]

function Cloud({ opacity = 0.1, scale = 1 }: { opacity?: number; scale?: number }) {
  return (
    <svg viewBox="0 0 300 100" style={{ transform: `scale(${scale})`, transformOrigin: "center", color: `rgba(148,163,184,${opacity})` }} className="fill-current">
      <path d="M280 70 Q290 50 270 40 Q260 15 230 20 Q220 5 195 10 Q175 0 155 12 Q130 5 115 20 Q90 18 80 35 Q60 30 50 50 Q30 45 20 60 Q10 72 25 80 L275 80 Q295 78 280 70 Z" />
    </svg>
  )
}

interface SkyLayerProps {
  mouseX?: MotionValue<number>
  mouseY?: MotionValue<number>
  scrollProgress?: MotionValue<number>
}

const SkyLayer = memo(function SkyLayer({ mouseX, mouseY, scrollProgress }: SkyLayerProps) {
  const fallbackMX = useMotionValue(0)
  const fallbackMY = useMotionValue(0)
  const fallbackSP = useMotionValue(0)
  const mx = mouseX ?? fallbackMX
  const my = mouseY ?? fallbackMY
  const sp = scrollProgress ?? fallbackSP
  const skyOpacity = useTransform(sp, [0, 0.4], [1, 0.6])

  return (
    <motion.div className="absolute inset-0 pointer-events-none" style={{ opacity: skyOpacity }}>
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--app-bg)] via-[var(--app-bg)] to-[var(--app-bg)]" />
      <div className="absolute bottom-[35%] left-0 right-0 h-[25%] bg-gradient-to-t from-[#0d1b3e]/60 to-transparent" />
      <Aurora mouseX={mx} />
      <StarCanvas />
      <Moon mouseX={mx} mouseY={my} />
      {CLOUD_CFG.map((c, i) => (
        <motion.div key={i} className="absolute pointer-events-none" style={{ top: c.top, left: "-20%" }}
          animate={{ x: ["0vw", "140vw"] }}
          transition={{ duration: c.dur, repeat: Infinity, ease: "linear", delay: c.delay }}>
          <Cloud opacity={c.op} scale={c.scale} />
        </motion.div>
      ))}
    </motion.div>
  )
})

export default SkyLayer
