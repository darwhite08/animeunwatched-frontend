"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import NextImage from "next/image"
import { Camera, Trash2, Download, Loader2, CheckCircle2, Link2, AlertCircle, Lock } from "lucide-react"
import { useToast } from "@/stores/toast.store"
import { useAuthStore } from "@/stores/auth.store"
import { useUpdateMe } from "@/hooks/useUsers"
import { useImageUpload } from "@/hooks/useImageUpload"
import { updateSlug, checkSlugAvailable, exportMyData, deleteAccount } from "@/lib/api/endpoints"
import { validateSlug } from "@/lib/utils/slug"
import { useRouter } from "next/navigation"

export default function AccountSettingsPage() {
  const { push }    = useToast()
  const router      = useRouter()
  const storeUser   = useAuthStore(s => s.user)
  const setUser     = useAuthStore(s => s.setUser)
  const clearAuth   = useAuthStore(s => s.clear)
  const updateMe    = useUpdateMe()

  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [form, setForm] = useState({
    displayName: storeUser?.displayName ?? "",
    bio:         storeUser?.bio         ?? "",
    avatarUrl:   storeUser?.avatarUrl   ?? "",
  })

  // Avatar upload
  const { upload: uploadAvatar, isUploading: avatarUploading, error: avatarError, progress: avatarProgress } = useImageUpload("avatar")
  const fileRef = useRef<HTMLInputElement>(null)

  // Data export
  const [exporting, setExporting] = useState(false)

  // Account deletion (2-step + password)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deletePassword, setDeletePassword] = useState("")
  const [deleting, setDeleting] = useState(false)

  // Slug change state
  const [slugInput,     setSlugInput]     = useState(storeUser?.slug ?? "")
  const [slugStatus,    setSlugStatus]    = useState<"idle" | "checking" | "available" | "taken" | "invalid">("idle")
  const [slugError,     setSlugError]     = useState<string | null>(null)
  const [slugSaving,    setSlugSaving]    = useState(false)
  const slugChanged = slugInput !== (storeUser?.slug ?? "")

  // Debounced availability check
  useEffect(() => {
    if (!slugChanged || !slugInput) { setSlugStatus("idle"); setSlugError(null); return }
    const err = validateSlug(slugInput)
    if (err) { setSlugStatus("invalid"); setSlugError(err); return }

    setSlugStatus("checking")
    const timer = setTimeout(async () => {
      try {
        const res = await checkSlugAvailable(slugInput)
        setSlugStatus(res.available ? "available" : "taken")
        setSlugError(res.available ? null : "Already taken — try another")
      } catch {
        setSlugStatus("idle")
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [slugInput, slugChanged])

  const saveSlug = async () => {
    if (slugStatus !== "available" || !slugChanged) return
    setSlugSaving(true)
    try {
      const res = await updateSlug(slugInput)
      if (storeUser) setUser({ ...storeUser, slug: res.user.slug })
      push("URL updated! Redirecting…", "success")
      setTimeout(() => router.replace(`/user/${res.user.slug}/settings/account`), 800)
    } catch {
      push("Failed to update URL slug. Try again.", "error")
    } finally {
      setSlugSaving(false)
    }
  }

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const save = () => {
    setSaving(true)
    updateMe.mutate(
      { displayName: form.displayName, bio: form.bio, avatarUrl: form.avatarUrl || undefined },
      {
        onSuccess: ({ user }) => {
          setSaving(false); setSaved(true)
          if (storeUser) setUser({ ...storeUser, ...user })
          push("Account saved!", "success")
          setTimeout(() => setSaved(false), 3000)
        },
        onError: () => { setSaving(false); push("Save failed. Try again.", "error") },
      }
    )
  }

  // Avatar: pick file → R2 upload → updateMe with new URL
  const onAvatarPick = async (file: File) => {
    try {
      const { publicUrl } = await uploadAvatar(file)
      setForm(f => ({ ...f, avatarUrl: publicUrl }))
      // Persist immediately so the new avatar shows across the app
      updateMe.mutate({ avatarUrl: publicUrl }, {
        onSuccess: ({ user }) => {
          if (storeUser) setUser({ ...storeUser, ...user })
          push("Profile photo updated", "success")
        },
        onError: () => push("Saved upload but couldn't update profile — try again", "error"),
      })
    } catch {
      // useImageUpload sets `error` — surface it
      if (avatarError) push(avatarError, "error")
    }
  }

  const exportData = async () => {
    setExporting(true)
    try {
      const data = await exportMyData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement("a")
      a.href = url
      a.download = `kaiveron-export-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a); a.click(); a.remove()
      URL.revokeObjectURL(url)
      push("Your data was downloaded as a JSON file.", "success")
    } catch {
      push("Couldn't export your data. Try again.", "error")
    } finally {
      setExporting(false)
    }
  }

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await deleteAccount({ password: deletePassword || undefined })
      push("Account deleted. Goodbye 🥲", "success")
      clearAuth()
      router.replace("/")
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not delete account"
      push(msg, "error")
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[9px] font-mono uppercase tracking-[0.4em] mb-1" style={{ color: "color-mix(in srgb, var(--app-accent) 50%, transparent)" }}>
          Account
        </p>
        <h2 className="text-2xl font-black tracking-tighter uppercase italic text-foreground">Profile & Account</h2>
      </div>

      {/* Avatar */}
      <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-subtle">Profile Photo</p>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) onAvatarPick(f); e.target.value = "" }}
        />
        <div className="flex items-center gap-5">
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-2xl font-black shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              {form.avatarUrl ? (
                <NextImage src={form.avatarUrl} alt={form.displayName} width={80} height={80} unoptimized className="w-full h-full object-cover" />
              ) : (
                form.displayName[0]?.toUpperCase() ?? "?"
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={avatarUploading}
              aria-label="Change profile photo"
              className="absolute inset-0 rounded-2xl bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center disabled:cursor-not-allowed"
            >
              {avatarUploading ? <Loader2 size={18} className="text-foreground animate-spin" /> : <Camera size={18} className="text-foreground" />}
            </button>
          </div>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={avatarUploading}
              className="block text-xs font-black uppercase tracking-widest text-accent-bright hover:text-white transition-colors disabled:opacity-50"
            >{avatarUploading ? `Uploading ${avatarProgress}%…` : "Upload photo"}</button>
            <p className="text-[9px] text-subtle">JPG, PNG, WebP, or GIF · Max 5MB</p>
            {avatarError && <p className="text-[10px] text-rose-400">{avatarError}</p>}
          </div>
        </div>
      </div>

      {/* Profile */}
      <div className="p-6 rounded-2xl bg-surface border border-border space-y-5">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-subtle">Profile</p>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-subtle mb-1.5">Display Name</label>
          <input type="text" value={form.displayName} onChange={set("displayName")} placeholder="Your name" maxLength={60}
            className="w-full rounded-2xl bg-black/30 border border-border px-4 py-3 text-base sm:text-sm text-foreground placeholder:text-subtle outline-none focus:border-accent/40 transition-colors"
          />
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-subtle mb-1.5">
            Username <Lock size={9} className="text-subtle" />
          </label>
          <input type="text" value={storeUser?.username ?? ""} disabled
            className="w-full rounded-2xl bg-black/40 border border-border px-4 py-3 text-sm text-muted cursor-not-allowed"
          />
          <p className="text-[9px] text-subtle mt-1">Username is permanent. Need to change it? Use a custom URL slug below.</p>
        </div>
        <div>
          <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-subtle mb-1.5">
            Email <Lock size={9} className="text-subtle" />
          </label>
          <input type="email" value={storeUser?.email ?? ""} disabled
            className="w-full rounded-2xl bg-black/40 border border-border px-4 py-3 text-sm text-muted cursor-not-allowed"
          />
          <p className="text-[9px] text-subtle mt-1">Email change isn&apos;t available yet — coming with the next release.</p>
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-subtle mb-1.5">Bio</label>
          <textarea value={form.bio} onChange={set("bio")} rows={3} maxLength={200}
            className="w-full rounded-2xl bg-black/30 border border-border px-4 py-3 text-base sm:text-sm text-foreground placeholder:text-subtle outline-none focus:border-accent/40 resize-none transition-colors"
          />
          <p className="text-[9px] text-right text-subtle mt-1">{form.bio.length}/200</p>
        </div>
        <div className="flex justify-end">
          <motion.button whileHover={{ scale:1.02 }} whileTap={{ scale:0.97 }} onClick={save} disabled={saving}
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

      {/* Profile URL Slug */}
      <div className="p-6 rounded-2xl bg-surface border border-border space-y-4"
        style={{ borderColor: slugStatus === "available" ? "color-mix(in srgb, var(--app-accent) 25%, transparent)" : undefined }}>
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-subtle flex items-center gap-2">
            <Link2 size={11} /> Profile URL Slug
          </p>
          <span className="text-[9px] font-mono text-subtle">
            kaiveron.com/user/<span className="text-accent-bright/60">{storeUser?.slug ?? "…"}</span>/dashboard
          </span>
        </div>

        <p className="text-[11px] text-subtle leading-relaxed">
          Your personal URL identifier. Lowercase letters, numbers, and hyphens only (3–50 chars).
          Changing it updates all your profile links.
        </p>

        <div className="space-y-2">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[11px] font-mono text-subtle pointer-events-none select-none">
              /user/
            </div>
            <input
              value={slugInput}
              onChange={e => setSlugInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
              placeholder={storeUser?.slug ?? "your-slug"}
              maxLength={50}
              className="w-full rounded-2xl border px-4 pl-14 py-3 text-base sm:text-sm font-mono text-foreground placeholder:text-subtle outline-none transition-colors bg-black/30"
              style={{
                borderColor: slugStatus === "available" ? "color-mix(in srgb, var(--app-accent) 40%, transparent)"
                  : slugStatus === "taken" || slugStatus === "invalid" ? "rgba(239,68,68,0.4)"
                  : "color-mix(in srgb, var(--app-fg) 10%, transparent)",
              }}
            />
            {/* Status indicator */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {slugStatus === "checking" && <Loader2 size={14} className="animate-spin text-subtle" />}
              {slugStatus === "available" && <CheckCircle2 size={14} className="text-accent-bright" />}
              {(slugStatus === "taken" || slugStatus === "invalid") && <AlertCircle size={14} className="text-red-400" />}
            </div>
          </div>

          {/* Feedback text */}
          {slugError && (
            <p className="text-[10px] text-red-400 font-bold">{slugError}</p>
          )}
          {slugStatus === "available" && slugChanged && (
            <p className="text-[10px] text-accent-bright font-bold">✓ Available</p>
          )}
          {!slugChanged && storeUser?.slug && (
            <p className="text-[10px] text-subtle font-mono">Current: /user/{storeUser.slug}/dashboard</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[9px] text-subtle">⚠ Old links won&apos;t redirect — update bookmarks after changing</p>
          <button
            onClick={saveSlug}
            disabled={slugStatus !== "available" || !slugChanged || slugSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed text-black"
            style={slugStatus === "available" && slugChanged
              ? { background: "linear-gradient(135deg, var(--app-accent-bright), var(--app-accent))", boxShadow: "0 4px 16px color-mix(in srgb, var(--app-accent) 35%, transparent)" }
              : { background: "color-mix(in srgb, var(--app-fg) 8%, transparent)" }}
          >
            {slugSaving ? <><Loader2 size={12} className="animate-spin" /> Saving…</> : "Update URL"}
          </button>
        </div>
      </div>

      {/* Data */}
      <div className="p-6 rounded-2xl bg-surface border border-border space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-subtle">Your Data</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-muted">Export all data</p>
            <p className="text-[10px] text-subtle mt-0.5">Watchlist, reviews, posts — everything</p>
          </div>
          <button onClick={exportData} disabled={exporting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-surface text-xs font-black uppercase tracking-wider text-muted hover:text-foreground hover:bg-surface transition-all disabled:opacity-50"
          >
            {exporting ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />}
            {exporting ? "Preparing…" : "Export"}
          </button>
        </div>
      </div>

      {/* Danger */}
      <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/5 space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400/70">Danger Zone</p>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-foreground">Delete Account</p>
            <p className="text-[10px] text-subtle mt-0.5">Permanently removes all your data. Irreversible.</p>
          </div>
          <button onClick={() => setDeleteOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border border-red-500/30 text-red-400 hover:bg-red-500/10"
          >
            <Trash2 size={13} /> Delete
          </button>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {deleteOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm"
          onClick={() => !deleting && setDeleteOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md rounded-3xl border border-red-500/25 bg-surface p-7 shadow-2xl space-y-5"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-2xl bg-red-500/15 border border-red-500/25 flex items-center justify-center flex-shrink-0">
                <AlertCircle size={20} className="text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-black uppercase tracking-tight text-foreground">Delete your account?</h3>
                <p className="text-[12px] text-muted mt-1 leading-relaxed">
                  Your profile, posts, watchlist, reviews, and DMs will be permanently erased.
                  This cannot be undone.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.18em] text-subtle mb-1.5">
                Confirm with your password
              </label>
              <input
                type="password"
                value={deletePassword}
                onChange={e => setDeletePassword(e.target.value)}
                placeholder="Leave blank if you signed in with Google"
                className="w-full rounded-2xl bg-black/40 border border-border px-4 py-3 text-base sm:text-sm text-foreground placeholder:text-subtle outline-none focus:border-red-500/40 transition-colors"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => { setDeleteOpen(false); setDeletePassword("") }}
                disabled={deleting}
                className="px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-muted hover:text-foreground hover:bg-surface transition-all disabled:opacity-50"
              >Cancel</button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider bg-red-600 hover:bg-red-500 text-foreground transition-all disabled:opacity-60"
              >
                {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                {deleting ? "Deleting…" : "Yes, delete forever"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
