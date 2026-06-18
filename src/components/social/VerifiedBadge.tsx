import { BadgeCheck, ShieldCheck } from "lucide-react"

type Kind = "USER" | "CREATOR" | "STUDIO" | null | undefined

const STYLES: Record<string, { className: string; label: string }> = {
  USER:    { className: "text-sky-400",    label: "Verified" },
  CREATOR: { className: "text-violet-400", label: "Verified creator" },
  STUDIO:  { className: "text-amber-400",  label: "Official studio" },
}

/** Renders the admin-granted verified badge next to a name. Nothing if unverified. */
export function VerifiedBadge({ kind, size = 16 }: { kind: Kind; size?: number }) {
  if (!kind) return null
  const s = STYLES[kind] ?? STYLES.USER
  return (
    <span title={s.label} aria-label={s.label} className={`inline-flex shrink-0 ${s.className}`}>
      <BadgeCheck size={size} className="fill-current/10" strokeWidth={2.5} />
    </span>
  )
}

/**
 * Community Lead flair — a green shield-check seal. Independent of the verified
 * badge (a user can show both). Renders nothing when `show` is falsy.
 */
export function CommunityLeadBadge({ show, size = 16 }: { show?: boolean | null; size?: number }) {
  if (!show) return null
  return (
    <span title="Community Lead" aria-label="Community Lead" className="inline-flex shrink-0 text-emerald-400">
      <ShieldCheck size={size} className="fill-current/10" strokeWidth={2.5} />
    </span>
  )
}
