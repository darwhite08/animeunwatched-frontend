import { create } from "zustand"

/**
 * Global "sign in to do that" prompt. Guests can browse freely; any write action
 * (post, comment, like, follow…) calls `show()` to pop the auth modal instead of
 * silently failing. This is the standard guest-browsing / login-wall-on-action
 * pattern (Reddit, Pinterest, Quora) — maximises reach + SEO while converting at
 * the moment of intent.
 */
type AuthPromptStore = {
  open: boolean
  title: string
  subtitle: string
  show: (opts?: { title?: string; subtitle?: string }) => void
  hide: () => void
}

const DEFAULT_TITLE = "Join Kaiveron"
const DEFAULT_SUB = "Create a free account to post, comment, like, and follow the community."

export const useAuthPrompt = create<AuthPromptStore>((set) => ({
  open: false,
  title: DEFAULT_TITLE,
  subtitle: DEFAULT_SUB,
  show: (opts) =>
    set({ open: true, title: opts?.title ?? DEFAULT_TITLE, subtitle: opts?.subtitle ?? DEFAULT_SUB }),
  hide: () => set({ open: false }),
}))
