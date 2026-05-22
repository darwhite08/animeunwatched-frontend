import { NextResponse } from "next/server"

/**
 * Reports which commit this running build was deployed from.
 *
 * On Vercel, `VERCEL_GIT_COMMIT_SHA` is injected at build time per deploy.
 * Locally we fall back to "dev". The `check-deploys.sh` script at the
 * project root compares this against `git rev-parse HEAD` on the production
 * branch to verify a push has actually gone live.
 */
export const dynamic = "force-dynamic"

export function GET() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA || "dev"
  return NextResponse.json({
    sha,
    shortSha: sha === "dev" ? "dev" : sha.slice(0, 7),
    env: process.env.VERCEL_ENV || process.env.NODE_ENV || "development",
    service: "animeunwatched-frontend",
    branch: process.env.VERCEL_GIT_COMMIT_REF || null,
    ts: new Date().toISOString(),
  })
}
