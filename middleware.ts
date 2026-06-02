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
    // Already inside /admin → just continue
    if (pathname.startsWith("/admin")) {
      return NextResponse.next()
    }
    // Map root → /admin, everything else → /admin/<path>
    const target = req.nextUrl.clone()
    target.pathname = "/admin" + (pathname === "/" ? "" : pathname)
    return NextResponse.rewrite(target)
    // Note: we do NOT check the refresh cookie here because it is path-scoped
    // to /api/v1/auth so the browser doesn't send it on /admin requests.
    // The AdminLayout component runs SessionProvider's bootstrap (which DOES
    // hit /api/v1/auth/refresh where the cookie is sent), then enforces the
    // ADMIN role check before rendering anything sensitive.
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

export const config = {
  // Run on every request so the host check happens. Exclude Next internals
  // and static assets to keep the edge cost down.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|js|css|woff2?|map)$).*)"],
}
