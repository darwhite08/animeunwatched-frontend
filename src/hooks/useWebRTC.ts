"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { getSocket, forceReconnect } from "@/lib/socket"
import { playSound, stopSound } from "@/lib/audio/notifications"

/* ── STUN + TURN servers ─────────────────────────────────────────────────── */
const ICE_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
  ],
  iceCandidatePoolSize: 10,
}

export type CallType   = "audio" | "video"
export type CallStatus = "idle" | "calling" | "incoming" | "active" | "ended"

/**
 * Summary of a call after it ends. Chat page consumes this to post a
 * "📞 Audio call · 2:34" or "📞 Video call · Missed" message into the
 * conversation. Only the caller (asInitiator = true) should send.
 */
export interface CallSummary {
  callType:    CallType
  status:      "answered" | "missed"
  duration:    number    // seconds, 0 if missed
  asInitiator: boolean   // local user was the caller
  endedAt:     number    // for de-duplication in useEffect deps
}

/** Convert internal error codes to user-facing messages */
function resolveMediaError(raw: string, type: CallType): string {
  if (raw === "NO_MEDIA_API") {
    return "MACOS_SYSTEM_BLOCK"
  }
  if (raw === "PERMISSION_DENIED") {
    return "MACOS_SYSTEM_BLOCK"
  }
  if (raw.startsWith("DEVICE_NOT_FOUND:")) {
    const t = raw.split(":")[1]
    return t === "video"
      ? "No camera or microphone detected. Please connect a device and try again."
      : "No microphone detected. Please connect one and try again."
  }
  if (raw === "DEVICE_IN_USE") {
    return "Microphone is in use by another app (Zoom, Teams, etc.). Close it and try again."
  }
  if (raw.startsWith("MEDIA_ERROR:")) {
    return `Could not access microphone: ${raw.split(":").slice(1).join(":")}`
  }
  return raw
}

export interface IncomingCallInfo {
  from:         string
  callerName:   string
  callerAvatar: string | null
  callType:     CallType
  offer:        RTCSessionDescriptionInit
}

export function useWebRTC() {
  const [status,       setStatus]       = useState<CallStatus>("idle")
  const [callType,     setCallType]     = useState<CallType>("audio")
  const [remotePeer,   setRemotePeer]   = useState<string | null>(null)
  const [incoming,     setIncoming]     = useState<IncomingCallInfo | null>(null)
  const [isMuted,      setIsMuted]      = useState(false)
  const [isCamOff,     setIsCamOff]     = useState(false)
  const [isSpeakerOff, setIsSpeakerOff] = useState(false)
  const [duration,     setDuration]     = useState(0)
  const [callError,    setCallError]    = useState<string | null>(null)
  // Set when a call ends so the chat page can post a summary message
  const [lastCallEnded, setLastCallEnded] = useState<CallSummary | null>(null)

  // Lifecycle tracking for call summaries
  const callStartTimeRef = useRef<number | null>(null)
  const wasInitiatorRef  = useRef<boolean>(false)
  const callTypeForSummaryRef = useRef<CallType>("audio")

  const pcRef           = useRef<RTCPeerConnection | null>(null)
  const localStream     = useRef<MediaStream | null>(null)
  const remoteStream    = useRef<MediaStream | null>(null)
  const localVideoEl    = useRef<HTMLVideoElement | null>(null)
  const remoteVideoEl   = useRef<HTMLVideoElement | null>(null)
  const timerRef        = useRef<ReturnType<typeof setInterval> | null>(null)
  const pendingICE      = useRef<RTCIceCandidateInit[]>([])
  const ringTimeoutRef  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hangUpRef       = useRef<() => void>(() => {})

  /* ── Ringtone driver ───────────────────────────────────────────────────── */
  // Centralised: ringtones follow call state automatically. Backed by the
  // shared audio pool (lib/audio/notifications.ts), which keeps the audio
  // elements unlocked across the app's lifetime — otherwise the browser's
  // autoplay policy silently rejects play() on the socket-driven ringtone.
  //   incoming + idle-ish  → play incoming ringtone
  //   calling (outbound)   → play outgoing ringback
  //   active / ended / idle → silence
  useEffect(() => {
    if (incoming && status !== "active") {
      stopSound("outgoing-call")
      playSound("incoming-call", { loop: true })
    } else if (status === "calling") {
      stopSound("incoming-call")
      playSound("outgoing-call", { loop: true })
    } else {
      stopSound("incoming-call")
      stopSound("outgoing-call")
    }
    return () => {
      stopSound("incoming-call")
      stopSound("outgoing-call")
    }
  }, [status, incoming])

  /* ── Timer ─────────────────────────────────────────────────────────────── */
  const startTimer = useCallback(() => {
    setDuration(0)
    timerRef.current = setInterval(() => setDuration(d => d + 1), 1000)
  }, [])

  const stopTimer = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    if (ringTimeoutRef.current) { clearTimeout(ringTimeoutRef.current); ringTimeoutRef.current = null }
    setDuration(0)
  }, [])

  /* ── Stream → video element helpers ────────────────────────────────────── */
  const applyLocalStream = useCallback(() => {
    const el = localVideoEl.current
    const stream = localStream.current
    if (el && stream && el.srcObject !== stream) el.srcObject = stream
  }, [])

  const applyRemoteStream = useCallback(() => {
    const el = remoteVideoEl.current
    const stream = remoteStream.current
    if (el && stream && el.srcObject !== stream) el.srcObject = stream
  }, [])

  // Called by ActiveCallModal after its <video> elements mount so streams are applied
  const onVideoElemsReady = useCallback(() => {
    applyLocalStream()
    applyRemoteStream()
  }, [applyLocalStream, applyRemoteStream])

  /* ── Pre-flight checks ──────────────────────────────────────────────────── */
  function preflightCheck(): string | null {
    if (typeof window === "undefined") return "Not in browser"
    if (!window.RTCPeerConnection) return "WebRTC is not supported in this browser. Try Chrome, Firefox or Safari."
    // NOTE: We do NOT check navigator.mediaDevices here — on some browsers/configs
    // it may be undefined even on localhost. We let getMedia() handle it gracefully.
    const s = getSocket()
    if (!s) return "SOCKET_NULL"
    if (!s.connected) {
      // Attempt to reconnect before failing — Render cold starts can take 30s
      forceReconnect()
      return "SOCKET_RECONNECTING"
    }
    return null
  }

  /* ── getUserMedia with progressive fallback + friendly errors ────────────── */
  // NOTE: We do NOT pre-check the Permissions API — its state can be stale
  // after the user changes browser settings. We always call getUserMedia directly
  // and let the browser itself decide to allow or deny based on current settings.
  async function getMedia(type: CallType): Promise<MediaStream> {
    // Handle browsers that don't expose mediaDevices on non-HTTPS origins
    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error("NO_MEDIA_API")
    }

    // Try with ideal constraints first, then fall back to bare minimum
    const attempts: MediaStreamConstraints[] = [
      {
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        video: type === "video"
          ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" }
          : false,
      },
      // Fallback 1: minimal constraints
      { audio: true, video: type === "video" },
    ]

    let lastError: Error | null = null
    for (const constraints of attempts) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        return stream
      } catch (err: unknown) {
        lastError = err as Error
        const e = err as Error
        // Don't retry on permission errors — user must fix in browser settings
        if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError") {
          throw new Error("PERMISSION_DENIED")
        }
        // Don't retry on "not found" — no device present
        if (e.name === "NotFoundError" || e.name === "DevicesNotFoundError") {
          throw new Error("DEVICE_NOT_FOUND:" + type)
        }
        // Continue to next attempt for constraint/read errors
      }
    }

    // All attempts exhausted
    const e = lastError as Error
    if (e?.name === "NotReadableError" || e?.name === "TrackStartError") {
      throw new Error("DEVICE_IN_USE")
    }
    throw new Error(`MEDIA_ERROR:${e?.message || "Unknown"}`)
  }

  /* ── Create RTCPeerConnection ────────────────────────────────────────────── */
  function createPC(toUserId: string): RTCPeerConnection {
    const pc = new RTCPeerConnection(ICE_CONFIG)

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        getSocket()?.emit("call:ice-candidate", { to: toUserId, candidate: candidate.toJSON() })
      }
    }

    pc.ontrack = ({ streams }) => {
      if (streams[0]) {
        remoteStream.current = streams[0]
        applyRemoteStream()
      }
    }

    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState
      if (state === "failed") {
        setCallError("Connection failed. You may be on different networks without TURN support.")
        hangUpRef.current()
      } else if (state === "disconnected") {
        // Give it 5 seconds to reconnect before hanging up
        setTimeout(() => {
          if (pc.iceConnectionState === "disconnected") hangUpRef.current()
        }, 5_000)
      }
    }

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        // Clear the ring timeout — connection is established
        if (ringTimeoutRef.current) {
          clearTimeout(ringTimeoutRef.current)
          ringTimeoutRef.current = null
        }
      }
    }

    return pc
  }

  /* ── Attach local stream tracks ─────────────────────────────────────────── */
  function attachLocalStream(pc: RTCPeerConnection, stream: MediaStream) {
    stream.getTracks().forEach(t => pc.addTrack(t, stream))
    localStream.current = stream
    applyLocalStream()
  }

  /* ── Hang up ─────────────────────────────────────────────────────────────── */
  const hangUp = useCallback(() => {
    if (remotePeer && status !== "idle") {
      getSocket()?.emit("call:end", { to: remotePeer })
    }

    // Build call summary for the chat page to post — only if WE initiated the call.
    // The recipient's "missed call" entry is sent by the caller, so we avoid duplicates.
    if (wasInitiatorRef.current && (status === "calling" || status === "active")) {
      const startedAt = callStartTimeRef.current
      const wasAnswered = startedAt !== null
      setLastCallEnded({
        callType:    callTypeForSummaryRef.current,
        status:      wasAnswered ? "answered" : "missed",
        duration:    wasAnswered ? Math.max(0, Math.floor((Date.now() - startedAt) / 1000)) : 0,
        asInitiator: true,
        endedAt:     Date.now(),
      })
    }
    // Reset tracking refs for the next call
    callStartTimeRef.current = null
    wasInitiatorRef.current  = false

    if (ringTimeoutRef.current) { clearTimeout(ringTimeoutRef.current); ringTimeoutRef.current = null }
    pcRef.current?.close()
    pcRef.current = null
    localStream.current?.getTracks().forEach(t => t.stop())
    localStream.current = null
    remoteStream.current = null
    if (localVideoEl.current)  localVideoEl.current.srcObject  = null
    if (remoteVideoEl.current) remoteVideoEl.current.srcObject = null
    pendingICE.current = []
    stopTimer()
    setStatus("idle")
    setRemotePeer(null)
    setIncoming(null)
    setIsMuted(false)
    setIsCamOff(false)
    setCallError(null)
  }, [remotePeer, status, stopTimer])

  // Mark start time when the call actually connects (active)
  useEffect(() => {
    if (status === "active" && callStartTimeRef.current === null) {
      callStartTimeRef.current = Date.now()
    }
  }, [status])

  // Always keep ref current so socket handlers use latest version
  useEffect(() => { hangUpRef.current = hangUp }, [hangUp])

  /* ── Initiate outgoing call ─────────────────────────────────────────────── */
  const call = useCallback(async (
    toUserId:     string,
    type:         CallType,
    callerName:   string,
    callerAvatar: string | null,
  ) => {
    if (status !== "idle") return

    // Pre-flight: socket + browser API checks
    const preflight = preflightCheck()
    if (preflight) {
      setCallError(preflight)
      return
    }

    setCallError(null)
    setStatus("calling")
    setCallType(type)
    setRemotePeer(toUserId)
    // Track this call as initiated by the local user so hangUp() can write the summary
    wasInitiatorRef.current = true
    callTypeForSummaryRef.current = type
    callStartTimeRef.current = null

    try {
      // Get media — this shows browser permission dialog
      const stream = await getMedia(type)
      const pc     = createPC(toUserId)
      attachLocalStream(pc, stream)
      pcRef.current = pc

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      // Re-check socket after the async getUserMedia (it could have disconnected)
      const s = getSocket()
      if (!s?.connected) throw new Error("Lost server connection. Please refresh and try again.")

      s.emit("call:offer", {
        to:          toUserId,
        offer:       pc.localDescription,
        callType:    type,
        callerName,
        callerAvatar,
      })

      // Auto-cancel if no answer in 45 seconds
      ringTimeoutRef.current = setTimeout(() => {
        if (pcRef.current) {
          setCallError("No answer. The call timed out.")
          hangUpRef.current()
        }
      }, 45_000)

    } catch (err) {
      const raw = err instanceof Error ? err.message : "Call failed"
      const msg = resolveMediaError(raw, type)
      setCallError(msg)
      pcRef.current?.close()
      pcRef.current = null
      localStream.current?.getTracks().forEach(t => t.stop())
      localStream.current = null
      if (ringTimeoutRef.current) { clearTimeout(ringTimeoutRef.current); ringTimeoutRef.current = null }
      setStatus("idle")
      setRemotePeer(null)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  /* ── Accept incoming call ───────────────────────────────────────────────── */
  const accept = useCallback(async () => {
    if (!incoming) return
    const { from, offer, callType: type } = incoming
    setCallError(null)
    setStatus("active")
    setCallType(type)
    setRemotePeer(from)
    setIncoming(null)

    try {
      const stream = await getMedia(type)
      const pc     = createPC(from)
      attachLocalStream(pc, stream)
      pcRef.current = pc

      await pc.setRemoteDescription(new RTCSessionDescription(offer))

      // Drain any ICE candidates that arrived before remote description was set
      for (const c of pendingICE.current) {
        try { await pc.addIceCandidate(new RTCIceCandidate(c)) } catch { /* ignore */ }
      }
      pendingICE.current = []

      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)

      const s = getSocket()
      if (!s?.connected) throw new Error("Lost server connection during answer.")

      s.emit("call:answer", { to: from, answer: pc.localDescription })
      startTimer()
    } catch (err) {
      const raw = err instanceof Error ? err.message : "Could not answer call."
      setCallError(resolveMediaError(raw, type))
      hangUpRef.current()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incoming, startTimer])

  /* ── Reject incoming call ───────────────────────────────────────────────── */
  const reject = useCallback(() => {
    if (!incoming) return
    getSocket()?.emit("call:reject", { to: incoming.from })
    setIncoming(null)
    setStatus("idle")
  }, [incoming])

  /* ── Media toggles ──────────────────────────────────────────────────────── */
  const toggleMute = useCallback(() => {
    const track = localStream.current?.getAudioTracks()[0]
    if (!track) return
    track.enabled = !track.enabled
    setIsMuted(m => !m)
  }, [])

  const toggleCamera = useCallback(() => {
    const track = localStream.current?.getVideoTracks()[0]
    if (!track) return
    track.enabled = !track.enabled
    setIsCamOff(c => !c)
  }, [])

  const toggleSpeaker = useCallback(() => {
    const el = remoteVideoEl.current
    if (el) el.muted = !el.muted
    setIsSpeakerOff(s => !s)
  }, [])

  /* ── Socket event listeners ─────────────────────────────────────────────── */
  useEffect(() => {
    let cleanupFn: (() => void) | null = null
    let retryTimeout: ReturnType<typeof setTimeout> | null = null
    let unmounted = false

    function attach() {
      const s = getSocket()
      if (!s) {
        retryTimeout = setTimeout(() => { if (!unmounted) attach() }, 600)
        return
      }

      // Caller side: recipient accepted the call
      const onAnswered = async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
        const pc = pcRef.current
        if (!pc) return
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer))
          for (const c of pendingICE.current) {
            try { await pc.addIceCandidate(new RTCIceCandidate(c)) } catch { /* ignore */ }
          }
          pendingICE.current = []
          setStatus("active")
          startTimer()
        } catch (err) {
          console.error("[WebRTC] onAnswered error:", err)
          hangUpRef.current()
        }
      }

      // Recipient side: incoming call notification
      const onIncoming = (info: IncomingCallInfo) => {
        setStatus(prev => {
          if (prev !== "idle") {
            // Already in a call — tell caller we're busy
            getSocket()?.emit("call:busy", { to: info.from })
            return prev
          }
          setIncoming(info)
          return "incoming"
        })
      }

      // Both sides: relay ICE candidates
      const onIce = async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
        const pc = pcRef.current
        if (!pc) return
        try {
          if (pc.remoteDescription) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate))
          } else {
            pendingICE.current.push(candidate)
          }
        } catch { /* ICE errors are often benign */ }
      }

      const onEnded = () => hangUpRef.current()

      const onRejected = () => {
        if (ringTimeoutRef.current) { clearTimeout(ringTimeoutRef.current); ringTimeoutRef.current = null }
        setStatus("idle")
        setRemotePeer(null)
        setCallError("Call was declined.")
      }

      const onBusy = () => {
        if (ringTimeoutRef.current) { clearTimeout(ringTimeoutRef.current); ringTimeoutRef.current = null }
        setStatus("idle")
        setRemotePeer(null)
        setCallError("User is currently in another call.")
      }

      s.on("call:answered",      onAnswered)
      s.on("call:incoming",      onIncoming)
      s.on("call:ice-candidate", onIce)
      s.on("call:ended",         onEnded)
      s.on("call:rejected",      onRejected)
      s.on("call:busy",          onBusy)

      cleanupFn = () => {
        s.off("call:answered",      onAnswered)
        s.off("call:incoming",      onIncoming)
        s.off("call:ice-candidate", onIce)
        s.off("call:ended",         onEnded)
        s.off("call:rejected",      onRejected)
        s.off("call:busy",          onBusy)
      }
    }

    attach()

    return () => {
      unmounted = true
      if (retryTimeout) clearTimeout(retryTimeout)
      cleanupFn?.()
    }
  }, [startTimer])

  // Allows the chat page to acknowledge a call summary it has already posted,
  // preventing duplicate messages if the page re-renders.
  const consumeLastCallEnded = useCallback(() => setLastCallEnded(null), [])

  return {
    status, callType, remotePeer, incoming, callError,
    isMuted, isCamOff, isSpeakerOff, duration,
    localVideoEl, remoteVideoEl, localStream, remoteStream,
    call, accept, reject, hangUp,
    toggleMute, toggleCamera, toggleSpeaker,
    onVideoElemsReady,
    lastCallEnded, consumeLastCallEnded,
  }
}

export function formatDuration(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, "0")}`
}
