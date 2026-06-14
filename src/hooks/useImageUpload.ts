"use client"

import { useCallback, useState } from "react"
import { presignAvatarUpload, presignPostImageUpload, presignShotVideoUpload } from "@/lib/api/endpoints"
import { ApiError } from "@/lib/api/client"

/**
 * Image upload via R2 presigned PUT.
 *
 * Flow: pick file → POST /uploads/{scope} → backend returns presigned PUT URL +
 * public URL → frontend PUTs the bytes directly to R2 → returned publicUrl is
 * saved to the post / DM / profile.
 *
 * Never proxies bytes through the backend, so it's fast on free Render tier.
 *
 * Returns:
 *   upload(file) → Promise<{ publicUrl, key }>
 *   isUploading  — true while a request is in flight
 *   error        — friendly error string or null
 */

export type UploadScope = "avatar" | "post" | "shot"

type UploadResult = { publicUrl: string; key: string }

const ALLOWED_MIMES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"])
// Shots accept short videos (phone-camera formats included).
const ALLOWED_VIDEO_MIMES = new Set(["video/mp4", "video/webm", "video/quicktime", "video/3gpp"])
const MAX_BYTES = { avatar: 5 * 1024 * 1024, post: 10 * 1024 * 1024, shot: 100 * 1024 * 1024 } as const

function validate(file: File, scope: UploadScope): string | null {
  if (scope === "shot") {
    if (!ALLOWED_VIDEO_MIMES.has(file.type)) {
      return "Only MP4, WebM, MOV, or 3GP videos are supported."
    }
    if (file.size > MAX_BYTES.shot) {
      return `Video is too large — must be under ${MAX_BYTES.shot / 1024 / 1024}MB.`
    }
    return null
  }
  if (!ALLOWED_MIMES.has(file.type)) {
    return "Only JPEG, PNG, WebP, or GIF images are supported."
  }
  if (file.size > MAX_BYTES[scope]) {
    const max = MAX_BYTES[scope] / 1024 / 1024
    return `Image is too large — must be under ${max}MB.`
  }
  return null
}

async function presign(scope: UploadScope, contentType: string, size: number) {
  if (scope === "avatar") return presignAvatarUpload(contentType, size)
  if (scope === "shot")   return presignShotVideoUpload(contentType, size)
  return presignPostImageUpload(contentType, size)
}

export function useImageUpload(scope: UploadScope) {
  const [isUploading, setUploading] = useState(false)
  const [error, setError]           = useState<string | null>(null)
  const [progress, setProgress]     = useState(0)

  const upload = useCallback(async (file: File): Promise<UploadResult> => {
    setError(null)
    const v = validate(file, scope)
    if (v) { setError(v); throw new Error(v) }

    setUploading(true)
    setProgress(0)
    try {
      const intent = await presign(scope, file.type, file.size)

      // Try the direct upload to S3 first (fast, no backend bandwidth).
      // New backend → size-enforced presigned POST (intent.fields); older
      // backend → presigned PUT. Either way the proxy is the fallback.
      try {
        if (intent.fields) {
          await directPost(intent.uploadUrl, intent.fields, file, setProgress)
        } else {
          await directPut(intent.uploadUrl, file, setProgress)
        }
        setProgress(100)
        return { publicUrl: intent.publicUrl, key: intent.key }
      } catch (err) {
        // Direct-to-S3 blocked (extension / strict CSP / network). Fall back to
        // the server-side proxy — now video-capable and pointed at the backend
        // directly, so shots up to 100MB go through too.
        console.warn("[upload] direct upload failed, retrying via proxy:", err)
        setProgress(10)
      }

      const proxied = await proxyUpload(scope, file, setProgress)
      setProgress(100)
      return proxied
    } catch (err) {
      let msg = "Could not upload image"
      if (err instanceof ApiError) {
        if (err.code === "NOT_CONFIGURED") {
          msg = "Image uploads aren't enabled yet — ask your admin to set R2 credentials."
        } else if (err.code === "VALIDATION") {
          msg = err.message
        } else {
          msg = err.message || msg
        }
      } else if (err instanceof Error) {
        msg = err.message
      }
      setError(msg)
      throw err
    } finally {
      setUploading(false)
    }
  }, [scope])

  return { upload, isUploading, error, progress, reset: () => { setError(null); setProgress(0) } }
}

// Direct size-enforced presigned POST to S3 (multipart form-data: the policy
// fields first, the file LAST). The browser sets the multipart Content-Type +
// boundary — we must NOT set it ourselves.
async function directPost(
  url: string,
  fields: Record<string, string>,
  file: File,
  setProgress: (n: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const form = new FormData()
    for (const [k, v] of Object.entries(fields)) form.append(k, v)
    form.append("file", file) // must be last
    const xhr = new XMLHttpRequest()
    xhr.open("POST", url, true)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      // 403 EntityTooLarge here = the file exceeded the policy's size cap.
      else reject(new Error(`S3 POST returned ${xhr.status}`))
    }
    xhr.onerror = () => reject(new Error("Direct upload blocked"))
    xhr.send(form)
  })
}

// Direct presigned PUT to S3 (legacy fallback for an older backend).
async function directPut(url: string, file: File, setProgress: (n: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("PUT", url, true)
    xhr.setRequestHeader("Content-Type", file.type)
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else reject(new Error(`S3 PUT returned ${xhr.status}`))
    }
    xhr.onerror = () => reject(new Error("Direct upload blocked"))
    xhr.send(file)
  })
}

// Server-side proxy fallback — POSTs raw bytes to /api/v1/uploads/proxy
// which uploads to S3 with credentials and returns the public URL.
async function proxyUpload(
  scope: UploadScope,
  file: File,
  setProgress: (n: number) => void,
): Promise<UploadResult> {
  const { useAuthStore } = await import("@/stores/auth.store")
  const token = useAuthStore.getState().accessToken

  // Hit the backend DIRECTLY (not the relative /api which is rewritten through
  // Vercel and capped at ~4.5MB) so large videos can be proxied to S3.
  const base = process.env.NEXT_PUBLIC_API_BASE ?? ""
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("POST", `${base}/api/v1/uploads/proxy?scope=${scope}`, true)
    xhr.setRequestHeader("Content-Type", file.type)
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`)
    xhr.withCredentials = true
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try { resolve(JSON.parse(xhr.responseText) as UploadResult) }
        catch { reject(new Error("Proxy returned malformed response")) }
      } else {
        reject(new Error(`Proxy upload returned ${xhr.status}`))
      }
    }
    xhr.onerror = () => reject(new Error("Proxy upload network error"))
    xhr.send(file)
  })
}
