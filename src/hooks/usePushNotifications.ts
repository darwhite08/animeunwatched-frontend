"use client"

import { useState, useCallback } from "react"
import { useToast } from "@/stores/toast.store"

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ""

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = window.atob(base64)
  return new Uint8Array([...rawData].map(char => char.charCodeAt(0)))
}

export function usePushNotifications() {
  const { push } = useToast()
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "default"
  )
  const [subscribing, setSubscribing] = useState(false)
  const isSupported = typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator

  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      push("Push notifications not supported in this browser", "info")
      return
    }

    if (permission === "granted") {
      push("Notifications are already enabled!", "success")
      return
    }

    setSubscribing(true)
    try {
      const result = await Notification.requestPermission()
      setPermission(result)

      if (result === "granted") {
        // Register with service worker
        if (VAPID_PUBLIC_KEY && "serviceWorker" in navigator) {
          const registration = await navigator.serviceWorker.ready
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
          })
          // Send subscription to backend
          await fetch("/api/v1/notifications/push-subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(subscription),
            credentials: "include",
          }).catch(() => {/* non-critical */})
        }
        push("🔔 Notifications enabled! You'll get updates about your anime.", "success")
      } else if (result === "denied") {
        push("Notifications blocked. You can enable them in browser settings.", "info")
      }
    } catch {
      push("Could not enable notifications", "error")
    } finally {
      setSubscribing(false)
    }
  }, [isSupported, permission, push])

  return { permission, subscribing, isSupported, requestPermission }
}
