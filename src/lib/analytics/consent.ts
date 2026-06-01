"use client"

import { useEffect, useState } from "react"

/**
 * Shared consent state for analytics. Read from localStorage on first
 * render, then synced via a custom event so multiple components stay in
 * lock-step when the user clicks Accept/Decline.
 *
 * Possible values:
 *   "accepted"  — user opted in; load GA and fire events
 *   "declined"  — user opted out; never load GA, no events
 *   null        — user hasn't decided yet; banner is showing
 */

export const CONSENT_KEY    = "kv_cookie_consent"
const CONSENT_EVENT = "kv:consent-changed"

export type ConsentState = "accepted" | "declined" | null

export function getConsent(): ConsentState {
  if (typeof window === "undefined") return null
  const v = window.localStorage.getItem(CONSENT_KEY)
  return v === "accepted" || v === "declined" ? v : null
}

export function setConsent(value: Exclude<ConsentState, null>): void {
  if (typeof window === "undefined") return
  window.localStorage.setItem(CONSENT_KEY, value)
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }))
}

export function useConsent(): ConsentState {
  const [state, setState] = useState<ConsentState>(null)

  useEffect(() => {
    setState(getConsent())
    const handler = (e: Event) => {
      const v = (e as CustomEvent<ConsentState>).detail ?? getConsent()
      setState(v)
    }
    window.addEventListener(CONSENT_EVENT, handler)
    // Cross-tab sync — if the user accepts in another tab, pick it up here
    const storage = (e: StorageEvent) => { if (e.key === CONSENT_KEY) setState(getConsent()) }
    window.addEventListener("storage", storage)
    return () => {
      window.removeEventListener(CONSENT_EVENT, handler)
      window.removeEventListener("storage", storage)
    }
  }, [])

  return state
}

/**
 * True only on the admin subdomain. Used to suppress GA there — admin
 * activity should never feed product analytics.
 */
export function isAdminHost(): boolean {
  if (typeof window === "undefined") return false
  return window.location.hostname === "admin-dashboard.kaiveron.com"
}
