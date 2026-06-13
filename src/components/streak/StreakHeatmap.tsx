"use client"

import { motion } from "framer-motion"
import { useAuthStore } from "@/stores/auth.store"
import { useUserList } from "@/hooks/useLists"

// 6-month heatmap of the user's real activity. Intensity per day = number
// of list-entry updates on that calendar day. Falls back to a flat "no
// activity" view when the user hasn't done anything yet.
export const StreakHeatmap = () => {
  const user = useAuthStore(s => s.user)
  const { data: listData } = useUserList(user?.username ?? "")

  const DAYS = 182
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const tally = new Map<number, number>()  // dayOffset → count
  for (const e of listData?.data ?? []) {
    const d = new Date(e.updatedAt); d.setHours(0, 0, 0, 0)
    const offset = Math.floor((today.getTime() - d.getTime()) / 86_400_000)
    if (offset < 0 || offset >= DAYS) continue
    tally.set(offset, (tally.get(offset) ?? 0) + 1)
  }
  const maxCount = Math.max(1, ...Array.from(tally.values()))

  function level(count: number): 0 | 1 | 2 | 3 | 4 {
    if (count === 0)             return 0
    const r = count / maxCount
    if (r >= 0.85)               return 4
    if (r >= 0.5)                return 3
    if (r >= 0.25)               return 2
    return 1
  }

  // Walk oldest → newest so the grid renders in chronological order
  const data = Array.from({ length: DAYS }, (_, i) => {
    const offset = DAYS - 1 - i
    const c      = tally.get(offset) ?? 0
    return { day: i, intensity: level(c), count: c }
  })

  // Last 6 month labels (oldest first)
  const months = (() => {
    const out: string[] = []
    const base = new Date(today)
    base.setDate(1)
    base.setMonth(base.getMonth() - 5)
    for (let i = 0; i < 6; i++) {
      out.push(base.toLocaleString(undefined, { month: "short" }))
      base.setMonth(base.getMonth() + 1)
    }
    return out
  })()

  // 182 days laid out as a 7-row (weekday) grid that scrolls horizontally —
  // the GitHub layout. On a phone the user swipes through the columns with
  // native momentum instead of cells wrapping into a cramped block.
  return (
    <div className="space-y-3">
      <div
        className="-mx-1 overflow-x-auto scrollbar-hide [scroll-snap-type:x_proximity]"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <div className="inline-block px-1">
          <div className="flex justify-between text-[10px] font-black text-subtle uppercase tracking-widest mb-3">
            {months.map(m => <span key={m}>{m}</span>)}
          </div>

          <div className="grid grid-flow-col grid-rows-7 gap-1.5 md:gap-2 w-max">
            {data.map((d, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.002 }}
                whileHover={{ scale: 1.5, zIndex: 50 }}
                title={`${d.count} update${d.count === 1 ? "" : "s"}`}
                className={`h-3.5 w-3.5 md:h-4 md:w-4 rounded-[4px] cursor-pointer transition-colors duration-500 shadow-sm
                  ${d.intensity === 0 ? "bg-surface hover:bg-surface" : ""}
                  ${d.intensity === 1 ? "bg-indigo-900/40" : ""}
                  ${d.intensity === 2 ? "bg-indigo-700/60" : ""}
                  ${d.intensity === 3 ? "bg-accent" : ""}
                  ${d.intensity === 4 ? "bg-accent-bright shadow-[0_0_15px_color-mix(in srgb, var(--app-accent-bright) 50%, transparent)]" : ""}
                `}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
