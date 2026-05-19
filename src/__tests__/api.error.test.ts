/**
 * ApiError class and api client error handling tests
 */
import { describe, it, expect } from "vitest"
import { ApiError } from "@/lib/api/client"

describe("ApiError", () => {
  it("is an instance of Error", () => {
    const err = new ApiError(404, "NOT_FOUND", "Resource missing")
    expect(err).toBeInstanceOf(Error)
    expect(err).toBeInstanceOf(ApiError)
  })

  it("stores status, code, and message", () => {
    const err = new ApiError(401, "UNAUTHORIZED", "Invalid token")
    expect(err.status).toBe(401)
    expect(err.code).toBe("UNAUTHORIZED")
    expect(err.message).toBe("Invalid token")
  })

  it("has correct name", () => {
    const err = new ApiError(500, "INTERNAL", "Server error")
    expect(err.name).toBe("ApiError")
  })

  it("can represent 409 CONFLICT", () => {
    const err = new ApiError(409, "CONFLICT", "Email already exists")
    expect(err.status).toBe(409)
    expect(err.code).toBe("CONFLICT")
  })

  it("can represent 429 RATE_LIMITED", () => {
    const err = new ApiError(429, "RATE_LIMITED", "Too many requests")
    expect(err.status).toBe(429)
  })
})
