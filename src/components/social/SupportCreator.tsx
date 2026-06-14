"use client"

import { useEffect, useState } from "react"
import { Heart, Sparkles, X, Loader2, Check, Coffee } from "lucide-react"
import { api } from "@/lib/api/client"
import { useToast } from "@/stores/toast.store"

type Tier = { id: string; name: string; description: string | null; priceCents: number; currency: string; perks: string[] }
type CreatorMon = { creatorId: string; username: string; displayName: string; isMonetized: boolean; isSelf: boolean; myTierId: string | null; tiers: Tier[] }

const usd = (c: number) => "$" + (c / 100).toFixed(2)
const TIP_PRESETS = [200, 500, 1000]

export function SupportCreator({ username }: { username: string }) {
  const [data, setData] = useState<CreatorMon | null>(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let alive = true
    api<CreatorMon>(`/monetization/creator/${username}`).then((d) => { if (alive) setData(d) }).catch(() => {})
    return () => { alive = false }
  }, [username])

  if (!data || data.isSelf || !data.isMonetized) return null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-accent/30 bg-accent-soft px-4 py-2.5 text-xs font-black uppercase tracking-widest text-accent-bright transition hover:bg-white/15"
      >
        <Heart size={15} /> Support
      </button>
      {open && <SupportModal data={data} onClose={() => setOpen(false)} />}
    </>
  )
}

function SupportModal({ data, onClose }: { data: CreatorMon; onClose: () => void }) {
  const { push } = useToast()
  const [busy, setBusy] = useState<string | null>(null)
  const [tab, setTab] = useState<"subscribe" | "tip">(data.tiers.length ? "subscribe" : "tip")
  const [tipCents, setTipCents] = useState(500)

  async function go(fn: () => Promise<{ url: string }>, key: string) {
    setBusy(key)
    try {
      const { url } = await fn()
      window.location.href = url
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Couldn't start checkout"
      push(/not configured|not available/i.test(msg) ? "Payments are launching soon — hang tight!" : msg, "info")
      setBusy(null)
    }
  }

  const subscribe = (tierId: string) =>
    go(() => api<{ url: string }>(`/monetization/checkout/membership`, { method: "POST", body: JSON.stringify({ tierId }) }), tierId)
  const tip = () =>
    go(() => api<{ url: string }>(`/monetization/checkout/tip`, { method: "POST", body: JSON.stringify({ creatorId: data.creatorId, amountCents: tipCents }) }), "tip")

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-3xl border border-border bg-background p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-black uppercase italic tracking-tight text-foreground">Support {data.displayName}</h2>
          <button onClick={onClose} className="text-muted hover:text-foreground"><X size={18} /></button>
        </div>

        <div className="mb-5 flex gap-1 rounded-full border border-border p-1">
          {data.tiers.length > 0 && (
            <button onClick={() => setTab("subscribe")} className={`flex-1 rounded-full py-2 text-[11px] font-black uppercase tracking-widest ${tab === "subscribe" ? "bg-accent text-white" : "text-muted"}`}>Subscribe</button>
          )}
          <button onClick={() => setTab("tip")} className={`flex-1 rounded-full py-2 text-[11px] font-black uppercase tracking-widest ${tab === "tip" ? "bg-accent text-white" : "text-muted"}`}>Tip</button>
        </div>

        {tab === "subscribe" ? (
          <div className="space-y-3">
            {data.tiers.map((t) => {
              const mine = data.myTierId === t.id
              return (
                <div key={t.id} className="rounded-2xl border border-border p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-black text-foreground">{t.name}</div>
                      <div className="text-lg font-black text-accent-bright">{usd(t.priceCents)}<span className="text-xs text-muted">/mo</span></div>
                    </div>
                    <button
                      onClick={() => !mine && subscribe(t.id)}
                      disabled={!!busy || mine}
                      className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-widest ${mine ? "bg-emerald-500/15 text-emerald-400" : "bg-accent text-white hover:opacity-90"} disabled:opacity-60`}
                    >
                      {busy === t.id ? <Loader2 size={13} className="animate-spin" /> : mine ? <Check size={13} /> : <Sparkles size={13} />}
                      {mine ? "Member" : "Subscribe"}
                    </button>
                  </div>
                  {t.description && <p className="mt-2 text-xs text-muted">{t.description}</p>}
                  {t.perks.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {t.perks.map((p, i) => <li key={i} className="flex items-start gap-2 text-[12px] text-muted"><Check size={13} className="mt-0.5 shrink-0 text-accent" /> {p}</li>)}
                    </ul>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-muted"><Coffee size={18} /> <span className="text-sm">Send a one-time tip</span></div>
            <div className="grid grid-cols-3 gap-2">
              {TIP_PRESETS.map((c) => (
                <button key={c} onClick={() => setTipCents(c)} className={`rounded-xl border py-3 text-sm font-black ${tipCents === c ? "border-accent bg-accent-soft text-accent-bright" : "border-border text-muted"}`}>{usd(c)}</button>
              ))}
            </div>
            <button onClick={tip} disabled={!!busy} className="flex w-full items-center justify-center gap-2 rounded-full bg-accent py-3 text-[12px] font-black uppercase tracking-widest text-white hover:opacity-90 disabled:opacity-60">
              {busy === "tip" ? <Loader2 size={14} className="animate-spin" /> : <Heart size={14} />} Tip {usd(tipCents)}
            </button>
          </div>
        )}
        <p className="mt-4 text-center text-[10px] text-muted">Creators keep 90%. Secure checkout.</p>
      </div>
    </div>
  )
}
