"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { getSocket } from "@/lib/socket"

/* ── STUN servers (public Google STUN — no cost, works for LAN + internet) ── */
const ICE_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
  ],
}

export type CallType   = "audio" | "video"
export type CallStatus = "idle" | "calling" | "incoming" | "active" | "ended"

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

  const pcRef         = useRef<RTCPeerConnection | null>(null)
  const localStream   = useRef<MediaStream | null>(null)
  const remoteStream  = useRef<MediaStream | null>(null)
  const localVideoEl  = useRef<HTMLVideoElement | null>(null)
  const remoteVideoEl = useRef<HTMLVideoElement | null>(null)
  const timerRef      = useRef<ReturnType<typeof setInterval> | null>(null)
  const pendingICE    = useRef<RTCIceCandidateInit[]>([])

  /* ── Timer ──────────────────────────────────────────────────────────────── */
  const startTimer = () => {
    setDuration(0)
    timerRef.current = setInterval(() => setDuration(d => d + 1), 1000)
  }
  const stopTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
    setDuration(0)
  }

  /* ── Media ───────────────────────────────────────────────────────────────── */
  async function getMedia(type: CallType): Promise<MediaStream> {
    return navigator.mediaDevices.getUserMedia({
      audio: true,
      video: type === "video" ? { width: { ideal: 1280 }, height: { ideal: 720 } } : false,
    })
  }

  /* ── Create peer connection ──────────────────────────────────────────────── */
  function createPC(toUserId: string): RTCPeerConnection {
    const pc = new RTCPeerConnection(ICE_CONFIG)

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        getSocket()?.emit("call:ice-candidate", { to: toUserId, candidate: candidate.toJSON() })
      }
    }

    pc.ontrack = ({ streams }) => {
      remoteStream.current = streams[0]
      if (remoteVideoEl.current) remoteVideoEl.current.srcObject = streams[0]
    }

    pc.oniceconnectionstatechange = () => {
      if (["disconnected", "failed", "closed"].includes(pc.iceConnectionState)) {
        hangUp()
      }
    }

    return pc
  }

  /* ── Attach local stream to peer connection ──────────────────────────────── */
  function attachLocalStream(pc: RTCPeerConnection, stream: MediaStream) {
    stream.getTracks().forEach(t => pc.addTrack(t, stream))
    localStream.current = stream
    if (localVideoEl.current) localVideoEl.current.srcObject = stream
  }

  /* ── Initiate outgoing call ─────────────────────────────────────────────── */
  const call = useCallback(async (
    toUserId:    string,
    type:        CallType,
    callerName:  string,
    callerAvatar: string | null,
  ) => {
    if (status !== "idle") return

    setStatus("calling")
    setCallType(type)
    setRemotePeer(toUserId)

    try {
      const stream = await getMedia(type)
      const pc     = createPC(toUserId)
      attachLocalStream(pc, stream)
      pcRef.current = pc

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      getSocket()?.emit("call:offer", {
        to:          toUserId,
        offer:       pc.localDescription,
        callType:    type,
        callerName,
        callerAvatar,
      })
    } catch (err) {
      console.error("[WebRTC] call error:", err)
      hangUp()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  /* ── Accept incoming call ───────────────────────────────────────────────── */
  const accept = useCallback(async () => {
    if (!incoming) return
    const { from, offer, callType: type } = incoming

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

      // Apply any queued ICE candidates
      for (const c of pendingICE.current) await pc.addIceCandidate(new RTCIceCandidate(c))
      pendingICE.current = []

      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)

      getSocket()?.emit("call:answer", { to: from, answer: pc.localDescription })
      startTimer()
    } catch (err) {
      console.error("[WebRTC] accept error:", err)
      hangUp()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incoming])

  /* ── Reject incoming call ───────────────────────────────────────────────── */
  const reject = useCallback(() => {
    if (!incoming) return
    getSocket()?.emit("call:reject", { to: incoming.from })
    setIncoming(null)
    setStatus("idle")
  }, [incoming])

  /* ── Hang up ────────────────────────────────────────────────────────────── */
  const hangUp = useCallback(() => {
    if (remotePeer && status !== "idle") {
      getSocket()?.emit("call:end", { to: remotePeer })
    }
    pcRef.current?.close()
    pcRef.current = null
    localStream.current?.getTracks().forEach(t => t.stop())
    localStream.current = null
    remoteStream.current = null
    pendingICE.current = []
    stopTimer()
    setStatus("idle")
    setRemotePeer(null)
    setIncoming(null)
    setIsMuted(false)
    setIsCamOff(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remotePeer, status])

  /* ── Toggle audio/video ─────────────────────────────────────────────────── */
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
    function attach() {
      const s = getSocket()
      if (!s) { setTimeout(attach, 800); return }

      // Remote peer accepted our call
      s.on("call:answered", async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
        if (!pcRef.current) return
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer))
        for (const c of pendingICE.current) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(c))
        }
        pendingICE.current = []
        setStatus("active")
        startTimer()
      })

      // Incoming call
      s.on("call:incoming", (info: IncomingCallInfo) => {
        if (status !== "idle") {
          // Already in a call — tell them we're busy
          getSocket()?.emit("call:busy", { to: info.from })
          return
        }
        setIncoming(info)
        setStatus("incoming")
      })

      // Remote ICE candidate
      s.on("call:ice-candidate", async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
        if (pcRef.current?.remoteDescription) {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate))
        } else {
          pendingICE.current.push(candidate)
        }
      })

      // Remote hung up
      s.on("call:ended",   () => { hangUp() })
      s.on("call:rejected",() => { setStatus("idle"); setRemotePeer(null) })
      s.on("call:busy",    () => { setStatus("idle"); setRemotePeer(null) })

      return () => {
        s.off("call:answered")
        s.off("call:incoming")
        s.off("call:ice-candidate")
        s.off("call:ended")
        s.off("call:rejected")
        s.off("call:busy")
      }
    }

    const cleanup = attach()
    return () => { cleanup?.() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  return {
    status, callType, remotePeer, incoming,
    isMuted, isCamOff, isSpeakerOff, duration,
    localVideoEl, remoteVideoEl,
    call, accept, reject, hangUp,
    toggleMute, toggleCamera, toggleSpeaker,
  }
}

export function formatDuration(s: number): string {
  const m = Math.floor(s / 60)
  const sec = s % 60
  return `${m}:${sec.toString().padStart(2, "0")}`
}
