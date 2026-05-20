import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Edge middleware — runs before any page render.
 *
 * Security model for /user/[slug]/* routes:
 *   Layer 1 (here): check that a refreshToken cookie exists. No cookie → not logged in → /login.
 *   Layer 2 (layout): client-side Zustand check confirms slug === session user's slug.
 *                     Mismatch → bounced to /user/<sessionSlug>/dashboard.
 *
 * The access token lives in memory (Zustand) — the edge cannot read it.
 * We use the refreshToken cookie as a lightweight auth signal only; the actual
 * data fetching always uses the server-validated session userId.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Only guard user-scoped routes
  if (!pathname.startsWith("/user/")) return NextResponse.next()

  // Allow the login redirect to avoid loops
  const refreshToken = req.cookies.get("refreshToken")?.value

  if (!refreshToken) {
    const loginUrl = req.nextUrl.clone()
    loginUrl.pathname = "/login"
    loginUrl.searchParams.set("returnTo", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/user/:slug*"],
}
