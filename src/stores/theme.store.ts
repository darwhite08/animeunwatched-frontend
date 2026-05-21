import { create } from "zustand"
import { persist } from "zustand/middleware"

export type ThemeMode   = "dark" | "light" | "dim"
export type AccentColor = "amber" | "violet" | "emerald" | "rose" | "sky" | "orange"

const ACCENT_MAP: Record<AccentColor, { hex: string; name: string }> = {
  amber:   { hex: "#f59e0b", name: "Gold"     },
  violet:  { hex: "#8b5cf6", name: "Violet"   },
  emerald: { hex: "#10b981", name: "Emerald"  },
  rose:    { hex: "#f43f5e", name: "Rose"     },
  sky:     { hex: "#0ea5e9", name: "Sky"      },
  orange:  { hex: "#f97316", name: "Orange"   },
}

export { ACCENT_MAP }

type ThemeStore = {
  mode:   ThemeMode
  accent: AccentColor
  setMode:   (m: ThemeMode)   => void
  setAccent: (a: AccentColor) => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode:      "dark",
      accent:    "amber",
      setMode:   (mode)   => set({ mode }),
      setAccent: (accent) => set({ accent }),
    }),
    { name: "aw-theme" },
  ),
)
