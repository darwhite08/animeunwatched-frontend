"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { X, Clapperboard, Loader2, Film, ArrowLeft } from "lucide-react"
import { useImageUpload } from "@/hooks/useImageUpload"
import { createShot } from "@/lib/api/endpoints"
import { useToast } from "@/stores/toast.store"

// Broad accept so the phone gallery shows every clip; the upload hook validates
// the actual codec (mp4 / webm / mov / 3gp) and surfaces a friendly error.
const ACCEPT = "video/*"

/** Grab the current frame of a <video> as a JPEG blob (best-effort cover). */
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
 * Post a Shot (vertical video reel), Instagram-style: full-screen on phones,
 * a centered card on desktop. Pick a clip → preview → caption → uploads straight
 * to R2 (presigned) → create. A cover frame is captured client-side.
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
    if (!f.type.startsWith("video/")) { push("Please choose a video.", "error"); return }
    if (f.size > 100 * 1024 * 1024) { push("Video is too large — must be under 100MB.", "error"); return }
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setFile(f)
    setPreviewUrl(URL.createObjectURL(f))
    setDurationMs(undefined)
  }

  const onMeta = () => {
    const d = videoRef.current?.duration
    if (d && isFinite(d)) setDurationMs(Math.round(d * 1000))
  }

  const share = async () => {
    if (!file || posting) return
    setPosting(true)
    try {
      let thumbnailUrl: string | undefined
      const blob = await captureFrame(videoRef.current)
      if (blob) {
        try {
          const t = await uploadThumb(new File([blob], "shot-thumb.jpg", { type: "image/jpeg" }))
          thumbnailUrl = t.publicUrl
        } catch { /* cover is optional */ }
      }
      const { publicUrl } = await uploadVideo(file)
      await createShot({ videoUrl: publicUrl, thumbnailUrl, caption: caption.trim() || undefined, durationMs })
      push("Shot shared! 🎬", "success")
      onPosted?.()
      onClose()
    } catch (e) {
      push(e instanceof Error ? e.message : "Failed to share shot", "error")
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
        className="fixed inset-0 z-[100] flex items-stretch justify-center bg-black/80 backdrop-blur-sm sm:items-center sm:p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 30, opacity: 0, scale: 0.99 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 30, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          onClick={(e) => e.stopPropagation()}
          className="flex h-full w-full flex-col bg-surface sm:h-auto sm:max-h-[92dvh] sm:w-full sm:max-w-md sm:rounded-3xl sm:border sm:border-border"
        >
          {/* Header — Instagram-style: back/close · title · Share */}
          <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border px-4 py-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] sm:pt-3">
            <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg text-foreground transition-colors hover:bg-surface-2" aria-label="Close">
              <ArrowLeft size={18} className="sm:hidden" />
              <X size={18} className="hidden sm:block" />
            </button>
            <p className="flex items-center gap-2 text-sm font-black uppercase italic tracking-tight text-foreground">
              <Clapperboard size={16} className="text-accent-bright" /> New Shot
            </p>
            <button
              onClick={share}
              disabled={!file || posting || videoUploading}
              className="rounded-lg px-2 py-1.5 text-[13px] font-black uppercase tracking-wide text-accent-bright transition-opacity hover:opacity-80 disabled:opacity-30"
            >
              {posting ? "…" : "Share"}
            </button>
          </div>

          <input ref={fileRef} type="file" accept={ACCEPT} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) pickFile(f) }} />

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4">
            {!previewUrl ? (
              <button
                onClick={() => fileRef.current?.click()}
                className="mx-auto flex aspect-[9/16] w-full max-w-[280px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface-2 text-subtle transition-colors hover:border-white/50 hover:text-foreground"
              >
                <Film size={30} />
                <span className="text-[12px] font-black uppercase tracking-widest">Choose a video</span>
                <span className="px-6 text-center text-[10px] leading-relaxed text-subtle">MP4 / WebM / MOV · up to 100MB · vertical looks best</span>
              </button>
            ) : (
              <div className="space-y-4">
                {/* Media preview */}
                <div className="relative mx-auto aspect-[9/16] max-h-[58vh] w-auto overflow-hidden rounded-2xl border border-border bg-background sm:max-h-[48vh]">
                  {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                  <video ref={videoRef} src={previewUrl} onLoadedMetadata={onMeta} className="h-full w-full object-contain" controls playsInline muted />
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="absolute right-2 top-2 rounded-full bg-black/70 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-foreground transition-transform active:scale-95"
                  >
                    Change
                  </button>
                </div>

                {/* Instagram-style caption row: thumbnail + caption */}
                <div className="flex items-start gap-3">
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-border bg-background">
                    {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                    <video src={previewUrl} className="h-full w-full object-cover" muted playsInline />
                  </div>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Write a caption…"
                    rows={3}
                    maxLength={2200}
                    className="min-h-[3.5rem] flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-subtle outline-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer — primary Share button */}
          {previewUrl && (
            <div className="shrink-0 border-t border-border p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] sm:pb-4">
              <button
                onClick={share}
                disabled={posting || videoUploading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent py-3.5 text-[12px] font-black uppercase tracking-widest text-black transition-all hover:bg-accent-bright active:scale-[0.99] disabled:opacity-50"
              >
                {posting ? <Loader2 size={15} className="animate-spin" /> : <Clapperboard size={15} />}
                {posting ? (videoUploading ? "Uploading…" : "Sharing…") : "Share"}
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  )
}
