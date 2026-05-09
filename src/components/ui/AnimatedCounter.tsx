"use client"

import { useEffect, useRef } from "react"
import { useMotionValue, animate } from "framer-motion"

export interface AnimatedCounterProps {
  value: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
}

/**
 * Returns a ref-backed span that animates its text content from 0 → value.
 * Uses framer-motion's animate() + useMotionValue for the count.
 */
export function AnimatedCounterText({
  value,
  duration = 2000,
  prefix = "",
  suffix = "",
  className,
}: AnimatedCounterProps) {
  const motionValue = useMotionValue(0)
  const spanRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: duration / 1000, // framer-motion uses seconds
      ease: "easeOut",
      onUpdate: (latest) => {
        if (spanRef.current) {
          spanRef.current.textContent =
            prefix + Math.round(latest).toLocaleString() + suffix
        }
      },
    })
    return () => controls.stop()
  }, [value, duration, prefix, suffix, motionValue])

  return (
    <span ref={spanRef} className={className}>
      {prefix}0{suffix}
    </span>
  )
}

/**
 * Standalone animated counter — renders just the formatted number string.
 * Counts from 0 → value over `duration` ms on mount.
 */
export default function AnimatedCounter({
  value,
  duration = 2000,
  prefix = "",
  suffix = "",
  className,
}: AnimatedCounterProps) {
  return (
    <AnimatedCounterText
      value={value}
      duration={duration}
      prefix={prefix}
      suffix={suffix}
      className={className}
    />
  )
}
