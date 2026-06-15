"use client"

import { useEffect, useState } from "react"
import { Lock, Plus, Copy, Trash2, Loader2, Check, ShieldAlert, Ticket } from "lucide-react"
import { useToast } from "@/stores/toast.store"
import { useAuthStore } from "@/stores/auth.store"
import {
  adminGetSignupAccess, adminSetInviteOnly, adminCreateInvite, adminRevokeInvite,
  type SignupInvite,
} from "@/lib/api/endpoints"

export default function AdminAccessPage() {
  const { push } = useToast()
  const user = useAuthStore((s) => s.user)
  const isAdmin = user?.role === "ADMIN"

  const [loading, setLoading] = useState(true)
  const [inviteOnly, setInviteOnly] = useState(false)
  const [invites, setInvites] = useState<SignupInvite[]>([])
  const [toggling, setToggling] = useState(false)
  const [creating, setCreating] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  // create form
  const [label, setLabel] = useState("")
  const [maxUses, setMaxUses] = useState("0")
  const [expiresInDays, setExpiresInDays] = useState("0")

  useEffect(() => {
    if (!isAdmin) { setLoading(false); return }
    adminGetSignupAccess()
      .then((d) => { setInviteOnly(d.inviteOnly); setInvites(d.invites) })
      .catch(() => push("Couldn't load signup access settings", "error"))
      .finally(() => setLoading(false))
  }, [isAdmin, push])

  const toggle = async () => {
    setToggling(true)
    const next = !inviteOnly
    try {
      await adminSetInviteOnly(next)
      setInviteOnly(next)
      push(next ? "Invite-only signup is now ON" : "Invite-only signup is now OFF", "success")
    } catch {
      push("Couldn't update the setting", "error")
    } finally { setToggling(false) }
  }

  const create = async () => {
    setCreating(true)
    try {
      const inv = await adminCreateInvite({
        label: label.trim() || undefined,
        maxUses: Number(maxUses) || 0,
        expiresInDays: Number(expiresInDays) || 0,
      })
      setInvites((prev) => [inv, ...prev])
      setLabel(""); setMaxUses("0"); setExpiresInDays("0")
      push(`Invite code created: ${inv.code}`, "success")
    } catch {
      push("Couldn't create invite", "error")
    } finally { setCreating(false) }
  }

  const revoke = async (id: string) => {
    try {
      const inv = await adminRevokeInvite(id)
      setInvites((prev) => prev.map((i) => (i.id === id ? inv : i)))
      push("Invite revoked", "info")
    } catch {
      push("Couldn't revoke invite", "error")
    }
  }

  const copy = async (inv: SignupInvite) => {
    const url = `${location.origin}/register?invite=${inv.code}`
    try { await navigator.clipboard.writeText(url); setCopied(inv.id); setTimeout(() => setCopied(null), 1500) } catch {}
  }

  const status = (i: SignupInvite) => {
    if (i.revokedAt) return { label: "Revoked", cls: "text-red-400 bg-red-500/10" }
    if (i.expiresAt && new Date(i.expiresAt) < new Date()) return { label: "Expired", cls: "text-orange-400 bg-orange-500/10" }
    if (i.maxUses > 0 && i.uses >= i.maxUses) return { label: "Used up", cls: "text-subtle bg-white/5" }
    return { label: "Active", cls: "text-emerald-400 bg-emerald-500/10" }
  }

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-32 flex flex-col items-center text-center gap-4">
        <ShieldAlert size={40} className="text-subtle" />
        <h1 className="text-2xl font-black tracking-tight text-foreground">Admins only</h1>
        <p className="text-sm text-muted">You don&apos;t have permission to view this page.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 pb-32 space-y-8">
      <div>
        <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-accent-bright/60 mb-1">Admin</p>
        <h1 className="text-3xl font-black tracking-tighter uppercase italic text-foreground">Signup Access</h1>
        <p className="text-sm text-muted mt-1">Gate who can create a Kaiveron account.</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-accent-bright" size={26} /></div>
      ) : (
        <>
          {/* Master toggle */}
          <div className="p-6 rounded-2xl bg-surface border border-border flex items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Lock size={18} className={inviteOnly ? "text-accent-bright mt-0.5" : "text-subtle mt-0.5"} />
              <div>
                <p className="text-sm font-black text-foreground">Invite-only signup</p>
                <p className="text-[11px] text-muted mt-0.5 max-w-md">
                  When ON, new accounts (email <span className="font-bold">and</span> Google/Apple) require a valid invite code below.
                </p>
              </div>
            </div>
            <button
              onClick={toggle} disabled={toggling} role="switch" aria-checked={inviteOnly}
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50 ${inviteOnly ? "bg-accent" : "bg-white/15"}`}
            >
              <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${inviteOnly ? "translate-x-5" : "translate-x-0.5"}`} />
            </button>
          </div>

          {/* Create invite */}
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-subtle flex items-center gap-2">
              <Ticket size={13} /> Create invite code
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-subtle mb-1.5">Label (optional)</label>
                <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Twitter wave"
                  className="w-full h-11 rounded-xl bg-black/30 border border-border px-3 text-sm text-foreground placeholder:text-subtle outline-none focus:border-accent/40" />
              </div>
              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-subtle mb-1.5">Max uses (0 = ∞)</label>
                <input type="number" min={0} value={maxUses} onChange={(e) => setMaxUses(e.target.value)}
                  className="w-full h-11 rounded-xl bg-black/30 border border-border px-3 text-sm text-foreground outline-none focus:border-accent/40" />
              </div>
              <div>
                <label className="block text-[9px] font-black uppercase tracking-widest text-subtle mb-1.5">Expires in days (0 = never)</label>
                <input type="number" min={0} value={expiresInDays} onChange={(e) => setExpiresInDays(e.target.value)}
                  className="w-full h-11 rounded-xl bg-black/30 border border-border px-3 text-sm text-foreground outline-none focus:border-accent/40" />
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={create} disabled={creating}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest text-black transition-all disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, var(--app-accent-bright), var(--app-accent))" }}>
                {creating ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} Create code
              </button>
            </div>
          </div>

          {/* Invite list */}
          <div className="p-6 rounded-2xl bg-surface border border-border space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-subtle">Invite codes ({invites.length})</p>
            {invites.length === 0 ? (
              <p className="text-sm text-subtle py-4">No invite codes yet — create one above.</p>
            ) : (
              <div className="space-y-2">
                {invites.map((i) => {
                  const st = status(i)
                  return (
                    <div key={i.id} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
                      <code className="font-mono text-sm font-black tracking-widest text-foreground">{i.code}</code>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                      {i.label && <span className="text-[11px] text-muted truncate">{i.label}</span>}
                      <span className="ml-auto text-[11px] tabular-nums text-subtle">
                        {i.uses}{i.maxUses > 0 ? ` / ${i.maxUses}` : ""} used
                      </span>
                      <button onClick={() => copy(i)} aria-label="Copy invite link"
                        className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted hover:text-foreground hover:border-white/30 transition-colors">
                        {copied === i.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                      </button>
                      {!i.revokedAt && (
                        <button onClick={() => revoke(i.id)} aria-label="Revoke"
                          className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted hover:text-red-400 hover:border-red-500/30 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
