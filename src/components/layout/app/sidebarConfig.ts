import {
  House, Sparkle, UsersThree, ChatCircleText, MonitorPlay, User,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react"

/**
 * Single source of truth for the authenticated app navigation.
 *
 * `path` is either:
 *   - absolute (starts with "/")  → used as-is (public/dashboard routes)
 *   - slug-relative (no leading /) → resolved to /user/[slug]/[path]
 */
export interface NavItem {
  key: string
  label: string
  path: string
  icon: PhosphorIcon
  badgeKey?: "unreadDms" | "unreadNotifications"
  mobile?: boolean // included in the <md bottom tab bar (5 max)
}

export const NAV_ITEMS: NavItem[] = [
  { key: "feed",     label: "Home",     path: "feed",        icon: House,         mobile: true },
  { key: "discover", label: "Discover", path: "/ai-discover", icon: Sparkle,      mobile: true },
  { key: "clubs",    label: "Clubs",    path: "/clubs",       icon: UsersThree,   mobile: true },
  { key: "chat",     label: "Chat",     path: "/chat",        icon: ChatCircleText, badgeKey: "unreadDms", mobile: true },
  { key: "library",  label: "Library",  path: "watchlist",    icon: MonitorPlay },
  { key: "profile",  label: "Profile",  path: "profile",      icon: User,          mobile: true },
]

/** Resolve a NavItem's href given the current user slug. */
export function resolvePath(item: { path: string }, slug?: string | null): string {
  if (item.path.startsWith("/")) return item.path
  return slug ? `/user/${slug}/${item.path}` : "/login"
}

/** Bottom-tab items (<md). Capped at 5 per the spec. */
export const MOBILE_ITEMS: NavItem[] = NAV_ITEMS.filter((i) => i.mobile).slice(0, 5)
