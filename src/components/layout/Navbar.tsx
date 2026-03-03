"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X, Search, User, Bookmark, LogOut, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NotificationBell from "@/components/notifications/NotificationBell"
import { getMockUser, mockLogout } from "@/lib/mockAuth"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<any>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const [isHydrated, setIsHydrated] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };

    if (searchOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node))
        setProfileOpen(false);

      if (moreRef.current && !moreRef.current.contains(e.target as Node))
        setMoreOpen(false);

      if (searchRef.current && !searchRef.current.contains(e.target as Node))
        setSearchOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  // mock user check
  useEffect(() => {
    const storedUser = getMockUser()
    setUser(storedUser)
    setIsHydrated(true)
  }, [pathname])

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Discover", href: "/ai-discover" },
    { name: "Best Anime List", href: "/bestanimelist" },
    { name: "Leaderboard", href: "/leaderboard" },
    { name: "Polls", href: "/poll" },
    { name: "Rate", href: "/rate" },
    { name: "Feed", href: "/rate" },
    { name: "blog", href: "/creators" },
    { name: "store", href: "/rate" },
    { name: "stream", href: "/rate" },
    { name: "Community", href: "/rate" },
  ];


  return (
    <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
      <nav
        className={`relative flex w-full max-w-6xl items-center justify-between rounded-full px-8 py-4 text-sm backdrop-blur-xl transition-all duration-300
        ${scrolled
            ? "bg-black/85 border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.6)]"
            : "bg-black/50 border border-white/10"
          }`}
      >
        {/* Logo */}
        <Link
          href="/"
          className="text-lg font-semibold tracking-wide hover:opacity-80 transition"
        >
          <span className="bg-gradient-to-r from-white to-[#748298] bg-clip-text text-transparent">
            AnimeUnwatched
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-5">
          {/* Primary Links */}
          {navLinks
            .filter(
              (item) =>
                !["store", "blog", "stream", "feed", "community"].includes(item.name.toLowerCase())
            )
            .map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="relative group flex items-center gap-2 text-white/60 hover:text-white transition"
              >
                {item.name === "Discover" && (
                  <Sparkles size={14} className="text-indigo-400 drop-shadow-[0_0_6px_rgba(99,102,241,0.6)]" />
                )}

                {item.name}
                <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-indigo-500 transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}

          {/* More Dropdown */}
          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setMoreOpen((prev) => !prev)}
              className="flex items-center gap-1 text-white/60 hover:text-white transition"
            >
              Explore
              <svg
                className="w-3 h-3 mt-[2px]"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.937a.75.75 0 111.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <AnimatePresence>
              {moreOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 mt-4 w-48 rounded-xl bg-zinc-900 border border-white/10 shadow-xl p-2"
                >
                  {navLinks
                    .filter((item) =>
                      ["store", "blog", "stream", "feed", "community"].includes(item.name.toLowerCase())
                    )
                    .map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMoreOpen(false)}
                        className="block rounded-lg px-3 py-2 text-sm text-white/70 hover:bg-zinc-800 hover:text-white transition"
                      >
                        {item.name}
                      </Link>
                    ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Section */}
        <div className="hidden md:flex items-center gap-6">

          {/* Search */}
          <div className="relative" ref={searchRef}>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-white/60 hover:text-white transition"
            >
              <Search size={20} />
            </button>
          </div>
          {/* Notification */}
          {user && <div>
            <NotificationBell />
          </div>}

          {/* Watchlist */}
          <Link
            href="/watchlist"
            className="flex items-center gap-2 text-white/60 hover:text-white transition"
          >
            <Bookmark size={18} />
            Watchlist
          </Link>

          {/* Auth */}
          {!isHydrated ? null : !user ? (
            <Link
              href="/login"
              className="rounded-full bg-indigo-600 px-5 py-2 font-medium text-white transition hover:bg-indigo-700"
            >
              Login
            </Link>
          ) : (
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 hover:bg-white/10 transition"
              >
                <User size={16} />
                {user.name}
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute right-0 mt-4 w-44 rounded-xl bg-zinc-900 p-2 shadow-xl border border-white/10"
                  >
                    <Link
                      href="/profile"
                      className="block rounded-lg px-3 py-2 text-sm hover:bg-zinc-800"
                    >
                      Profile
                    </Link>

                    <button
                      onClick={() => {
                        mockLogout()
                        setUser(null)
                        setProfileOpen(false)
                      }}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-zinc-800"
                    >
                      <LogOut size={14} />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute left-0 top-full mt-4 w-full rounded-2xl border border-white/10 bg-black/95 p-6 shadow-2xl md:hidden"
            >
              <div className="flex flex-col gap-6 text-base">
                {navLinks.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2"
                  >
                    {item.name === "Discover" && (
                      <Sparkles size={14} className="text-indigo-400" />
                    )}
                    {item.name}
                  </Link>
                ))}

                <Link href="/watchlist" onClick={() => setIsOpen(false)}>
                  Watchlist
                </Link>

                {!isHydrated ? null : !user ? (
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full bg-indigo-600 py-3 font-medium text-center"
                  >
                    Login
                  </Link>
                ) : (
                  <>
                    <Link href="/profile" onClick={() => setIsOpen(false)}>
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        mockLogout()
                        setUser(null)
                        setProfileOpen(false)
                        setIsOpen(false);
                      }}
                    >
                      Logout
                    </button>

                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md"
              onClick={() => setSearchOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-2xl rounded-3xl border border-white/10 bg-zinc-900/95 p-8 shadow-2xl"
              >
                <div className="flex items-center gap-4 border-b border-white/10 pb-5">
                  <Search className="text-white/50" size={22} />
                  <input
                    autoFocus
                    type="text"
                    placeholder="Search anime, genres, characters..."
                    className="w-full bg-transparent text-xl font-medium outline-none placeholder:text-white/40"
                  />
                </div>

                <div className="mt-6 space-y-3 text-sm text-white/50">
                  <p>Trending: Attack on Titan</p>
                  <p>Trending: Demon Slayer</p>
                  <p>Trending: One Piece</p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}