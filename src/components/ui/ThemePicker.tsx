"use client"

import { motion } from "framer-motion"
import { Moon, Sun, CloudMoon } from "@phosphor-icons/react"
import { useThemeStore, ACCENT_MAP, type AccentColor, type ThemeMode } from "@/stores/theme.store"

const MODES: { id: ThemeMode; label: string; icon: typeof Moon; desc: string }[] = [
  { id: "dark",  label: "Dark",  icon: Moon,   desc: "Pure black — easy on eyes" },
  { id: "dim",   label: "Dim",   icon: CloudMoon, desc: "GitHub-style dark grey" },
  { id: "light", label: "Light", icon: Sun,    desc: "White background mode"     },
]

export default function ThemePicker() {
  const { mode, accent, setMode, setAccent } = useThemeStore()

  return (
    <div className="space-y-6">
      {/* ── Mode ── */}
      <div className="space-y-3">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-subtle">Display Mode</p>
        <div className="grid grid-cols-3 gap-3">
          {MODES.map(({ id, label, icon: Icon, desc }) => {
            const active = mode === id
            return (
              <button
                key={id}
                onClick={() => setMode(id)}
                className={`relative p-4 rounded-2xl border text-left transition-all space-y-2 ${
                  active
                    ? "border-accent/60 bg-accent-soft"
                    : "border-border bg-surface hover:border-border-hover"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="theme-mode-active"
                    className="absolute inset-0 rounded-2xl border-2 border-accent"
                  />
                )}
                <Icon size={18} weight="bold" className={active ? "text-accent" : "text-muted"} />
                <p className={`text-xs font-black ${active ? "text-accent-bright" : "text-foreground/70"}`}>{label}</p>
                <p className="text-[9px] text-subtle leading-tight">{desc}</p>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Accent colour ── */}
      <div className="space-y-3">
        <p className="text-[9px] font-black uppercase tracking-[0.3em] text-subtle">Accent Colour</p>
        <div className="flex flex-wrap gap-3">
          {(Object.entries(ACCENT_MAP) as [AccentColor, { hex: string; name: string }][]).map(([id, { hex, name }]) => {
            const active = accent === id
            return (
              <button
                key={id}
                onClick={() => setAccent(id)}
                title={name}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                  active ? "" : "border-border bg-surface"
                }`}
                style={
                  active
                    ? { borderColor: hex, background: `${hex}15` }
                    : undefined
                }
              >
                <span
                  className="h-4 w-4 rounded-full shrink-0"
                  style={{ background: hex, boxShadow: active ? `0 0 8px ${hex}80` : "none" }}
                />
                <span
                  className={`text-[10px] font-black uppercase tracking-widest ${active ? "" : "text-muted"}`}
                  style={active ? { color: hex } : undefined}
                >
                  {name}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
