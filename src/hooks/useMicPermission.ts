"use client"

import { useState, useEffect, useCallback } from "react"

export type MicPermission = "unknown" | "prompt" | "granted" | "denied"

/**
 * Tracks microphone permission state and provides a requestMic() helper
 * that triggers the browser's permission dialog.
 *
 * - "unknown"  → Permissions API not supported (old browser)
 * - "prompt"   → Never asked — clicking the call button will trigger the dialog
 * - "granted"  → Mic is allowed — calls will work
 * - "denied"   → Blocked — user must reset in browser settings manually
 */
export function useMicPermission() {
  const [permission, setPermission] = useState<MicPermission>("unknown")

  useEffect(() => {
    if (typeof navigator === "undefined") return

    async function check() {
      try {
        if (!navigator.permissions?.query) {
          setPermission("unknown")
          return
        }
        const result = await navigator.permissions.query({ name: "microphone" as PermissionName })
        setPermission(result.state as MicPermission)

        // Auto-update when the user changes permission in browser settings
        result.onchange = () => {
          setPermission(result.state as MicPermission)
          // If they just granted access, auto-clear any call error
          if (result.state === "granted") {
            window.dispatchEvent(new CustomEvent("mic:granted"))
          }
        }
      } catch {
        setPermission("unknown")
      }
    }

    check()
  }, [])

  /**
   * Request mic access explicitly — stops immediately after grant.
   * Never used to block calls; only for pre-grant UX.
   */
  const requestMic = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
      stream.getTracks().forEach(t => t.stop())
      setPermission("granted")
      return true
    } catch {
      return false
    }
  }, [])

  return { permission, requestMic }
}
