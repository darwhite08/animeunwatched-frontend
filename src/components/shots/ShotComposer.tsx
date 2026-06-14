"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { X, Clapperboard, Loader2, Film } from "lucide-react"
import { useImageUpload } from "@/hooks/useImageUpload"
import { createShot } from "@/lib/api/endpoints"
import { useToast } from "@/stores/toast.store"

const ACCEPT = "video/mp4,video/webm,video/quicktime,video/3gpp"

/** Grab the current frame of a <video> as a JPEG blob (best-effort thumbnail). */
function captureFrame(video: HTMLVideoElement | null): Promise<Blob | null> {
  return new Promise((resolve) => {
    try {
      if (!video || !video.videoWidth) return resolve(null)
      const canvas = document.createElement("canvas")
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext("2d")
      if (!ctx) return resolve(null)
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.82)
    } catch {
      resolve(null)
    }
  })
}

/**
 * Post a Shot (vertical video reel). Pick a video → preview → caption → upload
 * straight to R2 (presigned) → create. A poster frame is captured client-side
 * so the feed has a thumbnail (best-effort; the post still works without one).
 */
export function ShotComposer({ onClose, onPosted }: { onClose: () => void; onPosted?: () => void }) {
  const { push } = useToast()
  const { upload: uploadVideo, isUploading: videoUploading } = useImageUpload("shot")
  const { upload: uploadThumb } = useImageUpload("post")
  const fileRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [caption, setCaption] = useState("")
  const [durationMs, setDurationMs] = useState<number | undefined>(undefined)
  const [posting, setPosting] = useState(false)

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl) }, [previewUrl])

  const pickFile = (f: File) => {
    const v = validateVideo(f)
    if (v) { push(v, "error"); return }
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
    setDurationMs(undefined)
  }

  const onMeta = () => {
    const d = videoRef.current?.duration
    if (d && isFinite(d)) setDurationMs(Math.round(d * 1000))
  }

  const post = async () => {
    if (!file || posting) return
    setPosting(true)
    try {
      // 1. Best-effort poster frame.
      let thumbnailUrl: string | undefined
      const blob = await captureFrame(videoRef.current)
      if (blob) {
        try {
          const t = await uploadThumb(new File([blob], "shot-thumb.jpg", { type: "image/jpeg" }))
          thumbnailUrl = t.publicUrl
        } catch { /* thumbnail is optional */ }
      }
      // 2. The video itself → R2.
      const { publicUrl } = await uploadVideo(file)
      // 3. Create the shot.
      await createShot({ videoUrl: publicUrl, thumbnailUrl, caption: caption.trim() || undefined, durationMs })
      push("Shot posted! 🎬", "success")
      onPosted?.()
      onClose()
    } catch (e) {
      push(e instanceof Error ? e.message : "Failed to post shot", "error")
    } finally {
      setPosting(false)
    }
  }

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 24, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl border border-border bg-surface p-4 sm:p-5 max-h-[92dvh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <p className="flex items-center gap-2 text-sm font-black uppercase italic tracking-tight text-foreground">
              <Clapperboard size={16} className="text-accent-bright" /> New Shot
            </p>
            <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg text-subtle hover:bg-surface-2 hover:text-foreground transition-colors" aria-label="Close">
              <X size={16} />
            </button>
          </div>

          <input ref={fileRef} type="file" accept={ACCEPT} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) pickFile(f) }} />

          {/* Pick / preview */}
          {!previewUrl ? (
            <button
              onClick={() => fileRef.current?.click()}
              className="flex aspect-[9/16] max-h-[52vh] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface-2 text-subtle transition-colors hover:border-accent/50 hover:text-accent-bright"
            >
              <Film size={28} />
              <span className="text-[11px] font-black uppercase tracking-widest">Choose a video</span>
              <span className="text-[10px] text-subtle">MP4 / WebM / MOV · up to 100MB · vertical looks best</span>
            </button>
          ) : (
            <div className="relative mx-auto aspect-[9/16] max-h-[52vh] w-auto overflow-hidden rounded-2xl border border-border bg-black">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video ref={videoRef} src={previewUrl} onLoadedMetadata={onMeta} className="h-full w-full object-contain" controls playsInline muted />
              <button
                onClick={() => fileRef.current?.click()}
                className="absolute right-2 top-2 rounded-full bg-black/70 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white transition-transform active:scale-95"
              >
                Change
              </button>
            </div>
          )}

          {/* Caption */}
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Add a caption…"
            rows={2}
            maxLength={2200}
            className="mt-3 w-full resize-none rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm text-foreground placeholder:text-subtle outline-none focus:border-accent/40"
          />

          {/* Post */}
          <button
            onClick={post}
            disabled={!file || posting || videoUploading}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-3.5 text-[11px] font-black uppercase tracking-widest text-black transition-all hover:bg-accent-bright active:scale-[0.99] disabled:opacity-50"
          >
            {posting ? <Loader2 size={14} className="animate-spin" /> : <Clapperboard size={14} />}
            {posting ? (videoUploading ? "Uploading…" : "Posting…") : "Post Shot"}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  )
}

function validateVideo(f: File): string | null {
  if (!f.type.startsWith("video/")) return "Please choose a video file."
  if (f.size > 100 * 1024 * 1024) return "Video is too large — must be under 100MB."
  return null
}
