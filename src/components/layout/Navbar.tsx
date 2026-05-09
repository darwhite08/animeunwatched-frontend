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

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const pathname = usePathname();
  const profileRef = useRef<HTMLDivElement>(null);

  // Subscribe to real auth store so navbar re-renders on login/logout
  const storeUser = useAuthStore(s => s.user);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

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

  const navLinks = [
    { name: "Home",        href: "/"              },
    { name: "Discover",    href: "/ai-discover"   },
    { name: "Best Anime",  href: "/bestanimelist" },
    { name: "Community",   href: "/community"     },
    { name: "Blog",        href: "/blog"          },
    { name: "Leaderboard", href: "/leaderboard"  },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] flex justify-center p-6">
      <motion.nav
        className={`relative flex w-full max-w-5xl items-center justify-between rounded-[2rem] px-8 py-3 transition-all duration-500 ${scrolled ? "bg-black/40 border border-white/10 backdrop-blur-2xl py-2" : "bg-black/20 border border-white/5 backdrop-blur-md"
          }`}
      >
        {/* Logo */}
        <Link href="/" className="relative group flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-transform group-hover:rotate-12">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="text-lg font-black tracking-tighter text-white uppercase italic hidden sm:block">
            UNWATCHED<span className="text-indigo-500">.</span>
          </span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5">
          {navLinks.map((link) => (
            <Link key={link.name} href={link.href} className={`relative px-5 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${pathname === link.href ? "text-white" : "text-white/40 hover:text-white"}`}>
              {pathname === link.href && (
                <motion.div layoutId="nav-pill" className="absolute inset-0 bg-white/10 rounded-full border border-white/10" />
              )}
              <span className="relative z-10">{link.name}</span>
            </Link>
          ))}
        </div>

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
              { name: "Home",        href: "/"              },
              { name: "Discover",    href: "/ai-discover"   },
              { name: "Best Anime",  href: "/bestanimelist" },
              { name: "Community",   href: "/community"     },
              { name: "Blog",        href: "/blog"          },
              { name: "Leaderboard", href: "/leaderboard"   },
              { name: "Polls",       href: "/poll"          },
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