"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Cookie, X } from "lucide-react"

const CONSENT_KEY = "kv_cookie_consent"

export default function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Small delay so it doesn't flash on every page load
    const t = setTimeout(() => {
      const consent = localStorage.getItem(CONSENT_KEY)
      if (!consent) setShow(true)
    }, 1500)
    return () => clearTimeout(t)
  }, [])

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted")
    setShow(false)
  }

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, "declined")
    setShow(false)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
          className="fixed bottom-6 left-6 z-[99990] max-w-sm w-full"
        >
          <div className="rounded-2xl border border-border p-5 backdrop-blur-2xl"
            style={{
              background: "linear-gradient(160deg, rgba(12,10,22,0.97), rgba(8,7,18,0.99))",
              boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 0 0.5px rgba(245,158,11,0.1) inset",
            }}>
            {/* Header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)" }}>
                <Cookie size={15} className="text-accent-bright" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-widest text-muted">
                Cookie Notice
              </p>
              <button onClick={decline}
                className="ml-auto text-subtle hover:text-muted transition-colors">
                <X size={14} />
              </button>
            </div>

            {/* Body */}
            <p className="text-[11px] text-muted leading-relaxed mb-4">
              We use essential cookies to keep you logged in and improve your experience.
              No tracking or advertising cookies.{" "}
              <Link href="/privacy" className="text-accent-bright/80 hover:text-accent-bright underline">
                Privacy Policy
              </Link>
            </p>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button onClick={accept}
                className="flex-1 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest text-black transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #fbbf24, #f59e0b)" }}>
                Accept
              </button>
              <button onClick={decline}
                className="flex-1 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest text-muted border border-border hover:bg-surface hover:text-muted transition-all">
                Decline
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
