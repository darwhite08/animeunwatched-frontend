import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Edge middleware — runs before any page render.
 *
 * Responsibilities:
 *   1. Host-based routing: requests to admin-dashboard.kaiveron.com are
 *      rewritten to /admin/* in the same Next.js app. Conversely, direct
 *      /admin/* hits on the main host are bounced back to the marketing
 *      site (so admin URLs only exist on the admin subdomain).
 *   2. Cookie gate on /user/[slug]/* routes (existing layer-1 check).
 *
 * Security model for /user/[slug]/* routes:
 *   Layer 1 (here): check that a refreshToken cookie exists. No cookie → /login.
 *   Layer 2 (layout): client-side Zustand check confirms slug === session user's slug.
 *
 * Security model for /admin/* routes:
 *   Layer 1 (here): refreshToken cookie must exist OR redirect to /login.
 *   Layer 2 (page layout): client-side role check; non-ADMIN → /403.
 *   Layer 3 (backend): every /api/v1/admin/* call has requireAdmin middleware
 *                      that validates the JWT's role claim.
 *
 * The access token lives in memory (Zustand) — the edge cannot read it,
 * so the role gate is enforced both client-side (UX) and server-side (security).
 */

const ADMIN_HOST = "admin-dashboard.kaiveron.com"

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const host = req.headers.get("host") ?? ""
  const isAdminHost = host === ADMIN_HOST || host.startsWith(ADMIN_HOST + ":")

  // ── Host-based routing ────────────────────────────────────────────────────
  if (isAdminHost) {
    // Already inside /admin → just continue (allows the rewrite below to be a no-op)
    if (pathname.startsWith("/admin")) {
      return guardAdminCookie(req)
    }
    // Map root → /admin, everything else → /admin/<path>
    const target = req.nextUrl.clone()
    target.pathname = "/admin" + (pathname === "/" ? "" : pathname)
    return guardAdminCookie(req, NextResponse.rewrite(target))
  }

  // Direct hits to /admin on the marketing host → not exposed here
  if (pathname.startsWith("/admin")) {
    const url = req.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  // ── User-scoped cookie gate (existing) ────────────────────────────────────
  if (pathname.startsWith("/user/")) {
    const refreshToken = req.cookies.get("refreshToken")?.value
    if (!refreshToken) {
      const loginUrl = req.nextUrl.clone()
      loginUrl.pathname = "/login"
      loginUrl.searchParams.set("returnTo", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.next()
}

function guardAdminCookie(req: NextRequest, fallback?: NextResponse): NextResponse {
  // Skip cookie check on the login page itself + on Next internals
  const p = req.nextUrl.pathname
  if (p.startsWith("/admin/login") || p.startsWith("/_next") || p.startsWith("/admin/_next")) {
    return fallback ?? NextResponse.next()
  }

  // The backend refresh cookie is `aw_refresh`, set with domain=".kaiveron.com"
  // in production so it's shared across all subdomains. If it's missing the
  // user has never logged in (or it expired) — bounce them to the admin
  // login page where they get redirected to the main site to authenticate.
  const refreshToken = req.cookies.get("aw_refresh")?.value
  if (!refreshToken) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = "/admin/login"
    loginUrl.searchParams.set("returnTo", p)
    return NextResponse.redirect(loginUrl)
  }
  return fallback ?? NextResponse.next()
}

export const config = {
  // Run on every request so the host check happens. Exclude Next internals
  // and static assets to keep the edge cost down.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|css|woff2?|map)$).*)"],
}
