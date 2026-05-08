import { create } from "zustand"
import type { Anime } from "@/lib/data/anime"

type WatchlistStore = {
  items: Anime[]
  count: number
  add: (anime: Anime) => void
  remove: (id: string) => void
  has: (id: string) => boolean
}

export const useWatchlist = create<WatchlistStore>((set, get) => ({
  items: [],
  count: 0,
  add: (anime) => {
    if (get().has(anime.id)) return
    set((state) => ({ items: [...state.items, anime], count: state.count + 1 }))
  },
  remove: (id) => {
    set((state) => ({
      items: state.items.filter((a) => a.id !== id),
      count: Math.max(0, state.count - 1),
    }))
  },
  has: (id) => get().items.some((a) => a.id === id),
}))
