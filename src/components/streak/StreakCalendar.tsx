"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight, Flame } from "lucide-react"

const weekDays = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"]

// Example streak days per month (demo)
const streakMap: Record<string, number[]> = {
  "2026-0": [2,3,4,5,6,7,9,10,11,12,13,14,16,17,18,19,20,21,23,24,25,26],
  "2026-1": [1,2,5,6,8,9,12,13,14,18,19,20],
}

export default function StreakCalendar() {
  const today = new Date(2026, 0) // start at Jan 2026
  const [currentDate, setCurrentDate] = useState(today)

  const year = currentDate.getFullYear()
  const monthIndex = currentDate.getMonth()

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
  })

  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()

  const firstDayOffset =
    (new Date(year, monthIndex, 1).getDay() + 6) % 7

  const streakDays =
    streakMap[`${year}-${monthIndex}`] || []

  const days = Array.from(
    { length: daysInMonth },
    (_, i) => i + 1
  )

  const handlePrev = () => {
    setCurrentDate(
      new Date(year, monthIndex - 1, 1)
    )
  }

  const handleNext = () => {
    setCurrentDate(
      new Date(year, monthIndex + 1, 1)
    )
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-neutral-950 p-6 md:p-8 space-y-8 ">

      {/* Header */}
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <p className="text-white/40 text-sm">{year}</p>
          <h2 className="text-3xl md:text-4xl font-semibold mt-1">
            {monthName}
          </h2>

          <button className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 transition text-sm md:text-base">
            ✨ View insights
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handlePrev}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            onClick={handleNext}
            className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 text-center text-white/40 text-sm">
        {weekDays.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-10 gap-2 md:gap-4 text-center">

        {/* Offset */}
        {Array.from({ length: firstDayOffset }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {days.map((day) => {
          const isStreak = streakDays.includes(day)

          return (
            <div
              key={day}
              className="relative flex items-center justify-center  h-10 md:h-12"
            >
              {isStreak ? (
                <div className="relative flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-full border border-white/10 hover:scale-110 transition">
                  {/* <Flame
                    size={18}
                    className="text-orange-500"
                  /> */}
                  <img className="bg-transparent" src="https://img.icons8.com/?size=100&id=houGsYyNpCbu&format=png&color=000000" alt="" />
                </div>
              ) : (
                <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-white/40 text-sm md:text-base">
                  {day}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 pt-6 border-t border-white/10 text-white/60 text-sm md:text-base">
        <Flame size={18} className="text-orange-500" />
        <p>
          You are on a{" "}
          <span className="text-white font-medium">
            22-day
          </span>{" "}
          streak and rank{" "}
          <span className="text-white font-medium">
            50,624
          </span>{" "}
          globally.
        </p>
      </div>
    </div>
  )
}