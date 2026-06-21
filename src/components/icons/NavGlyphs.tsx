import type { Icon as PhosphorIcon } from "@phosphor-icons/react"

/**
 * Custom two-tone Kaiveron navigation glyphs (cream body + amber accent).
 * Drop-in replacements for the Phosphor nav icons in sidebarConfig.
 *
 * These have fixed brand fills (not currentColor), so to keep the active/inactive
 * affordance we reuse the renderer's existing `weight` prop: SidebarItem/
 * BottomTabBar pass weight="fill" when active and "regular" otherwise. We map
 * that to opacity (active = full, inactive = dimmed). `size`/`className` match the
 * Phosphor icon API so they slot in with zero renderer changes.
 */
type GlyphProps = { size?: number; weight?: string; className?: string }
const dim = (weight?: string): React.CSSProperties => ({ opacity: weight === "fill" ? 1 : 0.6 })

function svg(size: number, className: string | undefined, weight: string | undefined, children: React.ReactNode) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={dim(weight)} aria-hidden="true">
      {children}
    </svg>
  )
}

export const NavHome = (({ size = 24, weight, className }: GlyphProps) => svg(size, className, weight, <>
  <path fill="#F4F2EC" d="M12 3.3c-.38 0-.74.13-1.02.37L4.3 9.15A1.8 1.8 0 0 0 3.65 10.5V18.2A1.7 1.7 0 0 0 5.35 19.9H8.7V15A1.5 1.5 0 0 1 10.2 13.5H13.8A1.5 1.5 0 0 1 15.3 15V19.9H18.65A1.7 1.7 0 0 0 20.35 18.2V10.5A1.8 1.8 0 0 0 19.7 9.15L13.02 3.67A1.6 1.6 0 0 0 12 3.3Z" />
  <circle fill="#F5A623" cx="12" cy="9.5" r="1.15" />
</>)) as unknown as PhosphorIcon

export const NavShots = (({ size = 24, weight, className }: GlyphProps) => svg(size, className, weight, <>
  <rect fill="#F4F2EC" x="3.5" y="4.2" width="17" height="15.6" rx="4.4" />
  <path fill="#F5A623" d="M10.2 8.85a.8.8 0 0 0-1.2.7v5.0a.8.8 0 0 0 1.2.7l4.35-2.5a.8.8 0 0 0 0-1.4z" />
</>)) as unknown as PhosphorIcon

export const NavAnime = (({ size = 24, weight, className }: GlyphProps) => svg(size, className, weight, <>
  <path fill="none" stroke="#F4F2EC" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" d="M12 6.9 8.9 3.9M12 6.9l3.1-3" />
  <rect fill="#F4F2EC" x="3.5" y="6.9" width="17" height="12.3" rx="3.4" />
  <rect fill="#F5A623" x="6.1" y="9.4" width="11.8" height="7.3" rx="1.7" />
</>)) as unknown as PhosphorIcon

export const NavDiscover = (({ size = 24, weight, className }: GlyphProps) => svg(size, className, weight, <>
  <circle fill="#F4F2EC" cx="12" cy="12" r="8.4" />
  <path fill="#F5A623" d="M12 5.5 13.15 10.85 18.5 12 13.15 13.15 12 18.5 10.85 13.15 5.5 12 10.85 10.85Z" />
  <circle fill="#F4F2EC" cx="12" cy="12" r="1.05" />
</>)) as unknown as PhosphorIcon

export const NavDens = (({ size = 24, weight, className }: GlyphProps) => svg(size, className, weight, <>
  <circle fill="#F5A623" cx="16" cy="8.1" r="2.2" />
  <path fill="#F5A623" d="M16.2 13.2c2.5 0 4.2 2.05 4.4 4.75a.5.5 0 0 1-.5.55h-3.2v-.6a6.4 6.4 0 0 0-1.85-4.5 4.2 4.2 0 0 1 1.15-.2Z" />
  <circle fill="#F4F2EC" cx="9.3" cy="8.6" r="2.95" />
  <path fill="#F4F2EC" d="M3.7 19.4a5.6 5.6 0 0 1 11.2 0 .55.55 0 0 1-.55.55H4.25A.55.55 0 0 1 3.7 19.4Z" />
</>)) as unknown as PhosphorIcon

export const NavBlog = (({ size = 24, weight, className }: GlyphProps) => svg(size, className, weight, <>
  <path fill="#F4F2EC" d="M6.6 3.6h6.0L18.4 9.0V19.4A1 1 0 0 1 17.4 20.4H6.6A1 1 0 0 1 5.6 19.4V4.6A1 1 0 0 1 6.6 3.6Z" />
  <path fill="none" stroke="#F4F2EC" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" d="M12.7 3.9V8.4a.55.55 0 0 0 .55.55H17.9" />
  <rect fill="#F5A623" x="8.2" y="12.3" width="7.0" height="1.5" rx=".75" />
  <rect fill="#F5A623" x="8.2" y="15.5" width="4.6" height="1.5" rx=".75" />
</>)) as unknown as PhosphorIcon

export const NavLeaderboard = (({ size = 24, weight, className }: GlyphProps) => svg(size, className, weight, <>
  <path fill="none" stroke="#F4F2EC" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" d="M7.6 5.5H5.3a1.9 1.9 0 0 0 2.5 3.3M16.4 5.5h2.3a1.9 1.9 0 0 1-2.5 3.3" />
  <path fill="#F4F2EC" d="M7.5 4.3h9v3.3a4.5 4.5 0 0 1-9 0Z" />
  <path fill="#F4F2EC" d="M11 11.5h2v2.0c1.5.3 2.5 1.15 2.5 2.45v.25a.5.5 0 0 1-.5.5H9a.5.5 0 0 1-.5-.5v-.25c0-1.3 1-2.15 2.5-2.45Z" />
  <path fill="#F5A623" d="M12 5.0l.62 1.26 1.39.2-1.0.98.24 1.38L12 8.55l-1.25.65.24-1.38-1-.98 1.39-.2Z" />
</>)) as unknown as PhosphorIcon

export const NavChat = (({ size = 24, weight, className }: GlyphProps) => svg(size, className, weight, <>
  <path fill="#F4F2EC" d="M5.5 5.4h13A2.4 2.4 0 0 1 20.9 7.8v5.7a2.4 2.4 0 0 1-2.4 2.4H10.6l-3.8 3.0a.6.6 0 0 1-.97-.47V15.9H5.5A2.4 2.4 0 0 1 3.1 13.5V7.8A2.4 2.4 0 0 1 5.5 5.4Z" />
  <circle fill="#F5A623" cx="8.9" cy="10.65" r="1.05" />
  <circle fill="#F5A623" cx="12" cy="10.65" r="1.05" />
  <circle fill="#F5A623" cx="15.1" cy="10.65" r="1.05" />
</>)) as unknown as PhosphorIcon

export const NavLibrary = (({ size = 24, weight, className }: GlyphProps) => svg(size, className, weight, <>
  <rect fill="#F4F2EC" x="3.9" y="4.4" width="4.05" height="15.2" rx="1.3" />
  <rect fill="#F4F2EC" x="8.6" y="4.4" width="4.05" height="15.2" rx="1.3" />
  <path fill="#F5A623" d="M15.0 6.75 18.55 5.78a1.1 1.1 0 0 1 1.35.78l2.2 8.05a1.1 1.1 0 0 1-.78 1.35l-3.55.97Z" />
  <path fill="none" stroke="#F4F2EC" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round" d="M5 8.1h1.95M9.65 8.1h1.95" />
</>)) as unknown as PhosphorIcon

export const NavProfile = (({ size = 24, weight, className }: GlyphProps) => svg(size, className, weight, <>
  <path fill="#F4F2EC" d="M5.4 19.6a6.6 6.6 0 0 1 13.2 0 .5.5 0 0 1-.5.45H5.9a.5.5 0 0 1-.5-.45Z" />
  <circle fill="#F5A623" cx="12" cy="8.3" r="3.6" />
</>)) as unknown as PhosphorIcon

export const NavWatch = (({ size = 24, weight, className }: GlyphProps) => svg(size, className, weight, <>
  <rect fill="#F4F2EC" x="3" y="5" width="18" height="14" rx="3.2" />
  <path fill="#F5A623" d="M10.4 9.1a.72.72 0 0 0-1.1.62v4.56a.72.72 0 0 0 1.1.62l3.95-2.28a.72.72 0 0 0 0-1.24z" />
</>)) as unknown as PhosphorIcon
