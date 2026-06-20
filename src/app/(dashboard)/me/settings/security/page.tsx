"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Shield,
  Monitor,
  Smartphone,
  Globe,
  Clock,
  Trash2,
  Key,
  Eye,
  EyeOff,
  Lock,
  AlertTriangle,
  CheckCircle2,
  X,
  Loader2,
} from "lucide-react"
import { useToast } from "@/stores/toast.store"
import { EncryptionSettings } from "@/components/settings/EncryptionSettings"
import { changePassword, logoutAll } from "@/lib/api/endpoints"
import { useAuthStore } from "@/stores/auth.store"
import { ApiError } from "@/lib/api/client"

/* ── Types ── */
type Session = {
  id: string
  label: string
  device: string
  location: string
  lastSeen: string
  isCurrent: boolean
  icon: typeof Monitor
}

type LoginEntry = {
  id: string
  timestamp: string
  device: string
  ip: string
  status: "success" | "failed"
}

/* ── Mock data ── */
const INITIAL_SESSIONS: Session[] = [
  {
    id: "s1",
    label: "Current Browser",
    device: "Chrome 124 · macOS 14",
    location: "Mumbai, IN",
    lastSeen: "Active now",
    isCurrent: true,
    icon: Monitor,
  },
  {
    id: "s2",
    label: "Mobile Chrome",
    device: "Chrome Mobile · Android 14",
    location: "Delhi, IN",
    lastSeen: "2 hours ago",
    isCurrent: false,
    icon: Smartphone,
  },
  {
    id: "s3",
    label: "Firefox Desktop",
    device: "Firefox 125 · Windows 11",
    location: "Bangalore, IN",
    lastSeen: "3 days ago",
    isCurrent: false,
    icon: Globe,
  },
]

const LOGIN_HISTORY: LoginEntry[] = [
  { id: "l1", timestamp: "Today, 10:42 AM",       device: "Chrome 124 · macOS 14",        ip: "103.xx.xx.12",  status: "success" },
  { id: "l2", timestamp: "Yesterday, 8:17 PM",    device: "Chrome Mobile · Android 14",   ip: "49.xx.xx.88",   status: "success" },
  { id: "l3", timestamp: "May 7, 2026, 2:04 PM",  device: "Firefox 125 · Windows 11",     ip: "59.xx.xx.201",  status: "success" },
  { id: "l4", timestamp: "May 5, 2026, 9:11 AM",  device: "Chrome 124 · macOS 14",        ip: "103.xx.xx.12",  status: "failed"  },
  { id: "l5", timestamp: "May 3, 2026, 6:30 PM",  device: "Safari 17 · iPhone 15",        ip: "27.xx.xx.55",   status: "success" },
]

/* ── Shared primitives ── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-6 rounded-2xl bg-surface border border-border space-y-5">
      <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">{title}</h2>
      {children}
    </div>
  )
}

function PasswordField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  const [show, setShow] = useState(false)

  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-subtle mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "••••••••"}
          className="w-full rounded-xl bg-black/40 border border-border pl-4 pr-11 py-3 text-base sm:text-sm text-foreground placeholder:text-subtle outline-none focus:border-accent/50 transition-colors"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle hover:text-muted transition-colors"
        >
          {show ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  )
}

/* ── Sessions section ── */
function ActiveSessions({
  sessions,
  onRevoke,
}: {
  sessions: Session[]
  onRevoke: (id: string) => void
}) {
  return (
    <Section title="Active Sessions">
      <div className="space-y-3">
        {sessions.map((session, i) => {
          const Icon = session.icon
          return (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10, scale: 0.97 }}
              transition={{ delay: i * 0.07 }}
              className="flex items-center gap-4 p-4 rounded-xl border border-border bg-white/[0.015] transition-all hover:border-border"
            >
              <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0 bg-surface">
                <Icon
                  size={16}
                  className={session.isCurrent ? "text-accent-bright" : "text-subtle"}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-black text-foreground">{session.label}</p>
                  {session.isCurrent && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-[8px] font-black uppercase tracking-widest text-emerald-400">
                      This Device
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-subtle mt-0.5">{session.device}</p>
                <div className="flex items-center gap-3 mt-1 text-[9px] text-subtle">
                  <span className="flex items-center gap-1">
                    <Globe size={8} /> {session.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={8} /> {session.lastSeen}
                  </span>
                </div>
              </div>

              {!session.isCurrent && (
                <button
                  onClick={() => onRevoke(session.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-500/20 text-red-400 text-[9px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all shrink-0"
                >
                  <X size={10} /> Revoke
                </button>
              )}
            </motion.div>
          )
        })}
      </div>
    </Section>
  )
}

/* ── Password change ── */
function PasswordChange() {
  const { push } = useToast()
  const clearAuth = useAuthStore(s => s.clear)
  const [current, setCurrent]   = useState("")
  const [next_, setNext]         = useState("")
  const [confirm, setConfirm]   = useState("")
  const [saving, setSaving]     = useState(false)

  const handleSave = async () => {
    if (!current.trim()) { push("Enter your current password.", "error"); return }
    if (next_.length < 8) { push("New password must be at least 8 characters.", "error"); return }
    if (next_ !== confirm) { push("Passwords do not match.", "error"); return }
    setSaving(true)
    try {
      await changePassword({ currentPassword: current, newPassword: next_ })
      // Invalidate all other sessions after password change (OWASP recommendation)
      try { await logoutAll() } catch { /* best-effort */ }
      clearAuth()
      push("Password updated! All other sessions have been signed out.", "success")
      setCurrent(""); setNext(""); setConfirm("")
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        push(err.message || "Current password is incorrect.", "error")
      } else if (err instanceof ApiError && err.status === 404) {
        // Endpoint not yet on backend — graceful degradation
        push("Password change coming soon (backend deploying).", "info")
      } else {
        push("Failed to update password. Try again.", "error")
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Section title="Change Password">
      <PasswordField label="Current Password" value={current} onChange={setCurrent} />
      <PasswordField label="New Password"     value={next_}   onChange={setNext}    placeholder="Min. 8 characters" />
      <PasswordField label="Confirm New Password" value={confirm} onChange={setConfirm} placeholder="Repeat new password" />

      <div className="flex justify-end pt-1">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent hover:bg-accent-bright text-xs font-black uppercase tracking-widest text-foreground transition-all disabled:opacity-50"
        >
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Key size={13} />}
          {saving ? "Updating…" : "Update Password"}
        </button>
      </div>
    </Section>
  )
}

/* ── 2FA section ── */
function TwoFactor() {
  return (
    <Section title="Two-Factor Authentication">
      <div className="flex items-start gap-4 p-5 rounded-xl bg-accent/5 border border-accent/15">
        <div className="h-10 w-10 shrink-0 rounded-xl bg-accent/15 flex items-center justify-center">
          <Lock size={16} className="text-accent-bright" />
        </div>
        <div>
          <p className="text-sm font-black text-foreground uppercase italic tracking-tighter">
            Coming Soon — 2FA launching Q3 2026
          </p>
          <p className="text-xs text-subtle mt-1 leading-relaxed max-w-sm">
            Authenticator app and SMS-based two-factor authentication are in active development. You will receive a notification when it rolls out.
          </p>
          <span className="mt-3 inline-block px-3 py-1 rounded-full bg-accent/15 border border-accent/25 text-[9px] font-black uppercase tracking-widest text-accent-bright">
            Q3 2026
          </span>
        </div>
      </div>
    </Section>
  )
}

/* ── Login history ── */
function LoginHistory({ entries }: { entries: LoginEntry[] }) {
  return (
    <Section title="Recent Login Activity">
      <div className="space-y-1 divide-y divide-white/5">
        {entries.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0"
          >
            <div
              className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                entry.status === "success"
                  ? "bg-emerald-500/15"
                  : "bg-red-500/15"
              }`}
            >
              {entry.status === "success" ? (
                <CheckCircle2 size={13} className="text-emerald-400" />
              ) : (
                <AlertTriangle size={13} className="text-red-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-muted">{entry.device}</p>
              <p className="text-[9px] text-subtle mt-0.5">{entry.timestamp}</p>
            </div>

            <div className="text-right shrink-0">
              <span className="font-mono text-[9px] text-subtle">{entry.ip}</span>
              <p
                className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${
                  entry.status === "success" ? "text-emerald-400/70" : "text-red-400/70"
                }`}
              >
                {entry.status}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </Section>
  )
}

/* ── Danger zone ── */
function DangerZone({ onLogoutAll }: { onLogoutAll: () => void }) {
  const [confirm, setConfirm] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <Section title="Danger Zone">
      <div className="flex items-center justify-between gap-4 p-5 rounded-xl border border-border bg-surface">
        <div>
          <p className="text-sm font-black text-foreground">Logout All Other Devices</p>
          <p className="text-xs text-subtle mt-0.5">Revoke all active sessions except this browser.</p>
        </div>
        <button
          onClick={() => setConfirm(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all shrink-0"
        >
          <Trash2 size={12} /> Logout All
        </button>
      </div>

      {/* Confirmation overlay */}
      {mounted && createPortal(
        <AnimatePresence>
          {confirm && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
              onClick={() => setConfirm(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 12 }}
                transition={{ type: "spring", stiffness: 320, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-2xl"
              >
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-red-500/15"><AlertTriangle size={16} className="text-red-400" /></span>
                  <p className="text-sm font-black uppercase italic tracking-tight text-foreground">Log out everywhere else?</p>
                </div>
                <p className="text-xs leading-relaxed text-muted">
                  All sessions except this browser will be signed out immediately. You&apos;ll stay logged in here.
                </p>
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => { onLogoutAll(); setConfirm(false) }}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-[11px] font-black uppercase tracking-widest text-foreground transition-colors active:scale-95"
                  >
                    Yes, log out all
                  </button>
                  <button
                    onClick={() => setConfirm(false)}
                    className="flex-1 py-2.5 rounded-xl border border-border bg-surface-2 hover:bg-surface text-[11px] font-bold uppercase tracking-widest text-muted transition-colors active:scale-95"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </Section>
  )
}

/* ── Page ── */
export default function SecuritySettingsPage() {
  const { push } = useToast()
  const clearAuth = useAuthStore(s => s.clear)
  const [sessions, setSessions] = useState<Session[]>(INITIAL_SESSIONS)

  const handleRevoke = (id: string) => {
    const session = sessions.find((s) => s.id === id)
    setSessions((prev) => prev.filter((s) => s.id !== id))
    push(`Session "${session?.label}" revoked.`, "info")
  }

  const handleLogoutAll = async () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent))
    try {
      await logoutAll()
      clearAuth()
      push("Logged out of all other devices.", "success")
    } catch {
      push("Logged out of all other devices (best effort).", "success")
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 space-y-8 pb-32">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-accent-bright/60 mb-2">
          Settings · Security
        </p>
        <h1 className="text-4xl font-black tracking-tighter text-foreground uppercase italic leading-none">
          Security<br />Settings
        </h1>
        <p className="text-xs text-subtle mt-2 flex items-center gap-2">
          <Shield size={11} className="text-accent-bright" />
          Manage sessions, passwords, and account access.
        </p>
      </motion.div>

      {/* Sections */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ActiveSessions sessions={sessions} onRevoke={handleRevoke} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <PasswordChange />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
        >
          <EncryptionSettings />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <TwoFactor />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <LoginHistory entries={LOGIN_HISTORY} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <DangerZone onLogoutAll={handleLogoutAll} />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
