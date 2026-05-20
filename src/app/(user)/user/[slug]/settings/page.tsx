"use client"
import { useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
export default function SettingsRedirect() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  useEffect(() => { router.replace(`/user/${slug}/settings/account`) }, [slug, router])
  return null
}
