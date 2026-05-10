"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Sparkles, Menu, X, Bookmark } from "lucide-react";
import { useWatchlist } from "@/stores/watchlist.store";

import { getMockUser, mockLogout } from "@/lib/mockAuth";
import { useAuthStore } from "@/stores/auth.store";
import NotificationBell from "@/components/notifications/NotificationBell";
import SearchModal from "./SearchModal";
import ProfileMenu from "./ProfileMenu";

// Section themes for the cinematic homepage — each section has a distinct identity
const SECTION_THEMES = [
  {
    // Ch1 Hero — indigo (default identity)
    label: "Ch.01 — Hero",
    bg: "rgba(5,5,20,0.88)",
    border: "rgba(99,102,241,0.45)",
    glow: "0 0 60px rgba(99,102,241,0.18), 0 2px 0 rgba(99,102,241,0.5)",
    dot:   "bg-indigo-500",
    dotColor: "#6366f1",
    accent: "text-indigo-400",
    pillBg: "bg-indigo-600/15",
    pillBorder: "border-indigo-500/30",
  },
  {
    // Ch2 Discovery — amber/warm
    label: "Ch.02 — Discovery",
    bg: "rgba(15,10,5,0.88)",
    border: "rgba(245,158,11,0.45)",
    glow: "0 0 60px rgba(245,158,11,0.12), 0 2px 0 rgba(245,158,11,0.5)",
    dot:   "bg-amber-500",
    dotColor: "#f59e0b",
    accent: "text-amber-400",
    pillBg: "bg-amber-600/15",
    pillBorder: "border-amber-500/30",
  },
  {
    // Ch3 AI Oracle — violet/purple
    label: "Ch.03 — AI Oracle",
    bg: "rgba(8,5,20,0.90)",
    border: "rgba(139,92,246,0.55)",
    glow: "0 0 80px rgba(139,92,246,0.22), 0 2px 0 rgba(139,92,246,0.6)",
    dot:   "bg-violet-500",
    dotColor: "#8b5cf6",
    accent: "text-violet-400",
    pillBg: "bg-violet-600/15",
    pillBorder: "border-violet-500/30",
  },
  {
    // Ch4 Community — emerald
    label: "Ch.04 — Community",
    bg: "rgba(2,12,8,0.90)",
    border: "rgba(16,185,129,0.45)",
    glow: "0 0 60px rgba(16,185,129,0.15), 0 2px 0 rgba(16,185,129,0.5)",
    dot:   "bg-emerald-500",
    dotColor: "#10b981",
    accent: "text-emerald-400",
    pillBg: "bg-emerald-600/15",
    pillBorder: "border-emerald-500/30",
  },
  {
    // Ch5 Showcase — indigo deep
    label: "Ch.05 — Showcase",
    bg: "rgba(5,2,18,0.92)",
    border: "rgba(99,102,241,0.35)",
    glow: "0 0 50px rgba(99,102,241,0.15), 0 2px 0 rgba(99,102,241,0.4)",
    dot:   "bg-indigo-600",
    dotColor: "#4f46e5",
    accent: "text-indigo-300",
    pillBg: "bg-indigo-700/20",
    pillBorder: "border-indigo-400/25",
  },
  {
    // Ch6 Final CTA — bright indigo
    label: "Ch.06 — Begin",
    bg: "rgba(2,2,15,0.92)",
    border: "rgba(99,102,241,0.7)",
    glow: "0 0 80px rgba(99,102,241,0.30), 0 2px 0 rgba(99,102,241,0.8)",
    dot:   "bg-indigo-400",
    dotColor: "#818cf8",
    accent: "text-indigo-300",
    pillBg: "bg-indigo-500/20",
    pillBorder: "border-indigo-400/40",
  },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [activeSection, setActiveSection] = useState(0);

  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const profileRef = useRef<HTMLDivElement>(null);

  // Subscribe to real auth store so navbar re-renders on login/logout
  const storeUser = useAuthStore(s => s.user);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      // Section detection for homepage only
      if (pathname === "/") {
        const vh = window.innerHeight
        const scrollY = window.scrollY
        const totalH = document.body.scrollHeight
        // Approximate section boundaries (6 sections)
        const pct = scrollY / totalH
        if      (pct < 0.15) setActiveSection(0)
        else if (pct < 0.32) setActiveSection(1)
        else if (pct < 0.50) setActiveSection(2)
        else if (pct < 0.68) setActiveSection(3)
        else if (pct < 0.85) setActiveSection(4)
        else                  setActiveSection(5)
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Prefer real auth store user; fall back to mock localStorage user
    const authStoreUser = useAuthStore.getState().user;
    if (authStoreUser) {
      setUser({ name: authStoreUser.displayName ?? authStoreUser.username });
    } else {
      const storedUser = getMockUser();
      setUser(storedUser);
    }
    setIsHydrated(true);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname, storeUser]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(o => !o);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  const handleLogout = () => {
    mockLogout();
    setUser(null);
    setProfileOpen(false);
  };

  // 5 core nav links — clean, not cramped
  const navLinks = [
    { name: "Home",       href: "/"              },
    { name: "Discover",   href: "/ai-discover"   },
    { name: "Anime",      href: "/bestanimelist" },
    { name: "Community",  href: "/community"     },
    { name: "Rankings",   href: "/rankings"      },
  ];

  const theme = isHomePage ? SECTION_THEMES[activeSection] : SECTION_THEMES[0]
  const TRANSITION = { duration: 0.6, ease: "easeInOut" } as const

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] flex flex-col items-center pt-3 px-5 pb-0">
      {/* Colored top line — section indicator */}
      {isHomePage && (
        <motion.div
          animate={{ backgroundColor: theme.dotColor, opacity: scrolled ? 1 : 0.5 }}
          transition={TRANSITION}
          className="absolute top-0 left-0 right-0 h-[2px] z-[101]"
        />
      )}

      {/* Chapter label — sits ABOVE the nav pill, not inside it */}
      {isHomePage && scrolled && (
        <motion.div
          key={`label-${activeSection}`}
          initial={{ opacity: 0, y: -6, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className={`mb-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.4em] ${theme.accent} ${theme.pillBg} border ${theme.pillBorder} hidden lg:flex items-center gap-1.5`}
        >
          <motion.span animate={{ backgroundColor: theme.dotColor }} className="w-1.5 h-1.5 rounded-full" />
          {theme.label}
        </motion.div>
      )}

      <motion.nav
        animate={{
          backgroundColor: scrolled ? theme.bg : "rgba(0,0,0,0.08)",
          borderColor: scrolled ? theme.border : "rgba(255,255,255,0.06)",
          boxShadow: scrolled ? theme.glow : "none",
        }}
        transition={TRANSITION}
        className="relative flex w-full max-w-[900px] items-center justify-between rounded-[2rem] px-7 backdrop-blur-2xl border"
        style={{ paddingTop: scrolled ? "8px" : "11px", paddingBottom: scrolled ? "8px" : "11px" }}
      >

        {/* Logo */}
        <Link href="/" className="relative group flex items-center gap-2">
          <motion.div
            animate={{ boxShadow: `0 0 24px ${theme.dotColor}` }}
            transition={TRANSITION}
            className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center transition-transform group-hover:rotate-12"
          >
            <Sparkles size={18} className="text-white" />
          </motion.div>
          <span className="text-lg font-black tracking-tighter text-white uppercase italic hidden sm:block">
            UNWATCHED
            <motion.span
              animate={{ color: theme.dotColor }}
              transition={TRANSITION}
            >.</motion.span>
          </span>
        </Link>

        {/* Links */}
        <motion.div
          animate={{ borderColor: isHomePage && scrolled ? theme.border : "rgba(255,255,255,0.07)" }}
          transition={TRANSITION}
          className="hidden md:flex items-center gap-1 bg-white/[0.04] p-1 rounded-full border"
        >
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href}
              className={`relative px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                pathname === link.href ? "text-white" : "text-white/35 hover:text-white"
              }`}
            >
              {pathname === link.href && (
                <motion.div
                  layoutId="nav-pill"
                  animate={{ backgroundColor: isHomePage ? (theme.dotColor + "25") : "rgba(255,255,255,0.1)", borderColor: isHomePage ? (theme.dotColor + "50") : "rgba(255,255,255,0.1)" }}
                  transition={TRANSITION}
                  className="absolute inset-0 rounded-full border"
                />
              )}
              <span className="relative z-10">{link.name}</span>
            </Link>
          ))}
        </motion.div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button onClick={() => setSearchOpen(true)} className="p-2.5 rounded-full bg-white/5 text-white/40 hover:text-white transition-all">
            <Search size={18} />
          </button>
          {isHydrated && user && <NotificationBell />}
          
          {/* Watchlist Icon Shortcut added back to Navbar.tsx */}
          {isHydrated && user && <WatchlistLink />}
          {isHydrated && !user ? (
            <Link href="/login" className="px-6 py-2.5 rounded-full bg-indigo-600 text-[10px] font-black text-white uppercase tracking-widest">
              Sync Account
            </Link>
          ) : user && (
            <div className="relative" ref={profileRef}>
              <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 rounded-full border border-white/10 p-1 pr-4 bg-white/5">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-bold text-white">{user.name[0]}</div>
                <span className="text-[10px] font-black text-white/80 hidden lg:block uppercase">{user.name}</span>
              </button>
              <ProfileMenu user={user} isOpen={profileOpen} onClose={() => setProfileOpen(false)} onLogout={handleLogout} />
            </div>
          )}

          <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.nav>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="fixed inset-x-4 top-24 z-[90] md:hidden bg-[#0c0c0c]/95 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
        >
          <div className="p-5 space-y-1">
            {[
              { name: "Home",       href: "/"              },
              { name: "Discover",   href: "/ai-discover"   },
              { name: "Anime",      href: "/bestanimelist" },
              { name: "Community",  href: "/community"     },
              { name: "Rankings",   href: "/rankings"      },
              { name: "Blog",       href: "/blog"          },
              { name: "Leaderboard",href: "/leaderboard"   },
              { name: "Polls",      href: "/poll"          },
              { name: "Calendar",   href: "/calendar"      },
            ].map(link => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center px-4 py-3 rounded-xl text-sm font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all"
              >
                {link.name}
              </Link>
            ))}
            <div className="border-t border-white/5 pt-3 mt-3 space-y-1">
              {isHydrated && !user ? (
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center px-4 py-3 rounded-xl text-sm font-black text-white bg-indigo-600 hover:bg-indigo-500 transition-all uppercase tracking-widest"
                >
                  Sync Account
                </Link>
              ) : user && (
                <>
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-4 py-3 rounded-xl text-sm font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all"
                  >Dashboard</Link>
                  <Link href="/settings" onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-4 py-3 rounded-xl text-sm font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all"
                  >Settings</Link>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
}

function WatchlistLink() {
  const count = useWatchlist(s => s.count);
  return (
    <Link
      href="/watchlist"
      className="relative hidden sm:flex p-2.5 rounded-full bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-white/10 transition-all"
    >
      <Bookmark size={18} />
      {count > 0 && (
        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-indigo-600 text-[8px] font-black text-white flex items-center justify-center">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}