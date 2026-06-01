"use client"

import Link from "next/link"

export default function AdminForbiddenPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-6">
      <div className="text-center max-w-md">
        <div className="text-[9px] font-mono uppercase tracking-[0.4em] text-accent-bright/60 mb-2">
          403
        </div>
        <h1 className="text-4xl font-black tracking-tighter uppercase italic mb-3">
          Forbidden<span style={{ color: "var(--app-accent)" }}>.</span>
        </h1>
        <p className="text-muted text-sm mb-8">
          You&apos;re signed in, but this account doesn&apos;t have admin access. If this looks wrong,
          email <a href="mailto:info@athavita.com" className="text-accent-bright hover:underline">info@athavita.com</a>.
        </p>
        <Link
          href="/"
          className="inline-block text-xs font-mono uppercase tracking-[0.3em] text-accent-bright/80 hover:text-accent-bright"
        >
          ← Back to Kaiveron
        </Link>
      </div>
    </div>
  )
}
