"use client";

import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import NotificationDropdown from "./NotificationDropdown";
import { useNotifications } from "./useNotifications";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAllAsRead, clearAll } = useNotifications();
  const bellRef = useRef<HTMLDivElement>(null);
  // Track previous count so we can punch the bell when a new one arrives
  const prevCountRef = useRef(unreadCount);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (unreadCount > prevCountRef.current) {
      setShake(true);
      const t = setTimeout(() => setShake(false), 800);
      prevCountRef.current = unreadCount;
      return () => clearTimeout(t);
    }
    prevCountRef.current = unreadCount;
  }, [unreadCount]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={bellRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        animate={shake ? { rotate: [0, -18, 18, -14, 14, -8, 8, 0] } : { rotate: 0 }}
        transition={{ duration: 0.8 }}
        className="relative p-2.5 rounded-full bg-white/5 border border-white/5 text-white/40 hover:text-white hover:bg-amber-500/10 transition-colors group"
      >
        <Bell size={18} className={unreadCount > 0 ? "text-amber-400" : ""} />

        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-amber-500 text-black text-[9px] font-black flex items-center justify-center leading-none shadow-[0_0_8px_rgba(245,158,11,0.6)]">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute right-0 mt-4 w-80 sm:w-96 z-[110]"
          >
            <NotificationDropdown 
              notifications={notifications} 
              onClose={() => setIsOpen(false)} 
              onClear={clearAll}
              onMarkRead={markAllAsRead}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}