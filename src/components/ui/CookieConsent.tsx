"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { Cookie, X } from "lucide-react"
import { getConsent, setConsent } from "@/lib/analytics/consent"

export default function CookieConsent() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Small delay so it doesn't flash on every page load
    const t = setTimeout(() => {
      if (!getConsent()) setShow(true)
    }, 1500)
    return () => clearTimeout(t)
  }, [])

  const accept = () => {
    setConsent("accepted")
    setShow(false)
  }

  const decline = () => {
    setConsent("declined")
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
              background: "linear-gradient(160deg, color-mix(in srgb, var(--app-bg) 97%, transparent), color-mix(in srgb, var(--app-bg) 99%, transparent))",
              boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 0 0.5px color-mix(in srgb, var(--app-accent) 10%, transparent) inset",
            }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "color-mix(in srgb, var(--app-accent) 15%, transparent)", border: "1px solid color-mix(in srgb, var(--app-accent) 30%, transparent)" }}>
                <Cookie size={15} className="text-accent-bright" />
              </div>
              <p className="text-[11px] font-black uppercase tracking-widest text-muted">
                Cookies & Analytics
              </p>
              <button onClick={decline}
                className="ml-auto text-subtle hover:text-muted transition-colors"
                aria-label="Decline non-essential cookies">
                <X size={14} />
              </button>
            </div>

            <p className="text-[11px] text-muted leading-relaxed mb-4">
              Essential cookies keep you signed in and remember preferences.
              With your consent, we also load{" "}
              <span className="text-foreground/80">Google Analytics</span>{" "}
              (anonymised IP) to understand which features are useful.
              No ad pixels, no cross-site trackers.{" "}
              <Link href="/privacy" className="text-accent-bright/80 hover:text-white underline">
                Privacy
              </Link>
            </p>

            <div className="flex items-center gap-2">
              <button onClick={accept}
                className="flex-1 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest text-black transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, var(--app-accent-bright), var(--app-accent))" }}>
                Accept all
              </button>
              <button onClick={decline}
                className="flex-1 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest text-muted border border-border hover:bg-surface hover:text-muted transition-all">
                Essential only
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
