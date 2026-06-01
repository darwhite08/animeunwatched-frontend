"use client"

import { useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  User, Shield, Bell, Palette, CreditCard, Link as LinkIcon,
  Lock, ChevronRight, Eye, Smartphone, Loader2, CheckCircle2
} from "lucide-react"
import { useAuthStore } from "@/stores/auth.store"
import { useUpdateMe } from "@/hooks/useUsers"
import { useToast } from "@/stores/toast.store"

const SECTIONS = [
  {
    group: "Profile",
    items: [
      { href:"/settings/account",    icon:User,       label:"Account",           desc:"Name, username, email, bio",          color:"text-accent-bright", bg:"bg-accent/10" },
      { href:"/settings/appearance", icon:Palette,    label:"Appearance",        desc:"Theme, accent color, text size",      color:"text-violet-400", bg:"bg-violet-500/10" },
    ]
  },
  {
    group: "Privacy & Security",
    items: [
      { href:"/settings/privacy",   icon:Eye,        label:"Privacy",           desc:"Who can see what on your profile",     color:"text-emerald-400",bg:"bg-emerald-500/10"},
      { href:"/settings/security",  icon:Lock,       label:"Security",          desc:"Password, sessions, 2FA",              color:"text-accent-bright",  bg:"bg-accent/10"  },
    ]
  },
  {
    group: "Notifications",
    items: [
      { href:"/settings/notifications", icon:Bell,   label:"Notifications",     desc:"What alerts you receive",              color:"text-rose-400",   bg:"bg-rose-500/10"   },
      { href:"/notifications/settings", icon:Smartphone, label:"Push & Email",  desc:"Delivery channels and digest",         color:"text-blue-400",   bg:"bg-blue-500/10"   },
    ]
  },
  {
    group: "Billing & Connections",
    items: [
      { href:"/settings/billing",   icon:CreditCard, label:"Billing & Plan",    desc:"Free vs Pro, payment method",          color:"text-yellow-400", bg:"bg-yellow-500/10" },
      { href:"/settings/connected", icon:LinkIcon,   label:"Connected Accounts", desc:"MAL, AniList, import/export",         color:"text-teal-400",   bg:"bg-teal-500/10"   },
    ]
  },
]

export default function ProfileSettingsIndex() {
  const user      = useAuthStore(s => s.user)
  const updateMe  = useUpdateMe()
  const { push }  = useToast()

  const [form, setForm] = useState({
    displayName: user?.displayName ?? "",
    bio:         user?.bio         ?? "",
  })
  const [saving, setSaving]   = useState(false)
  const [saved,  setSaved]    = useState(false)

  const setField = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [k]: e.target.value }))

  const save = () => {
    setSaving(true)
    updateMe.mutate(
      { displayName: form.displayName || undefined, bio: form.bio || undefined },
      {
        onSuccess: () => {
          setSaving(false); setSaved(true)
          push("Settings saved!", "success")
          setTimeout(() => setSaved(false), 3000)
        },
        onError: () => {
          setSaving(false)
          push("Save failed. Try again.", "error")
        },
      },
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 pb-32 space-y-8">
      <div>
        <p className="text-[9px] font-mono uppercase tracking-[0.4em] text-accent-bright/60 mb-2">Preferences</p>
        <h1 className="text-3xl font-black tracking-tighter uppercase italic text-foreground">
          Settings<span style={{color:"var(--app-accent)"}}>.</span>
        </h1>
        <p className="text-subtle text-sm mt-1">
          {user ? `Signed in as @${user.username}` : "Manage your account, privacy, and preferences"}
        </p>
      </div>

      {/* Quick-edit profile card */}
      <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-subtle">Quick Edit</p>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-subtle mb-1.5">
            Display Name
          </label>
          <input
            type="text"
            value={form.displayName}
            onChange={setField("displayName")}
            placeholder="Your name"
            className="w-full rounded-2xl bg-black/30 border border-border px-4 py-3 text-sm text-foreground placeholder:text-subtle outline-none focus:border-accent/40 transition-colors"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-subtle mb-1.5">
            Bio
          </label>
          <textarea
            value={form.bio}
            onChange={setField("bio")}
            rows={2}
            maxLength={200}
            placeholder="Tell the community about yourself…"
            className="w-full rounded-2xl bg-black/30 border border-border px-4 py-3 text-sm text-foreground placeholder:text-subtle outline-none focus:border-accent/40 resize-none transition-colors"
          />
          <p className="text-[9px] text-right text-subtle mt-1">{form.bio.length}/200</p>
        </div>
        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={save}
            disabled={saving}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
              saved ? "bg-emerald-600 text-foreground" : "bg-accent hover:bg-accent-bright text-black"
            } disabled:opacity-60`}
          >
            {saving ? <><Loader2 size={13} className="animate-spin" /> Saving…</>
            : saved  ? <><CheckCircle2 size={13} /> Saved!</>
            : "Save Changes"}
          </motion.button>
        </div>
      </div>

      {SECTIONS.map((section, si) => (
        <div key={section.group} className="space-y-2">
          <p className="text-[9px] font-black uppercase tracking-[0.35em] text-subtle px-1">{section.group}</p>
          {section.items.map((item, i) => (
            <motion.div key={item.href} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:(si*2+i)*0.05 }}>
              <Link href={item.href}
                className="flex items-center gap-4 p-5 rounded-2xl bg-surface border border-border hover:border-white/18 hover:bg-surface transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                  <item.icon size={18} className={item.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-muted group-hover:text-foreground transition-colors">{item.label}</p>
                  <p className="text-[10px] text-subtle mt-0.5">{item.desc}</p>
                </div>
                <ChevronRight size={14} className="text-subtle group-hover:text-muted group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  )
}
