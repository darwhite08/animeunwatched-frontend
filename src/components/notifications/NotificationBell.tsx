"use client"

import { useState, useRef, useEffect } from "react"
import { Bell } from "lucide-react"
import NotificationDropdown from "./NotificationDropdown"
import { useNotifications } from "./useNotifications"

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications()

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () =>
      document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(prev => !prev)}
        className="relative text-white/60 hover:text-white transition"
      >
        <Bell size={20} />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-semibold">
            {unreadCount}
          </span>
        )}
      </button>

      <NotificationDropdown
        open={open}
        notifications={notifications}
        markAsRead={markAsRead}
        markAllAsRead={markAllAsRead}
      />
    </div>
  )
}