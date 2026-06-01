"use client"

import { useState } from "react"
import clsx from "clsx"

const tabs = ["All", "Watching", "Planning", "Completed"]

export default function WatchlistTabs() {
  const [active, setActive] = useState("All")

  return (
    <div className="flex gap-6 border-b border-border pb-4">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => setActive(tab)}
          className={clsx(
            "relative pb-2 text-sm transition",
            active === tab
              ? "text-foreground"
              : "text-muted hover:text-foreground"
          )}
        >
          {tab}

          {active === tab && (
            <span className="absolute bottom-0 left-0 h-[2px] w-full bg-accent rounded-full" />
          )}
        </button>
      ))}
    </div>
  )
}