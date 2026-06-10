import { NextResponse } from "next/server"

/**
 * Edge middleware for /user/[slug]/* routes.
 *
 * NOTE: the previous edge auth-gate checked for a `refreshToken` cookie and
 * redirected to /login when absent. It was doubly broken:
 *   1. The backend names the refresh cookie `aw_refresh`, not `refreshToken`.
 *   2. `aw_refresh` is path-scoped to `/api/v1/auth`, so the browser never
 *      sends it to `/user/*` requests — the edge literally cannot read it.
 * The result: EVERY authenticated user was 307-redirected to /login.
 *
 * Auth for these routes is enforced client-side by the (user) layout (Zustand
 * session + /auth/me), and all data access is validated server-side by the
 * session userId. The edge pre-check added nothing but the bug above, so we
 * pass straight through.
 */
export function middleware() {
  return NextResponse.next()
}

export const config = {
  matcher: ["/user/:slug*"],
}
