"use client"

import { useRouter } from "next/navigation"
import OnboardingModal from "@/components/onboarding/OnboardingModal"

export default function OnboardingPage() {
  const router = useRouter()

  const handleComplete = () => {
    // "/" routes through LandingGate → the user's feed (Instagram-style home).
    router.push("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <OnboardingModal isOpen onComplete={handleComplete} />
    </div>
  )
}
