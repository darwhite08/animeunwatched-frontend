import type { Metadata } from "next"
import Link from "next/link"
import { Crown, Check, Star, Shield, Users } from "lucide-react"

export const metadata: Metadata = {
  title: "Pricing — Kaiveron",
  description: "Simple, transparent pricing. Free forever with an optional Pro upgrade.",
}

const FREE_FEATURES = [
  "Track up to 500 anime",
  "Community feed + posts",
  "10 AI Oracle queries/day",
  "Join & create clubs",
  "Full episode tracker",
  "Discord-style chat",
  "Seasonal calendar",
  "Standard themes",
]

const PRO_FEATURES = [
  "Unlimited anime tracking",
  "Unlimited AI Oracle queries",
  "Advanced analytics dashboard",
  "10 custom profile themes",
  "Legendary Shinobi badge",
  "Priority community support",
  "Creator Studio monetisation",
  "Early access to new features",
  "MAL/AniList bulk import",
  "Export your data anytime",
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-16 text-center">
        <div className="inline-flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.4em]"
          style={{ background: "color-mix(in srgb, var(--app-accent) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--app-accent) 25%, transparent)", color: "var(--app-accent)" }}>
          <Crown size={11} /> Pricing
        </div>
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-foreground leading-none mb-6">
          Simple,{" "}
          <span className="italic" style={{
            backgroundImage: "linear-gradient(135deg, var(--app-accent-bright), var(--app-accent))",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            transparent.
          </span>
        </h1>
        <p className="text-muted text-lg max-w-lg mx-auto">
          Kaiveron is free forever. Upgrade to Pro if you want the extras — no pressure, no dark patterns.
        </p>
      </div>

      {/* Plans */}
      <div className="max-w-4xl mx-auto px-6 grid md:grid-cols-2 gap-6">
        {/* Free */}
        <div className="relative p-8 rounded-[2rem] border border-border bg-surface space-y-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-subtle mb-2">Free forever</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-foreground">₹0</span>
              <span className="text-muted">/month</span>
            </div>
            <p className="text-sm text-subtle mt-2">No credit card. No trial. Always free.</p>
          </div>

          <Link href="/register"
            className="block w-full py-3.5 rounded-2xl text-center text-xs font-black uppercase tracking-widest border border-border text-muted hover:bg-surface hover:text-foreground transition-all">
            Get Started Free
          </Link>

          <div className="space-y-3">
            {FREE_FEATURES.map(f => (
              <div key={f} className="flex items-center gap-3">
                <Check size={14} className="text-emerald-400 shrink-0" />
                <span className="text-sm text-muted">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pro */}
        <div className="relative p-8 rounded-[2rem] border space-y-6"
          style={{
            borderColor: "color-mix(in srgb, var(--app-accent) 30%, transparent)",
            background: "linear-gradient(160deg, color-mix(in srgb, var(--app-accent) 6%, transparent), color-mix(in srgb, var(--app-accent) 2%, transparent))",
            boxShadow: "0 0 60px color-mix(in srgb, var(--app-accent) 8%, transparent)",
          }}>
          {/* Badge */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-black"
            style={{ background: "linear-gradient(135deg, var(--app-accent-bright), var(--app-accent))" }}>
            Most Popular
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent-bright/70 mb-2">Pro</p>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-foreground">₹399</span>
              <span className="text-muted">/month</span>
            </div>
            <p className="text-sm text-subtle mt-1">or ₹3,499/year (save 27%)</p>
          </div>

          <a
            href="mailto:kaiveron@gmail.com?subject=Pro Waitlist"
            className="block w-full py-3.5 rounded-2xl text-center text-xs font-black uppercase tracking-widest text-black transition-all hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg, var(--app-accent-bright), var(--app-accent))", boxShadow: "0 4px 20px color-mix(in srgb, var(--app-accent) 35%, transparent)" }}
          >
            <Crown size={13} className="inline mr-2" /> Join Pro Waitlist
          </a>

          <div className="space-y-3">
            {PRO_FEATURES.map(f => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: "color-mix(in srgb, var(--app-accent) 20%, transparent)", border: "1px solid color-mix(in srgb, var(--app-accent) 40%, transparent)" }}>
                  <Check size={9} className="text-accent-bright" />
                </div>
                <span className="text-sm text-muted">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto px-6 mt-20 space-y-6">
        <h2 className="text-2xl font-black tracking-tighter uppercase italic text-foreground text-center">
          Common Questions<span style={{ color: "var(--app-accent)" }}>.</span>
        </h2>

        {[
          {
            q: "Is Kaiveron really free forever?",
            a: "Yes. The free tier is fully functional for tracking, social features, clubs, and community. Pro is genuinely optional.",
          },
          {
            q: "Can I cancel Pro anytime?",
            a: "Yes. No cancellation fees, no retention tricks. Cancel and you keep Pro until the end of your billing period.",
          },
          {
            q: "What happens to my data if I cancel?",
            a: "Your data is yours. Export your full list at any time from Settings → Import. We'll never delete your account for inactivity.",
          },
          {
            q: "Is there a student discount?",
            a: "Yes — email us at kaiveron@gmail.com from your .edu address and we'll hook you up.",
          },
        ].map(({ q, a }) => (
          <div key={q} className="p-5 rounded-2xl border border-border bg-surface">
            <p className="text-sm font-black text-foreground mb-2">{q}</p>
            <p className="text-xs text-muted leading-relaxed">{a}</p>
          </div>
        ))}
      </div>

      {/* Commitment */}
      <div className="max-w-4xl mx-auto px-6 mt-16">
        <div className="p-8 rounded-[2rem] border border-border bg-surface grid sm:grid-cols-3 gap-6 text-center">
          {[
            { icon: Shield, label: "No dark patterns", desc: "Easy to cancel, easy to export, nothing hidden" },
            { icon: Users, label: "Community first", desc: "Free users are full citizens, not second class" },
            { icon: Star, label: "Fair pricing", desc: "₹399/mo — affordable for Indian anime fans" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="space-y-2">
              <Icon size={20} className="mx-auto text-accent-bright" />
              <p className="text-sm font-black text-foreground">{label}</p>
              <p className="text-xs text-subtle">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
