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

/** ISO-3166 alpha-2 → flag emoji. */
export function countryFlag(code: string): string {
  if (!code || !/^[A-Za-z]{2}$/.test(code)) return "🌐"
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65))
}
let _rn: Intl.DisplayNames | null = null
export function countryNameOf(code: string): string {
  try { _rn ??= new Intl.DisplayNames(["en"], { type: "region" }); return _rn.of(code.toUpperCase()) ?? code }
  catch { return code }
}

/**
 * "First from <country>" pioneer flair — the country flag in a subtle ring.
 * Pass the ISO-2 country code (parsed from a FIRST_FROM_XX badge). Nothing if absent.
 */
export function CountryPioneerBadge({ country, size = 16 }: { country?: string | null; size?: number }) {
  if (!country) return null
  const label = `First member from ${countryNameOf(country)}`
  return (
    <span title={label} aria-label={label}
      className="inline-flex shrink-0 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10"
      style={{ width: size + 8, height: size + 8, fontSize: size - 2, lineHeight: 1 }}>
      {countryFlag(country)}
    </span>
  )
}

/** Extract the country code from a user's badges (e.g. FIRST_FROM_RO → "RO"). */
export function pioneerCountryFromBadges(badges?: Array<{ code: string }> | null): string | null {
  const m = badges?.map(b => /^FIRST_FROM_([A-Z]{2})$/.exec(b.code)).find(Boolean)
  return m ? m[1] : null
}
