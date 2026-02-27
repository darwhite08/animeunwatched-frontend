"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X, Search, User, Bookmark, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

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
  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false);
      }

      if (
        searchRef.current &&
        !searchRef.current.contains(e.target as Node)
      ) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Best Anime List", href: "/bestanimelist" },
    { name: "Leaderboard", href: "/leaderboard" },
    { name: "Discover", href: "/discover" },
    { name: "Polls", href: "/polls" },
    { name: "Rate", href: "/rate" },
  ];

  const user = { name: "Priyanshu" };

  return (
    <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
      <nav
        className={`relative flex w-full max-w-6xl items-center justify-between rounded-full px-8 py-4 text-sm backdrop-blur-xl transition-all duration-300
        ${scrolled
            ? "bg-black/90 border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.6)]"
            : "bg-black/60 border border-white/5"
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

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="relative group text-white/70 hover:text-white transition"
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-indigo-500 transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="hidden md:flex items-center gap-6">
          {/* Search */}
          <div className="relative" ref={searchRef}>
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-white/70 hover:text-white transition"
            >
              <Search size={20} />
            </button>

            <div className="relative" ref={searchRef}>

            </div>
          </div>

          {/* Watchlist */}
          <Link
            href="/watchlist"
            className="flex items-center gap-2 text-white/70 hover:text-white transition"
          >
            <Bookmark size={18} />
            Watchlist
          </Link>

          {/* Auth */}
          {!isLoggedIn ? (
            <button
              onClick={() => setIsLoggedIn(true)}
              className="rounded-full bg-indigo-600 px-5 py-2 font-medium text-white transition hover:bg-indigo-700"
            >
              Login
            </button>
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
                        setIsLoggedIn(false);
                        setProfileOpen(false);
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
              className="absolute left-0 top-full mt-4 w-full rounded-2xl border border-white/10 bg-black p-6 shadow-2xl md:hidden"
            >
              <div className="flex flex-col gap-6 text-base">
                {navLinks.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}

                <Link href="/watchlist" onClick={() => setIsOpen(false)}>
                  Watchlist
                </Link>

                {!isLoggedIn ? (
                  <button
                    onClick={() => {
                      setIsLoggedIn(true);
                      setIsOpen(false);
                    }}
                    className="rounded-full bg-indigo-600 py-3 font-medium"
                  >
                    Login
                  </button>
                ) : (
                  <>
                    <Link
                      href="/profile"
                      onClick={() => setIsOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        setIsLoggedIn(false);
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
  <AnimatePresence>
  {searchOpen && (
    <>
      {/* Background Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md"
        onClick={() => setSearchOpen(false)}
      />

      {/* Glass Search Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: -20 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4"
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="
            w-full max-w-2xl
            rounded-3xl
            border border-white/10
            bg-gradient-to-br from-white/10 to-white/5
            backdrop-blur-2xl
            shadow-[0_20px_80px_rgba(0,0,0,0.6)]
            p-8
          "
        >
          {/* Top Search Row */}
          <div className="flex items-center gap-4 border-b border-white/10 pb-5">
            <Search className="text-white/50" size={22} />
            <input
              autoFocus
              type="text"
              placeholder="Search anime, genres, characters..."
              className="w-full bg-transparent text-xl font-medium outline-none placeholder:text-white/40"
            />
          </div>

          {/* Suggestions Area */}
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