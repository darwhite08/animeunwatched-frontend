import type { Metadata } from "next"
import Link from "next/link"
import { Crown, CheckCircle2, Zap, Star, Shield } from "lucide-react"

export const metadata: Metadata = { title: "Billing | Kaiveron" }

const PRO_FEATURES = [
  "Unlimited anime lists (Free: 500)",
  "AI Oracle unlimited queries (Free: 10/day)",
  "Advanced analytics dashboard",
  "Custom profile themes (10 options)",
  "Exclusive Legendary Shinobi badge",
  "Priority support response",
  "Creator Studio monetization",
  "Early access to new features",
]

export default function BillingPage() {
  return (
    <div className="max-w-2xl mx-auto px-6 py-12 pb-32 space-y-8">
      <div>
        <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-amber-400/60 mb-2">Subscription</p>
        <h1 className="text-3xl font-black tracking-tighter uppercase italic text-white">Billing & Plan</h1>
      </div>

      {/* Current plan */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/35 mb-1">Current Plan</p>
            <p className="text-xl font-black text-white">Free Tier</p>
          </div>
          <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/40">Active</span>
        </div>
        <p className="text-sm text-white/40">Your plan renews never — free forever.</p>
      </div>

      {/* Pro upgrade */}
      <div className="p-7 rounded-[2rem] bg-gradient-to-br from-indigo-600/20 to-violet-600/10 border border-indigo-500/30 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center">
            <Crown size={18} className="text-amber-400" />
          </div>
          <div>
            <p className="font-black text-white">Kaiveron Pro</p>
            <p className="text-[10px] text-indigo-400/70 uppercase tracking-widest">Ascend to Prime Grade</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-2xl font-black text-white">$4.99<span className="text-sm text-white/30">/mo</span></p>
            <p className="text-[9px] text-white/30">or $39.99/year (save 33%)</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {PRO_FEATURES.map(f => (
            <div key={f} className="flex items-start gap-2 text-xs text-white/60">
              <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
              {f}
            </div>
          ))}
        </div>

        <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-sm font-black uppercase tracking-widest text-white hover:opacity-90 transition-all shadow-[0_0_30px_rgba(99,102,241,0.3)] flex items-center justify-center gap-2">
          <Zap size={14} fill="white" /> Upgrade to Pro
        </button>
        <p className="text-center text-[9px] text-white/25">Cancel anytime. No hidden fees.</p>
      </div>

      {/* Payment info */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/8 space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/35">Payment Method</p>
        <p className="text-sm text-white/40">No payment method on file — you're on the free plan.</p>
        <div className="flex items-center gap-2 text-[9px] text-white/25">
          <Shield size={11} /> Payments secured by Stripe
        </div>
      </div>

      {/* FAQ */}
      <div className="space-y-3">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/35">FAQ</p>
        {[
          ["Will the free tier always be free?", "Yes. The core features will always remain free."],
          ["Can I cancel Pro anytime?", "Yes, cancel anytime with no questions asked."],
          ["Is there a student discount?", "Reach out to us — we offer 50% off for students."],
        ].map(([q, a]) => (
          <div key={q} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1">
            <p className="text-sm font-bold text-white/70">{q}</p>
            <p className="text-xs text-white/35">{a}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
