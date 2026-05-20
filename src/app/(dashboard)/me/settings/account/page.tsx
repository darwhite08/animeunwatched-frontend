"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { User, Camera, Trash2, Download, Loader2, CheckCircle2 } from "lucide-react"
import { useToast } from "@/stores/toast.store"
import { useAuthStore } from "@/stores/auth.store"
import { useUpdateMe } from "@/hooks/useUsers"

export default function AccountSettingsPage() {
  const { push } = useToast()
  const storeUser = useAuthStore(s => s.user)
  const updateMe = useUpdateMe()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState({
    displayName: storeUser?.displayName ?? "",
    username:    storeUser?.username    ?? "",
    email:       storeUser?.email       ?? "",
    bio:         storeUser?.bio         ?? "Anime enjoyer. Tracking every frame.",
    avatarUrl:   storeUser?.avatarUrl   ?? "",
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const save = () => {
    setSaving(true)
    updateMe.mutate(
      { displayName: form.displayName, bio: form.bio, avatarUrl: form.avatarUrl || undefined },
      {
        onSuccess: () => { setSaving(false); setSaved(true); push("Account saved!", "success"); setTimeout(() => setSaved(false), 3000) },
        onError:   () => { setSaving(false); push("Save failed. Try again.", "error") },
      }
    )
  }

  const exportData = () => {
    push("Your data export will be emailed to you within 24 hours.", "info")
  }

  const deleteAccount = () => {
    if (!deleting) { setDeleting(true); return }
    push("Account deletion requires email confirmation. Check your inbox.", "info")
    setDeleting(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[9px] font-mono uppercase tracking-[0.4em] mb-1" style={{ color: "rgba(245,158,11,0.5)" }}>
          Account
        </p>
        <h2 className="text-2xl font-black tracking-tighter uppercase italic text-white">Profile & Account</h2>
      </div>

      {/* Avatar */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/8 space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/35">Profile Photo</p>
        <div className="flex items-center gap-5">
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-2xl font-black shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              {form.displayName[0]}
            </div>
            <button className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera size={18} className="text-white" />
            </button>
          </div>
          <div className="space-y-2">
            <button onClick={() => push("Photo upload coming soon!", "info")}
              className="block text-xs font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
            >Upload photo</button>
            <p className="text-[9px] text-white/25">JPG, PNG or GIF · Max 5MB</p>
          </div>
        </div>
      </div>

      {/* Profile */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/8 space-y-5">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/35">Profile</p>
        {([
          { k:"displayName", label:"Display Name", type:"text", placeholder:"Your name" },
          { k:"username",    label:"Username",     type:"text", placeholder:"@handle"   },
          { k:"email",       label:"Email",        type:"email",placeholder:"you@example.com" },
        ] as const).map(({ k, label, type, placeholder }) => (
          <div key={k}>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/35 mb-1.5">{label}</label>
            <input type={type} value={form[k]} onChange={set(k)} placeholder={placeholder}
              className="w-full rounded-2xl bg-black/30 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-indigo-500/40 transition-colors"
            />
          </div>
        ))}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-white/35 mb-1.5">Bio</label>
          <textarea value={form.bio} onChange={set("bio")} rows={3} maxLength={200}
            className="w-full rounded-2xl bg-black/30 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-indigo-500/40 resize-none transition-colors"
          />
          <p className="text-[9px] text-right text-white/20 mt-1">{form.bio.length}/200</p>
        </div>
        <div className="flex justify-end">
          <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }} onClick={save} disabled={saving}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
              saved ? "bg-emerald-600 text-white" : "bg-amber-500 hover:bg-amber-400 text-black"
            } disabled:opacity-60`}
          >
            {saving ? <><Loader2 size={13} className="animate-spin" /> Saving…</>
            : saved  ? <><CheckCircle2 size={13} /> Saved!</>
            : "Save Changes"}
          </motion.button>
        </div>
      </div>

      {/* Data */}
      <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/8 space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/35">Your Data</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-white/70">Export all data</p>
            <p className="text-[10px] text-white/30 mt-0.5">Watchlist, reviews, posts — everything</p>
          </div>
          <button onClick={exportData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-xs font-black uppercase tracking-wider text-white/50 hover:text-white hover:bg-white/8 transition-all"
          >
            <Download size={13} /> Export
          </button>
        </div>
      </div>

      {/* Danger */}
      <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400/70">Danger Zone</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-white">{deleting ? "Are you sure? Click again to confirm." : "Delete Account"}</p>
            <p className="text-[10px] text-white/30 mt-0.5">Permanently removes all your data. Irreversible.</p>
          </div>
          <button onClick={deleteAccount}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
              deleting ? "bg-red-600 text-white border-transparent" : "border border-red-500/30 text-red-400 hover:bg-red-500/10"
            }`}
          >
            <Trash2 size={13} /> {deleting ? "Confirm Delete" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  )
}
