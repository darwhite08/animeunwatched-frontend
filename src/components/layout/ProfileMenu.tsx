"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { SquaresFour, User, BookmarkSimple, SignOut, Gear, PenNib } from "@phosphor-icons/react";

interface ProfileMenuProps {
  user: { name: string };
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const LINKS = [
  { href: "/dashboard",            icon: SquaresFour,   label: "Dashboard"  },
  { href: "/profile",              icon: User,           label: "Profile"    },
  { href: "/watchlist",            icon: BookmarkSimple, label: "Watchlist"  },
  { href: "/creators/create/blog", icon: PenNib,         label: "Write Blog" },
  { href: "/settings",             icon: Gear,           label: "Settings"   },
]

export default function ProfileMenu({ user, isOpen, onClose, onLogout }: ProfileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.93, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.93, y: 8 }}
          transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
          className="absolute right-0 mt-3 w-52 rounded-2xl p-1.5 backdrop-blur-2xl z-50"
          style={{
            background: "linear-gradient(160deg, rgba(12,10,22,0.98), rgba(8,7,18,0.99))",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.7), 0 0 0 0.5px rgba(245,158,11,0.1) inset",
          }}
        >
          {/* User label */}
          <div className="px-3 py-2 mb-1">
            <p className="text-[9px] font-black uppercase tracking-[0.3em]" style={{ color: "rgba(245,158,11,0.5)" }}>
              Signed in as
            </p>
            <p className="text-[11px] font-black text-white/80 truncate mt-0.5">{user.name}</p>
          </div>

          {/* Gold shimmer divider */}
          <div className="h-px mx-2 mb-1" style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.3), transparent)" }} />

          {LINKS.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} onClick={onClose}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[10px] font-black text-white/50 uppercase tracking-widest hover:text-white hover:bg-white/[0.04] transition-all group"
            >
              <Icon size={14} weight="duotone" className="text-amber-400/60 group-hover:text-amber-400 transition-colors" />
              {label}
            </Link>
          ))}

          <div className="h-px mx-2 my-1" style={{ background: "rgba(255,255,255,0.05)" }} />

          <button onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[10px] font-black text-red-400/50 uppercase tracking-widest hover:bg-red-500/8 hover:text-red-400 transition-all group"
          >
            <SignOut size={14} weight="duotone" className="group-hover:text-red-400 transition-colors" />
            Sign Out
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
