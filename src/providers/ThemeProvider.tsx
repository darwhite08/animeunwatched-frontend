"use client"

import { useEffect } from "react"
import { useThemeStore } from "@/stores/theme.store"

/**
 * Drives the visual theme by toggling two classes on <html>:
 *
 *   `.theme-{dark|dim|light}`     — flips background / surface / foreground
 *   `.accent-{amber|violet|...}`  — flips --color-accent and friends
 *
 * The actual CSS variable values live in globals.css under those class
 * selectors. Components consume them via Tailwind utilities like
 * `bg-background`, `text-foreground`, `text-accent`, etc.
 *
 * This file used to set CSS variables directly + override body styles;
 * that approach silently did nothing because the design system never
 * referenced those variables.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { mode, accent } = useThemeStore()

  useEffect(() => {
    const html = document.documentElement

    html.classList.remove("theme-dark", "theme-dim", "theme-light")
    html.classList.add(`theme-${mode}`)

    html.classList.remove(
      "accent-amber", "accent-violet", "accent-emerald",
      "accent-rose",  "accent-sky",    "accent-orange",
    )
    html.classList.add(`accent-${accent}`)
  }, [mode, accent])

  return <>{children}</>
}
