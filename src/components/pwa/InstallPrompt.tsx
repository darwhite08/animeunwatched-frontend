"use client"

import { useEffect, useState } from "react"
import { Download, X } from "lucide-react"

// Chrome-only event; not in the TS DOM lib, so we type it locally.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

const DISMISS_KEY = "kaiveron-pwa-install-dismissed"

// Non-intrusive "Add to home screen" pill. Only appears when the browser fires
// beforeinstallprompt (Android/desktop Chrome + Edge) AND the app isn't already
// installed. iOS Safari has no install event, so nothing shows there — the
// on-phone testing checklist covers the manual "Add to Home Screen" path.
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Already running as an installed app → never prompt.
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    if (standalone) return

    let dismissed = false
    try {
      dismissed = localStorage.getItem(DISMISS_KEY) === "1"
    } catch {
      /* private mode / storage blocked — just show it */
    }
    if (dismissed) return

    const onPrompt = (e: Event) => {
      e.preventDefault() // suppress Chrome's default mini-infobar; we drive it
      setDeferred(e as BeforeInstallPromptEvent)
      setVisible(true)
    }
    const onInstalled = () => {
      setVisible(false)
      setDeferred(null)
    }

    window.addEventListener("beforeinstallprompt", onPrompt)
    window.addEventListener("appinstalled", onInstalled)
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt)
      window.removeEventListener("appinstalled", onInstalled)
    }
  }, [])

  const install = async () => {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice // resolves after the user accepts/dismisses
    setVisible(false)
    setDeferred(null)
  }

  const dismiss = () => {
    setVisible(false)
    try {
      localStorage.setItem(DISMISS_KEY, "1")
    } catch {
      /* ignore */
    }
  }

  if (!visible) return null

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+5rem)] md:pb-[calc(env(safe-area-inset-bottom)+1rem)] pointer-events-none">
      <div className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-border bg-surface/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-accent/30 bg-accent/15">
          <Download size={16} className="text-accent-bright" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-tight text-foreground">Install Kaiveron</p>
          <p className="text-[11px] leading-tight text-muted">Add to your home screen for the full app.</p>
        </div>
        <button
          onClick={install}
          className="shrink-0 rounded-xl bg-accent px-3 py-2 text-xs font-black uppercase tracking-wider text-black transition-colors hover:bg-accent-bright"
        >
          Add
        </button>
        <button
          onClick={dismiss}
          aria-label="Dismiss install prompt"
          className="shrink-0 text-muted transition-colors hover:text-foreground"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
