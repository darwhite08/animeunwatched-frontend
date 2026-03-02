"use client"

import DashboardHeader from "@/components/dashboard/DashboardHeader"
import DashboardGrid from "@/components/dashboard/DashboardGrid"

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <DashboardHeader />
      <DashboardGrid />
    </div>
  )
}