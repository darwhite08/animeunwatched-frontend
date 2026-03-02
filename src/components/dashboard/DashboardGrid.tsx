"use client"

import WatchStatsCard from "./cards/WatchStatsCard"
import ActivityCard from "./cards/ActivityCard"
import GenreCard from "./cards/GenreCard"
import RecommendationCard from "./cards/RecommendationCard"

export default function DashboardGrid() {
  return (
    <div className="grid grid-cols-12 gap-6">
      
      <div className="col-span-12 md:col-span-6 xl:col-span-4">
        <WatchStatsCard />
      </div>

      <div className="col-span-12 md:col-span-6 xl:col-span-4">
        <ActivityCard />
      </div>

      <div className="col-span-12 xl:col-span-4">
        <GenreCard />
      </div>

      <div className="col-span-12">
        <RecommendationCard />
      </div>

    </div>
  )
}