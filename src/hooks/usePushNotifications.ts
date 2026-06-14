"use client"

import { useState, useCallback, useEffect } from "react"
import { api } from "@/lib/api/client"
import { useToast } from "@/stores/toast.store"

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""

/** The Push API requires a Uint8Array applicationServerKey, not a base64 string. */
function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4)
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/")
  const raw = atob(b64)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

/** True only when launched from the Home Screen icon (standalone) — iOS push
 *  only works in that mode. */
export function isStandalone(): boolean {
  if (typeof window === "undefined") return false
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

export function usePushNotifications() {
  const { push } = useToast()
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [subscribing, setSubscribing] = useState(false)
  const isSupported =
    typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator && "PushManager" in window

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) setPermission(Notification.permission)
  }, [])

  // Must run inside a real user gesture (a tap) — firing on load silently fails on iOS.
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      push("Push notifications aren't supported in this browser", "info")
      return
    }
    if (!VAPID_PUBLIC_KEY) {
      push("Push isn't configured yet — try again shortly", "info")
      return
    }
    setSubscribing(true)
    try {
      // The root layout registers /sw.js in prod; ensure it's there + active.
      const reg =
        (await navigator.serviceWorker.getRegistration()) ?? (await navigator.serviceWorker.register("/sw.js"))
      await navigator.serviceWorker.ready

      const result = await Notification.requestPermission()
      setPermission(result)
      if (result !== "granted") {
        if (result === "denied") push("Notifications blocked. Enable them in your browser settings.", "info")
        return
      }

      let sub = await reg.pushManager.getSubscription()
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true, // iOS requires this
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
        })
      }

      await api<{ ok: boolean }>("/push/web/subscribe", {
        method: "POST",
        body: JSON.stringify({ subscription: sub.toJSON(), userAgent: navigator.userAgent }),
      })
      push("🔔 Notifications enabled! You'll get updates about your anime.", "success")
    } catch {
      push("Couldn't enable notifications", "error")
    } finally {
      setSubscribing(false)
    }
  }, [isSupported, push])

  return { permission, subscribing, isSupported, requestPermission, isStandalone: isStandalone() }
}
