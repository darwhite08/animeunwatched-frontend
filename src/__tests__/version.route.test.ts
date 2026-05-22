/**
 * /api/version route handler tests — env fallback + shape of returned payload.
 */
import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { GET } from "@/app/api/version/route"

const originalSha = process.env.VERCEL_GIT_COMMIT_SHA
const originalRef = process.env.VERCEL_GIT_COMMIT_REF
const originalVercelEnv = process.env.VERCEL_ENV

function restore(key: string, value: string | undefined) {
  if (value === undefined) delete process.env[key]
  else process.env[key] = value
}

afterEach(() => {
  restore("VERCEL_GIT_COMMIT_SHA", originalSha)
  restore("VERCEL_GIT_COMMIT_REF", originalRef)
  restore("VERCEL_ENV", originalVercelEnv)
})

describe("GET /api/version", () => {
  beforeEach(() => {
    delete process.env.VERCEL_GIT_COMMIT_SHA
    delete process.env.VERCEL_GIT_COMMIT_REF
    delete process.env.VERCEL_ENV
  })

  it("falls back to 'dev' when VERCEL_GIT_COMMIT_SHA is unset", async () => {
    const res = GET()
    const json = await res.json()
    expect(json.sha).toBe("dev")
    expect(json.shortSha).toBe("dev")
  })

  it("returns full + short SHA when VERCEL_GIT_COMMIT_SHA is set", async () => {
    process.env.VERCEL_GIT_COMMIT_SHA = "abc1234567890def1234567890abcdef12345678"
    const res = GET()
    const json = await res.json()
    expect(json.sha).toBe("abc1234567890def1234567890abcdef12345678")
    expect(json.shortSha).toBe("abc1234")
  })

  it("includes service name", async () => {
    const json = await GET().json()
    expect(json.service).toBe("animeunwatched-frontend")
  })

  it("includes the deploy branch when VERCEL_GIT_COMMIT_REF is set", async () => {
    process.env.VERCEL_GIT_COMMIT_REF = "production"
    const json = await GET().json()
    expect(json.branch).toBe("production")
  })

  it("branch is null when not deployed on Vercel", async () => {
    const json = await GET().json()
    expect(json.branch).toBeNull()
  })

  it("returns a parseable ISO timestamp", async () => {
    const json = await GET().json()
    expect(Number.isFinite(Date.parse(json.ts))).toBe(true)
  })

  it("reports VERCEL_ENV when available, else NODE_ENV", async () => {
    process.env.VERCEL_ENV = "production"
    const json = await GET().json()
    expect(json.env).toBe("production")
  })
})
