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
export function CountryPioneerBadge({ country }: { country?: string | null; size?: number }) {
  if (!country) return null
  return (
    <span
      title={`First member from ${countryNameOf(country)}`}
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-amber-300"
      style={{
        background: "linear-gradient(135deg, rgba(253,224,71,0.16), rgba(245,158,11,0.08))",
        border: "1px solid rgba(251,191,36,0.4)",
      }}
    >
      <span style={{ fontSize: 13, lineHeight: 1 }}>{countryFlag(country)}</span>
      1st in {countryNameOf(country)}
    </span>
  )
}

/** Extract the country code from a user's badges (e.g. FIRST_FROM_RO → "RO"). */
export function pioneerCountryFromBadges(badges?: Array<{ code: string }> | null): string | null {
  const m = badges?.map(b => /^FIRST_FROM_([A-Z]{2})$/.exec(b.code)).find(Boolean)
  return m ? m[1] : null
}

/**
 * "Day One" founding-member flair — a glowing violet seal with a ⚡. Granted to
 * the first 1,000 members; a prestige "I was here at the start" mark.
 */
export function DayOneBadge({ show }: { show?: boolean | null; size?: number }) {
  if (!show) return null
  return (
    <span
      title="Day One — one of the first 1,000 members"
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-violet-300"
      style={{
        background: "linear-gradient(135deg, rgba(216,180,254,0.18), rgba(147,51,234,0.10))",
        border: "1px solid rgba(192,132,252,0.45)",
      }}
    >
      <span style={{ fontSize: 12, lineHeight: 1 }}>⚡</span>
      Day One
    </span>
  )
}

export const hasDayOne = (badges?: Array<{ code: string }> | null): boolean =>
  !!badges?.some(b => b.code === "DAY_ONE")
