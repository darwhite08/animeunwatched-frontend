"use client"

import { useRef, useState, useCallback } from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"

interface TiltCardProps {
  children: React.ReactNode
  className?: string
  intensity?: number   // 1–20, default 8
  glare?: boolean
  scale?: number       // hover scale, default 1.02
}

export function TiltCard({
  children,
  className = "",
  intensity = 8,
  glare = true,
  scale = 1.02,
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [hovering, setHovering] = useState(false)

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const glareX = useMotionValue(50)
  const glareY = useMotionValue(50)

  const springConfig = { stiffness: 280, damping: 26, mass: 0.5 }
  const rotateX = useSpring(useTransform(rawY, [-1, 1], [intensity, -intensity]), springConfig)
  const rotateY = useSpring(useTransform(rawX, [-1, 1], [-intensity, intensity]), springConfig)

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    rawX.set(x)
    rawY.set(y)
    glareX.set(((e.clientX - rect.left) / rect.width) * 100)
    glareY.set(((e.clientY - rect.top) / rect.height) * 100)
  }, [rawX, rawY, glareX, glareY])

  const handleMouseLeave = useCallback(() => {
    rawX.set(0)
    rawY.set(0)
    setHovering(false)
  }, [rawX, rawY])

  const glareBackground = useTransform(
    [glareX, glareY],
    ([x, y]) =>
      `radial-gradient(circle at ${x}% ${y}%, color-mix(in srgb, var(--app-fg) 12%, transparent) 0%, transparent 65%)`
  )

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        scale: hovering ? scale : 1,
      }}
      transition={{ scale: { duration: 0.2 } }}
      className={`relative ${className}`}
    >
      {children}

      {/* Glare layer */}
      {glare && hovering && (
        <motion.div
          style={{ background: glareBackground }}
          className="absolute inset-0 rounded-[inherit] pointer-events-none z-10 mix-blend-plus-lighter"
        />
      )}
    </motion.div>
  )
}
