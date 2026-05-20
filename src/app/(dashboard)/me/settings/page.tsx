"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function MeSettingsRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace("/me/settings/account") }, [router])
  return null
}
