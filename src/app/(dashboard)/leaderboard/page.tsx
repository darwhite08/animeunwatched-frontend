"use client"

import TopStats from "@/components/leaderboard/TopStats"
import TopThree from "@/components/leaderboard/TopThree"
import RankingTable from "@/components/leaderboard/RankingTable"

export default function LeaderboardPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-semibold">
          Leaderboard
        </h1>
        <p className="text-white/50 mt-2">
          See who’s dominating the anime world.
        </p>
      </div>

      <TopStats />
      <TopThree />
      <RankingTable />
    </div>
  )
}