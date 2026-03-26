"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { User, LayoutDashboard, Bookmark, LogOut } from "lucide-react";

interface ProfileMenuProps {
  user: any;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function ProfileMenu({ user, isOpen, onClose, onLogout }: ProfileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="absolute right-0 mt-4 w-56 rounded-[1.5rem] bg-[#0a0a0a] border border-white/10 shadow-2xl p-2 backdrop-blur-3xl"
        >
          <Link href="/dashboard" onClick={onClose} className="flex items-center gap-3 rounded-xl px-4 py-3 text-[10px] font-black text-white/60 uppercase hover:bg-white/5 hover:text-indigo-400 transition-all">
            <LayoutDashboard size={14} /> Neural Dashboard
          </Link>
          <Link href="/profile" onClick={onClose} className="flex items-center gap-3 rounded-xl px-4 py-3 text-[10px] font-black text-white/60 uppercase hover:bg-white/5 hover:text-indigo-400 transition-all">
            <User size={14} /> User Profile
          </Link>
          <Link href="/watchlist" onClick={onClose} className="flex items-center gap-3 rounded-xl px-4 py-3 text-[10px] font-black text-white/60 uppercase hover:bg-white/5 hover:text-indigo-400 transition-all">
            <Bookmark size={14} /> Watchlist
          </Link>
          <div className="h-px bg-white/5 my-2 mx-2" />
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[10px] font-black text-red-400/60 uppercase hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut size={14} /> Terminate Session
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}