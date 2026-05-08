"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  User, Bell, Shield, Palette, Globe, Trash2,
  Save, Loader2, CheckCircle2, ChevronRight, Moon, Sun,
} from "lucide-react"
import { useToast } from "@/stores/toast.store"

type Tab = "account" | "notifications" | "appearance" | "privacy"

const TABS: { id: Tab; label: string; icon: typeof User }[] = [
  { id: "account",       label: "Account",       icon: User    },
  { id: "notifications", label: "Notifications", icon: Bell    },
  { id: "appearance",    label: "Appearance",    icon: Palette },
  { id: "privacy",       label: "Privacy",       icon: Shield  },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("account")

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-10 pb-32">
      {/* Header */}
      <div>
        <p className="text-[9px] font-mono font-black uppercase tracking-[0.4em] text-indigo-400/60 mb-2">
          System Configuration
        </p>
        <h1 className="text-4xl font-black tracking-tighter text-white uppercase italic">Settings</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Tab sidebar */}
        <nav className="lg:w-56 flex lg:flex-col gap-1 flex-wrap">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left ${
                activeTab === tab.id
                  ? "bg-indigo-600/15 border border-indigo-500/20 text-white"
                  : "text-white/40 hover:bg-white/5 hover:text-white"
              }`}
            >
              <tab.icon size={15} className={activeTab === tab.id ? "text-indigo-400" : ""} />
              {tab.label}
            </button>
          ))}
        </nav>

        {/* Tab content */}
        <div className="flex-1">
          {activeTab === "account"       && <AccountTab />}
          {activeTab === "notifications" && <NotificationsTab />}
          {activeTab === "appearance"    && <AppearanceTab />}
          {activeTab === "privacy"       && <PrivacyTab />}
        </div>
      </div>
    </div>
  )
}

/* ── Account ── */
function AccountTab() {
  const { push } = useToast()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ displayName: "Priyanshu", username: "darwhite08", email: "chandrapriyanshu10@gmail.com" })
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }))

  const save = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 800))
    setSaving(false)
    push("Account settings saved!", "success")
  }

  return (
    <div className="space-y-6">
      <Section title="Identity">
        <Field label="Display Name" value={form.displayName} onChange={set("displayName")} />
        <Field label="Username" value={form.username} onChange={set("username")} />
        <Field label="Email" type="email" value={form.email} onChange={set("email")} />
        <SaveButton saving={saving} onClick={save} />
      </Section>

      <Section title="Password">
        <Field label="Current Password" type="password" value="" onChange={() => {}} placeholder="••••••••" />
        <Field label="New Password" type="password" value="" onChange={() => {}} placeholder="Min. 8 characters" />
        <SaveButton saving={false} onClick={() => push("Password updated!", "success")} label="Update Password" />
      </Section>

      <Section title="Danger Zone">
        <div className="p-5 rounded-2xl border border-red-500/20 bg-red-500/5 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-white">Delete Account</p>
            <p className="text-xs text-white/40 mt-0.5">Permanently delete all your data. This cannot be undone.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 text-red-400 text-xs font-black uppercase tracking-wider hover:bg-red-500/10 transition-colors">
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </Section>
    </div>
  )
}

/* ── Notifications ── */
function NotificationsTab() {
  const { push } = useToast()
  const [prefs, setPrefs] = useState({
    newFollower: true, mentionPost: true, pollResults: false,
    weeklyDigest: true, newEpisode: true, systemUpdates: false,
  })
  const toggle = (k: keyof typeof prefs) => setPrefs(p => ({ ...p, [k]: !p[k] }))

  const items = [
    { key: "newFollower",   label: "New Follower",          desc: "When someone follows your profile" },
    { key: "mentionPost",   label: "Mentions",              desc: "When someone @mentions you in a post" },
    { key: "pollResults",   label: "Poll Results",          desc: "When a poll you voted in closes" },
    { key: "weeklyDigest",  label: "Weekly Digest",         desc: "Your weekly anime activity summary" },
    { key: "newEpisode",    label: "New Episodes",          desc: "Episodes airing for anime in your list" },
    { key: "systemUpdates", label: "Platform Updates",      desc: "Feature announcements and news" },
  ] as const

  return (
    <Section title="Notification Preferences">
      <div className="space-y-1">
        {items.map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
            <div>
              <p className="text-sm font-bold text-white">{label}</p>
              <p className="text-xs text-white/35 mt-0.5">{desc}</p>
            </div>
            <Toggle checked={prefs[key]} onChange={() => toggle(key)} />
          </div>
        ))}
      </div>
      <SaveButton saving={false} onClick={() => push("Notification preferences saved!", "success")} />
    </Section>
  )
}

/* ── Appearance ── */
function AppearanceTab() {
  const { push } = useToast()
  const [theme, setTheme] = useState<"dark" | "darker">("dark")
  const [accent, setAccent] = useState("indigo")

  const ACCENTS = [
    { id: "indigo", color: "bg-indigo-600" },
    { id: "violet", color: "bg-violet-600" },
    { id: "rose",   color: "bg-rose-600" },
    { id: "emerald",color: "bg-emerald-600" },
    { id: "amber",  color: "bg-amber-500" },
  ]

  return (
    <div className="space-y-6">
      <Section title="Theme">
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: "dark",   label: "Dark",   icon: Moon, desc: "Midnight black background" },
            { id: "darker", label: "AMOLED",  icon: Sun,  desc: "Pure black for OLED displays" },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id as "dark" | "darker")}
              className={`p-5 rounded-2xl border text-left transition-all ${
                theme === t.id ? "border-indigo-500/50 bg-indigo-500/10" : "border-white/8 bg-white/[0.02] hover:border-white/15"
              }`}
            >
              <t.icon size={20} className={theme === t.id ? "text-indigo-400" : "text-white/30"} />
              <p className="font-bold text-sm mt-3 text-white">{t.label}</p>
              <p className="text-[10px] text-white/30 mt-0.5">{t.desc}</p>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Accent Color">
        <div className="flex items-center gap-3">
          {ACCENTS.map(a => (
            <button
              key={a.id}
              onClick={() => setAccent(a.id)}
              className={`w-8 h-8 rounded-full ${a.color} transition-all ${accent === a.id ? "ring-2 ring-white/60 ring-offset-2 ring-offset-black scale-110" : "opacity-60 hover:opacity-100"}`}
            />
          ))}
        </div>
      </Section>

      <SaveButton saving={false} onClick={() => push("Appearance saved!", "success")} />
    </div>
  )
}

/* ── Privacy ── */
function PrivacyTab() {
  const { push } = useToast()
  const [prefs, setPrefs] = useState({ publicProfile: true, showWatchlist: true, showStreak: false })
  const toggle = (k: keyof typeof prefs) => setPrefs(p => ({ ...p, [k]: !p[k] }))

  return (
    <Section title="Privacy Controls">
      <div className="space-y-1">
        {([
          { key: "publicProfile",  label: "Public Profile",       desc: "Anyone can view your profile page" },
          { key: "showWatchlist",  label: "Public Watchlist",      desc: "Your watchlist is visible to others" },
          { key: "showStreak",     label: "Show Streak on Profile", desc: "Display your streak count publicly" },
        ] as const).map(({ key, label, desc }) => (
          <div key={key} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
            <div>
              <p className="text-sm font-bold text-white">{label}</p>
              <p className="text-xs text-white/35 mt-0.5">{desc}</p>
            </div>
            <Toggle checked={prefs[key]} onChange={() => toggle(key)} />
          </div>
        ))}
      </div>
      <SaveButton saving={false} onClick={() => push("Privacy settings saved!", "success")} />
    </Section>
  )
}

/* ── Shared UI primitives ── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/8 space-y-5">
      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">{title}</h3>
      {children}
    </div>
  )
}

function Field({ label, value, onChange, type = "text", placeholder }: {
  label: string; value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string; placeholder?: string
}) {
  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/35 mb-1.5">{label}</label>
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        className="w-full rounded-xl bg-black/40 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-indigo-500/50 transition-colors"
      />
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-10 h-5 rounded-full transition-colors ${checked ? "bg-indigo-600" : "bg-white/10"}`}
    >
      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : "translate-x-0.5"}`} />
    </button>
  )
}

function SaveButton({ saving, onClick, label = "Save Changes" }: { saving: boolean; onClick: () => void; label?: string }) {
  return (
    <div className="flex justify-end pt-2">
      <button
        onClick={onClick}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-black uppercase tracking-widest text-white transition-all disabled:opacity-50"
      >
        {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
        {saving ? "Saving…" : label}
      </button>
    </div>
  )
}
