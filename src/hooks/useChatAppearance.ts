"use client"

import { useState, useEffect, useCallback } from "react"

/* ── Theme types ──────────────────────────────────────────────────────────── */

export interface BubbleTheme {
  id:       string
  name:     string
  sent:     string   // CSS background value for sent bubble
  sentShadow: string // box-shadow for sent bubble
  received: string   // CSS background for received bubble
  accent:   string   // hex for read receipts / timestamps
}

export interface BackgroundTheme {
  id:     string
  name:   string
  bg:     string   // CSS background for chat area
  doodle: "stars" | "sakura" | "swords" | "ramen" | "asanoha" | "manga" | "none"
  emoji:  string   // preview emoji
}

/* ── Bubble colour presets ────────────────────────────────────────────────── */
export const BUBBLE_THEMES: BubbleTheme[] = [
  {
    id: "indigo", name: "Indigo",
    sent: "linear-gradient(135deg,#5b5ef4 0%,#7060f0 100%)",
    sentShadow: "0 4px 18px rgba(91,94,244,0.28)",
    received: "rgba(26,26,40,0.92)",
    accent: "#818cf8",
  },
  {
    id: "violet", name: "Violet",
    sent: "linear-gradient(135deg,#7c3aed 0%,#a855f7 100%)",
    sentShadow: "0 4px 18px rgba(124,58,237,0.28)",
    received: "rgba(24,20,38,0.92)",
    accent: "#c084fc",
  },
  {
    id: "rose", name: "Rose",
    sent: "linear-gradient(135deg,#e11d48 0%,#f43f5e 100%)",
    sentShadow: "0 4px 18px rgba(225,29,72,0.28)",
    received: "rgba(32,18,22,0.92)",
    accent: "#fb7185",
  },
  {
    id: "emerald", name: "Emerald",
    sent: "linear-gradient(135deg,#059669 0%,#10b981 100%)",
    sentShadow: "0 4px 18px rgba(16,185,129,0.28)",
    received: "rgba(10,28,22,0.92)",
    accent: "#34d399",
  },
  {
    id: "amber", name: "Amber",
    sent: "linear-gradient(135deg,#d97706 0%,#f59e0b 100%)",
    sentShadow: "0 4px 18px rgba(217,119,6,0.28)",
    received: "rgba(28,22,8,0.92)",
    accent: "#fbbf24",
  },
  {
    id: "cyan", name: "Cyan",
    sent: "linear-gradient(135deg,#0891b2 0%,#06b6d4 100%)",
    sentShadow: "0 4px 18px rgba(8,145,178,0.28)",
    received: "rgba(5,22,30,0.92)",
    accent: "#22d3ee",
  },
  {
    id: "dark", name: "Dark",
    sent: "linear-gradient(135deg,#27272a 0%,#3f3f46 100%)",
    sentShadow: "0 4px 18px rgba(0,0,0,0.4)",
    received: "rgba(20,20,22,0.95)",
    accent: "#a1a1aa",
  },
]

/* ── Background presets ───────────────────────────────────────────────────── */
export const BG_THEMES: BackgroundTheme[] = [
  { id: "dark",    name: "Dark",        bg: "#0a0a10", doodle: "none",    emoji: "⬛" },
  { id: "stars",   name: "Anime Stars", bg: "#070710", doodle: "stars",   emoji: "✨" },
  { id: "sakura",  name: "Sakura",      bg: "#0d080f", doodle: "sakura",  emoji: "🌸" },
  { id: "swords",  name: "Katana",      bg: "#080810", doodle: "swords",  emoji: "⚔️" },
  { id: "ramen",   name: "Ramen",       bg: "#0a0906", doodle: "ramen",   emoji: "🍜" },
  { id: "asanoha", name: "Asanoha",     bg: "#060810", doodle: "asanoha", emoji: "🎌" },
  { id: "manga",   name: "Manga",       bg: "#08080a", doodle: "manga",   emoji: "💥" },
]

/* ── Stored appearance ────────────────────────────────────────────────────── */
export interface ChatAppearance {
  bubbleThemeId: string
  bgThemeId:     string
}

const STORAGE_KEY = "aw_chat_appearance"

const DEFAULT: ChatAppearance = { bubbleThemeId: "indigo", bgThemeId: "stars" }

export function useChatAppearance() {
  const [appearance, setAppearance] = useState<ChatAppearance>(DEFAULT)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setAppearance({ ...DEFAULT, ...JSON.parse(stored) })
    } catch { /* ignore */ }
  }, [])

  const update = useCallback((patch: Partial<ChatAppearance>) => {
    setAppearance(prev => {
      const next = { ...prev, ...patch }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }, [])

  const bubbleTheme = BUBBLE_THEMES.find(t => t.id === appearance.bubbleThemeId) ?? BUBBLE_THEMES[0]
  const bgTheme     = BG_THEMES.find(t => t.id === appearance.bgThemeId)         ?? BG_THEMES[0]

  return { appearance, update, bubbleTheme, bgTheme }
}
