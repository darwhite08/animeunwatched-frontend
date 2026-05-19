/**
 * API client tests — tests the fetch wrapper behavior.
 */
import { describe, it, expect, vi, beforeEach } from "vitest"
import { useAuthStore } from "@/stores/auth.store"

// Reset fetch mock between tests
const mockFetch = vi.fn()
global.fetch = mockFetch

beforeEach(() => {
  mockFetch.mockReset()
  useAuthStore.setState({ accessToken: null, user: null, isAuthenticated: false })
})

describe("api() client — success paths", () => {
  it("returns JSON body on 200", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValueOnce({ data: "hello" }),
    })

    const { api } = await import("@/lib/api/client")
    const result = await api<{ data: string }>("/test")
    expect(result).toEqual({ data: "hello" })
  })

  it("returns undefined on 204 No Content", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: vi.fn(),
    })

    const { api } = await import("@/lib/api/client")
    const result = await api<void>("/test", { method: "DELETE" })
    expect(result).toBeUndefined()
  })

  it("includes Authorization header when token is set", async () => {
    useAuthStore.setState({ accessToken: "my-token", user: null, isAuthenticated: true })
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValueOnce({}),
    })

    const { api } = await import("@/lib/api/client")
    await api("/protected")

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/protected"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer my-token",
        }),
      })
    )
  })

  it("does not include Authorization header when no token", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValueOnce({}),
    })

    const { api } = await import("@/lib/api/client")
    await api("/public")

    const callArgs = mockFetch.mock.calls[0][1] as RequestInit
    const headers = callArgs.headers as Record<string, string>
    expect(headers.Authorization).toBeUndefined()
  })

  it("always sets credentials: include", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValueOnce({}),
    })

    const { api } = await import("@/lib/api/client")
    await api("/test")

    expect(mockFetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ credentials: "include" })
    )
  })
})

describe("api() client — error paths", () => {
  it("throws ApiError on non-200 response", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: vi.fn().mockResolvedValueOnce({ error: { code: "NOT_FOUND", message: "Not found" } }),
    })

    const { api, ApiError } = await import("@/lib/api/client")
    await expect(api("/missing")).rejects.toBeInstanceOf(ApiError)
  })

  it("ApiError has correct status and code on 404", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: vi.fn().mockResolvedValueOnce({ error: { code: "NOT_FOUND", message: "Resource missing" } }),
    })

    const { api, ApiError } = await import("@/lib/api/client")
    try {
      await api("/missing")
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError)
      const apiErr = err as InstanceType<typeof ApiError>
      expect(apiErr.status).toBe(404)
      expect(apiErr.code).toBe("NOT_FOUND")
      expect(apiErr.message).toBe("Resource missing")
    }
  })

  it("prepends API base URL to path", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValueOnce({}),
    })

    const { api } = await import("@/lib/api/client")
    await api("/anime/21")

    const url = mockFetch.mock.calls[0][0] as string
    expect(url).toContain("/api/v1/anime/21")
  })
})
