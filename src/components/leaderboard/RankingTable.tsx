"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"

const users = [
  {
    rank: 1,
    name: "OtakuMaster",
    watched: 124,
    hours: 340,
    achievements: 42,
    points: 5675,
  },
  {
    rank: 2,
    name: "AnimeSensei",
    watched: 118,
    hours: 310,
    achievements: 39,
    points: 5443,
  },
  {
    rank: 3,
    name: "ShonenKing",
    watched: 97,
    hours: 260,
    achievements: 28,
    points: 4362,
  },
]

export default function RankingTable() {
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    return users.filter((user) =>
      user.name
        .toLowerCase()
        .includes(search.toLowerCase())
    )
  }, [search])

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 space-y-6">

      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          Global Ranking
        </h2>

        <div className="relative w-64">
          <Search
            size={16}
            className="absolute left-3 top-3 text-white/40"
          />
          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search user..."
            className="w-full bg-neutral-900 border border-white/10 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="text-white/40 text-sm">
            <tr>
              <th className="py-3">Rank</th>
              <th>Name</th>
              <th>Anime Watched</th>
              <th>Hours</th>
              <th>Achievements</th>
              <th>Points</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((user) => (
              <tr
                key={user.rank}
                className="border-t border-white/10 hover:bg-white/5 transition"
              >
                <td className="py-4">
                  #{user.rank}
                </td>
                <td>{user.name}</td>
                <td>{user.watched}</td>
                <td>{user.hours}</td>
                <td>{user.achievements}</td>
                <td className="text-indigo-400 font-semibold">
                  {user.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  )
}