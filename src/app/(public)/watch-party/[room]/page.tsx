"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Users, Crown, Link as LinkIcon, Send, Check } from "lucide-react"
import { getSocket } from "@/lib/socket"
import { useAuthStore } from "@/stores/auth.store"

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global { interface Window { YT?: any; onYouTubeIframeAPIReady?: () => void } }
let apiPromise: Promise<void> | null = null
function loadYT(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve()
  if (window.YT?.Player) return Promise.resolve()
  if (apiPromise) return apiPromise
  apiPromise = new Promise<void>((resolve) => {
    const prev = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => { prev?.(); resolve() }
    const s = document.createElement("script"); s.src = "https://www.youtube.com/iframe_api"; document.head.appendChild(s)
  })
  return apiPromise
}

type WpState = { hostId: string; videoId: string | null; playing: boolean; time: number; at: number; youAreHost?: boolean }
type ChatMsg = { userId: string; name: string; text: string; at: number }

export default function WatchPartyRoom() {
  const params = useParams()
  const search = useSearchParams()
  const me = useAuthStore((s) => s.user)
  const roomShort = String(params?.room ?? "")
  const room = `wp:${roomShort}`
  const initialVideo = search.get("v") || undefined

  const [isHost, setIsHost] = useState(false)
  const [count, setCount] = useState(1)
  const [videoId, setVideoId] = useState<string | undefined>(initialVideo)
  const [chat, setChat] = useState<ChatMsg[]>([])
  const [draft, setDraft] = useState("")
  const [copied, setCopied] = useState(false)

  const hostRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<any>(null)
  const applyingRemote = useRef(false)
  const isHostRef = useRef(false)
  const videoRef = useRef<string | undefined>(initialVideo)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => { isHostRef.current = isHost }, [isHost])
  useEffect(() => { videoRef.current = videoId }, [videoId])
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }) }, [chat])

  const emitSync = useCallback((partial: { playing?: boolean; time?: number; videoId?: string }) => {
    const sock = getSocket(); if (!sock || !isHostRef.current) return
    sock.emit("wp:sync", { room, ...partial })
  }, [room])

  // Apply remote host state to the player (participants).
  const applyRemote = useCallback((st: WpState) => {
    if (st.videoId && st.videoId !== videoRef.current) { setVideoId(st.videoId); videoRef.current = st.videoId }
    const p = playerRef.current
    if (!p?.getCurrentTime) return
    applyingRemote.current = true
    const target = st.time + (st.playing ? (Date.now() - st.at) / 1000 : 0)
    try {
      if (Math.abs((p.getCurrentTime() || 0) - target) > 2) p.seekTo(target, true)
      if (st.playing) p.playVideo(); else p.pauseVideo()
    } catch { /* noop */ }
    setTimeout(() => { applyingRemote.current = false }, 700)
  }, [])

  // Socket wiring
  useEffect(() => {
    let cleanup: (() => void) | undefined
    let retry: ReturnType<typeof setTimeout> | undefined
    const attach = () => {
      const sock = getSocket()
      if (!sock) { retry = setTimeout(attach, 600); return }
      const onState = (st: WpState) => {
        if (typeof st.youAreHost === "boolean") setIsHost(st.youAreHost)
        else setIsHost(st.hostId === me?.id)
        if (!(st.hostId === me?.id || st.youAreHost)) applyRemote(st)
        else if (st.videoId && st.videoId !== videoRef.current) { setVideoId(st.videoId); videoRef.current = st.videoId }
      }
      const onPresence = (d: { count: number }) => setCount(d.count)
      const onChat = (m: ChatMsg) => setChat((c) => [...c.slice(-99), m])
      sock.on("wp:state", onState); sock.on("wp:presence", onPresence); sock.on("wp:chat", onChat)
      sock.emit("wp:join", room)
      cleanup = () => { sock.off("wp:state", onState); sock.off("wp:presence", onPresence); sock.off("wp:chat", onChat); sock.emit("wp:leave", room) }
    }
    attach()
    return () => { if (retry) clearTimeout(retry); cleanup?.() }
  }, [room, me?.id, applyRemote])

  // Build the player once we have a video. YT.Player REPLACES its target node
  // with an <iframe>, so we hand it an imperatively-created child instead of a
  // React-managed element — otherwise the next re-render (presence/chat/host
  // updates) reconciles against the detached node and the player vanishes,
  // leaving a black box. React only ever owns the stable `hostRef` wrapper.
  useEffect(() => {
    if (!videoId) return
    let cancelled = false
    loadYT().then(() => {
      if (cancelled || !hostRef.current || !window.YT?.Player) return
      if (playerRef.current?.loadVideoById) { playerRef.current.loadVideoById(videoId); return }
      const mount = document.createElement("div")
      mount.style.width = "100%"; mount.style.height = "100%"
      hostRef.current.appendChild(mount)
      playerRef.current = new window.YT.Player(mount, {
        width: "100%",
        height: "100%",
        videoId,
        playerVars: { rel: 0, modestbranding: 1, playsinline: 1, iv_load_policy: 3, origin: typeof window !== "undefined" ? window.location.origin : undefined },
        events: {
          onReady: () => { if (isHostRef.current && videoRef.current) emitSync({ videoId: videoRef.current, playing: false, time: 0 }) },
          onStateChange: (e: { data: number }) => {
            if (applyingRemote.current || !isHostRef.current) return
            const p = playerRef.current
            if (e.data === 1) emitSync({ playing: true, time: p.getCurrentTime() })   // playing
            else if (e.data === 2) emitSync({ playing: false, time: p.getCurrentTime() }) // paused
          },
        },
      })
    })
    return () => { cancelled = true }
  }, [videoId, emitSync])

  // Tear the player down on unmount so its iframe/listeners don't leak.
  useEffect(() => () => {
    try { playerRef.current?.destroy?.() } catch { /* noop */ }
    playerRef.current = null
  }, [])

  // Host heartbeat — keep participants' clocks aligned every 5s while playing.
  useEffect(() => {
    const t = setInterval(() => {
      const p = playerRef.current
      if (isHostRef.current && p?.getPlayerState && p.getPlayerState() === 1) emitSync({ playing: true, time: p.getCurrentTime() })
    }, 5000)
    return () => clearInterval(t)
  }, [emitSync])

  const sendChat = () => {
    const sock = getSocket(); const text = draft.trim()
    if (!sock || !text) return
    sock.emit("wp:chat", { room, text, name: me?.displayName || me?.username || "Guest" })
    setDraft("")
  }
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { /* noop */ }
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-4 sm:pt-20">
        {/* Header */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-black uppercase italic tracking-tighter">Watch Party</h1>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-[11px] font-bold text-muted"><Users size={13} /> {count} watching</span>
          {isHost && <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] font-black text-accent-bright"><Crown size={13} /> Host</span>}
          <button onClick={copyLink} className="ml-auto inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2 text-[11px] font-black uppercase tracking-widest text-muted transition hover:text-foreground">
            {copied ? <><Check size={14} /> Copied</> : <><LinkIcon size={14} /> Invite</>}
          </button>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Player */}
          <div className="overflow-hidden rounded-2xl border border-border bg-black">
            {videoId ? (
              <div className="relative aspect-video w-full"><div ref={hostRef} className="absolute inset-0 h-full w-full" /></div>
            ) : (
              <div className="flex aspect-video w-full items-center justify-center text-sm text-muted">Waiting for the host to start a video…</div>
            )}
            {!isHost && <p className="px-4 py-2 text-[11px] text-subtle">Playback is synced to the host. Sit back and watch together.</p>}
          </div>

          {/* Chat */}
          <div className="flex h-[420px] flex-col rounded-2xl border border-border bg-surface lg:h-auto">
            <div className="border-b border-border px-4 py-3 text-[10px] font-black uppercase tracking-[0.3em] text-muted">Party Chat</div>
            <div className="flex-1 space-y-2.5 overflow-y-auto p-4">
              {chat.length === 0 && <p className="text-xs text-subtle">Say hi — chat is shared with everyone in the party.</p>}
              {chat.map((m, i) => (
                <div key={i} className="text-sm">
                  <span className={`font-bold ${m.userId === me?.id ? "text-accent-bright" : "text-foreground"}`}>{m.userId === me?.id ? "You" : (m.name || "Guest")}</span>
                  <span className="ml-2 text-muted">{m.text}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="flex items-center gap-2 border-t border-border p-3">
              <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendChat()}
                placeholder="Message…" className="min-w-0 flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-accent/40" style={{ color: "var(--app-fg)" }} />
              <button onClick={sendChat} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-black transition hover:opacity-90 active:scale-95"><Send size={16} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
