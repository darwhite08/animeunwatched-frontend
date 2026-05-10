"use client"

import { useState } from "react"
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
    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/8 space-y-5">
      <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">{title}</h2>
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
      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/35 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? "••••••••"}
          className="w-full rounded-xl bg-black/40 border border-white/10 pl-4 pr-11 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-indigo-500/50 transition-colors"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
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
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                session.isCurrent
                  ? "bg-indigo-500/8 border-indigo-500/20"
                  : "bg-white/[0.015] border-white/8 hover:border-white/15"
              }`}
            >
              <div
                className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${
                  session.isCurrent ? "bg-indigo-500/15" : "bg-white/5"
                }`}
              >
                <Icon
                  size={16}
                  className={session.isCurrent ? "text-indigo-400" : "text-white/30"}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-black text-white">{session.label}</p>
                  {session.isCurrent && (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-[8px] font-black uppercase tracking-widest text-emerald-400">
                      This Device
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-white/35 mt-0.5">{session.device}</p>
                <div className="flex items-center gap-3 mt-1 text-[9px] text-white/25">
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
  const [current, setCurrent]   = useState("")
  const [next_, setNext]         = useState("")
  const [confirm, setConfirm]   = useState("")
  const [saving, setSaving]     = useState(false)

  const handleSave = async () => {
    if (!current.trim()) { push("Enter your current password.", "error"); return }
    if (next_.length < 8) { push("New password must be at least 8 characters.", "error"); return }
    if (next_ !== confirm) { push("Passwords do not match.", "error"); return }
    setSaving(true)
    await new Promise((r) => setTimeout(r, 900))
    setSaving(false)
    setCurrent(""); setNext(""); setConfirm("")
    push("Password updated successfully!", "success")
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
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-black uppercase tracking-widest text-white transition-all disabled:opacity-50"
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
      <div className="flex items-start gap-4 p-5 rounded-xl bg-indigo-500/5 border border-indigo-500/15">
        <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-500/15 flex items-center justify-center">
          <Lock size={16} className="text-indigo-400" />
        </div>
        <div>
          <p className="text-sm font-black text-white uppercase italic tracking-tighter">
            Coming Soon — 2FA launching Q3 2026
          </p>
          <p className="text-xs text-white/35 mt-1 leading-relaxed max-w-sm">
            Authenticator app and SMS-based two-factor authentication are in active development. You will receive a notification when it rolls out.
          </p>
          <span className="mt-3 inline-block px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/25 text-[9px] font-black uppercase tracking-widest text-indigo-400">
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
              <p className="text-xs font-bold text-white/75">{entry.device}</p>
              <p className="text-[9px] text-white/30 mt-0.5">{entry.timestamp}</p>
            </div>

            <div className="text-right shrink-0">
              <span className="font-mono text-[9px] text-white/25">{entry.ip}</span>
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

  return (
    <Section title="Danger Zone">
      <AnimatePresence mode="wait">
        {!confirm ? (
          <motion.div
            key="prompt"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-between gap-4 p-5 rounded-xl border border-red-500/15 bg-red-500/5"
          >
            <div>
              <p className="text-sm font-black text-white">Logout All Other Devices</p>
              <p className="text-xs text-white/35 mt-0.5">
                Revoke all active sessions except this browser.
              </p>
            </div>
            <button
              onClick={() => setConfirm(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 text-red-400 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/10 transition-all shrink-0"
            >
              <Trash2 size={12} /> Logout All
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="p-5 rounded-xl border border-red-500/30 bg-red-500/8 space-y-4"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-400 shrink-0" />
              <p className="text-sm font-black text-white uppercase italic">
                Are you absolutely sure?
              </p>
            </div>
            <p className="text-xs text-white/40 leading-relaxed">
              All sessions except your current browser will be immediately invalidated. Any unsaved work in other tabs will be lost.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => { onLogoutAll(); setConfirm(false) }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-black uppercase tracking-widest text-white transition-colors"
              >
                Yes, Logout All
              </button>
              <button
                onClick={() => setConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white/50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Section>
  )
}

/* ── Page ── */
export default function SecuritySettingsPage() {
  const { push } = useToast()
  const [sessions, setSessions] = useState<Session[]>(INITIAL_SESSIONS)

  const handleRevoke = (id: string) => {
    const session = sessions.find((s) => s.id === id)
    setSessions((prev) => prev.filter((s) => s.id !== id))
    push(`Session "${session?.label}" revoked.`, "info")
  }

  const handleLogoutAll = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent))
    push("Logged out of all other devices.", "success")
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 space-y-8 pb-32">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-indigo-400/60 mb-2">
          Settings · Security
        </p>
        <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-none">
          Security<br />Settings
        </h1>
        <p className="text-xs text-white/30 mt-2 flex items-center gap-2">
          <Shield size={11} className="text-indigo-400" />
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
