"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Notification } from "./useNotifications"

type Props = {
  open: boolean
  notifications: Notification[]
  markAsRead: (id: string) => void
  markAllAsRead: () => void
}

export default function NotificationDropdown({
  open,
  notifications,
  markAsRead,
  markAllAsRead,
}: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          className="absolute right-0 mt-4 w-80 rounded-2xl border border-white/10 bg-zinc-900 shadow-2xl p-3"
        >
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-semibold">Notifications</h4>
            <button
              onClick={markAllAsRead}
              className="text-xs text-indigo-400 hover:underline"
            >
              Mark all read
            </button>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-white/50 text-center py-6">
                No notifications
              </p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`p-3 rounded-xl cursor-pointer transition ${
                    n.read
                      ? "bg-zinc-800/40"
                      : "bg-indigo-500/10 border border-indigo-500/20"
                  }`}
                >
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="text-xs text-white/60">
                    {n.description}
                  </p>
                  <p className="text-[10px] text-white/40 mt-1">
                    {n.time}
                  </p>
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}