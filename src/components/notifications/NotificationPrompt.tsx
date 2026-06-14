"use client"

import { useEffect, useState } from "react"
import { Bell, X } from "lucide-react"
import { useAuthStore } from "@/stores/auth.store"
import { usePushNotifications } from "@/hooks/usePushNotifications"

const DISMISS_KEY = "kaiveron-push-prompt-dismissed"

/**
 * Post-install nudge to turn on push. Browsers REQUIRE the permission request to
 * run inside a user gesture, so we can't auto-enable — instead we surface a
 * small, dismissible "Turn on notifications" bar whose Enable button (a tap)
 * triggers the subscribe. Shown only to signed-in users who can actually receive
 * push (supported + permission still "default"), skipping iOS Safari tabs where
 * push doesn't work until the app is added to the Home Screen. Dismissal sticks.
 */
export default function NotificationPrompt() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { permission, isSupported, subscribing, requestPermission, isStandalone } = usePushNotifications()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!isAuthenticated || !isSupported || permission !== "default") return
    // Only nudge INSTALLED users (standalone) — that's "after install", works on
    // every platform incl. iOS, and avoids overlapping the install prompt (which
    // only shows when NOT installed).
    if (!isStandalone) return
    let dismissed = false
    try {
      dismissed = localStorage.getItem(DISMISS_KEY) === "1"
    } catch {
      /* private mode */
    }
    if (dismissed) return
    // Short delay so we don't slam the user the instant the app opens.
    const t = setTimeout(() => setVisible(true), 2500)
    return () => clearTimeout(t)
  }, [isAuthenticated, isSupported, permission, isStandalone])

  if (!visible || permission !== "default") return null

  const enable = async () => {
    await requestPermission()
    setVisible(false)
  }
  const dismiss = () => {
    setVisible(false)
    try {
      localStorage.setItem(DISMISS_KEY, "1")
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+5rem)] md:pb-[calc(env(safe-area-inset-bottom)+1rem)]">
      <div className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border border-border bg-surface/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-accent/30 bg-accent/15">
          <Bell size={16} className="text-accent-bright" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-tight text-foreground">Turn on notifications</p>
          <p className="text-[11px] leading-tight text-muted">Get alerts for replies, follows &amp; new episodes.</p>
        </div>
        <button
          onClick={enable}
          disabled={subscribing}
          className="shrink-0 rounded-xl bg-accent px-3 py-2 text-xs font-black uppercase tracking-wider text-black transition-all hover:bg-accent-bright active:scale-95 disabled:opacity-50"
        >
          {subscribing ? "…" : "Enable"}
        </button>
        <button onClick={dismiss} aria-label="Dismiss" className="shrink-0 text-muted transition-colors hover:text-foreground">
          <X size={16} />
        </button>
      </div>
    </div>
  )
}
