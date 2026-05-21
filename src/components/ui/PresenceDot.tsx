"use client"

import { usePresence } from "@/hooks/useRealtime"

/**
 * Green/grey dot that reflects realtime presence for a given user.
 *
 * Mount anywhere in a user card / avatar overlay — it independently subscribes
 * to the same presence cache so all instances update together with one socket event.
 */
export function PresenceDot({
  userId,
  size = 8,
  className = "",
  showOffline = false,
}: {
  userId: string | null | undefined
  size?: number
  className?: string
  /** If false, returns null when the user is offline (avoids visual clutter). */
  showOffline?: boolean
}) {
  const online = usePresence(userId)
  if (!online && !showOffline) return null
  return (
    <span
      title={online ? "Online" : "Offline"}
      className={className}
      style={{
        display:      "inline-block",
        width:        size,
        height:       size,
        borderRadius: "50%",
        background:   online ? "#10b981" : "rgba(255,255,255,0.2)",
        boxShadow:    online ? "0 0 8px rgba(16,185,129,0.6)" : "none",
        flexShrink:   0,
      }}
    />
  )
}
