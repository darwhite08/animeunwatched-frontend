import type { Metadata } from "next"
import Link from "next/link"
import { Crown, CheckCircle2, Zap, Star, Shield, ExternalLink } from "lucide-react"
import { DesktopOnly } from "@/components/layout/DesktopOnly"

export const metadata: Metadata = { title: "Billing | Kaiveron" }

const PRO_FEATURES = [
  "Unlimited anime tracking (free: 500)",
  "Unlimited AI Oracle queries (free: 10/day)",
  "Advanced analytics dashboard",
  "10 custom profile themes",
  "Legendary Shinobi badge",
  "Priority community support",
  "Creator Studio monetisation",
  "Early access to new features",
  "MAL/AniList bulk import",
  "Export your data anytime",
]

export default function BillingPage() {
  return (
    <DesktopOnly title="Manage billing on desktop" note="Payment & billing settings open on a larger screen.">
    <div className="max-w-2xl mx-auto px-6 py-12 space-y-8 pb-32">
      {/* Header */}
      <div>
        <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-accent-bright/60 mb-2">Settings · Billing</p>
        <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic leading-none">
          Billing &amp; Pro
        </h1>
        <p className="text-xs text-subtle mt-2 flex items-center gap-2">
          <Crown size={11} className="text-accent-bright" /> Manage your subscription and Pro access.
        </p>
      </div>

      {/* Current plan */}
      <div className="p-6 rounded-2xl border border-border bg-surface space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-surface border border-border flex items-center justify-center">
              <Zap size={16} className="text-muted" />
            </div>
            <div>
              <p className="text-sm font-black text-foreground">Free Plan</p>
              <p className="text-[10px] text-subtle mt-0.5">No expiry — free forever</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-surface border border-border text-[9px] font-black uppercase tracking-widest text-subtle">Active</span>
        </div>
      </div>

      {/* Pro upgrade */}
      <div className="relative mt-5 p-6 rounded-2xl border space-y-5"
        style={{ borderColor: "color-mix(in srgb, var(--app-accent) 30%, transparent)", background: "linear-gradient(160deg,color-mix(in srgb, var(--app-accent) 6%, transparent),color-mix(in srgb, var(--app-accent) 2%, transparent))", boxShadow: "0 0 60px color-mix(in srgb, var(--app-accent) 8%, transparent)" }}>
        <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest text-black shadow-lg"
          style={{ background: "linear-gradient(135deg,var(--app-accent-bright),var(--app-accent))" }}>
          Coming Soon — Q3 2026
        </div>

        <div className="pt-2">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-foreground">₹399</span>
            <span className="text-muted">/month</span>
          </div>
          <p className="text-sm text-subtle mt-1">or ₹3,499/year — save 27%</p>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {PRO_FEATURES.map(f => (
            <div key={f} className="flex items-center gap-3">
              <CheckCircle2 size={12} className="text-accent-bright shrink-0" />
              <span className="text-xs text-muted">{f}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <a href="mailto:kaiveron@gmail.com?subject=Pro Waitlist"
            className="flex-1 py-3.5 rounded-2xl text-center text-xs font-black uppercase tracking-widest text-black transition-all hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg,var(--app-accent-bright),var(--app-accent))", boxShadow: "0 4px 20px color-mix(in srgb, var(--app-accent) 35%, transparent)" }}>
            <Crown size={12} className="inline mr-2" /> Join Pro Waitlist
          </a>
          <Link href="/pricing"
            className="flex items-center justify-center gap-1.5 py-3.5 px-5 rounded-2xl border border-border text-xs font-black uppercase tracking-widest text-muted hover:text-foreground hover:border-border transition-all">
            Compare Plans <ExternalLink size={11} />
          </Link>
        </div>
      </div>

      {/* Anti-dark-patterns commitment */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Shield,  label: "No dark patterns",  desc: "Easy to cancel anytime"        },
          { icon: Star,    label: "Fair pricing",       desc: "₹399/mo — affordable"          },
          { icon: Zap,     label: "Data portability",   desc: "Export your list at any time"  },
        ].map(({ icon: Icon, label, desc }) => (
          <div key={label} className="text-center p-4 rounded-2xl border border-border bg-surface space-y-1">
            <Icon size={16} className="mx-auto text-accent-bright" />
            <p className="text-[10px] font-black text-foreground">{label}</p>
            <p className="text-[9px] text-subtle">{desc}</p>
          </div>
        ))}
      </div>
    </div>
    </DesktopOnly>
  )
}
