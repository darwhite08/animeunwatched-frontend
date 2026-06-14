import {
  House, Television, Sparkle, UsersThree, FilmReel, MagnifyingGlass,
  Trophy, ChatCircleText, Bookmarks, User,
  ListBullets, PlayCircle, Robot, CalendarBlank, CalendarCheck,
  Star, Tag, Buildings, Smiley, MagicWand, SquaresFour,
  MonitorPlay, BookOpen, Books, ClockCounterClockwise, Flame,
  Medal, ChartBar, Users, BellSimple, Gear,
  Newspaper, TrendUp, Article,
  type Icon as PhosphorIcon,
} from "@phosphor-icons/react"

/**
 * Single source of truth for the authenticated app navigation.
 *
 * `path` is either:
 *   - absolute (starts with "/")  → used as-is (public/dashboard routes)
 *   - slug-relative (no leading /) → resolved to /user/[slug]/[path]
 */
export interface FlyoutLink {
  label: string
  desc: string
  path: string
  icon: PhosphorIcon
}

export interface NavItem {
  key: string
  label: string
  path: string
  icon: PhosphorIcon
  badgeKey?: "unreadDms" | "unreadNotifications"
  mobile?: boolean // included in the <md bottom tab bar (5 max)
  flyout?: FlyoutLink[] // hover panel of sub-destinations (desktop sidebar)
}

/** Anime section sub-modes — mirrors the marketing ANIME dropdown. */
export const ANIME_FLYOUT: FlyoutLink[] = [
  { label: "Browse All",      desc: "All 30,000+ anime",   path: "/bestanimelist",  icon: ListBullets },
  { label: "Trailers",        desc: "Watch anime trailers", path: "/trailers",      icon: PlayCircle },
  { label: "AI Discover",     desc: "Neural recommendations", path: "/ai-discover", icon: Robot },
  { label: "Seasonal",        desc: "Any year & season",   path: "/seasonal",       icon: CalendarBlank },
  { label: "Calendar",        desc: "Airing schedule",     path: "/calendar",       icon: CalendarCheck },
  { label: "Top Rated",       desc: "Community ranked",    path: "/rankings",       icon: Star },
  { label: "Genres",          desc: "Browse by genre",     path: "/genres",         icon: Tag },
  { label: "Studios",         desc: "Browse by studio",    path: "/studios",        icon: Buildings },
  { label: "Mood Picker",     desc: "Match your vibe",     path: "/mood",           icon: Smiley },
  { label: "Recommendations", desc: "Picks for you",       path: "/recommendations", icon: MagicWand },
  { label: "Collections",     desc: "Curated lists",       path: "/collections",    icon: SquaresFour },
]

/** Community content types (absolute public routes). */
export const HOME_FLYOUT: FlyoutLink[] = [
  { label: "Feed",     desc: "Latest posts",       path: "/community",          icon: Newspaper },
  { label: "Trending", desc: "What's hot right now", path: "/community/trending", icon: TrendUp },
  { label: "Reviews",  desc: "Anime reviews",      path: "/reviews",            icon: Star },
  { label: "Polls",    desc: "Vote & debate",      path: "/poll",               icon: ChartBar },
]

/** "My Space" — personal collection + progress (slug-relative routes). */
export const LIBRARY_FLYOUT: FlyoutLink[] = [
  { label: "Dashboard",    desc: "Your overview",        path: "dashboard",    icon: SquaresFour },
  { label: "Watchlist",    desc: "Anime you track",      path: "watchlist",    icon: MonitorPlay },
  { label: "Readlist",     desc: "Saved to read",        path: "readlist",     icon: BookOpen },
  { label: "Manga",        desc: "Manga you track",      path: "manga",        icon: Books },
  { label: "History",      desc: "Recently watched",     path: "history",      icon: ClockCounterClockwise },
  { label: "Streak",       desc: "Daily momentum",       path: "streak",       icon: Flame },
  { label: "Achievements", desc: "Badges & milestones",  path: "achievements", icon: Medal },
  { label: "Watch Stats",  desc: "Your analytics",       path: "stats",        icon: ChartBar },
]

/** "Account" — identity + settings (slug-relative routes). */
export const PROFILE_FLYOUT: FlyoutLink[] = [
  { label: "My Profile",    desc: "Your public page",   path: "profile",          icon: User },
  { label: "Following",     desc: "People you follow",  path: "following",        icon: Users },
  { label: "Notifications", desc: "Alerts & activity",  path: "notifications",    icon: BellSimple },
  { label: "Settings",      desc: "Account & prefs",    path: "settings/account", icon: Gear },
]

export const NAV_ITEMS: NavItem[] = [
  { key: "feed",        label: "Home",        path: "/community",     icon: House,           mobile: true, flyout: HOME_FLYOUT },
  { key: "shots",       label: "Shots",       path: "/shots",         icon: FilmReel,       mobile: true },
  { key: "anime",       label: "Anime",       path: "/bestanimelist", icon: Television,     mobile: true, flyout: ANIME_FLYOUT },
  { key: "discover",    label: "Discover",    path: "/ai-discover",   icon: Sparkle },
  { key: "clubs",       label: "Clubs",       path: "/clubs",         icon: UsersThree },
  { key: "blog",        label: "Blog",        path: "/blog",          icon: Article },
  { key: "leaderboard", label: "Leaderboard", path: "/leaderboard",   icon: Trophy },
  { key: "chat",        label: "Chat",        path: "/chat",          icon: ChatCircleText, badgeKey: "unreadDms", mobile: true },
  { key: "library",     label: "Library",     path: "watchlist",      icon: Bookmarks,      flyout: LIBRARY_FLYOUT },
  { key: "profile",     label: "Profile",     path: "profile",        icon: User,           mobile: true, flyout: PROFILE_FLYOUT },
]

/** Resolve a NavItem's href given the current user slug. */
export function resolvePath(item: { path: string }, slug?: string | null): string {
  if (item.path.startsWith("/")) return item.path
  return slug ? `/user/${slug}/${item.path}` : "/login"
}

/** Bottom-tab items (<md). Explicit order: Home · Search · Messages · Shots · Profile. */
export const MOBILE_ITEMS: NavItem[] = [
  { key: "feed",    label: "Home",     path: "/community", icon: House,           mobile: true },
  { key: "search",  label: "Search",   path: "/search",    icon: MagnifyingGlass, mobile: true },
  { key: "chat",    label: "Messages", path: "/chat",      icon: ChatCircleText,  badgeKey: "unreadDms", mobile: true },
  { key: "shots",   label: "Shots",    path: "/shots",     icon: FilmReel,        mobile: true },
  { key: "profile", label: "Profile",  path: "profile",    icon: User,            mobile: true },
]
