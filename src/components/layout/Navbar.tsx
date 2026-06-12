"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Menu, X, Bookmark, ChevronDown,
  TrendingUp, MessageSquare,
} from "lucide-react";
import {
  List, Robot, CalendarDots, Star, Tag, Buildings, SquaresFour,
  Lightning, Newspaper, UsersThree, BookOpenText, ChartBar, Trophy,
  MonitorPlay, Sparkle, ArrowRight, House, CalendarCheck, Smiley,
} from "@phosphor-icons/react";
import { useWatchlist } from "@/stores/watchlist.store";
import { useAuthStore } from "@/stores/auth.store";
import { disconnectSocket } from "@/lib/socket";
import { logout } from "@/lib/api/endpoints";
import NotificationBell from "@/components/notifications/NotificationBell";
import { OnlineCountBadge } from "@/components/ui/OnlineCountBadge";
import { Avatar } from "@/components/ui/Avatar";
import SearchModal from "./SearchModal";
import ProfileMenu from "./ProfileMenu";

/* ── Dropdown link data ─────────────────────────────────────── */

const ANIME_LINKS = [
  { name: "Browse All",       href: "/bestanimelist",    icon: List,          desc: "All 30,000+ anime" },
  { name: "Trailers",         href: "/trailers",         icon: MonitorPlay,   desc: "Watch anime trailers" },
  { name: "AI Discover",      href: "/ai-discover",      icon: Robot,         desc: "Neural recommendations" },
  { name: "Seasonal",         href: "/seasonal",         icon: CalendarDots,  desc: "Any year & season" },
  { name: "Calendar",         href: "/calendar",         icon: CalendarCheck, desc: "Airing schedule" },
  { name: "Top Rated",        href: "/rankings",         icon: Star,          desc: "Community ranked" },
  { name: "Genres",           href: "/genres",           icon: Tag,           desc: "Browse by genre" },
  { name: "Studios",          href: "/studios",          icon: Buildings,     desc: "Browse by studio" },
  { name: "Mood Picker",      href: "/mood",             icon: Smiley,        desc: "Match your vibe" },
  { name: "Recommendations",  href: "/recommendations",  icon: Sparkle,       desc: "Picks for you" },
  { name: "Collections",      href: "/collections",      icon: SquaresFour,   desc: "Curated lists" },
];

const COMMUNITY_LINKS = [
  { name: "Feed",        href: "/community",   icon: Newspaper,    desc: "Latest posts" },
  { name: "Shots",       href: "/shots",       icon: MonitorPlay,  desc: "Short vertical clips" },
  { name: "Clubs",       href: "/clubs",       icon: UsersThree,   desc: "Join a community" },
  { name: "Blog",        href: "/blog",        icon: BookOpenText, desc: "Long-form articles" },
  { name: "Polls",       href: "/poll",        icon: ChartBar,     desc: "Vote & debate" },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy,       desc: "Top users" },
];

// MY_LINKS resolved at render time using user's slug (see Navbar component below)

/* ── Homepage section themes ────────────────────────────────── */

const SECTION_THEMES = [
  { bg: "color-mix(in srgb, var(--app-bg) 90%, transparent)",  border: "rgba(99,102,241,0.45)", glow: "0 0 60px rgba(99,102,241,0.18),0 2px 0 rgba(99,102,241,0.5)",  dotColor: "#6366f1", accent: "text-accent-bright",  label: "Ch.01 — Hero" },
  { bg: "color-mix(in srgb, var(--app-bg) 90%, transparent)", border: "color-mix(in srgb, var(--app-accent) 45%, transparent)", glow: "0 0 60px color-mix(in srgb, var(--app-accent) 12%, transparent),0 2px 0 color-mix(in srgb, var(--app-accent) 50%, transparent)",  dotColor: "var(--app-accent)", accent: "text-accent-bright",   label: "Ch.02 — Discovery" },
  { bg: "color-mix(in srgb, var(--app-bg) 92%, transparent)",  border: "rgba(139,92,246,0.55)", glow: "0 0 80px rgba(139,92,246,0.22),0 2px 0 rgba(139,92,246,0.6)",  dotColor: "#8b5cf6", accent: "text-violet-400",  label: "Ch.03 — AI Oracle" },
  { bg: "color-mix(in srgb, var(--app-bg) 92%, transparent)",  border: "rgba(16,185,129,0.45)", glow: "0 0 60px rgba(16,185,129,0.15),0 2px 0 rgba(16,185,129,0.5)",  dotColor: "#10b981", accent: "text-emerald-400", label: "Ch.04 — Community" },
  { bg: "color-mix(in srgb, var(--app-bg) 94%, transparent)",  border: "rgba(99,102,241,0.35)", glow: "0 0 50px rgba(99,102,241,0.15),0 2px 0 rgba(99,102,241,0.4)",  dotColor: "#4f46e5", accent: "text-accent-bright",  label: "Ch.05 — Showcase" },
  { bg: "color-mix(in srgb, var(--app-bg) 94%, transparent)",  border: "rgba(99,102,241,0.70)", glow: "0 0 80px rgba(99,102,241,0.30),0 2px 0 rgba(99,102,241,0.8)",  dotColor: "#818cf8", accent: "text-accent-bright",  label: "Ch.06 — Begin" },
];

/* ── Reusable dropdown panel ─────────────────────────────────── */

type DropItem = { name: string; href: string; icon: React.ElementType; desc: string };

function NavDropdown({ items, onClose }: { items: DropItem[]; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0,  scale: 1     }}
      exit={{    opacity: 0, y: 6,  scale: 0.97  }}
      transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-3 z-50"
      style={{ minWidth: "240px" }}
    >
      {/* Gold top-border accent line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-accent-bright/60 to-transparent mb-0" />

      <div
        className="rounded-2xl overflow-hidden border border-white/[0.07]"
        style={{
          background: "linear-gradient(160deg, color-mix(in srgb, var(--app-bg) 98%, transparent) 0%, color-mix(in srgb, var(--app-bg) 99%, transparent) 100%)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.7), 0 0 0 0.5px color-mix(in srgb, var(--app-accent) 12%, transparent) inset, 0 1px 0 color-mix(in srgb, var(--app-accent) 15%, transparent) inset",
          backdropFilter: "blur(32px) saturate(180%)",
        }}
      >
        {/* Subtle gold shimmer at top */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-accent-bright/30 to-transparent" />

        <div className="p-1.5">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} onClick={onClose}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface transition-all duration-150 group relative"
              >
                {/* Gold icon container */}
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 group-hover:scale-110"
                  style={{
                    background: "linear-gradient(135deg, color-mix(in srgb, var(--app-accent) 18%, transparent) 0%, color-mix(in srgb, var(--app-accent-bright) 10%, transparent) 100%)",
                    border: "1px solid color-mix(in srgb, var(--app-accent) 30%, transparent)",
                    boxShadow: "0 2px 10px color-mix(in srgb, var(--app-accent) 15%, transparent), inset 0 1px 0 color-mix(in srgb, var(--app-fg) 8%, transparent)",
                  }}
                >
                  <Icon size={16} weight="duotone" className="text-accent-bright group-hover:text-accent-bright transition-colors" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-black text-muted group-hover:text-foreground uppercase tracking-widest leading-none transition-colors">
                    {item.name}
                  </p>
                  <p className="text-[9px] text-subtle group-hover:text-muted mt-0.5 truncate transition-colors">
                    {item.desc}
                  </p>
                </div>

                {/* Arrow indicator */}
                <div className="text-white/0 group-hover:text-accent-bright/60 transition-all translate-x-0 group-hover:translate-x-0.5 shrink-0">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5h6M5.5 2.5L8 5l-2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Bottom shimmer */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-accent-bright/10 to-transparent" />
      </div>
    </motion.div>
  );
}

/* ── Main Navbar ─────────────────────────────────────────────── */

export default function Navbar() {
  const [scrolled,       setScrolled]       = useState(false);
  const [searchOpen,     setSearchOpen]     = useState(false);
  const [profileOpen,    setProfileOpen]    = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection,  setActiveSection]  = useState(0);
  const [openDropdown,   setOpenDropdown]   = useState<"anime" | "community" | "my" | null>(null);
  const [isHydrated,     setIsHydrated]     = useState(false);

  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const profileRef  = useRef<HTMLDivElement>(null);
  const pathname    = usePathname();
  const isHomePage  = pathname === "/";

  const storeUser       = useAuthStore(s => s.user);
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const userSlug        = storeUser?.slug ?? null;

  // MY LIST links resolved with real slug so /dashboard doesn't bounce through redirect
  const MY_LINKS = [
    {
      name: "Dashboard",
      href: userSlug ? `/user/${userSlug}/dashboard` : "/dashboard",
      icon: MonitorPlay,
      desc: "Your personal hub",
    },
  ];

  useEffect(() => {
    setIsHydrated(true);
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      if (isHomePage) {
        const pct = window.scrollY / document.body.scrollHeight;
        setActiveSection(pct < 0.15 ? 0 : pct < 0.32 ? 1 : pct < 0.50 ? 2 : pct < 0.68 ? 3 : pct < 0.85 ? 4 : 5);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHomePage]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setSearchOpen(o => !o); }
      if (e.key === "Escape") { setOpenDropdown(null); setMobileMenuOpen(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const enterDropdown = (key: "anime" | "community" | "my") => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpenDropdown(key);
  };
  const leaveDropdown = () => {
    timerRef.current = setTimeout(() => setOpenDropdown(null), 150);
  };

  const theme = isHomePage ? SECTION_THEMES[activeSection] : SECTION_THEMES[0];
  const T     = { duration: 0.5, ease: "easeInOut" } as const;

  const isAnimePath     = ["/bestanimelist", "/ai-discover", "/seasonal", "/rankings", "/anime"].some(p => pathname.startsWith(p));
  const isCommunityPath = ["/community", "/clubs", "/blog", "/poll", "/leaderboard"].some(p => pathname.startsWith(p));
  const isMyPath        = (userSlug && pathname.startsWith(`/user/${userSlug}/`))
    || ["/watchlist", "/readlist", "/stats", "/streak", "/dashboard"].some(p => pathname.startsWith(p));

  return (
    <header className="w-full flex flex-col items-center pt-3 px-5 pb-0">

      {/* Homepage section colour line */}
      {isHomePage && (
        <motion.div animate={{ backgroundColor: theme.dotColor }} transition={T}
          className="absolute top-0 left-0 right-0 h-[2px] z-[101]" />
      )}


      {/* Nav pill */}
      <motion.nav
        animate={{
          backgroundColor: scrolled ? "color-mix(in srgb, var(--app-bg) 92%, transparent)" : "color-mix(in srgb, var(--app-surface) 70%, transparent)",
          borderColor:     scrolled ? "color-mix(in srgb, var(--app-fg) 18%, transparent)" : "color-mix(in srgb, var(--app-fg) 6%, transparent)",
          boxShadow:       "none",
        }}
        transition={T}
        className="relative flex w-full max-w-[1200px] items-center justify-between rounded-[2rem] px-6 backdrop-blur-2xl border"
        style={{ paddingTop: scrolled ? "8px" : "11px", paddingBottom: scrolled ? "8px" : "11px" }}
      >
        {/* ── Logo ── */}
        <Link href="/" className="group flex items-center gap-2 shrink-0">
          <div className="rounded-xl transition-transform group-hover:scale-105"
            style={{ boxShadow: "0 0 18px color-mix(in srgb, var(--app-fg) 15%, transparent)" }}>
            {/* Kaiveron K mark */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="32" height="32">
              <rect width="100" height="100" rx="18" fill="var(--app-bg)"/>
              <path d="M 30 28 L 40 28 L 40 46 L 47 46 L 54 28 L 64 28 L 53 50 L 50 50 L 60 72 L 50 72 L 44 60 L 40 60 L 40 72 L 30 72 Z" fill="var(--app-fg)"/>
            </svg>
          </div>
          <span className="text-lg font-black tracking-tight text-foreground uppercase italic hidden sm:block">
            KAIVERON<span style={{ color: "var(--app-accent)" }}>.</span>
          </span>
        </Link>

        {/* ── Desktop nav links ── */}
        <nav className="hidden lg:flex items-center gap-1" aria-label="Main navigation">

          <Link href="/"
            className={`whitespace-nowrap px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${pathname === "/" ? "text-foreground bg-surface" : "text-muted hover:text-foreground hover:bg-surface"}`}>
            Home
          </Link>

          {/* Anime dropdown */}
          <div className="relative" onMouseEnter={() => enterDropdown("anime")} onMouseLeave={leaveDropdown}>
            <button
              className={`whitespace-nowrap flex items-center gap-1 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${isAnimePath || openDropdown === "anime" ? "text-foreground bg-surface" : "text-muted hover:text-foreground hover:bg-surface"}`}
              aria-expanded={openDropdown === "anime"} aria-haspopup="menu">
              Anime
              <ChevronDown size={11} className={`transition-transform duration-200 ${openDropdown === "anime" ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {openDropdown === "anime" && <NavDropdown items={ANIME_LINKS} onClose={() => setOpenDropdown(null)} />}
            </AnimatePresence>
          </div>

          {/* Blog — public long-form content (SEO + discovery), shown to everyone. */}
          <Link href="/blog"
            className={`whitespace-nowrap px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${pathname.startsWith("/blog") ? "text-foreground bg-surface" : "text-muted hover:text-foreground hover:bg-surface"}`}>
            Blog
          </Link>

          {/* Community + Leaderboard are part of the logged-in experience.
              Logged-out marketing nav stays minimal: Home + Anime + Blog + Search + Sign in. */}
          {isHydrated && isAuthenticated && (
            <>
              {/* Community dropdown */}
              <div className="relative" onMouseEnter={() => enterDropdown("community")} onMouseLeave={leaveDropdown}>
                <button
                  className={`whitespace-nowrap flex items-center gap-1 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${isCommunityPath || openDropdown === "community" ? "text-foreground bg-surface" : "text-muted hover:text-foreground hover:bg-surface"}`}
                  aria-expanded={openDropdown === "community"} aria-haspopup="menu">
                  Community
                  <ChevronDown size={11} className={`transition-transform duration-200 ${openDropdown === "community" ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {openDropdown === "community" && <NavDropdown items={COMMUNITY_LINKS} onClose={() => setOpenDropdown(null)} />}
                </AnimatePresence>
              </div>

              <Link href="/leaderboard"
                className={`whitespace-nowrap flex items-center gap-1.5 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-full transition-all ${pathname.startsWith("/leaderboard") ? "text-foreground bg-surface" : "text-muted hover:text-foreground hover:bg-surface"}`}>
                <TrendingUp size={11} />
                Leaderboard
              </Link>
            </>
          )}
        </nav>

        {/* ── Actions ── */}
        <div className="flex items-center gap-1.5">
          {/* Search */}
          <button onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 h-9 px-3 rounded-full bg-surface border border-border text-muted hover:text-foreground hover:bg-surface hover:border-border transition-all">
            <Search size={15} />
            <span className="hidden xl:block text-[10px] font-black text-subtle tracking-widest">⌘K</span>
          </button>

          {isHydrated && isAuthenticated && (
            <span className="hidden md:inline-flex">
              <OnlineCountBadge compact />
            </span>
          )}
          {isHydrated && isAuthenticated && <NotificationBell />}
          {isHydrated && isAuthenticated && (
            <Link href="/chat" title="Messages"
              className="p-2 rounded-full text-muted hover:text-foreground hover:bg-surface transition-all">
              <MessageSquare size={17} />
            </Link>
          )}
          {isHydrated && isAuthenticated && <WatchlistLink />}

          {/* Auth CTA / Profile */}
          {isHydrated && !isAuthenticated ? (
            <Link href="/login"
              className="px-5 py-2 rounded-full text-[10px] font-black text-black uppercase tracking-widest transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, var(--app-accent-bright), var(--app-accent))", boxShadow: "0 2px 12px color-mix(in srgb, var(--app-accent) 35%, transparent)" }}>
              Sign In
            </Link>
          ) : isHydrated && isAuthenticated && storeUser ? (
            <div className="relative" ref={profileRef}>
              <button onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-full border border-border p-1 pr-3 bg-surface hover:bg-surface transition-all">
                <Avatar
                  src={storeUser.avatarUrl}
                  name={storeUser.displayName ?? storeUser.username}
                  size={28}
                />
                {/* Lint: Image import retained for other usages below */}
                <span className="text-[10px] font-black text-muted hidden xl:block uppercase tracking-wide max-w-[72px] truncate">
                  {storeUser.displayName ?? storeUser.username}
                </span>
              </button>
              <ProfileMenu
                user={{ name: storeUser.displayName ?? storeUser.username }}
                isOpen={profileOpen}
                onClose={() => setProfileOpen(false)}
                onLogout={async () => {
                  // Call logout with Bearer token (requireAuth) + cookie (credentials)
                  // Best-effort: clear client state even if the API call fails
                  try { await logout() } catch { /* ignore — still clear client */ }
                  disconnectSocket()
                  useAuthStore.getState().clear()
                  setProfileOpen(false)
                  // Hard redirect clears any in-memory state and re-bootstraps cleanly
                  if (typeof window !== "undefined") window.location.href = "/"
                }}
              />
            </div>
          ) : null}

          {/* Mobile hamburger */}
          <button className="lg:hidden text-muted hover:text-foreground transition-colors p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Open menu">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.nav>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* ── Mobile drawer ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0   }}
            exit={{    opacity: 0, y: -10  }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            className="fixed inset-x-4 top-24 z-[90] lg:hidden bg-background/97 backdrop-blur-2xl rounded-3xl border border-border shadow-2xl overflow-hidden"
          >
            <div className="p-4 max-h-[80vh] overflow-y-auto space-y-4">

              <div>
                <p className="text-[8px] font-black text-subtle uppercase tracking-[0.3em] px-3 mb-1">Navigate</p>
                {[{ name: "Home", href: "/" }, { name: "Blog", href: "/blog" }, { name: "Leaderboard", href: "/leaderboard" }].map(l => (
                  <Link key={l.href} href={l.href} onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-3 rounded-xl text-xs font-bold transition-all ${pathname === l.href ? "text-foreground bg-surface" : "text-muted hover:text-foreground hover:bg-surface"}`}>
                    {l.name}
                  </Link>
                ))}
              </div>

              <MobileSection title="Anime" links={ANIME_LINKS} onClose={() => setMobileMenuOpen(false)} />
              <MobileSection title="Community" links={COMMUNITY_LINKS} onClose={() => setMobileMenuOpen(false)} />
              {isAuthenticated && (
                <MobileSection title="My List" links={MY_LINKS} onClose={() => setMobileMenuOpen(false)} />
              )}

              <div className="border-t border-border pt-3">
                {!isAuthenticated ? (
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center px-4 py-3 rounded-xl text-xs font-black text-black transition-all uppercase tracking-widest"
                    style={{ background: "linear-gradient(135deg, var(--app-accent-bright), var(--app-accent))" }}>
                    Sign In
                  </Link>
                ) : (
                  <>
                    <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex items-center px-3 py-3 rounded-xl text-xs font-bold text-muted hover:text-foreground hover:bg-surface transition-all">Dashboard</Link>
                    <Link href="/me/settings/account"  onClick={() => setMobileMenuOpen(false)} className="flex items-center px-3 py-3 rounded-xl text-xs font-bold text-muted hover:text-foreground hover:bg-surface transition-all">Settings</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function MobileSection({ title, links, onClose }: { title: string; links: DropItem[]; accentClass?: string; onClose: () => void }) {
  return (
    <div>
      <p className="text-[8px] font-black text-accent-bright/40 uppercase tracking-[0.4em] px-3 mb-1.5">{title}</p>
      {links.map(l => {
        const Icon = l.icon;
        return (
          <Link key={l.href} href={l.href} onClick={onClose}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-muted hover:text-foreground hover:bg-surface transition-all group">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all group-hover:scale-110"
              style={{
                background: "linear-gradient(135deg, color-mix(in srgb, var(--app-accent) 12%, transparent) 0%, color-mix(in srgb, var(--app-accent-bright) 6%, transparent) 100%)",
                border: "1px solid color-mix(in srgb, var(--app-accent) 20%, transparent)",
              }}
            >
              <Icon size={14} weight="duotone" className="text-accent-bright/80 group-hover:text-accent-bright transition-colors" />
            </div>
            <div>
              <p className="text-[11px] font-black uppercase tracking-wider leading-none">{l.name}</p>
              <p className="text-[9px] text-subtle mt-0.5">{l.desc}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function WatchlistLink() {
  const count = useWatchlist(s => s.count);
  return (
    <Link href="/watchlist"
      className="relative hidden sm:flex h-9 w-9 items-center justify-center rounded-full bg-surface border border-border text-muted hover:text-foreground hover:bg-surface hover:border-border transition-all">
      <Bookmark size={15} />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full text-[8px] font-black text-black flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, var(--app-accent-bright), var(--app-accent))" }}>
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
