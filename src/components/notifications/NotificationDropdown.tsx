"use client";

import { motion } from "framer-motion";
import { Bell, Zap, MessageSquare, Trophy } from "lucide-react";

export default function NotificationDropdown({ notifications, onClose, onClear, onMarkRead }: any) {
  const getIcon = (type: string) => {
    switch(type) {
      case 'comment': return <MessageSquare size={16} />;
      case 'achievement': return <Trophy size={16} />;
      default: return <Zap size={16} />;
    }
  };

  return (
    /* FIXED: Reduced opacity to /70 and added backdrop-saturate for a better glass effect */
    <div className="bg-[#0c0c0c] backdrop-blur-2xl backdrop-saturate-150 rounded-[2rem] border border-border shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden">
      {/* HUD Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-surface">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-emerald-500" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Neural_Feed</h3>
        </div>
        <div className="flex gap-4">
          <button onClick={onMarkRead} className="text-[9px] font-black text-emerald-400/60 hover:text-emerald-400 uppercase tracking-widest transition-colors">Mark Read</button>
          <button onClick={onClear} className="text-[9px] font-black text-subtle hover:text-red-400 uppercase tracking-widest transition-colors">Clear</button>
        </div>
      </div>

      {/* Kinetic Feed */}
      <div className="max-h-[400px] overflow-y-auto no-scrollbar">
        {notifications.length > 0 ? (
          <div className="p-2 space-y-1">
            {notifications.map((notif: any, i: number) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`group relative flex gap-4 p-4 rounded-2xl transition-all border border-transparent ${
                  notif.read ? "opacity-40 hover:opacity-100" : "bg-surface border-border hover:bg-surface"
                }`}
              >
                <div className="shrink-0 h-10 w-10 rounded-xl bg-surface border border-border flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground leading-tight uppercase tracking-tight mb-1">
                    {notif.message}
                  </p>
                  <p className="text-[9px] font-black text-subtle uppercase tracking-widest">
                    {notif.time} // {notif.node}
                  </p>
                </div>

                {!notif.read && (
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center px-10">
            <Bell size={40} className="text-subtle mb-4" />
            <p className="text-[10px] font-black text-subtle uppercase tracking-[0.2em]">Archive_Empty</p>
          </div>
        )}
      </div>

      <button 
        onClick={onClose}
        className="w-full py-4 border-t border-border bg-black/40 text-[9px] font-black text-subtle hover:text-foreground uppercase tracking-[0.4em] transition-all"
      >
        Close Interface
      </button>
    </div>
  );
}