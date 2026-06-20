"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MailWarning } from "lucide-react"
import { useAuthStore } from "@/stores/auth.store"

/**
 * Slim reminder shown to logged-in users whose email isn't confirmed yet.
 * Only ever appears when the backend actually requires verification (SMTP on) —
 * existing + OAuth users come back with emailVerifiedAt set, so they never see
 * this. Hidden on the verify page itself.
 */
export function EmailVerifyBanner() {
  const user = useAuthStore(s => s.user)
  const sessionReady = useAuthStore(s => s.sessionReady)
  const pathname = usePathname()

  if (!sessionReady || !user) return null
  if (user.emailVerifiedAt) return null
  if (pathname?.startsWith("/verify-email")) return null

  return (
    <div className="border-b border-accent/20 bg-accent/10 px-4 py-2.5">
      <div className="mx-auto flex max-w-5xl items-center justify-center gap-3 text-center">
        <MailWarning size={16} className="shrink-0 text-accent-bright" />
        <p className="text-xs font-semibold text-accent-bright">
          Confirm your email to unlock posting and the full account.
        </p>
        <Link
          href="/verify-email"
          className="shrink-0 rounded-full bg-accent-bright px-3 py-1 text-[11px] font-black uppercase tracking-wide text-black transition-opacity hover:opacity-90"
        >
          Verify now
        </Link>
      </div>
    </div>
  )
}
