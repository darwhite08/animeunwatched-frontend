"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Sparkles, Calendar, Info } from "lucide-react"
import Link from "next/link"

export type AnnouncementBannerProps = {
  message: string
  href?: string
  linkLabel?: string
  type: "info" | "new" | "event"
}

/** Stable numeric hash so the dismissal key survives re-renders */
function hashMessage(str: string): string {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0
  }
  return Math.abs(h).toString(36)
}

const TYPE_STYLES = {
  new: {
    bg: "bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600",
    text: "text-amber-100",
    linkClass: "text-white underline-offset-2 hover:underline font-black",
    icon: Sparkles,
    iconClass: "text-violet-300",
    badge: "New",
    badgeBg: "bg-white/15 text-white",
  },
  event: {
    bg: "bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500",
    text: "text-amber-50",
    linkClass: "text-white underline-offset-2 hover:underline font-black",
    icon: Calendar,
    iconClass: "text-amber-200",
    badge: "Event",
    badgeBg: "bg-white/20 text-white",
  },
  info: {
    bg: "bg-slate-800",
    text: "text-slate-200",
    linkClass: "text-slate-100 underline-offset-2 hover:underline font-black",
    icon: Info,
    iconClass: "text-slate-400",
    badge: "Info",
    badgeBg: "bg-white/10 text-slate-300",
  },
}

export default function AnnouncementBanner({
  message,
  href,
  linkLabel,
  type,
}: AnnouncementBannerProps) {
  const storageKey = `aw_banner_dismissed_${hashMessage(message)}`
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Only show if not already dismissed
    const dismissed = localStorage.getItem(storageKey) === "1"
    if (!dismissed) setVisible(true)
  }, [storageKey])

  const dismiss = () => {
    localStorage.setItem(storageKey, "1")
    setVisible(false)
  }

  const styles = TYPE_STYLES[type]
  const Icon = styles.icon

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className={`w-full ${styles.bg} overflow-hidden`}
        >
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center gap-3">
            {/* Icon + badge */}
            <div className="flex items-center gap-2 shrink-0">
              <Icon size={13} className={styles.iconClass} />
              <span
                className={`hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${styles.badgeBg}`}
              >
                {styles.badge}
              </span>
            </div>

            {/* Message */}
            <p className={`flex-1 text-xs font-medium text-center leading-snug ${styles.text}`}>
              {message}
              {href && linkLabel && (
                <>
                  {" "}
                  <Link href={href} className={`${styles.linkClass} ml-1`}>
                    {linkLabel}
                  </Link>
                </>
              )}
            </p>

            {/* Dismiss */}
            <button
              onClick={dismiss}
              aria-label="Dismiss announcement"
              className="shrink-0 p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
