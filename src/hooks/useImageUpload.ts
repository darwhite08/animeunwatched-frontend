"use client"

import { useCallback, useState } from "react"
import { presignAvatarUpload, presignPostImageUpload } from "@/lib/api/endpoints"
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

export type UploadScope = "avatar" | "post"

type UploadResult = { publicUrl: string; key: string }

const ALLOWED_MIMES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"])
const MAX_BYTES = { avatar: 5 * 1024 * 1024, post: 10 * 1024 * 1024 } as const

function validate(file: File, scope: UploadScope): string | null {
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
  return scope === "avatar"
    ? presignAvatarUpload(contentType, size)
    : presignPostImageUpload(contentType, size)
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

      // Use XMLHttpRequest so we can report upload progress
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open("PUT", intent.uploadUrl, true)
        xhr.setRequestHeader("Content-Type", file.type)
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
        }
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve()
          else reject(new Error(`Upload failed (${xhr.status})`))
        }
        xhr.onerror = () => reject(new Error("Network error during upload"))
        xhr.send(file)
      })

      setProgress(100)
      return { publicUrl: intent.publicUrl, key: intent.key }
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
