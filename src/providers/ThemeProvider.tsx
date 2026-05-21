"use client"

import { useEffect } from "react"
import { useThemeStore, ACCENT_MAP } from "@/stores/theme.store"

// CSS variable injection — all accent colours in the design reference var(--accent)
// Mode classes on <html> drive bg/text via Tailwind's dark: variants
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { mode, accent } = useThemeStore()

  useEffect(() => {
    const html = document.documentElement

    // ── Mode ────────────────────────────────────────────────────────────────
    html.classList.remove("theme-dark", "theme-light", "theme-dim")
    html.classList.add(`theme-${mode}`)

    // Background + text colour per mode
    const modeVars: Record<string, { bg: string; bgSecondary: string; text: string; textMuted: string; border: string }> = {
      dark:  { bg: "#020202", bgSecondary: "#0a0a0a", text: "#ffffff",   textMuted: "rgba(255,255,255,0.5)", border: "rgba(255,255,255,0.08)" },
      dim:   { bg: "#0d1117", bgSecondary: "#161b22", text: "#e6edf3",   textMuted: "rgba(230,237,243,0.5)", border: "rgba(230,237,243,0.1)"  },
      light: { bg: "#f8f9fa", bgSecondary: "#ffffff",  text: "#0d1117",   textMuted: "rgba(13,17,23,0.55)",   border: "rgba(0,0,0,0.08)"      },
    }

    const mv = modeVars[mode]
    html.style.setProperty("--bg",           mv.bg)
    html.style.setProperty("--bg-secondary",  mv.bgSecondary)
    html.style.setProperty("--text",          mv.text)
    html.style.setProperty("--text-muted",    mv.textMuted)
    html.style.setProperty("--border",        mv.border)

    // Apply background to body so pages don't flash white
    document.body.style.background = mv.bg
    document.body.style.color      = mv.text

    // ── Accent ──────────────────────────────────────────────────────────────
    const { hex } = ACCENT_MAP[accent]
    html.style.setProperty("--accent",        hex)
    html.style.setProperty("--accent-rgb",    hexToRgb(hex))
  }, [mode, accent])

  return <>{children}</>
}

function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r}, ${g}, ${b}`
}
