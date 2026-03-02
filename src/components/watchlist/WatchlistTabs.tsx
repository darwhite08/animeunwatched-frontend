"use client"

import { useState } from "react"
import clsx from "clsx"

const tabs = ["All", "Watching", "Planning", "Completed"]

export default function WatchlistTabs() {
  const [active, setActive] = useState("All")

  return (
    <div className="flex gap-6 border-b border-white/10 pb-4">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActive(tab)}
          className={clsx(
            "relative pb-2 text-sm transition",
            active === tab
              ? "text-white"
              : "text-white/40 hover:text-white"
          )}
        >
          {tab}

          {active === tab && (
            <span className="absolute bottom-0 left-0 h-[2px] w-full bg-indigo-600 rounded-full" />
          )}
        </button>
      ))}
    </div>
  )
}