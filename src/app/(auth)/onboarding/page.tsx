"use client"

import { useRouter } from "next/navigation"
import OnboardingModal from "@/components/onboarding/OnboardingModal"

export default function OnboardingPage() {
  const router = useRouter()

  const handleComplete = () => {
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-[#020202]">
      <OnboardingModal isOpen onComplete={handleComplete} />
    </div>
  )
}
