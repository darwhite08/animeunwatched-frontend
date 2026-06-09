import { BadgeCheck } from "lucide-react"

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
