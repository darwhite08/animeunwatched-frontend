"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Bell, Heart, MessageCircle, UserPlus, AtSign, Trophy, Flame } from "lucide-react";

const TYPE_META: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  message:         { icon: MessageCircle, color: "text-indigo-400",     bg: "bg-indigo-500/15" },
  new_follower:    { icon: UserPlus,      color: "text-emerald-400",   bg: "bg-emerald-500/15" },
  post_liked:      { icon: Heart,         color: "text-rose-400",      bg: "bg-rose-500/15" },
  review_liked:    { icon: Heart,         color: "text-rose-400",      bg: "bg-rose-500/15" },
  post_comment:    { icon: MessageCircle, color: "text-accent-bright", bg: "bg-accent/15" },
  mention:         { icon: AtSign,        color: "text-sky-400",       bg: "bg-sky-500/15" },
  achievement:     { icon: Trophy,        color: "text-amber-400",     bg: "bg-amber-500/15" },
  streak_reminder: { icon: Flame,         color: "text-orange-400",    bg: "bg-orange-500/15" },
  system:          { icon: Bell,          color: "text-muted",         bg: "bg-surface" },
};
const metaFor = (t: string) => TYPE_META[t] ?? TYPE_META.system;

type Notif = { id: string; type: string; message: string; avatar: string | null; link: string | null; time: string; read: boolean };

export default function NotificationDropdown(
  { notifications, onClose, onMarkRead }: { notifications: Notif[]; onClose: () => void; onClear?: () => void; onMarkRead: () => void },
) {
  const router = useRouter();

  return (
    <div className="bg-background backdrop-blur-2xl backdrop-saturate-150 rounded-3xl border border-border shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <h3 className="text-sm font-black uppercase italic tracking-tight text-foreground">Notifications</h3>
        <button onClick={onMarkRead} className="text-[10px] font-black text-accent-bright/80 hover:text-accent-bright uppercase tracking-widest transition-colors">Mark all read</button>
      </div>

      <div className="max-h-[400px] overflow-y-auto no-scrollbar">
        {notifications.length > 0 ? (
          <div className="p-2 space-y-0.5">
            {notifications.map((n, i) => {
              const { icon: Icon, color, bg } = metaFor(n.type);
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => { if (n.link) { router.push(n.link); onClose(); } }}
                  className={`group relative flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${
                    n.read ? "opacity-60 hover:opacity-100 hover:bg-surface" : "bg-accent/5 hover:bg-white/[0.06]"
                  }`}
                >
                  <div className="relative shrink-0">
                    {n.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={n.avatar} alt="" className="h-9 w-9 rounded-full object-cover bg-surface" />
                    ) : (
                      <div className={`h-9 w-9 rounded-full grid place-items-center ${bg}`}><Icon size={15} className={color} /></div>
                    )}
                    {n.avatar && (
                      <span className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full grid place-items-center ring-2 ring-background ${bg}`}>
                        <Icon size={9} className={color} />
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[13px] leading-snug line-clamp-2 ${n.read ? "text-muted" : "text-foreground font-medium"}`}>{n.message}</p>
                    <p className="text-[10px] text-subtle mt-0.5">{n.time}</p>
                  </div>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-accent shrink-0" />}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center px-10">
            <Bell size={32} className="text-subtle mb-3" />
            <p className="text-xs font-black text-subtle uppercase tracking-widest">No notifications yet</p>
          </div>
        )}
      </div>

      <button
        onClick={onClose}
        className="w-full py-3 border-t border-border text-[11px] font-black text-subtle hover:text-foreground uppercase tracking-widest transition-all"
      >
        Close
      </button>
    </div>
  );
}
