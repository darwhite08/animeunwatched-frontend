"use client"

import { useEffect } from "react"
import { Loader2 } from "lucide-react"

// The Creator Studio has moved to its own gated subdomain. Not everyone is a
// creator — the studio unlocks only for creators who meet Kaiveron's criteria
// (the studio enforces the access gate + cross-subdomain SSO). This page just
// forwards there so /creators is no longer a section of the main domain.
const STUDIO_URL = "https://creator-studio.kaiveron.com"

export default function CreatorsRedirect() {
  useEffect(() => {
    window.location.replace(STUDIO_URL)
  }, [])

  return (
    <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center gap-4 text-center px-6">
      <Loader2 className="animate-spin text-indigo-500" size={28} />
      <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/40">
        Taking you to Creator Studio…
      </p>
      <a href={STUDIO_URL} className="text-xs text-indigo-400 underline">
        creator-studio.kaiveron.com
      </a>
    </div>
  )
}
