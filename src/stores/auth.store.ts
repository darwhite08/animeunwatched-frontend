import { create } from "zustand"
import type { User } from "@/lib/api/types"

type AuthStore = {
  accessToken: string | null
  user: User | null
  setAccess: (token: string) => void
  setUser: (user: User) => void
  clear: () => void
  isAuthenticated: boolean
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  setAccess: (token) => set({ accessToken: token, isAuthenticated: true }),
  setUser: (user) => set({ user }),
  clear: () => set({ accessToken: null, user: null, isAuthenticated: false }),
}))
