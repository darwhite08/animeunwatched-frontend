"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { ShieldCheck, KeyRound, Fingerprint, Loader2, Lock, Smartphone, Monitor, Check } from "lucide-react"
import { e2eeState } from "@/lib/api/endpoints"
import {
  setupVault, unlockVault, addPasskeyToVault, isUnlocked, lockThisDevice, isPasskeySupported,
} from "@/lib/e2ee-vault"
import { useToast } from "@/stores/toast.store"

/**
 * Opt-in E2EE control. Set up an encryption password (+ optional passkey),
 * unlock this device, and manage devices. Messages start encrypting once both
 * people in a chat have it on. The server never sees your key.
 */
export function EncryptionSettings() {
  const qc = useQueryClient()
  const { push } = useToast()
  const { data, isLoading } = useQuery({ queryKey: ["e2ee/state"], queryFn: e2eeState })
  const [unlocked, setUnlocked] = useState(isUnlocked())
  const [busy, setBusy] = useState(false)

  // setup form
  const [pw, setPw] = useState("")
  const [pw2, setPw2] = useState("")
  const [withPasskey, setWithPasskey] = useState(isPasskeySupported)
  // unlock form
  const [unlockPw, setUnlockPw] = useState("")

  const refresh = () => qc.invalidateQueries({ queryKey: ["e2ee/state"] })

  async function doSetup() {
    if (pw.length < 8) { push("Use a password of at least 8 characters.", "error"); return }
    if (pw !== pw2) { push("Passwords don't match.", "error"); return }
    setBusy(true)
    try {
      await setupVault(pw, { addPasskey: withPasskey })
      setUnlocked(true); setPw(""); setPw2(""); refresh()
      push("End-to-end encryption is on 🔒", "success")
    } catch (e) {
      push(e instanceof Error ? e.message : "Couldn't set up encryption", "error")
    } finally { setBusy(false) }
  }

  async function doUnlock(via: { password: string } | { passkey: true }) {
    setBusy(true)
    try {
      await unlockVault(via)
      setUnlocked(true); setUnlockPw(""); refresh()
      push("Unlocked on this device 🔓", "success")
    } catch (e) {
      console.error("[e2ee] unlock failed:", e)
      push(e instanceof Error ? e.message : "Couldn't unlock — check your password", "error")
    } finally { setBusy(false) }
  }

  async function doAddPasskey() {
    setBusy(true)
    try { await addPasskeyToVault(); refresh(); push("Passkey added ✓", "success") }
    catch (e) { push(e instanceof Error ? e.message : "Couldn't add passkey", "error") }
    finally { setBusy(false) }
  }

  const hasE2EE = !!data?.hasE2EE
  const hasPasskey = !!data?.wraps?.some(w => w.method === "PASSKEY_PRF")
  const devices = data?.devices ?? []

  const input = "w-full rounded-xl bg-black/40 border border-border px-4 py-3 text-base sm:text-sm text-foreground placeholder:text-subtle outline-none focus:border-accent/50 transition-colors"

  return (
    <div className="p-6 rounded-2xl bg-surface border border-border space-y-5">
      <div className="flex items-center gap-2">
        <ShieldCheck size={15} className="text-accent-bright" />
        <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">End-to-end encryption</h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-6"><Loader2 className="animate-spin text-subtle" size={20} /></div>
      ) : !hasE2EE ? (
        /* ── Not set up: enable ── */
        <div className="space-y-4">
          <p className="text-sm text-muted leading-relaxed">
            Turn on encryption so only you and the person you&apos;re chatting with can read your DMs — not even Kaiveron.
            Protect your key with a <b className="text-foreground">password</b> (and optionally a <b className="text-foreground">passkey</b>) so it works on all your devices.
          </p>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-subtle mb-1.5">Encryption password</label>
            <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="At least 8 characters" className={input} />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-subtle mb-1.5">Confirm password</label>
            <input type="password" value={pw2} onChange={e => setPw2(e.target.value)} placeholder="Re-enter password" className={input} />
          </div>
          {isPasskeySupported && (
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input type="checkbox" checked={withPasskey} onChange={e => setWithPasskey(e.target.checked)} className="h-4 w-4 accent-[var(--app-accent)]" />
              <span className="flex items-center gap-1.5 text-sm text-muted"><Fingerprint size={14} className="text-accent-bright" /> Also add a passkey (Face ID / fingerprint)</span>
            </label>
          )}
          <p className="text-[11px] leading-relaxed text-amber-400/80">
            ⚠ If you forget this password (and have no passkey), your encrypted messages can&apos;t be recovered. There&apos;s no reset.
          </p>
          <button onClick={doSetup} disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-[11px] font-black uppercase tracking-widest text-black transition-all hover:bg-accent-bright active:scale-[0.99] disabled:opacity-50">
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />} Turn on encryption
          </button>
        </div>
      ) : !unlocked ? (
        /* ── Set up elsewhere, locked here: unlock ── */
        <div className="space-y-4">
          <p className="text-sm text-muted leading-relaxed">Encryption is on for your account, but this device is locked. Unlock it to read and send encrypted messages here.</p>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-subtle mb-1.5">Encryption password</label>
            <input type="password" value={unlockPw} onChange={e => setUnlockPw(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && unlockPw) doUnlock({ password: unlockPw }) }} placeholder="Your encryption password" className={input} />
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button onClick={() => doUnlock({ password: unlockPw })} disabled={busy || !unlockPw} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent py-3 text-[11px] font-black uppercase tracking-widest text-black transition-all hover:bg-accent-bright active:scale-[0.99] disabled:opacity-50">
              {busy ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />} Unlock with password
            </button>
            {hasPasskey && isPasskeySupported && (
              <button onClick={() => doUnlock({ passkey: true })} disabled={busy} className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-foreground transition-all hover:bg-surface active:scale-95 disabled:opacity-50">
                <Fingerprint size={14} /> Passkey
              </button>
            )}
          </div>
        </div>
      ) : (
        /* ── Set up + unlocked here ── */
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2.5 text-sm font-semibold text-emerald-400">
            <Check size={15} /> Encryption is on and this device is unlocked.
          </div>

          <div>
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-subtle">Your devices</p>
            <div className="space-y-2">
              {devices.map(d => {
                const Icon = /iphone|android/i.test(d.name) ? Smartphone : Monitor
                return (
                  <div key={d.id} className="flex items-center gap-3 rounded-xl border border-border bg-black/30 px-3 py-2.5">
                    <Icon size={16} className="text-subtle" />
                    <span className="flex-1 text-sm font-semibold text-foreground">{d.name}</span>
                    {d.revoked && <span className="text-[10px] font-black uppercase text-rose-400">Revoked</span>}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            {!hasPasskey && isPasskeySupported && (
              <button onClick={doAddPasskey} disabled={busy} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 py-3 text-[11px] font-black uppercase tracking-widest text-foreground transition-all hover:bg-surface active:scale-95 disabled:opacity-50">
                {busy ? <Loader2 size={14} className="animate-spin" /> : <Fingerprint size={14} />} Add a passkey
              </button>
            )}
            <button onClick={() => { lockThisDevice(); setUnlocked(false); push("Locked on this device", "info") }} className="flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 px-4 py-3 text-[11px] font-black uppercase tracking-widest text-muted transition-all hover:text-foreground active:scale-95">
              <Lock size={14} /> Lock this device
            </button>
          </div>
          <p className="text-[11px] leading-relaxed text-subtle">Messages encrypt automatically in chats where both people have encryption on.</p>
        </div>
      )}
    </div>
  )
}
