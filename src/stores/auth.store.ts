import { create } from "zustand"
import type { User } from "@/lib/api/types"

type AuthStore = {
  accessToken: string | null
  user: User | null
  isAuthenticated: boolean
  /**
   * True once SessionProvider has finished its bootstrap
   * (either successfully authenticated or confirmed unauthenticated).
   * Use this instead of isAuthenticated to avoid acting on incomplete state.
   */
  sessionReady: boolean
  setAccess: (token: string) => void
  setUser:   (user: User)   => void
  setSessionReady: () => void
  clear: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  accessToken:    null,
  user:           null,
  isAuthenticated: false,
  sessionReady:   false,
  setAccess:       (token) => set({ accessToken: token, isAuthenticated: true }),
  setUser:         (user)  => set({ user }),
  setSessionReady: ()      => set({ sessionReady: true }),
  clear:           ()      => set({ accessToken: null, user: null, isAuthenticated: false }),
}))
