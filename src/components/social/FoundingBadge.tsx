import { Award } from "lucide-react"

/**
 * Founding Creator badge — shown next to the display name for one of the first
 * 250 verified creators. Cosmetic for now (no perks). The serial is the 1-based
 * tenure ordinal; the tooltip reads "Founding Creator #N".
 */
export function FoundingBadge({ serial, size = 16 }: { serial: number; size?: number }) {
  const label = `Founding Creator #${serial}`
  return (
    <span
      title={label}
      aria-label={label}
      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-amber-300"
    >
      <Award size={size} strokeWidth={2.5} className="shrink-0" />
      <span className="font-mono text-[10px] font-bold tracking-tight">#{serial}</span>
    </span>
  )
}
