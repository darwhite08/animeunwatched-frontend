"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Search, User, Bookmark, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const user = { name: "Priyanshu" };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Leaderboard", href: "/leaderboard" },
    { name: "Discover", href: "/discover" },
    { name: "Polls", href: "/polls" },
    { name: "Rate", href: "/rate" },
  ];

  return (
 <header className="fixed top-6 left-0 right-0 z-50 flex justify-center transition-all duration-300">
      <nav
        className={`relative flex w-full max-w-6xl items-center justify-between rounded-full px-8 py-4 text-sm text-white backdrop-blur-md transition-all duration-300
        ${
          scrolled
            ? "bg-black/90 border border-white/10 shadow-lg"
            : "bg-black/70 border border-white/5"
        }`}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center font-semibold tracking-wide">
          <span className="text-lg font-bold">ANIME</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="relative group text-white/80 hover:text-white transition"
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-white transition-all duration-300 group-hover:w-full"></span>
            </Link>
          ))}
        </div>

        {/* Right Section */}
        <div className="hidden md:flex items-center gap-6">
          {/* Search */}
          <div className="relative">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-white/80 hover:text-white transition"
            >
              <Search size={20} />
            </button>

            <AnimatePresence>
              {searchOpen && (
                <motion.input
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 200, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  type="text"
                  placeholder="Search anime..."
                  className="absolute right-8 top-[-6px] rounded-full bg-zinc-900 px-4 py-2 text-sm outline-none border border-white/10"
                />
              )}
            </AnimatePresence>
          </div>

          {/* Watchlist */}
          <Link
            href="/watchlist"
            className="flex items-center gap-2 text-white/80 hover:text-white transition"
          >
            <Bookmark size={18} />
            Watchlist
          </Link>

          {/* Auth */}
          {!isLoggedIn ? (
            <button
              onClick={() => setIsLoggedIn(true)}
              className="rounded-full bg-white px-4 py-2 font-medium text-black shadow-[0px_0px_30px_7px] shadow-white/40 hover:bg-gray-200 hover:shadow-[0px_0px_30px_14px] transition duration-300"
            >
              Login
            </button>
          ) : (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 rounded-full border border-slate-600 px-4 py-2 hover:bg-slate-800 transition"
              >
                <User size={16} />
                {user.name}
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-3 w-44 rounded-xl bg-zinc-900 p-2 shadow-xl border border-white/10"
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
          className="md:hidden"
          aria-label="Toggle Menu"
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
              className="absolute left-0 top-full mt-4 w-full rounded-2xl bg-black p-6 shadow-xl border border-white/10 md:hidden"
            >
              <div className="flex flex-col gap-6 text-base">
                {navLinks.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="hover:text-white/80"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}

                <Link
                  href="/watchlist"
                  onClick={() => setIsOpen(false)}
                >
                  Watchlist
                </Link>

                {!isLoggedIn ? (
                  <button
                    onClick={() => {
                      setIsLoggedIn(true);
                      setIsOpen(false);
                    }}
                    className="rounded-full bg-white py-3 text-black font-medium"
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
    </header>
  );
}