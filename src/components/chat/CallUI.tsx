"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { type CallStatus, type CallType, formatDuration } from "@/hooks/useWebRTC"

/* ── Icons ───────────────────────────────────────────────────────────────── */
const I = ({ d, size = 20, fill = "none", stroke = "currentColor", sw = 2 }: {
  d: string; size?: number; fill?: string; stroke?: string; sw?: number
}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
    stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
)

/* ── Round action button ──────────────────────────────────────────────────── */
function Btn({
  onClick, bg = "color-mix(in srgb, var(--app-fg) 12%, transparent)", color = "var(--app-fg)",
  size = 54, icon, label, danger,
}: {
  onClick: () => void; bg?: string; color?: string; size?: number
  icon: React.ReactNode; label?: string; danger?: boolean
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <button onClick={onClick} style={{
        width: size, height: size, borderRadius: "50%",
        background: danger ? "oklch(0.55 0.22 20)" : bg,
        color, border: "none", cursor: "pointer",
        display: "grid", placeItems: "center",
        transition: "transform 100ms, filter 100ms",
        boxShadow: danger ? "0 4px 18px oklch(0.45 0.22 20 / 0.50)" : "0 2px 10px rgba(0,0,0,0.4)",
      }}
      onMouseEnter={e => (e.currentTarget.style.filter = "brightness(1.15)")}
      onMouseLeave={e => (e.currentTarget.style.filter = "brightness(1)")}
      onMouseDown={e => (e.currentTarget.style.transform = "scale(0.93)")}
      onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
      >
        {icon}
      </button>
      {label && <span style={{ fontSize: 11, color: "color-mix(in srgb, var(--app-fg) 55%, transparent)", fontWeight: 500 }}>{label}</span>}
    </div>
  )
}

/* ── Avatar for calls ────────────────────────────────────────────────────── */
function CallAvatar({ name, src, size = 80 }: { name: string; src?: string | null; size?: number }) {
  const initials = name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
  return src
    ? <Image src={src} alt={name} width={size} height={size}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover",
          boxShadow: "0 0 0 4px color-mix(in srgb, var(--app-fg) 15%, transparent), 0 8px 32px rgba(0,0,0,0.5)" }} />
    : <div style={{
        width: size, height: size, borderRadius: "50%",
        background: "linear-gradient(135deg, oklch(0.62 0.18 282), oklch(0.55 0.17 280))",
        display: "grid", placeItems: "center",
        color: "var(--app-fg)", fontWeight: 700, fontSize: size * 0.35,
        boxShadow: "0 0 0 4px color-mix(in srgb, var(--app-fg) 15%, transparent), 0 8px 32px rgba(0,0,0,0.5)",
      }}>{initials}</div>
}

/* ── Incoming call ───────────────────────────────────────────────────────── */
export function IncomingCallCard({
  callerName, callerAvatar, callType, onAccept, onReject,
}: {
  callerName: string; callerAvatar: string | null; callType: CallType
  onAccept: () => void; onReject: () => void
}) {
  // Vibrate / audio feedback
  useEffect(() => {
    if (typeof navigator.vibrate === "function") {
      const id = setInterval(() => navigator.vibrate([200, 100, 200]), 1200)
      return () => { clearInterval(id); navigator.vibrate(0) }
    }
  }, [])

  return (
    <motion.div initial={{ opacity: 0, y: -20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.95 }}
      style={{
        position: "fixed", top: 20, right: 20, zIndex: 9999,
        width: 320, padding: "20px 20px 16px",
        background: "linear-gradient(160deg, #1a1b2e 0%, #13141f 100%)",
        border: "1px solid color-mix(in srgb, var(--app-fg) 10%, transparent)",
        borderRadius: 20,
        boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
        backdropFilter: "blur(24px)",
      }}>
      {/* Pulsing ring animation */}
      <div style={{ position: "absolute", inset: 0, borderRadius: 20, overflow: "hidden", pointerEvents: "none" }}>
        <motion.div animate={{ opacity: [0.15, 0.4, 0.15], scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ position: "absolute", inset: 0, borderRadius: 20, border: "2px solid oklch(0.78 0.16 145)", opacity: 0.2 }} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
        <div style={{ position: "relative" }}>
          <CallAvatar name={callerName} src={callerAvatar} size={52} />
          <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            style={{ position: "absolute", inset: -6, borderRadius: "50%", border: "2px solid oklch(0.78 0.16 145)" }} />
        </div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "var(--app-fg)", marginBottom: 3 }}>{callerName}</div>
          <div style={{ fontSize: 12, color: "oklch(0.78 0.16 145)", display: "flex", alignItems: "center", gap: 5 }}>
            {callType === "video"
              ? <><I d="M15 10l4.553-2.069A1 1 0 0 1 21 8.82v6.361a1 1 0 0 1-1.447.894L15 14M3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" size={13} /> Video call</>
              : <><I d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 10.86 19.79 19.79 0 0 1 1.93 2.18 2 2 0 0 1 3.9 0H6.9a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 7.91a16 16 0 0 0 6.13 6.13l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" size={13} /> Voice call</>
            }
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onReject} style={{
          flex: 1, height: 44, borderRadius: 12,
          background: "oklch(0.45 0.22 20 / 0.25)", border: "1px solid oklch(0.55 0.22 20 / 0.40)",
          color: "oklch(0.85 0.18 20)", fontSize: 13.5, fontWeight: 600, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontFamily: "inherit",
        }}>
          <I d="M18 6 6 18M6 6l12 12" size={14} /> Decline
        </button>
        <button onClick={onAccept} style={{
          flex: 1, height: 44, borderRadius: 12,
          background: "linear-gradient(135deg, oklch(0.60 0.20 145), oklch(0.52 0.18 145))",
          border: "none", color: "var(--app-fg)", fontSize: 13.5, fontWeight: 600, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 7, fontFamily: "inherit",
          boxShadow: "0 4px 16px oklch(0.45 0.18 145 / 0.45)",
        }}>
          {callType === "video"
            ? <I d="M15 10l4.553-2.069A1 1 0 0 1 21 8.82v6.361a1 1 0 0 1-1.447.894L15 14M3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" size={14} />
            : <I d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 10.86 19.79 19.79 0 0 1 1.93 2.18 2 2 0 0 1 3.9 0H6.9a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 7.91a16 16 0 0 0 6.13 6.13l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" size={14} />
          }
          Accept
        </button>
      </div>
    </motion.div>
  )
}

/* ── Active call overlay ─────────────────────────────────────────────────── */
export function ActiveCallModal({
  callType, peerName, peerAvatar, duration,
  isMuted, isCamOff, isSpeakerOff, status,
  localVideoEl, remoteVideoEl,
  onMute, onCamera, onSpeaker, onHangUp,
  onVideoElemsReady,
}: {
  callType: CallType; peerName: string; peerAvatar: string | null
  duration: number; isMuted: boolean; isCamOff: boolean; isSpeakerOff: boolean
  status: CallStatus
  localVideoEl: React.RefObject<HTMLVideoElement | null>
  remoteVideoEl: React.RefObject<HTMLVideoElement | null>
  onMute: () => void; onCamera: () => void; onSpeaker: () => void; onHangUp: () => void
  onVideoElemsReady?: () => void
}) {
  // Attach video refs
  const remoteRef = useRef<HTMLVideoElement>(null)
  const localRef  = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (remoteRef.current) {
      remoteVideoEl.current = remoteRef.current
      remoteRef.current.autoplay    = true
      remoteRef.current.playsInline = true
    }
    if (localRef.current) {
      localVideoEl.current = localRef.current
      localRef.current.autoplay    = true
      localRef.current.playsInline = true
      localRef.current.muted       = true
    }
    // CRITICAL: notify hook that video elements are ready so it can apply streams
    onVideoElemsReady?.()
  }, [localVideoEl, remoteVideoEl, onVideoElemsReady])

  const isCalling = status === "calling"
  const statusLabel = isCalling ? "Calling…" : formatDuration(duration)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, zIndex: 9998,
        background: callType === "video" ? "#000" : "linear-gradient(160deg, #0e0e1a 0%, #0a0a14 100%)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "space-between",
        paddingBottom: 48, paddingTop: 60,
      }}>

      {/* ── Video: remote stream fills background ── */}
      {callType === "video" && (
        <video ref={remoteRef}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }} />
      )}

      {/* Dark overlay for video mode */}
      {callType === "video" && (
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.7) 100%)", zIndex: 1 }} />
      )}

      {/* ── Audio call: big avatar + status ── */}
      {callType === "audio" && (
        <div style={{ position: "relative", zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
          <motion.div animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 3, repeat: Infinity }}>
            <CallAvatar name={peerName} src={peerAvatar} size={112} />
          </motion.div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "var(--app-fg)", marginBottom: 6 }}>{peerName}</div>
            <div style={{ fontSize: 14, color: isCalling ? "oklch(0.78 0.16 145)" : "color-mix(in srgb, var(--app-fg) 55%, transparent)" }}>
              {statusLabel}
            </div>
          </div>
          {/* Audio waveform animation when active */}
          {!isCalling && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, height: 24 }}>
              {[0.6, 1, 0.8, 1.2, 0.7, 1.1, 0.9].map((h, i) => (
                <motion.div key={i}
                  animate={{ scaleY: [h * 0.5, h, h * 0.5] }}
                  transition={{ duration: 0.8 + i * 0.1, repeat: Infinity, delay: i * 0.1 }}
                  style={{ width: 3, height: 20, borderRadius: 2, background: "oklch(0.78 0.16 145)", transformOrigin: "center" }} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Video call: name + timer overlay ── */}
      {callType === "video" && (
        <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "var(--app-fg)", textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}>{peerName}</div>
          <div style={{ fontSize: 13, color: "color-mix(in srgb, var(--app-fg) 65%, transparent)", marginTop: 4 }}>{statusLabel}</div>
        </div>
      )}

      {/* ── Local video PiP ── */}
      {callType === "video" && (
        <motion.div drag dragMomentum={false}
          style={{ position: "absolute", bottom: 140, right: 20, zIndex: 5, borderRadius: 14, overflow: "hidden", width: 110, height: 160, boxShadow: "0 4px 20px rgba(0,0,0,0.6)", border: "2px solid color-mix(in srgb, var(--app-fg) 20%, transparent)", cursor: "grab" }}>
          <video ref={localRef} style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" }} />
          {isCamOff && (
            <div style={{ position: "absolute", inset: 0, background: "#111", display: "grid", placeItems: "center" }}>
              <CallAvatar name="Me" size={40} />
            </div>
          )}
        </motion.div>
      )}

      {/* ── Controls ── */}
      <div style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "flex-end", gap: 20, justifyContent: "center", width: "100%" }}>
        {callType === "video" && (
          <Btn onClick={onCamera} label={isCamOff ? "Camera" : "Camera"}
            bg={isCamOff ? "color-mix(in srgb, var(--app-fg) 15%, transparent)" : "color-mix(in srgb, var(--app-fg) 15%, transparent)"}
            icon={isCamOff
              ? <I d="M3 3l18 18M10.5 10.5C10.188 10.812 10 11.235 10 11.7V14a2 2 0 0 0 2 2h2.3c.463 0 .887-.188 1.2-.5M15 10h-.01M15 10l4.553-2.069A1 1 0 0 1 21 8.82v6.361a1 1 0 0 1-1.447.894L15 14M3 8a2 2 0 0 1 2-2h7" size={18} />
              : <I d="M15 10l4.553-2.069A1 1 0 0 1 21 8.82v6.361a1 1 0 0 1-1.447.894L15 14M3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" size={18} />
            }
          />
        )}
        <Btn onClick={onMute} label={isMuted ? "Unmute" : "Mute"}
          bg="color-mix(in srgb, var(--app-fg) 15%, transparent)"
          icon={isMuted
            ? <I d="M12 18.5a6 6 0 0 0 6-6v-1m-6 7a6 6 0 0 1-6-6v-1m6 7v4m-3 0h6M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zM3 3l18 18" size={18} />
            : <I d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3zm6 10.5a6 6 0 0 1-12 0M12 19v4m-3 0h6" size={18} />
          }
        />
        <Btn onClick={onHangUp} size={62} danger label="End call"
          icon={<I d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 10.86 19.79 19.79 0 0 1 1.93 2.18 2 2 0 0 1 3.9 0H6.9a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 7.91a16 16 0 0 0 6.13 6.13l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z" size={22} fill="currentColor" stroke="none" />}
        />
        <Btn onClick={onSpeaker} label={isSpeakerOff ? "Speaker" : "Speaker"}
          bg="color-mix(in srgb, var(--app-fg) 15%, transparent)"
          icon={isSpeakerOff
            ? <I d="M11 5 6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" size={18} />
            : <I d="M11 5 6 9H2v6h4l5 4V5zm7.07-1.07a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" size={18} />
          }
        />
        {callType === "video" && <div style={{ width: 54 }} />}
      </div>
    </motion.div>
  )
}
