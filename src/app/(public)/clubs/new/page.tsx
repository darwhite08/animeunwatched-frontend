"use client"

import { useState, useEffect, useRef } from "react"
import { useCreateClub } from "@/hooks/useClubs"
import { ApiError } from "@/lib/api/client"
import { useImageUpload } from "@/hooks/useImageUpload"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Sparkles,
  Shield,
  ImagePlus,
  Loader2,
  X,
} from "lucide-react"
import { useToast } from "@/stores/toast.store"

/* ── Types ── */
type FormData = {
  name: string
  slug: string
  description: string
  category: string
}

type FieldErrors = Partial<Record<keyof FormData, string>>

const CATEGORIES = [
  "Series Discussion",
  "Rankings",
  "Recommendations",
  "Studio Fan Club",
  "Genre Focus",
  "Other",
]

const USER_REPUTATION = 840
const REQUIRED_REPUTATION = 50

/* ── Helpers ── */
function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 30)
}

function validate(data: FormData): FieldErrors {
  const errors: FieldErrors = {}
  if (data.name.length < 3 || data.name.length > 60) {
    errors.name = "Den name must be 3–60 characters."
  }
  if (!/^[a-z0-9-]{3,30}$/.test(data.slug)) {
    errors.slug = "Slug must be 3–30 lowercase letters, numbers, or hyphens."
  }
  if (!data.category) {
    errors.category = "Please select a category."
  }
  if (data.description.length > 1000) {
    errors.description = `Description must be 1000 characters or fewer (currently ${data.description.length}).`
  }
  return errors
}

/* ── Field component ── */
function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-muted">
        {label}
      </label>
      {children}
      {error ? (
        <p className="flex items-center gap-1.5 text-[10px] text-red-400">
          <AlertCircle size={10} /> {error}
        </p>
      ) : hint ? (
        <p className="text-[10px] text-subtle">{hint}</p>
      ) : null}
    </div>
  )
}

/* ── Page ── */
export default function NewClubPage() {
  const createClub = useCreateClub()
  const router = useRouter()
  const { push } = useToast()

  const [form, setForm] = useState<FormData>({
    name: "",
    slug: "",
    description: "",
    category: "",
  })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof FormData, boolean>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [slugEdited, setSlugEdited] = useState(false)

  /* Cover image — uploaded to R2 via the shared image-upload hook (post scope). */
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const { upload: uploadCover, isUploading: uploadingCover } = useImageUpload("post")
  const coverInputRef = useRef<HTMLInputElement>(null)

  const handleCoverPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = "" // allow re-picking the same file
    if (!file) return
    try {
      const { publicUrl } = await uploadCover(file)
      setCoverUrl(publicUrl)
    } catch (err) {
      push(err instanceof Error ? err.message : "Couldn't upload that image", "error")
    }
  }

  /* Auto-generate slug from name unless user has edited it */
  useEffect(() => {
    if (!slugEdited) {
      setForm((prev) => ({ ...prev, slug: slugify(prev.name) }))
    }
  }, [form.name, slugEdited])

  const setField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setTouched((prev) => ({ ...prev, [key]: true }))
    // Clear any stale backend error for this field once the user edits it.
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev))
    if (key === "slug") setSlugEdited(true)
  }

  const getFieldError = (key: keyof FormData): string | undefined => {
    if (!touched[key]) return undefined
    // Live client validation takes priority; fall back to any backend-reported
    // error stored for this field (e.g. "slug already taken").
    return validate(form)[key] ?? errors[key]
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(form)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      setTouched({ name: true, slug: true, description: true, category: true })
      return
    }
    setErrors({})
    setSubmitting(true)
    createClub.mutate(
      { name: form.name, slug: form.slug, description: form.description, category: form.category, bannerUrl: coverUrl },
      {
        onSuccess: () => {
          setSubmitting(false)
          push("Den created!", "success")
          router.push("/clubs")
        },
        onError: (e: Error) => {
          setSubmitting(false)
          // Surface the real backend message (e.g. "You need at least 50
          // reputation to create a den") instead of a generic toast.
          if (e instanceof ApiError) {
            // Map a backend validation rejection to the offending field so the
            // user sees WHICH field is wrong, not a bare "Validation failed".
            if (e.code === "VALIDATION" && e.issues?.length) {
              const fieldErrs: FieldErrors = {}
              for (const issue of e.issues) {
                const key = issue.path[0]
                if (key === "name" || key === "slug" || key === "description" || key === "category") {
                  fieldErrs[key] = issue.message
                }
              }
              if (Object.keys(fieldErrs).length) {
                setErrors(fieldErrs)
                setTouched({ name: true, slug: true, description: true, category: true })
                push(Object.values(fieldErrs)[0], "error")
                return
              }
            }
            if (e.code === "CONFLICT" || e.message?.includes("CONFLICT")) {
              push("That slug is already taken", "error")
              return
            }
          }
          push(e.message || "Failed to create den", "error")
        },
      }
    )
  }

  const inputClass =
    "w-full px-4 py-3 rounded-xl bg-surface border border-border text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent/50 focus:bg-surface transition-all"

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[30%] h-[50%] bg-indigo-700/12 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[25%] h-[40%] bg-violet-900/8 blur-[100px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 pt-16">
        {/* Back link */}
        <Link
          href="/clubs"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-subtle hover:text-muted transition-colors mb-10 group"
        >
          <ArrowLeft size={12} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Dens
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <h1 className="text-5xl font-black uppercase italic tracking-tighter text-foreground leading-none">
            Create Den<span style={{color:"var(--app-accent)"}}>.</span>
          </h1>
          <p className="mt-3 text-muted text-sm">
            Build a home for your anime corner of the community.
          </p>
        </motion.div>

        {/* Reputation notice */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mb-8 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-3"
        >
          <div className="mt-0.5">
            <CheckCircle2 size={16} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-300">
              Reputation requirement met
            </p>
            <p className="text-xs text-muted mt-0.5">
              Requires {REQUIRED_REPUTATION}+ reputation score. Your current score:{" "}
              <span className="font-black text-emerald-400">
                {USER_REPUTATION} ✓
              </span>
            </p>
          </div>
          <Shield size={14} className="text-emerald-500/30 ml-auto mt-0.5 shrink-0" />
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.5 }}
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Card wrapper */}
          <div className="p-8 rounded-3xl bg-surface border border-border space-y-7">
            {/* Cover image */}
            <Field label="Cover Image" hint="Optional. 16:9 looks best — JP, PNG, WebP up to 10MB.">
              <input
                ref={coverInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleCoverPick}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                disabled={uploadingCover}
                className="group relative block w-full aspect-[16/9] overflow-hidden rounded-2xl border border-dashed border-border bg-surface-2 transition-colors hover:border-white/50"
              >
                {coverUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={coverUrl} alt="Den cover" className="absolute inset-0 h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-foreground opacity-0 transition-opacity group-hover:opacity-100">
                      Change cover
                    </span>
                  </>
                ) : (
                  <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-subtle">
                    {uploadingCover ? (
                      <Loader2 size={22} className="animate-spin" />
                    ) : (
                      <ImagePlus size={22} className="transition-colors group-hover:text-foreground" />
                    )}
                    <span className="text-[11px] font-black uppercase tracking-widest">
                      {uploadingCover ? "Uploading…" : "Add a cover"}
                    </span>
                  </span>
                )}
              </button>
              {coverUrl && !uploadingCover && (
                <button
                  type="button"
                  onClick={() => setCoverUrl(null)}
                  className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-subtle transition-colors hover:text-red-400"
                >
                  <X size={11} /> Remove
                </button>
              )}
            </Field>

            {/* Den Name */}
            <Field
              label="Den Name"
              error={getFieldError("name")}
              hint="3–60 characters. Be memorable."
            >
              <input
                type="text"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="e.g. Attack on Titan Discussion"
                maxLength={60}
                className={`${inputClass} ${getFieldError("name") ? "border-red-500/40" : ""}`}
              />
              <div className="flex justify-end mt-1">
                <span
                  className={`text-[9px] font-mono ${
                    form.name.length > 54 ? "text-accent-bright" : "text-subtle"
                  }`}
                >
                  {form.name.length}/60
                </span>
              </div>
            </Field>

            {/* Slug */}
            <Field
              label="Slug"
              error={getFieldError("slug")}
              hint="URL: kaiveron.com/clubs/your-slug"
            >
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs text-subtle font-mono select-none">
                  /clubs/
                </span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setField("slug", e.target.value)}
                  placeholder="my-club-name"
                  maxLength={30}
                  className={`${inputClass} pl-[4.25rem] ${
                    getFieldError("slug") ? "border-red-500/40" : ""
                  }`}
                />
              </div>
              {!getFieldError("slug") && form.slug && (
                <p className="flex items-center gap-1.5 text-[10px] text-accent-bright">
                  <Sparkles size={9} />
                  Auto-generated from name — editable
                </p>
              )}
            </Field>

            {/* Category */}
            <Field label="Category" error={getFieldError("category")}>
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) => setField("category", e.target.value)}
                  className={`${inputClass} appearance-none cursor-pointer ${
                    getFieldError("category") ? "border-red-500/40" : ""
                  } ${!form.category ? "text-subtle" : ""}`}
                >
                  <option value="" disabled className="bg-surface-2 text-muted">
                    Select a category
                  </option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat} className="bg-surface-2 text-foreground">
                      {cat}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={14}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-subtle pointer-events-none"
                />
              </div>
            </Field>

            {/* Description */}
            <Field
              label="Description"
              error={getFieldError("description")}
              hint="Optional. Tell people what this den is about."
            >
              <textarea
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="What will members discuss here?"
                rows={4}
                maxLength={1000}
                className={`${inputClass} resize-none leading-relaxed ${
                  getFieldError("description") ? "border-red-500/40" : ""
                }`}
              />
              <div className="flex justify-end mt-1">
                <span
                  className={`text-[9px] font-mono ${
                    form.description.length > 900 ? "text-accent-bright" : "text-subtle"
                  }`}
                >
                  {form.description.length}/1000
                </span>
              </div>
            </Field>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3.5 rounded-2xl bg-accent hover:bg-accent-bright disabled:opacity-50 text-sm font-black uppercase tracking-widest text-foreground transition-all shadow-[0_0_32px_rgba(99,102,241,0.3)] hover:-translate-y-0.5 disabled:translate-y-0"
            >
              {submitting ? "Creating…" : "Create Den"}
            </button>
            <Link
              href="/clubs"
              className="px-6 py-3.5 rounded-2xl bg-surface border border-border text-sm font-black uppercase tracking-widest text-muted hover:text-muted hover:border-border transition-all"
            >
              Cancel
            </Link>
          </div>
        </motion.form>
      </div>
    </div>
  )
}
