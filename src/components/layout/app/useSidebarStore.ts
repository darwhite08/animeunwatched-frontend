"use client"

import { create } from "zustand"

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
