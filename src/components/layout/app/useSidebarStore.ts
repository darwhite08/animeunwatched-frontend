"use client"

import { create } from "zustand"
import { useEffect, useState } from "react"

interface SidebarState {
  collapsed: boolean
  mobileDrawerOpen: boolean
  toggle: () => void
  setCollapsed: (v: boolean) => void
  setMobileDrawer: (v: boolean) => void
}

const KEY = "kaiveron_sidebar_collapsed"
const initial = typeof window !== "undefined" && localStorage.getItem(KEY) === "1"

/** Sidebar expand/collapse, persisted to localStorage for the session. */
export const useSidebarStore = create<SidebarState>((set) => ({
  collapsed: initial,
  mobileDrawerOpen: false,
  toggle: () =>
    set((s) => {
      const next = !s.collapsed
      if (typeof window !== "undefined") localStorage.setItem(KEY, next ? "1" : "0")
      return { collapsed: next }
    }),
  setCollapsed: (v) => {
    if (typeof window !== "undefined") localStorage.setItem(KEY, v ? "1" : "0")
    set({ collapsed: v })
  },
  setMobileDrawer: (v) => set({ mobileDrawerOpen: v }),
}))

/**
 * Effective collapsed state: the user's preference OR auto-collapsed below `xl`
 * (1280px). The expanded 240px rail + feed + the right rail need ~1280px to sit
 * comfortably, so the left rail strips to icons as the layout starts to get
 * cramped — before the feed is squeezed — rather than only once the right rail
 * has already dropped at 1024. Above xl, the user's toggle wins.
 */
export function useEffectiveCollapsed(): boolean {
  const userCollapsed = useSidebarStore((s) => s.collapsed)
  const [narrow, setNarrow] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1279px)")
    setNarrow(mq.matches)
    const on = () => setNarrow(mq.matches)
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [])
  return userCollapsed || narrow
}
