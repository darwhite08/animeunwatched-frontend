"use client"

import { useState } from "react"
import { Bell, Check } from "lucide-react"
import { usePushNotifications } from "@/hooks/usePushNotifications"
import { api } from "@/lib/api/client"
import { useToast } from "@/stores/toast.store"

/**
 * Push-notification opt-in card. Requests permission inside a tap (required on
 * iOS), subscribes via VAPID, and stores the subscription on the backend. On
 * iOS Safari (not installed) it guides the user to Add to Home Screen first,
 * since web push there only works in standalone mode.
 */
export function EnableNotifications() {
  const { permission, subscribing, isSupported, requestPermission, isStandalone } = usePushNotifications()
  const { push } = useToast()
  const [testing, setTesting] = useState(false)
  const isIOS = typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent)

  const sendTest = async () => {
    setTesting(true)
    try {
      const res = await api<{ sent: number }>("/push/test", { method: "POST" })
      push(
        res.sent > 0 ? `Test sent to ${res.sent} device${res.sent === 1 ? "" : "s"} — check your notifications.` : "No devices registered yet — tap Enable first.",
        res.sent > 0 ? "success" : "info",
      )
    } catch {
      push("Couldn't send test push", "error")
    } finally {
      setTesting(false)
    }
  }

  if (isIOS && !isStandalone) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4 sm:p-5">
        <Bell size={18} className="mt-0.5 shrink-0 text-accent-bright" />
        <div>
          <p className="text-sm font-bold text-foreground">Push notifications</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Tap the Share icon, then <b className="text-foreground">Add to Home Screen</b>, and open Kaiveron from the
            icon to turn on notifications.
          </p>
        </div>
      </div>
    )
  }

  if (!isSupported) return null

  const enabled = permission === "granted"
  const blocked = permission === "denied"

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 sm:p-5">
      <div
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
          enabled ? "bg-emerald-500/15 text-emerald-400" : "bg-accent/15 text-accent-bright"
        }`}
      >
        {enabled ? <Check size={18} /> : <Bell size={18} />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-foreground">Push notifications</p>
        <p className="mt-0.5 text-xs text-muted">
          {enabled
            ? "On — you'll get push alerts on this device."
            : blocked
              ? "Blocked in your browser settings."
              : "Get notified about replies, follows, and new episodes."}
        </p>
      </div>
      {!enabled && !blocked && (
        <button
          onClick={requestPermission}
          disabled={subscribing}
          className="shrink-0 rounded-xl bg-accent px-4 py-2.5 text-xs font-black uppercase tracking-widest text-black transition-all hover:bg-accent-bright active:scale-95 disabled:opacity-50"
        >
          {subscribing ? "Enabling…" : "Enable"}
        </button>
      )}
      {enabled && (
        <button
          onClick={sendTest}
          disabled={testing}
          className="shrink-0 rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-foreground transition-all hover:bg-surface active:scale-95 disabled:opacity-50"
        >
          {testing ? "Sending…" : "Send test"}
        </button>
      )}
    </div>
  )
}
