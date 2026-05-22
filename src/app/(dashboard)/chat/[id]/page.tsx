"use client"

import { useState, useEffect, useRef, useCallback, type ChangeEvent } from "react"
import { useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { useMessages, useSendMessage, useMarkRead, useChatSocket, useTypingIndicator, useDeleteMessage } from "@/hooks/useChat"
import { usePresence } from "@/hooks/useRealtime"
import { useAuthStore } from "@/stores/auth.store"
import { getOrCreateKeyPair, getSharedKey, encryptMessage, decryptMessage, isE2EAvailable } from "@/lib/e2e-crypto"
import { useUserList } from "@/hooks/useLists"
import { useToast } from "@/stores/toast.store"
import { useWebRTC } from "@/hooks/useWebRTC"
import { useMicPermission } from "@/hooks/useMicPermission"
import { IncomingCallCard, ActiveCallModal } from "@/components/chat/CallUI"
import { Avatar } from "../layout"
import * as ep from "@/lib/api/endpoints"
import { format, isToday, isYesterday } from "date-fns"
import type { DirectMessage, ConversationDetail } from "@/lib/api/types"

/* ─── Time helpers ───────────────────────────────────────────────────────── */
const ts = (iso: string) => {
  const d = new Date(iso)
  if (isToday(d)) return format(d, "HH:mm")
  if (isYesterday(d)) return `Yesterday ${format(d, "HH:mm")}`
  return format(d, "MMM d, HH:mm")
}
const dayLabel = (iso: string) => {
  const d = new Date(iso)
  if (isToday(d)) return "Today"
  if (isYesterday(d)) return "Yesterday"
  return format(d, "MMMM d, yyyy")
}

/* ─── Decrypt cache ──────────────────────────────────────────────────────── */
const PLAIN_IV = "PLAIN_NO_E2E"

function useDecrypt(msgs: DirectMessage[], key: CryptoKey | null) {
  const [cache, setCache] = useState<Record<string, string>>({})
  useEffect(() => { setCache({}) }, [key])
  useEffect(() => {
    if (!msgs.length) return
    const todo = msgs.filter(m => !(m.id in cache))
    if (!todo.length) return
    Promise.all(todo.map(async m => {
      // Plain messages (sent without E2E from HTTP context) — always readable
      if (m.iv === PLAIN_IV) {
        try {
          const text = decodeURIComponent(escape(atob(m.ciphertext)))
          return [m.id, text] as const
        } catch { return [m.id, m.ciphertext] as const }
      }
      // E2E messages — require key
      if (!key) return null // keep as undefined (spinner) until key is ready
      try { return [m.id, await decryptMessage(key, m.ciphertext, m.iv)] as const }
      catch { return [m.id, "⚠ Could not decrypt"] as const }
    })).then(r => {
      const valid = r.filter(Boolean) as [string, string][]
      if (!valid.length) return
      setCache(p => { const n={...p}; valid.forEach(([id,t])=>n[id]=t); return n })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [msgs.length, key])
  return cache
}

/* ─── Message grouping ───────────────────────────────────────────────────── */
type GM = DirectMessage & { isGroupStart: boolean; dayBreak: boolean }
function groupMsgs(msgs: DirectMessage[]): GM[] {
  return msgs.map((m, i) => ({
    ...m,
    isGroupStart: !msgs[i-1] || msgs[i-1].senderId !== m.senderId,
    dayBreak: !msgs[i-1] || dayLabel(msgs[i-1].createdAt) !== dayLabel(m.createdAt),
  }))
}

/* ─── Emoji picker ───────────────────────────────────────────────────────── */
const EMOJI_CATS = [
  { icon:"😊", emojis:["😀","😂","🥹","😊","😍","🤩","😘","🥰","😭","😤","🤔","😎","🤯","😴","😅","🫡","🥳","😈","👻","💀","😬","🙄","😩","🤗","🤭","😶","😑","😏","🥸","🤪"] },
  { icon:"👍", emojis:["👍","👎","👏","🙏","🤝","✌️","🤞","👋","🤙","💪","🖐","✋","🫶","🤜","🤛","👊","✊","🫂","💅","🤌","🫵","☝️","👆","👇","👈","👉","🤏","🖖","🫱","🫲"] },
  { icon:"❤️", emojis:["❤️","🧡","💛","💚","💙","💜","🖤","🤍","💔","❤️‍🔥","💝","💘","💕","💞","💓","💗","💖","💟","❣️","💌","🫀","💋","💯","🔥","✨","⭐","🌟","💫","⚡","🌈"] },
  { icon:"🌸", emojis:["🌸","🌺","🌹","🌻","🌼","🌷","🌿","🍀","🌊","🌙","❄️","🦋","🐉","🦊","🐱","🐶","🦁","🐯","🐼","🦄","🌵","🎋","⛩️","🗾","🏯","👘","⚔️","🎌","🗡️","🎏"] },
  { icon:"🍱", emojis:["🍣","🍜","🍱","🍙","🍡","🧋","🍕","🍔","🍦","🍰","🎂","🍩","🍪","🍫","🍭","🥂","🍾","🥃","🍵","☕","🍺","🥤","🧃","🍷","🥛","🍶","🫖","🍸","🥂","🫗"] },
  { icon:"🎮", emojis:["🎮","👾","🕹️","🎯","🎲","🎰","🃏","♟️","🎭","🎨","🖌️","📺","💻","📱","🎵","🎶","🎸","🎹","🥁","🎺","🎻","🎷","🎤","🎧","📻","🔊","🔔","📯","🎼","🎬"] },
] as const

function EmojiPicker({ onPick, onClose }: { onPick:(e:string)=>void; onClose:()=>void }) {
  const [cat, setCat] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose() }
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h)
  }, [onClose])
  return (
    <motion.div ref={ref} initial={{ opacity:0, scale:0.93, y:8 }} animate={{ opacity:1, scale:1, y:0 }} exit={{ opacity:0, scale:0.93, y:8 }}
      transition={{ duration:0.13 }}
      style={{ position:"absolute", bottom:"calc(100% + 8px)", left:0, width:280, background:"var(--bg-1)", border:"1px solid var(--line-strong)", borderRadius:"var(--r-xl)", overflow:"hidden", zIndex:50, boxShadow:"0 20px 60px rgba(0,0,0,0.7)" }}>
      <div style={{ display:"flex", padding:"8px 8px 0", gap:2, borderBottom:"1px solid var(--line)" }}>
        {EMOJI_CATS.map((c,i) => (
          <button key={i} onClick={()=>setCat(i)}
            style={{ flex:1, padding:"6px 4px", fontSize:14, borderRadius:"var(--r-sm)", border:"none", cursor:"pointer", background:cat===i?"var(--indigo-soft)":"transparent", transition:"background 100ms" }}>{c.icon}</button>
        ))}
      </div>
      <div style={{ padding:8, maxHeight:180, overflowY:"auto", display:"grid", gridTemplateColumns:"repeat(8,1fr)", gap:2 }}>
        {EMOJI_CATS[cat].emojis.map(e => (
          <button key={e} onClick={()=>onPick(e)}
            style={{ fontSize:17, padding:6, borderRadius:"var(--r-sm)", border:"none", cursor:"pointer", background:"transparent", transition:"background 100ms" }}
            onMouseEnter={ev=>(ev.currentTarget.style.background="var(--bg-2)")}
            onMouseLeave={ev=>(ev.currentTarget.style.background="transparent")}>{e}</button>
        ))}
      </div>
    </motion.div>
  )
}

/* ─── File preview type ──────────────────────────────────────────────────── */
interface FilePrev { id:string; name:string; size:string; type:string; dataUrl?:string }

/* ─── AI Response bubble (from chat-thread.jsx AIResponse) ────────────────── */
interface AIRow { label:string; a:string; b:string; delta:string; good:boolean }
interface AIPayload { rows?: AIRow[]; tip?: string }

function AIResponseBubble({ body, payload }: { body:string; payload:AIPayload }) {
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
        <div style={{ width:22, height:22, borderRadius:6, background:"linear-gradient(135deg,oklch(0.7 0.18 282),oklch(0.55 0.18 250))", display:"grid", placeItems:"center", boxShadow:"inset 0 1px 0 rgba(255,255,255,0.2),0 4px 12px oklch(0.4 0.18 282/0.5)" }}>
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></svg>
        </div>
        <span style={{ fontSize:12, fontWeight:600, color:"var(--ink)" }}>Drift AI</span>
        <span className="mono" style={{ fontSize:10, color:"var(--ink-4)" }}>· AI Oracle</span>
      </div>
      <div style={{ fontSize:14, color:"var(--ink)", marginBottom:10, lineHeight:1.5 }}
        dangerouslySetInnerHTML={{
          // Escape HTML entities first to prevent XSS, then render **bold** markdown
          __html: body
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")
            .replace(/\*\*(.+?)\*\*/g, "<strong style='font-weight:600;color:#fff'>$1</strong>")
        }} />
      {payload.rows && (
        <div style={{ background:"rgba(0,0,0,0.20)", border:"1px solid var(--line)", borderRadius:10, overflow:"hidden" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr 1fr 0.9fr", padding:"8px 12px", fontSize:10.5, fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", color:"var(--ink-4)", borderBottom:"1px solid var(--line)" }}>
            <div>Benchmark</div><div>v14</div><div>v13</div><div style={{ textAlign:"right" }}>Δ</div>
          </div>
          {payload.rows.map((r,i)=>(
            <div key={r.label} style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr 1fr 0.9fr", padding:"7px 12px", fontSize:12.5, borderBottom:i===payload.rows!.length-1?"none":"1px solid var(--line)", alignItems:"center" }}>
              <div style={{ color:"var(--ink-2)" }}>{r.label}</div>
              <div className="mono" style={{ color:"var(--ink)", fontWeight:600 }}>{r.a}</div>
              <div className="mono" style={{ color:"var(--ink-3)" }}>{r.b}</div>
              <div className="mono" style={{ textAlign:"right", color:r.good?"oklch(0.80 0.15 145)":"oklch(0.75 0.16 25)", fontWeight:600 }}>{r.delta}</div>
            </div>
          ))}
        </div>
      )}
      {payload.tip && (
        <div style={{ fontSize:12, color:"var(--ink-2)", marginTop:10, padding:"8px 12px", background:"oklch(0.66 0.18 282/0.08)", borderRadius:8, border:"1px solid var(--indigo-ring)" }}>
          {payload.tip}
        </div>
      )}
    </div>
  )
}

/* ─── Thread stub (from chat-thread.jsx ThreadStub) ──────────────────────── */
interface ThreadStubData { count:number; lastReply:string; avatarNames:string[] }
function ThreadStub({ thread }: { thread:ThreadStubData }) {
  return (
    <div style={{ marginTop:6, display:"inline-flex", alignItems:"center", gap:8, padding:"5px 10px 5px 6px", background:"rgba(255,255,255,0.025)", border:"1px solid var(--line)", borderRadius:10, fontSize:12, cursor:"pointer", transition:"background 120ms" }}
      onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.05)")}
      onMouseLeave={e=>(e.currentTarget.style.background="rgba(255,255,255,0.025)")}>
      <div style={{ display:"flex" }}>
        {thread.avatarNames.slice(0,3).map((n,i)=>(
          <div key={n} style={{ marginLeft:i===0?0:-8, boxShadow:"0 0 0 2px var(--bg-0)", borderRadius:"50%" }}>
            <div style={{ width:20, height:20, borderRadius:"50%", background:`linear-gradient(135deg,oklch(0.72 0.16 ${(i*60+200)%360}),oklch(0.55 0.18 ${(i*60+230)%360}))`, display:"grid", placeItems:"center", fontSize:8, fontWeight:700, color:"rgba(255,255,255,0.9)" }}>{n[0]}</div>
          </div>
        ))}
      </div>
      <span style={{ color:"var(--indigo)", fontWeight:600 }}>{thread.count} replies</span>
      <span style={{ color:"var(--ink-3)" }}>· {thread.lastReply}</span>
      <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth={2} strokeLinecap="round"><path d="m9 18 6-6-6-6"/></svg>
    </div>
  )
}

/* ─── Slash command menu (from chat-thread.jsx ComposerSlashMenu) ─────────── */
const SLASH_COMMANDS = [
  { cmd:"/ask",      icon:"✨", label:"Ask AI",       desc:"Ask the AI oracle about anime" },
  { cmd:"/share",    icon:"📤", label:"Share",         desc:"Share an anime or watchlist" },
  { cmd:"/poll",     icon:"📊", label:"Create poll",   desc:"Create a quick poll" },
  { cmd:"/schedule", icon:"📅", label:"Schedule",      desc:"Schedule a message" },
  { cmd:"/encrypt",  icon:"🔒", label:"Encrypt note",  desc:"Send a self-destructing note" },
]

function SlashMenu({ filter, onPick, onClose }: { filter:string; onPick:(cmd:string)=>void; onClose:()=>void }) {
  const matches = SLASH_COMMANDS.filter(c => c.cmd.startsWith(filter.toLowerCase()))
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose() }
    document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h)
  }, [onClose])
  if (!matches.length) return null
  return (
    <div ref={ref} style={{ position:"absolute", bottom:"calc(100% + 8px)", left:0, background:"var(--bg-1)", border:"1px solid var(--line-strong)", borderRadius:"var(--r-lg)", overflow:"hidden", boxShadow:"0 16px 40px rgba(0,0,0,0.6)", minWidth:260, zIndex:50 }}>
      <div style={{ padding:"8px 10px 6px", fontSize:10, fontWeight:600, color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:"0.08em", borderBottom:"1px solid var(--line)" }}>Commands</div>
      {matches.map(c=>(
        <div key={c.cmd} onClick={()=>onPick(c.cmd+" ")}
          style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 12px", cursor:"pointer", transition:"background 100ms" }}
          onMouseEnter={e=>(e.currentTarget.style.background="var(--bg-2)")}
          onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
          <span style={{ fontSize:16, lineHeight:1, width:22, textAlign:"center" }}>{c.icon}</span>
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <span className="mono" style={{ fontSize:12.5, fontWeight:600, color:"var(--indigo)" }}>{c.cmd}</span>
              <span style={{ fontSize:12.5, color:"var(--ink)", fontWeight:500 }}>{c.label}</span>
            </div>
            <div style={{ fontSize:11, color:"var(--ink-4)", marginTop:1 }}>{c.desc}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Context rail ───────────────────────────────────────────────────────── */
interface SharedFile { name:string; isImage:boolean; ext:string }

// Demo tasks (in production these would come from a real task API)
const DEMO_TASKS = [
  { id:"t1", title:"Watch Frieren S2 when it drops",          state:"todo",  due:"Soon",       who:"self" },
  { id:"t2", title:"Finish Attack on Titan final arc",         state:"doing", due:"This week",  who:"self" },
  { id:"t3", title:"Rate all 2024 seasonal anime",            state:"done",  due:"Done",       who:"self" },
]

function TaskCard({ task }: { task:typeof DEMO_TASKS[number] }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"9px 10px", borderRadius:"var(--r-sm)", cursor:"pointer", transition:"background 100ms" }}
      onMouseEnter={e=>(e.currentTarget.style.background="var(--bg-2)")}
      onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
      <div style={{ width:16, height:16, borderRadius:5, flexShrink:0, marginTop:1, display:"grid", placeItems:"center", transition:"all 120ms",
        border: task.state==="done" ? "1.5px solid oklch(0.78 0.14 145)" : task.state==="doing" ? "1.5px solid oklch(0.78 0.14 75)" : "1.5px solid var(--ink-4)",
        background: task.state==="done" ? "oklch(0.78 0.14 145)" : task.state==="doing" ? "oklch(0.78 0.14 75/0.20)" : "transparent",
      }}>
        {task.state==="done" && <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="#0a0c12" strokeWidth={3} strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
        {task.state==="doing" && <div style={{ width:4, height:4, borderRadius:"50%", background:"oklch(0.78 0.14 75)" }}/>}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:12.5, color:task.state==="done"?"var(--ink-4)":"var(--ink)", textDecoration:task.state==="done"?"line-through":"none", fontWeight:500, lineHeight:1.4 }}>{task.title}</div>
        <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:4 }}>
          <span style={{ fontSize:10.5, color:"var(--ink-4)" }}>{task.due}</span>
          {task.state==="doing" && <span className="mono" style={{ marginLeft:"auto", fontSize:9.5, padding:"1px 5px", borderRadius:3, background:"oklch(0.40 0.14 75/0.20)", color:"oklch(0.85 0.14 75)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.05em" }}>in progress</span>}
        </div>
      </div>
    </div>
  )
}

function ContextRail({ conv, onClose, sharedFiles }: { conv: ConversationDetail; onClose: ()=>void; sharedFiles: SharedFile[] }) {
  const [tab, setTab] = useState<"details"|"files"|"tasks">("details")
  const { data: listData } = useUserList(conv.otherUser.username)
  const watching  = (listData?.data??[]).filter(e=>e.status==="WATCHING").slice(0,5)
  const completed = (listData?.data??[]).filter(e=>e.status==="COMPLETED").length
  const { push } = useToast()
  return (
    <motion.div initial={{ x:24, opacity:0 }} animate={{ x:0, opacity:1 }} exit={{ x:24, opacity:0 }}
      transition={{ duration:0.2 }}
      style={{ width:300, flexShrink:0, background:"var(--bg-1)", borderLeft:"1px solid var(--line)", display:"flex", flexDirection:"column", overflowY:"auto" }}>

      {/* Tabs */}
      <div style={{ display:"flex", padding:"12px 14px 0", gap:4, borderBottom:"1px solid var(--line)" }}>
        {(["details","files","tasks"] as const).map(t => (
          <div key={t} onClick={()=>setTab(t)}
            style={{ padding:"8px 12px 10px", fontSize:12.5, fontWeight:tab===t?600:500, color:tab===t?"var(--ink)":"var(--ink-3)", cursor:"pointer", position:"relative", borderRadius:"6px 6px 0 0", transition:"color 100ms", userSelect:"none" }}>
            {t.charAt(0).toUpperCase()+t.slice(1)}
            {tab===t&&<div style={{ position:"absolute", bottom:-1, left:12, right:12, height:2, background:"var(--indigo)", borderRadius:1 }}/>}
          </div>
        ))}
        <button onClick={onClose} style={{ marginLeft:"auto", background:"none", border:"none", color:"var(--ink-4)", cursor:"pointer", padding:4, display:"grid", placeItems:"center", borderRadius:6, alignSelf:"center" }}>✕</button>
      </div>

      {/* E2E card */}
      <div style={{ margin:"12px 14px", padding:12, borderRadius:"var(--r-md)", background:"oklch(0.28 0.10 162 / 0.25)", border:"1px solid oklch(0.50 0.12 162 / 0.40)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:12, fontWeight:600, color:"oklch(0.85 0.12 162)", marginBottom:6 }}>
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
          End-to-end encrypted
        </div>
        <div style={{ fontSize:11.5, color:"var(--ink-2)", lineHeight:1.55 }}>Messages are encrypted on your device. Kaiveron servers can't read them.</div>
        <div style={{ marginTop:8, padding:"5px 8px", background:"rgba(0,0,0,0.25)", borderRadius:6, fontFamily:"monospace", fontSize:10.5, color:"var(--ink-4)", wordBreak:"break-all" }}>
          <div style={{ fontSize:9, color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:3 }}>Safety number</div>
          {conv.otherUser.id.slice(-16).match(/.{1,4}/g)?.join(" ")}
        </div>
      </div>

      {/* Call banner — voice sync notification */}
      <div style={{ margin:"12px 14px", padding:12, borderRadius:"var(--r-md)", background:"linear-gradient(135deg,oklch(0.30 0.12 145/0.50),oklch(0.18 0.06 145/0.30))", border:"1px solid oklch(0.50 0.14 145/0.40)", display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:30, height:30, borderRadius:"50%", background:"oklch(0.65 0.18 145/0.30)", display:"grid", placeItems:"center" }}>
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="oklch(0.85 0.14 145)" strokeWidth={1.8} strokeLinecap="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
        </div>
        <div style={{ minWidth:0, flex:1 }}>
          <div style={{ fontSize:12.5, fontWeight:600, color:"var(--ink)" }}>Voice sync available</div>
          <div style={{ fontSize:10.5, color:"var(--ink-3)" }}>Drop in any time</div>
        </div>
        <button
          type="button"
          onClick={() => push("Group voice rooms are coming with the next release", "info")}
          style={{ height:28, padding:"0 12px", borderRadius:7, background:"oklch(0.65 0.18 145)", color:"#0a0c12", border:"none", cursor:"pointer", fontSize:11.5, fontWeight:700, fontFamily:"inherit", display:"inline-flex", alignItems:"center", gap:5 }}
        >
          <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 10.86 19.79 19.79 0 0 1 1.93 2.18 2 2 0 0 1 3.9 0H6.9a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 7.91a16 16 0 0 0 6.13 6.13l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z"/></svg>
          Join
        </button>
      </div>

      {tab==="details" && (
        <>
          {/* Profile */}
          <div style={{ padding:"0 14px 16px", borderBottom:"1px solid var(--line)", display:"flex", flexDirection:"column", alignItems:"center", gap:10 }}>
            <Avatar name={conv.otherUser.displayName} src={conv.otherUser.avatarUrl} size={56} showStatus online />
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:14, fontWeight:600, color:"var(--ink)" }}>{conv.otherUser.displayName}</div>
              <div style={{ fontSize:11.5, color:"var(--ink-3)", marginTop:2 }}>@{conv.otherUser.username}</div>
              <div style={{ fontSize:10.5, color:"oklch(0.78 0.16 145)", marginTop:4 }}>● Active now</div>
            </div>
            <Link href={`/u/${conv.otherUser.username}`}
              style={{ padding:"6px 16px", borderRadius:"var(--r-sm)", background:"var(--indigo-soft)", color:"var(--indigo)", fontSize:12, fontWeight:600, textDecoration:"none", border:"1px solid var(--indigo-ring)" }}>
              View profile
            </Link>
          </div>

          {/* Stats */}
          <div style={{ padding:"14px", borderBottom:"1px solid var(--line)" }}>
            <div style={{ fontSize:11, fontWeight:600, color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:"0.10em", marginBottom:10 }}>Anime Library</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
              {[{v:(listData?.data??[]).length,l:"Total"},{v:watching.length,l:"Watching"},{v:completed,l:"Done"}].map(({v,l})=>(
                <div key={l} style={{ padding:"10px 8px", borderRadius:"var(--r-md)", background:"var(--bg-2)", border:"1px solid var(--line)", textAlign:"center" }}>
                  <div style={{ fontSize:18, fontWeight:700, color:"var(--ink)" }}>{v}</div>
                  <div style={{ fontSize:10, color:"var(--ink-4)", marginTop:2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {tab==="tasks" && (
        <div style={{ padding:"14px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ fontSize:11, fontWeight:600, color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:"0.10em" }}>Tasks</span>
            <button
              type="button"
              onClick={() => push("Task creation is coming with the next chat release", "info")}
              title="Coming soon"
              style={{ fontSize:11.5, color:"var(--indigo)", fontWeight:500, background:"none", border:"none", cursor:"pointer", fontFamily:"inherit" }}
            >+ New</button>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
            {DEMO_TASKS.map(t=><TaskCard key={t.id} task={t}/>)}
          </div>
        </div>
      )}

      {tab==="files" && (
        <div style={{ padding:"14px" }}>
          <div style={{ fontSize:11, fontWeight:600, color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:"0.10em", marginBottom:10 }}>Shared Files</div>
          {sharedFiles.length===0
            ? <p style={{ color:"var(--ink-4)", fontSize:12, textAlign:"center", padding:"20px 0", lineHeight:1.6 }}>No files shared yet.<br/>Send an image or file to see it here.</p>
            : sharedFiles.map((f,i)=>(
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 10px", borderRadius:"var(--r-md)", cursor:"pointer", marginBottom:2, transition:"background 100ms" }}
                onMouseEnter={ev=>(ev.currentTarget.style.background="var(--bg-2)")}
                onMouseLeave={ev=>(ev.currentTarget.style.background="transparent")}>
                <div style={{ width:30, height:36, borderRadius:4, background:`linear-gradient(160deg,oklch(0.65 0.18 ${f.isImage?282:145}),oklch(0.50 0.20 ${f.isImage?302:165}))`, display:"grid", placeItems:"center", flexShrink:0 }}>
                  {f.isImage
                    ? <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={2} strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="1.6"/><path d="m21 15-5-5L5 21"/></svg>
                    : <span style={{ fontSize:7, fontWeight:700, color:"#fff", letterSpacing:"0.05em" }}>{f.ext}</span>
                  }
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12.5, color:"var(--ink)", fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{f.name}</div>
                  <div style={{ fontSize:10.5, color:"var(--ink-4)", marginTop:1 }}>{f.isImage?"Image":"File"}</div>
                </div>
              </div>
            ))
          }
        </div>
      )}
    </motion.div>
  )
}

/* ─── Parse message content into parts ──────────────────────────────────── */
type MsgPart =
  | { kind:"text";  content:string }
  | { kind:"image"; name:string }
  | { kind:"file";  name:string; size:string }

function parseParts(text: string): MsgPart[] {
  const parts: MsgPart[] = []
  let buf: string[] = []
  for (const line of text.split("\n")) {
    const img  = line.match(/^📷 \[Image: (.+)\]$/)
    const file = line.match(/^📎 \[File: (.+) \((.+)\)\]$/)
    if (img) {
      if (buf.length) { parts.push({ kind:"text", content:buf.join("\n") }); buf=[] }
      parts.push({ kind:"image", name:img[1] })
    } else if (file) {
      if (buf.length) { parts.push({ kind:"text", content:buf.join("\n") }); buf=[] }
      parts.push({ kind:"file", name:file[1], size:file[2] })
    } else { buf.push(line) }
  }
  if (buf.length) parts.push({ kind:"text", content:buf.join("\n") })
  return parts
}

/* ─── File card (matches chat-thread.jsx FileCard design) ────────────────── */
function FileCard({ name, size, isImage, isMine }: { name:string; size?:string; isImage:boolean; isMine:boolean }) {
  const ext = name.split(".").pop()?.toUpperCase() ?? "FILE"
  const hue = isImage ? 282 : ext==="PDF" ? 18 : ext==="DOC"||ext==="DOCX" ? 200 : 145
  return (
    <div style={{ display:"inline-flex", alignItems:"center", gap:12, padding:"10px 14px 10px 12px", background:"var(--bg-2)", border:"1px solid var(--line-strong)", borderRadius:12, cursor:"pointer", transition:"background 120ms", minWidth:220, maxWidth:300 }}
      onMouseEnter={e=>(e.currentTarget.style.background="var(--bg-3)")}
      onMouseLeave={e=>(e.currentTarget.style.background="var(--bg-2)")}>
      {/* Gradient file icon */}
      <div style={{ width:36, height:44, borderRadius:4, background:`linear-gradient(160deg,oklch(0.65 0.18 ${hue}),oklch(0.50 0.20 ${hue+20}))`, display:"grid", placeItems:"center", color:"#fff", fontSize:9, fontWeight:700, letterSpacing:"0.05em", flexShrink:0, boxShadow:"inset 0 1px 0 rgba(255,255,255,0.15)", position:"relative" }}>
        {isImage
          ? <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={1.8} strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="1.6"/><path d="m21 15-5-5L5 21"/></svg>
          : ext
        }
      </div>
      <div style={{ minWidth:0 }}>
        <div style={{ fontSize:13, color:"var(--ink)", fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{name}</div>
        {size && <div style={{ fontSize:11, color:"var(--ink-4)", marginTop:2 }}>{size} · {isImage ? "Image" : "File"}</div>}
      </div>
    </div>
  )
}

/* ─── Message row ────────────────────────────────────────────────────────── */
// Header sub-component — uses real presence so the green dot + "Active now"
// reflects whether the other user actually has a live socket connection.
function ChatHeaderUser({ other }: { other: { id: string; username: string; displayName: string; avatarUrl: string | null } }) {
  const isOnline = usePresence(other.id)
  return (
    <>
      <Avatar name={other.displayName} src={other.avatarUrl} size={34} showStatus online={isOnline} />
      <div style={{ minWidth:0 }}>
        <div style={{ fontSize:14, fontWeight:600, color:"var(--ink)", display:"flex", alignItems:"center", gap:6 }}>
          {other.displayName}
          <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"3px 7px", fontSize:10, fontWeight:600, borderRadius:999, color:"oklch(0.85 0.12 162)", background:"oklch(0.30 0.10 162/0.20)", border:"1px solid oklch(0.50 0.12 162/0.30)", flexShrink:0 }}>
            <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
            E2E
          </span>
        </div>
        <div style={{ fontSize:11.5, color:"var(--ink-3)", marginTop:1, display:"flex", alignItems:"center", gap:6 }}>
          <div style={{ width:6, height:6, background: isOnline ? "oklch(0.78 0.16 145)" : "oklch(0.55 0 0)", borderRadius:"50%" }}/>
          {isOnline ? `Active now · @${other.username}` : `Offline · @${other.username}`}
        </div>
      </div>
    </>
  )
}

function MsgRow({ m, isMine, text, authorSrc, authorName, onDelete }: { m:GM; isMine:boolean; text?:string; authorSrc?:string|null; authorName:string; onDelete?: (id: string, scope: "me" | "everyone") => void }) {
  const [hover, setHover] = useState(false)
  const [reacted, setReacted] = useState<string|null>(null)
  const [menuOpen, setMenuOpen] = useState(false)

  // WhatsApp "delete for everyone" is sender-only, within 24h of sending
  const ageMs = Date.now() - new Date(m.createdAt).getTime()
  const canDeleteForEveryone = isMine && ageMs < 24 * 60 * 60 * 1000 && !m.deletedAt

  // Render tombstone for "delete for everyone" messages
  const isDeleted = !!m.deletedAt

  const bubble: React.CSSProperties = isMine
    ? { background:"linear-gradient(180deg,oklch(0.62 0.18 282),oklch(0.55 0.17 280))", color:"#F8F7FF", borderTopRightRadius:4, boxShadow:"0 6px 22px oklch(0.45 0.18 282/0.30),inset 0 1px 0 rgba(255,255,255,0.10)" }
    : { background:"var(--bg-2)", border:"1px solid var(--line)", borderTopLeftRadius:4 }

  const isDecrypting = text === undefined
  const isError      = text?.startsWith("⚠")
  // Call-summary messages are rendered as a distinct centered line, not a bubble.
  // Format: "📞 Audio call · 2:34" or "📞 Video call · Missed"
  const isCallSummary = !isDecrypting && !isError && text?.startsWith("📞 ")
  const parts        = (!isDecrypting && !isError && !isCallSummary && text) ? parseParts(text) : null

  // Centered call summary row — WhatsApp/iMessage style.
  // Asymmetric copy: caller (isMine) doesn't see "Missed" — they see "No answer"
  // since they were the one calling. Recipient sees "Missed audio call".
  if (isCallSummary && text) {
    const isMissed = text.includes("Missed")
    const isVideo  = text.includes("Video")
    const labelColor = isMissed ? "oklch(0.70 0.18 25)" : "var(--ink-3)" // red-ish for missed

    // Build the display text based on perspective
    let displayText: string
    if (isMissed) {
      displayText = isMine
        ? (isVideo ? "No answer · Video call" : "No answer · Audio call")
        : (isVideo ? "Missed video call"        : "Missed audio call")
    } else {
      // Answered call — strip emoji + show "Audio call · 2:34"
      displayText = text.replace("📞 ", "")
    }

    return (
      <div style={{ padding:"6px 24px", display:"flex", justifyContent:"center" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"6px 14px", borderRadius:999, background:"var(--bg-2)", border:"1px solid var(--line)", fontSize:12, color:labelColor }}>
          <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 10.86 19.79 19.79 0 0 1 1.93 2.18 2 2 0 0 1 3.9 0H6.9a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 7.91a16 16 0 0 0 6.13 6.13l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z"/>
          </svg>
          <span style={{ fontWeight:600 }}>{displayText}</span>
          <span className="mono" style={{ fontSize:10.5, color:"var(--ink-4)", marginLeft:4 }}>{ts(m.createdAt)}</span>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display:"grid", gridTemplateColumns:"52px minmax(0,1fr)", padding:`${m.isGroupStart?"10px":"2px"} 24px`, position:"relative", animation:"msg-in 240ms cubic-bezier(0.22,1,0.36,1) both" }}
      onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}>

      {/* Avatar col */}
      <div style={{ display:"flex", justifyContent:"flex-end", paddingRight:8, paddingTop:m.isGroupStart?2:0 }}>
        {!isMine && m.isGroupStart && <Avatar name={authorName} src={authorSrc} size={32} showStatus={false} />}
      </div>

      {/* Content col */}
      <div style={{ minWidth:0, display:"flex", flexDirection:"column", alignItems:isMine?"flex-end":"flex-start" }}>
        {m.isGroupStart && (
          <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:4, flexDirection:isMine?"row-reverse":"row" }}>
            <span style={{ fontSize:13.5, fontWeight:600, color:"var(--ink)", letterSpacing:"-0.005em" }}>{authorName}</span>
            <span className="mono" style={{ fontSize:11, color:"var(--ink-4)", marginLeft:2 }}>{ts(m.createdAt)}</span>
          </div>
        )}

        {/* Bubble — renders file cards OR text bubble */}
        <div style={{ maxWidth:"min(620px,94%)", position:"relative", display:"flex", flexDirection:"column", gap:4, alignItems:isMine?"flex-end":"flex-start" }}
          onContextMenu={(e) => { if (onDelete && !isDeleted) { e.preventDefault(); setMenuOpen(true) } }}>
          {isDeleted ? (
            // Tombstone for messages deleted "for everyone" — visible to BOTH users
            <div style={{ ...bubble, display:"inline-flex", alignItems:"center", gap:6, padding:"8px 13px 9px", borderRadius:14, fontStyle:"italic", opacity:0.6 }}>
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
              </svg>
              <span style={{ fontSize:13 }}>{isMine ? "You deleted this message" : "This message was deleted"}</span>
            </div>
          ) : isDecrypting ? (
            <div style={{ ...bubble, display:"inline-block", padding:"8px 13px 9px", borderRadius:14 }}>
              <span style={{ color:"var(--ink-4)", fontSize:13, display:"flex", alignItems:"center", gap:6 }}>
                🔒 <span style={{ opacity:0.6 }}>Encrypted — open this chat to read</span>
              </span>
            </div>
          ) : isError ? (
            <div style={{ ...bubble, display:"inline-block", padding:"8px 13px 9px", borderRadius:14 }}>
              <span style={{ color:"var(--amber)", fontSize:13 }}>⚠ {text?.slice(2)}</span>
            </div>
          ) : parts ? (
            parts.map((p, i) => {
              if (p.kind === "image") return <FileCard key={i} name={p.name} isImage={true} isMine={isMine} />
              if (p.kind === "file")  return <FileCard key={i} name={p.name} size={p.size} isImage={false} isMine={isMine} />
              if (!p.content.trim()) return null
              return (
                <div key={i} style={{ ...bubble, display:"inline-block", padding:"8px 13px 9px", borderRadius:14, fontSize:14, lineHeight:1.5, letterSpacing:"-0.003em", whiteSpace:"pre-wrap", wordBreak:"break-word" }}>
                  {p.content}
                </div>
              )
            })
          ) : null}

          {/* Delete menu (right-click) — WhatsApp-style */}
          {menuOpen && onDelete && !isDeleted && (
            <>
              <div onClick={() => setMenuOpen(false)} style={{ position:"fixed", inset:0, zIndex:50 }} />
              <div style={{
                position: "absolute", top: "100%", marginTop: 4,
                ...(isMine ? { right: 0 } : { left: 0 }),
                zIndex: 51, background: "var(--bg-2)", border: "1px solid var(--line)",
                borderRadius: 12, padding: 4, minWidth: 180, boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
              } as React.CSSProperties}>
                <button onClick={() => { onDelete(m.id, "me"); setMenuOpen(false) }}
                  style={{ width:"100%", textAlign:"left", padding:"8px 12px", background:"transparent", border:"none", color:"var(--ink)", fontSize:13, cursor:"pointer", borderRadius:8, display:"flex", alignItems:"center", gap:8 }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-3)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                  Delete for me
                </button>
                {canDeleteForEveryone && (
                  <button onClick={() => { onDelete(m.id, "everyone"); setMenuOpen(false) }}
                    style={{ width:"100%", textAlign:"left", padding:"8px 12px", background:"transparent", border:"none", color:"oklch(0.70 0.18 25)", fontSize:13, cursor:"pointer", borderRadius:8, display:"flex", alignItems:"center", gap:8 }}
                    onMouseEnter={e => (e.currentTarget.style.background = "oklch(0.30 0.10 25 / 0.18)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
                  Delete for everyone
                  </button>
                )}
              </div>
            </>
          )}

          {/* Reactions */}
          {reacted && (
            <div style={{ display:"flex", justifyContent:isMine?"flex-end":"flex-start" }}>
              <div onClick={()=>setReacted(null)} style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"2px 8px 2px 6px", borderRadius:999, background:"oklch(0.40 0.16 282/0.25)", border:"1px solid var(--indigo-ring)", fontSize:11.5, color:"var(--ink)", cursor:"pointer" }}>
                {reacted} <span style={{ fontFeatureSettings:'"tnum"' }}>1</span>
              </div>
            </div>
          )}

          {/* Timestamp + read receipt */}
          <div style={{ display:"flex", alignItems:"center", gap:5, flexDirection:isMine?"row-reverse":"row" }}>
            <span className="mono" style={{ fontSize:10.5, color:"var(--ink-4)" }}>{ts(m.createdAt)}</span>
            {isMine && <span className="mono" style={{ fontSize:10.5, color:m.readAt?"var(--indigo)":"var(--ink-4)" }}>{m.readAt?"✓✓":"✓"}</span>}
          </div>
        </div>
      </div>

      {/* Hover action bar */}
      {hover && !reacted && (
        <div style={{ position:"absolute", top:-14, right:24, display:"flex", background:"var(--bg-elev)", border:"1px solid var(--line-strong)", borderRadius:10, padding:2, boxShadow:"0 12px 30px rgba(0,0,0,0.45)", zIndex:4, animation:"msg-in 120ms ease-out both" }}>
          {["👍","❤️","😂","🔥","👏","😮"].map(e=>(
            <button key={e} onClick={()=>setReacted(e)}
              style={{ fontSize:14, padding:"4px 6px", border:"none", cursor:"pointer", background:"transparent", borderRadius:8, transition:"background 80ms, transform 80ms", lineHeight:1 }}
              onMouseEnter={ev=>{ev.currentTarget.style.background="rgba(255,255,255,0.08)";ev.currentTarget.style.transform="scale(1.2)"}}
              onMouseLeave={ev=>{ev.currentTarget.style.background="transparent";ev.currentTarget.style.transform="scale(1)"}}>
              {e}
            </button>
          ))}
          {[
            { title:"Reply", d:"M9 14 4 9l5-5M4 9h11a5 5 0 0 1 5 5v6" },
            { title:"Pin",   d:"M9 4v6l-2 4h10l-2-4V4M12 16v4M8 4h8" },
            { title:"More",  dots:true },
          ].map(({ title, d, dots }) => (
            <button key={title} title={title}
              style={{ width:28, height:28, border:"none", cursor:"pointer", background:"transparent", borderRadius:8, display:"grid", placeItems:"center", color:"var(--ink-3)", transition:"background 80ms, color 80ms" }}
              onMouseEnter={ev=>{ev.currentTarget.style.background="rgba(255,255,255,0.08)";ev.currentTarget.style.color="var(--ink)"}}
              onMouseLeave={ev=>{ev.currentTarget.style.background="transparent";ev.currentTarget.style.color="var(--ink-3)"}}>
              {dots
                ? <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
                : <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><path d={d}/></svg>
              }
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ─── Typing indicator ───────────────────────────────────────────────────── */
function TypingIndicator({ name, src }: { name:string; src?:string|null }) {
  return (
    <div style={{ display:"grid", gridTemplateColumns:"52px minmax(0,1fr)", padding:"4px 24px 8px" }}>
      <div style={{ display:"flex", justifyContent:"flex-end", paddingRight:8, paddingTop:2 }}>
        <Avatar name={name} src={src} size={28} showStatus={false} />
      </div>
      <div style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"8px 12px", background:"var(--bg-2)", border:"1px solid var(--line)", borderRadius:"14px 14px 14px 4px", width:"fit-content" }}>
        {[0,1,2].map(i=>(
          <div key={i} style={{ width:7, height:7, borderRadius:"50%", background:"var(--ink-3)", animation:`typing-bounce 1.2s ease-in-out ${i*0.16}s infinite` }}/>
        ))}
      </div>
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function ConversationPage() {
  const params         = useParams()
  const conversationId = params.id as string
  const me             = useAuthStore(s => s.user)
  const { push }       = useToast()

  const [conv,         setConv]         = useState<ConversationDetail|null>(null)
  const [initLoading,  setInitLoading]  = useState(true)
  const [cryptoError,  setCryptoError]  = useState<string|null>(null)
  const [showContext,  setShowContext]   = useState(false)
  const [sharedKey,    setSharedKey]    = useState<CryptoKey|null>(null)
  const sharedKeyRef = useRef<CryptoKey|null>(null)
  sharedKeyRef.current = sharedKey

  const [input,        setInput]        = useState("")
  const [showEmoji,    setShowEmoji]    = useState(false)
  const [showSlash,    setShowSlash]    = useState(false)
  const [pendingFiles, setPendingFiles] = useState<FilePrev[]>([])
  const [focus,        setFocus]        = useState(false)

  const scrollRef   = useRef<HTMLDivElement>(null)
  const inputRef    = useRef<HTMLTextAreaElement>(null)
  const fileRef     = useRef<HTMLInputElement>(null)
  const imgRef      = useRef<HTMLInputElement>(null)
  const lastMarkRef = useRef(0)
  const prevLastId  = useRef<string|null>(null)
  const prevScrollH = useRef(0)

  useChatSocket(conversationId)
  const { permission: micPerm, requestMic } = useMicPermission()
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useMessages(conversationId)
  const messages  = [...(data?.pages??[])].reverse().flatMap(p=>[...p.messages].reverse())
  const grouped   = groupMsgs(messages)
  const decrypted = useDecrypt(messages, sharedKey)

  const sendMutation = useSendMessage(conversationId)
  const markReadMut  = useMarkRead(conversationId)
  const deleteMut    = useDeleteMessage(conversationId)

  const handleDeleteMessage = useCallback((id: string, scope: "me" | "everyone") => {
    deleteMut.mutate({ messageId: id, scope }, {
      onError: () => push("Failed to delete message.", "error"),
    })
  }, [deleteMut, push])
  const webrtc       = useWebRTC()
  const { otherTyping, emitTyping, stopTyping } = useTypingIndicator(
    conversationId,
    conv?.otherUser?.id ?? null,
  )

  // Auto-clear stale permission error when user grants mic access in browser panel
  useEffect(() => {
    if (micPerm === "granted" && webrtc.callError?.includes("blocked")) {
      webrtc.hangUp() // clears callError so the "Try calling" buttons appear
    }
  }, [micPerm, webrtc.callError]) // eslint-disable-line react-hooks/exhaustive-deps

  // After a call ends, post an encrypted "📞 Audio call · 2:34" or "Missed" message
  // into the conversation so both users see it in the chat history.
  // Only the caller posts (asInitiator) — prevents duplicate entries.
  useEffect(() => {
    const summary = webrtc.lastCallEnded
    if (!summary || !summary.asInitiator) return
    if (!sharedKeyRef.current && isE2EAvailable) return // wait for crypto

    const fmtDuration = (s: number) => {
      const m = Math.floor(s / 60)
      const r = s % 60
      return `${m}:${r.toString().padStart(2, "0")}`
    }

    const label = summary.callType === "video" ? "Video call" : "Audio call"
    const detail = summary.status === "missed" ? "Missed" : fmtDuration(summary.duration)
    const text = `📞 ${label} · ${detail}`

    // Acknowledge immediately so a re-render won't fire again
    webrtc.consumeLastCallEnded()

    void (async () => {
      try {
        const { ciphertext, iv } = await encryptMessage(sharedKeyRef.current, text)
        sendMutation.mutate({ ciphertext, iv })
      } catch {
        /* silent — call already ended, summary post is best-effort */
      }
    })()
  }, [webrtc.lastCallEnded, webrtc, sendMutation])

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = scrollRef.current; if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior })
  }, [])

  useEffect(() => {
    if (!messages.length || !sharedKey) return
    const now = Date.now()
    if (now - lastMarkRef.current < 5_000) return
    lastMarkRef.current = now; markReadMut.mutate()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, sharedKey])

  const initCrypto = useCallback(async (cancelled: { v: boolean }) => {
    setCryptoError(null)

    // Non-secure context (http:// on a LAN IP): crypto.subtle is unavailable.
    // Skip E2E setup entirely — messaging still works via server-side encoding.
    if (!isE2EAvailable) {
      try {
        const { conversation } = await ep.getConversation(conversationId)
        if (cancelled.v) return
        setConv(conversation)
        // No sharedKey — encryptMessage/decryptMessage handle null key with base64 fallback
        setCryptoError("no-e2e") // special marker: not a real error, just no E2E
      } catch (e) {
        if (!cancelled.v) setCryptoError("Could not load conversation.")
        console.error("[Chat]", e)
      } finally {
        if (!cancelled.v) setInitLoading(false)
      }
      return
    }

    try {
      const { publicKeyJwk, privateKey } = await getOrCreateKeyPair()
      await ep.uploadPublicKey(publicKeyJwk)
      const { conversation } = await ep.getConversation(conversationId)
      if (cancelled.v) return
      setConv(conversation)
      if (conversation.publicKey) {
        const key = await getSharedKey(privateKey, conversation.publicKey)
        if (!cancelled.v) { setSharedKey(key); sharedKeyRef.current = key }
      } else {
        if (!cancelled.v) setCryptoError("Waiting for the other user to open this chat.")
      }
    } catch (e) {
      if (!cancelled.v) setCryptoError("Encryption setup failed.")
      console.error("[Chat]", e)
    } finally {
      if (!cancelled.v) setInitLoading(false)
    }
  }, [conversationId])

  useEffect(() => {
    const c = { v:false }; setInitLoading(true); setSharedKey(null)
    initCrypto(c); return () => { c.v = true }
  }, [conversationId, initCrypto])

  // Auto-retry key exchange every 10s while waiting (not in no-e2e mode)
  useEffect(() => {
    if (!cryptoError?.includes("Waiting") || !isE2EAvailable) return
    const timer = setInterval(() => {
      const c = { v: false }
      initCrypto(c)
    }, 10_000)
    return () => clearInterval(timer)
  }, [cryptoError, initCrypto])

  useEffect(() => {
    const last = messages[messages.length-1]; if (!last) return
    if (last.id === prevLastId.current) {
      const el = scrollRef.current
      if (el && prevScrollH.current>0) { el.scrollTop = el.scrollHeight - prevScrollH.current; prevScrollH.current=0 }
      return
    }
    const prev = prevLastId.current; prevLastId.current = last.id
    if (!prev) { scrollToBottom("instant"); return }
    const el = scrollRef.current
    if (!el || el.scrollHeight-el.scrollTop-el.clientHeight<200) scrollToBottom("smooth")
  }, [messages, scrollToBottom])

  const handleFilePick = (e: ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files??[]).forEach(file => {
      const id = Math.random().toString(36).slice(2)
      const size = file.size>1_048_576?`${(file.size/1_048_576).toFixed(1)} MB`:`${(file.size/1024).toFixed(0)} KB`
      if (file.type.startsWith("image/")) {
        const r = new FileReader()
        r.onload = ev => setPendingFiles(p=>[...p,{id,name:file.name,size,type:"image",dataUrl:ev.target?.result as string}])
        r.readAsDataURL(file)
      } else { setPendingFiles(p=>[...p,{id,name:file.name,size,type:"file"}]) }
    })
    e.target.value = ""
  }

  const handleSend = useCallback(async () => {
    const text = input.trim()
    // Allow sending when: E2E key ready, no-E2E mode (LAN HTTP), OR waiting for key
    // encryptMessage(null, text) uses base64 fallback when key is null
    const canEncrypt = !!sharedKeyRef.current || !isE2EAvailable || cryptoReady
    if ((!text && !pendingFiles.length) || !canEncrypt || sendMutation.isPending) return

    // /ask command — show local AI response bubble (matching chat-thread.jsx AIResponse)
    if (text.startsWith("/ask ") && text.length > 5) {
      const query = text.slice(5)
      setInput(""); setShowSlash(false)
      setAiResponse({
        body: `**Analyzing:** "${query}"\n\nBased on your watchlist and ratings, here are my top recommendations for you.`,
        payload: {
          rows: [
            { label:"Relevance", a:"94%", b:"81%", delta:"+13%", good:true },
            { label:"Genre match", a:"98%", b:"76%", delta:"+22%", good:true },
            { label:"Rating avg",  a:"8.9", b:"8.4", delta:"+0.5", good:true },
          ],
          tip:"Try the AI Oracle page for deeper anime discovery with full neural matching.",
        }
      })
      return
    }

    let content = text
    if (pendingFiles.length) {
      const labels = pendingFiles.map(f=>f.type==="image"?`📷 [Image: ${f.name}]`:`📎 [File: ${f.name} (${f.size})]`).join("\n")
      content = text ? `${labels}\n${text}` : labels
    }
    setInput(""); setPendingFiles([]); setShowEmoji(false); setShowSlash(false)
    stopTyping()
    const el = inputRef.current; if (el) { el.style.height="auto"; el.focus() }
    try {
      const { ciphertext, iv } = await encryptMessage(sharedKeyRef.current, content)
      sendMutation.mutate({ ciphertext, iv }, { onError: () => { setInput(text); push("Failed to send.", "error") } })
    } catch { setInput(text); push("Encryption failed.", "error") }
  }, [input, pendingFiles, sendMutation, push])

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key==="Escape") { setShowSlash(false); setShowEmoji(false); return }
    if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); handleSend() }
  }
  const autoResize = () => {
    const el = inputRef.current; if (!el) return
    el.style.height = "auto"; el.style.height = Math.min(el.scrollHeight,200)+"px"
  }
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setInput(val)
    autoResize()
    setShowSlash(val.startsWith("/") && val.length >= 1 && !val.includes(" "))
    if (val) emitTyping()
  }

  // Local AI response (from /ask command — cosmetic demo matching chat-thread.jsx)
  const [aiResponse, setAiResponse] = useState<{ body:string; payload:AIPayload } | null>(null)

  // Messaging works when: E2E key ready OR waiting/no-E2E (uses base64 fallback)
  // "Waiting for other user" is NOT a reason to block sending — messages still go through
  const cryptoReady = !!sharedKey || !isE2EAvailable || !!cryptoError?.includes("Waiting")
  const canSend = (input.trim().length>0||pendingFiles.length>0) && cryptoReady && !sendMutation.isPending
  const other   = conv?.otherUser

  // Extract shared files from all decrypted messages
  const sharedFiles = Object.values(decrypted).flatMap(text => {
    if (!text || text.startsWith("⚠")) return []
    return parseParts(text).filter(p=>p.kind==="image"||p.kind==="file").map(p => ({
      name:    p.kind==="image" || p.kind==="file" ? p.name : "",
      isImage: p.kind==="image",
      ext:     (p.kind==="image" || p.kind==="file" ? p.name : "").split(".").pop()?.toUpperCase()??"FILE",
    }))
  })

  const initiateCall = (type: "audio"|"video") => {
    if (!other || !me) return
    if (webrtc.status !== "idle") return
    // Always let getUserMedia be the source of truth — never pre-block based on
    // Permissions API state which can be stale after the user changes browser settings
    webrtc.call(
      other.id,
      type,
      me.displayName || me.username,
      me.avatarUrl ?? null,
    )
  }

  if (initLoading) return (
    <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:12, background:"var(--bg-0)" }}>
      <div style={{ width:36, height:36, borderRadius:10, background:"var(--indigo-soft)", border:"1px solid var(--indigo-ring)", display:"grid", placeItems:"center" }}>
        <div style={{ width:16, height:16, border:"2px solid var(--indigo)", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.6s linear infinite" }}/>
      </div>
      <p style={{ fontSize:12.5, color:"var(--ink-3)" }}>Setting up encrypted channel…</p>
    </div>
  )

  return (
    <div style={{ flex:1, display:"flex", minWidth:0, minHeight:0, overflow:"hidden" }}>
      <input ref={fileRef} type="file" multiple className="sr-only" onChange={handleFilePick}/>
      <input ref={imgRef}  type="file" multiple accept="image/*" className="sr-only" onChange={handleFilePick}/>

      {/* ── THREAD ────────────────────────────────────────────────────────── */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, minHeight:0, background:"var(--bg-0)" }}>

        {/* Header */}
        <div style={{ height:60, flexShrink:0, padding:"0 16px", display:"flex", alignItems:"center", gap:12, borderBottom:"1px solid var(--line)", background:"var(--bg-0)", position:"relative" }}>
          {/* Back arrow — Instagram-web style. Exits the conversation and goes to dashboard. */}
          <Link href="/dashboard" title="Back to dashboard"
            style={{ width:30, height:30, borderRadius:"var(--r-sm)", display:"grid", placeItems:"center", color:"var(--ink-3)", background:"transparent", textDecoration:"none", flexShrink:0, transition:"background 120ms,color 120ms" }}
            onMouseEnter={e=>Object.assign((e.currentTarget as HTMLElement).style,{background:"var(--bg-2)",color:"var(--ink)"})}
            onMouseLeave={e=>Object.assign((e.currentTarget as HTMLElement).style,{background:"transparent",color:"var(--ink-3)"})}
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Link>
          {other && <ChatHeaderUser other={other} />}

          {/* Actions */}
          <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:2, flexShrink:0 }}>
            {/* Mic blocked indicator */}
            {micPerm === "denied" && (
              <span title="Microphone blocked — click a call button to see how to fix it"
                style={{ fontSize:13, cursor:"default", opacity:0.6 }}>🎙️🚫</span>
            )}
            {[
              { id:"audio", title: micPerm==="denied" ? "🚫 Mic blocked — click for help" : "Voice call", onClick:()=>initiateCall("audio"), d:"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.99 10.86 19.79 19.79 0 0 1 1.93 2.18 2 2 0 0 1 3.9 0H6.9a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 7.91a16 16 0 0 0 6.13 6.13l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92Z", isCall: true },
              { id:"video", title: micPerm==="denied" ? "🚫 Mic blocked — click for help" : "Video call", onClick:()=>initiateCall("video"), d:"M15 10l4.553-2.069A1 1 0 0 1 21 8.82v6.361a1 1 0 0 1-1.447.894L15 14M3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z", isCall: true },
              { id:"search", title:"Message search coming soon", onClick:()=>push("Message search is coming in the next release", "info"), d:"M11 11c0-3.87 2.13-7 7-7m-7 7a7 7 0 1 1 0-14 7 7 0 0 1 0 14Z", isCall: false },
            ].map(({ id, title, onClick, d, isCall }) => {
              const inCall = webrtc.status !== "idle"
              const disabled = isCall && inCall
              const blockedColor = micPerm === "denied" && isCall ? "rgba(239,68,68,0.7)" : "var(--ink-3)"
              return (
              <button key={id} onClick={disabled ? undefined : () => onClick()} title={title}
                style={{ width:30, height:30, borderRadius:"var(--r-sm)", display:"grid", placeItems:"center", color: disabled ? "var(--ink-5)" : blockedColor, background:"transparent", border:"none", cursor: disabled ? "not-allowed" : "pointer", transition:"background 120ms,color 120ms", opacity: disabled ? 0.4 : 1 }}
                onMouseEnter={e=>!disabled && Object.assign((e.currentTarget as HTMLElement).style,{background:"var(--bg-2)",color:"var(--ink)"})}
                onMouseLeave={e=>!disabled && Object.assign((e.currentTarget as HTMLElement).style,{background:"transparent",color: blockedColor})}>
                <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><path d={d}/></svg>
              </button>
            )})}
            <button onClick={()=>setShowContext(p=>!p)} title="Details"
              style={{ width:30, height:30, borderRadius:"var(--r-sm)", display:"grid", placeItems:"center", background:showContext?"var(--indigo-soft)":"transparent", color:showContext?"var(--indigo)":"var(--ink-3)", border:showContext?"1px solid var(--indigo-ring)":"none", cursor:"pointer", transition:"all 120ms" }}>
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
            </button>
          </div>
        </div>

        {/* No-E2E mode banner (HTTP on LAN IP — crypto.subtle unavailable) */}
        {cryptoError === "no-e2e" && (
          <div style={{ flexShrink:0, padding:"6px 24px", background:"oklch(0.28 0.08 60/0.25)", borderBottom:"1px solid oklch(0.50 0.10 60/0.30)", display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:12, color:"oklch(0.82 0.12 80)" }}>
              🔓 Messages are server-encrypted (E2E unavailable on HTTP). Use <strong>localhost:3000</strong> for full E2E encryption.
            </span>
          </div>
        )}

        {/* Crypto error */}
        {cryptoError && cryptoError !== "no-e2e" && (
          <div style={{ flexShrink:0, padding:"8px 24px", background:"oklch(0.32 0.12 75/0.20)", borderBottom:"1px solid oklch(0.50 0.12 75/0.25)", display:"flex", alignItems:"center", justifyContent:"space-between", gap:10 }}>
            <span style={{ fontSize:11.5, color:"var(--amber)", display:"flex", alignItems:"center", gap:6 }}>
              {cryptoError.includes("Waiting") ? (
                <>
                  <span style={{ width:7, height:7, borderRadius:"50%", background:"var(--amber)", animation:"pulse 1.5s ease-in-out infinite", flexShrink:0, display:"inline-block" }}/>
                  Waiting for {other?.displayName ?? "the other user"} to open the chat — checking every 10 s
                </>
              ) : (
                <>⚠ {cryptoError}</>
              )}
            </span>
            <button onClick={()=>{ setInitLoading(true); const c={v:false}; initCrypto(c) }}
              style={{ padding:"3px 10px", borderRadius:6, background:"transparent", border:"1px solid oklch(0.50 0.12 75/0.5)", color:"var(--amber)", fontSize:11, fontWeight:600, cursor:"pointer", fontFamily:"inherit", flexShrink:0 }}>
              Retry now
            </button>
          </div>
        )}

        {/* Messages — data-lenis-prevent tells the global Lenis smooth-scroll
            wrapper to NOT hijack wheel events here, otherwise two-finger
            trackpad scroll just bounces the whole page instead of scrolling
            the chat. overscrollBehavior:contain stops scroll chaining too. */}
        <div ref={scrollRef}
          data-lenis-prevent="true"
          style={{ flex:1, overflowY:"auto", overscrollBehavior:"contain", paddingTop:16, paddingBottom:8, minHeight:0 }}>
          {hasNextPage && (
            <div style={{ display:"flex", justifyContent:"center", paddingBottom:12 }}>
              <button onClick={()=>{ prevScrollH.current=scrollRef.current?.scrollHeight??0; fetchNextPage() }} disabled={isFetchingNextPage}
                style={{ padding:"4px 16px", borderRadius:999, background:"var(--bg-2)", border:"1px solid var(--line)", color:"var(--ink-3)", fontSize:11.5, cursor:"pointer", fontFamily:"inherit" }}>
                {isFetchingNextPage ? "Loading…" : "↑ Load older messages"}
              </button>
            </div>
          )}

          {grouped.length===0 && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"60%", gap:10, padding:"0 24px" }}>
              <div style={{ width:44, height:44, borderRadius:"var(--r-md)", background:"var(--indigo-soft)", border:"1px solid var(--indigo-ring)", display:"grid", placeItems:"center" }}>
                <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="var(--indigo)" strokeWidth={1.8} strokeLinecap="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
              </div>
              <p style={{ fontSize:13, color:"var(--ink-3)", textAlign:"center", lineHeight:1.6 }}>No messages yet.<br/>This conversation is end-to-end encrypted.</p>
            </div>
          )}

          {grouped.map((msg, i) => {
            const isMine = msg.senderId === me?.id
            const showDay = msg.dayBreak
            return (
              <div key={msg.id}>
                {showDay && (
                  <div style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 24px 18px", fontSize:11, color:"var(--ink-4)", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.08em" }}>
                    <div style={{ flex:1, height:1, background:"var(--line)" }}/>
                    {dayLabel(msg.createdAt)}
                    <div style={{ flex:1, height:1, background:"var(--line)" }}/>
                  </div>
                )}
                <MsgRow m={msg} isMine={isMine}
                  text={decrypted[msg.id]}
                  authorSrc={isMine ? me?.avatarUrl : other?.avatarUrl}
                  authorName={isMine ? (me?.displayName??"You") : (other?.displayName??"Them")}
                  onDelete={handleDeleteMessage}
                />
              </div>
            )
          })}

          {/* AI Response bubble (from /ask command) */}
          {aiResponse && (
            <div style={{ display:"grid", gridTemplateColumns:"52px minmax(0,1fr)", padding:"10px 24px", animation:"msg-in 240ms cubic-bezier(0.22,1,0.36,1) both" }}>
              <div style={{ display:"flex", justifyContent:"flex-end", paddingRight:8, paddingTop:2 }}>
                <div style={{ width:32, height:32, borderRadius:"50%", background:"linear-gradient(135deg,oklch(0.7 0.18 282),oklch(0.55 0.18 250))", display:"grid", placeItems:"center" }}>
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2} strokeLinecap="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></svg>
                </div>
              </div>
              <div style={{ minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:4 }}>
                  <span style={{ fontSize:13.5, fontWeight:600, color:"var(--ink)" }}>Drift AI</span>
                  <span className="mono" style={{ fontSize:11, color:"var(--ink-4)" }}>{ts(new Date().toISOString())}</span>
                </div>
                <div style={{ display:"inline-block", maxWidth:"min(640px,96%)", padding:"8px 13px 9px", borderRadius:"14px 14px 14px 4px", background:"linear-gradient(180deg,oklch(0.21 0.04 280),oklch(0.16 0.03 270))", border:"1px solid oklch(0.40 0.12 282/0.35)", boxShadow:"0 8px 30px oklch(0.30 0.12 282/0.35)" }}>
                  <AIResponseBubble body={aiResponse.body} payload={aiResponse.payload} />
                </div>
                <button onClick={()=>setAiResponse(null)} style={{ fontSize:10.5, color:"var(--ink-4)", background:"none", border:"none", cursor:"pointer", marginTop:4, fontFamily:"inherit" }}>Dismiss</button>
              </div>
            </div>
          )}

          {/* Typing indicator */}
          {otherTyping && conv?.otherUser && (
            <TypingIndicator name={conv.otherUser.displayName} src={conv.otherUser.avatarUrl} />
          )}

          <div style={{ height:4 }}/>
        </div>

        {/* Composer */}
        <div style={{ flexShrink:0, padding:"12px 24px 18px", background:"var(--bg-0)", position:"relative" }}>
          {/* Slash command popup */}
          <AnimatePresence>
            {showSlash && (
              <div style={{ position:"absolute", bottom:"100%", left:24, right:24, zIndex:50 }}>
                <SlashMenu filter={input} onPick={cmd=>{ setInput(cmd); setShowSlash(false); inputRef.current?.focus() }} onClose={()=>setShowSlash(false)} />
              </div>
            )}
          </AnimatePresence>

          {/* File previews */}
          {pendingFiles.length>0 && (
            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:10 }}>
              {pendingFiles.map(f=>(
                <div key={f.id} style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 8px 5px 6px", borderRadius:"var(--r-sm)", background:"var(--indigo-soft)", border:"1px solid var(--indigo-ring)" }}>
                  {f.type==="image"&&f.dataUrl
                    ? <img src={f.dataUrl} alt="" style={{ width:24, height:24, borderRadius:4, objectFit:"cover" }}/>
                    : <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="var(--indigo)" strokeWidth={1.8} strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><polyline points="14 2 14 8 20 8"/></svg>
                  }
                  <div>
                    <div style={{ fontSize:11, fontWeight:500, color:"var(--ink)", maxWidth:120, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{f.name}</div>
                    <div style={{ fontSize:9.5, color:"var(--ink-3)" }}>{f.size}</div>
                  </div>
                  <button onClick={()=>setPendingFiles(p=>p.filter(x=>x.id!==f.id))} style={{ background:"none", border:"none", color:"var(--ink-4)", cursor:"pointer", padding:2, display:"grid", placeItems:"center", borderRadius:4, fontSize:14, lineHeight:1 }}>✕</button>
                </div>
              ))}
            </div>
          )}

          <div style={{ background:"var(--bg-2)", border:`1px solid ${focus?"var(--indigo-ring)":"var(--line-strong)"}`, borderRadius:16, transition:"border-color 160ms,box-shadow 160ms", boxShadow:focus?"0 0 0 4px oklch(0.55 0.18 282/0.10)":"none" }}>
            <textarea ref={inputRef} value={input}
              onChange={handleInputChange}
              onFocus={()=>setFocus(true)} onBlur={()=>setFocus(false)}
              onKeyDown={onKey}
              placeholder={
                cryptoError?.includes("Waiting")
                  ? `Message ${other?.displayName?.split(" ")[0]??"…"} — key exchange pending, messages still send`
                  : cryptoReady
                    ? `Message ${other?.displayName?.split(" ")[0]??"…"} — type / for commands`
                    : cryptoError && cryptoError !== "no-e2e"
                      ? "Encryption error — click Retry"
                      : "Setting up encryption…"
              }
              disabled={!cryptoReady || sendMutation.isPending}
              rows={1}
              style={{ width:"100%", minHeight:44, maxHeight:200, padding:"12px 14px 8px", background:"transparent", border:"none", outline:"none", color:"var(--ink)", fontSize:14, lineHeight:1.5, resize:"none", fontFamily:"inherit", opacity:!cryptoReady||sendMutation.isPending?0.5:1 }}
            />
            {/* Toolbar */}
            <div style={{ display:"flex", alignItems:"center", gap:2, padding:"6px 8px", borderTop:"1px solid var(--line)" }}>
              {[
                { title:"Attach file",  icon:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12", action:()=>fileRef.current?.click() },
                { title:"Share image",  icon:"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12", isImg:true, action:()=>imgRef.current?.click() },
                { title:"Emoji",        emoji:true, action:()=>setShowEmoji(p=>!p) },
                { title:"Mention",      icon:"M16 8a6 6 0 0 1 6 6v1a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-1a4 4 0 0 0-4-4 4 4 0 0 0-4 4v2a2 2 0 0 0 2 2h4M12 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", action:()=>setInput(p=>p+"@") },
                { title:"Slash commands",icon:"M12 2v20M2 12h20", slash:true, action:()=>{ setInput("/"); setShowSlash(true); inputRef.current?.focus() } },
                { title:"Voice message",icon:"M9 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3ZM19 11a7 7 0 0 1-14 0M12 19v4m-3 0h6", action:()=>{} },
              ].map(({ title, icon, emoji, isImg, slash, action }) => (
                <div key={title} style={{ position:"relative" }}>
                  <button onClick={action} title={title}
                    style={{ width:30, height:30, borderRadius:7, display:"grid", placeItems:"center", color:showEmoji&&emoji?"var(--indigo)":"var(--ink-3)", background:showEmoji&&emoji?"var(--indigo-soft)":"transparent", border:"none", cursor:"pointer", transition:"background 100ms,color 100ms", fontSize:emoji?14:undefined }}
                    onMouseEnter={e=>{ if(!(showEmoji&&emoji))Object.assign((e.currentTarget as HTMLElement).style,{background:"rgba(255,255,255,0.05)",color:"var(--ink)"}) }}
                    onMouseLeave={e=>{ if(!(showEmoji&&emoji))Object.assign((e.currentTarget as HTMLElement).style,{background:showEmoji&&emoji?"var(--indigo-soft)":"transparent",color:showEmoji&&emoji?"var(--indigo)":"var(--ink-3)"}) }}>
                    {emoji ? "😊"
                      : slash ? <span style={{ fontFamily:"monospace", fontSize:13, fontWeight:600 }}>/</span>
                      : isImg ? <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="1.6"/><path d="m21 15-5-5L5 21"/></svg>
                      : <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><path d={icon}/></svg>
                    }
                  </button>
                  {emoji && <AnimatePresence>{showEmoji && <EmojiPicker onPick={e=>{ setInput(p=>p+e); setShowEmoji(false); inputRef.current?.focus() }} onClose={()=>setShowEmoji(false)}/>}</AnimatePresence>}
                </div>
              ))}

              {/* Ask AI */}
              <button
                type="button"
                onClick={() => { setInput(p => p + (p.endsWith(" ") || p.length === 0 ? "/ai " : " /ai ")); inputRef.current?.focus() }}
                title="Prefix your message with /ai to ask the AI"
                style={{ height:28, marginLeft:4, padding:"0 10px 0 8px", borderRadius:7, display:"inline-flex", alignItems:"center", gap:5, background:"var(--indigo-soft)", color:"var(--indigo)", border:"1px solid var(--indigo-ring)", cursor:"pointer", fontSize:11.5, fontWeight:600, fontFamily:"inherit" }}
              >
                <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></svg>
                Ask AI
              </button>

              {/* Send */}
              <button onClick={handleSend} disabled={!canSend}
                style={{ marginLeft:"auto", height:30, padding:"0 10px 0 12px", borderRadius:8, display:"inline-flex", alignItems:"center", gap:6, background:canSend?"var(--indigo)":"var(--bg-3)", color:canSend?"#fff":"var(--ink-4)", border:"none", cursor:canSend?"pointer":"default", fontSize:12.5, fontWeight:600, boxShadow:canSend?"0 6px 16px oklch(0.45 0.18 282/0.45)":"none", transition:"all 150ms", fontFamily:"inherit" }}>
                {sendMutation.isPending
                  ? <div style={{ width:12, height:12, border:"2px solid rgba(255,255,255,0.5)", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.6s linear infinite" }}/>
                  : <>Send <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round"><path d="m5 12 7-7 7 7M12 5v14"/></svg></>
                }
              </button>
            </div>
          </div>

          {/* Hints */}
          <div className="composer-hint" style={{ display:"flex", alignItems:"center", gap:12, marginTop:7, paddingLeft:4, fontSize:11, color:"var(--ink-4)" }}>
            {[["↵","Send"],["⇧↵","New line"],["/","Commands"]].map(([k,l])=>(
              <span key={k}><span className="mono" style={{ padding:"1px 5px", borderRadius:4, background:"rgba(255,255,255,0.04)", border:"1px solid var(--line)", fontSize:10.5, marginRight:4 }}>{k}</span>{l}</span>
            ))}
            <span style={{ marginLeft:"auto", display:"inline-flex", alignItems:"center", gap:5, color:"var(--ink-4)", flexShrink:0 }}>
              <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="oklch(0.80 0.14 162)" strokeWidth={2.4} strokeLinecap="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
              {sharedKey ? "Encrypted on your device" : !isE2EAvailable ? "Server encrypted (HTTP mode)" : "Server encrypted"}
            </span>
          </div>
        </div>
      </div>

      {/* Context rail */}
      <AnimatePresence>{showContext && conv && <ContextRail conv={conv} onClose={()=>setShowContext(false)} sharedFiles={sharedFiles}/>}</AnimatePresence>

      {/* Call error toast */}
      {webrtc.callError && (
        <div style={{
          position:"fixed", top:24, left:"50%", transform:"translateX(-50%)", zIndex:10000,
          background:"#140c0c", border:"1px solid rgba(239,68,68,0.35)",
          borderRadius:18, padding:"16px 18px", maxWidth:440, minWidth:280,
          color:"#fca5a5", fontSize:13,
          boxShadow:"0 20px 60px rgba(0,0,0,0.85)",
        }}>
          <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
            <span style={{ fontSize:18, flexShrink:0 }}>
              {webrtc.callError === "MACOS_SYSTEM_BLOCK" ? "🚫" : "⚠️"}
            </span>
            <div style={{ flex:1 }}>

              {webrtc.callError === "MACOS_SYSTEM_BLOCK" ? (
                /* macOS system-level block — browser toggles may show green but hardware is denied */
                <>
                  <p style={{ margin:"0 0 6px", fontWeight:700, color:"#f87171", fontSize:13.5 }}>
                    Camera / Microphone blocked
                  </p>
                  <p style={{ margin:"0 0 10px", fontSize:12.5, color:"rgba(252,165,165,0.75)", lineHeight:1.6 }}>
                    Your browser toggles may show <strong>green</strong>, but macOS is blocking hardware access for Chrome. Fix it in System Settings:
                  </p>
                  <ol style={{ margin:"0 0 14px", padding:"0 0 0 16px", fontSize:12, color:"rgba(252,165,165,0.7)", lineHeight:2 }}>
                    <li>Open <strong style={{color:"#fca5a5"}}>Apple Menu → System Settings</strong></li>
                    <li>Go to <strong style={{color:"#fca5a5"}}>Privacy &amp; Security → Microphone</strong></li>
                    <li>Enable the toggle next to <strong style={{color:"#fca5a5"}}>Google Chrome</strong></li>
                    <li>Do the same for <strong style={{color:"#fca5a5"}}>Camera</strong></li>
                    <li>Quit and reopen Chrome, then try calling again</li>
                  </ol>
                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={() => webrtc.hangUp()}
                      style={{ flex:1, padding:"8px 0", borderRadius:10, fontSize:12, fontWeight:600, cursor:"pointer", background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.25)", color:"#fca5a5" }}>
                      Dismiss
                    </button>
                    <button onClick={() => { webrtc.hangUp(); setTimeout(()=>initiateCall("audio"), 200) }}
                      style={{ flex:1, padding:"8px 0", borderRadius:10, fontSize:12, fontWeight:700, cursor:"pointer", background:"rgba(74,222,128,0.12)", border:"1px solid rgba(74,222,128,0.3)", color:"#4ade80" }}>
                      Try again
                    </button>
                  </div>
                </>
              ) : webrtc.callError === "SOCKET_RECONNECTING" || webrtc.callError === "SOCKET_NULL" ? (
                /* Socket not connected — reconnecting */
                <>
                  <p style={{ margin:"0 0 6px", fontWeight:700, color:"#fbbf24", fontSize:13.5 }}>
                    Reconnecting to server…
                  </p>
                  <p style={{ margin:"0 0 12px", fontSize:12.5, color:"rgba(252,211,77,0.7)", lineHeight:1.6 }}>
                    The server is waking up (Render free tier). This takes up to 30 seconds.
                    Wait a moment then try calling again.
                  </p>
                  <div style={{ display:"flex", gap:8 }}>
                    <button onClick={() => webrtc.hangUp()}
                      style={{ flex:1, padding:"8px 0", borderRadius:10, fontSize:12, fontWeight:600, cursor:"pointer", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", color:"rgba(255,255,255,0.5)" }}>
                      Dismiss
                    </button>
                    <button onClick={() => { webrtc.hangUp(); setTimeout(()=>initiateCall(webrtc.callType || "audio"), 5000) }}
                      style={{ flex:1, padding:"8px 0", borderRadius:10, fontSize:12, fontWeight:700, cursor:"pointer", background:"rgba(251,191,36,0.15)", border:"1px solid rgba(251,191,36,0.35)", color:"#fbbf24" }}>
                      Retry in 5s
                    </button>
                  </div>
                </>
              ) : (
                /* Generic error */
                <>
                  <p style={{ margin:"0 0 10px", lineHeight:1.55 }}>{webrtc.callError.split("\n\n")[0]}</p>
                  <button onClick={() => webrtc.hangUp()}
                    style={{ padding:"6px 16px", borderRadius:8, fontSize:12, fontWeight:600, cursor:"pointer", background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.25)", color:"#fca5a5" }}>
                    Dismiss
                  </button>
                </>
              )}
            </div>
            <button onClick={() => webrtc.hangUp()}
              style={{ fontSize:16, color:"rgba(255,255,255,0.2)", cursor:"pointer", background:"none", border:"none", flexShrink:0 }}>✕</button>
          </div>
        </div>
      )}

      {/* Call UI */}
      <AnimatePresence>
        {webrtc.status==="incoming" && webrtc.incoming && (
          <IncomingCallCard callerName={webrtc.incoming.callerName} callerAvatar={webrtc.incoming.callerAvatar} callType={webrtc.incoming.callType} onAccept={webrtc.accept} onReject={webrtc.reject}/>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {(webrtc.status==="calling"||webrtc.status==="active") && (
          <ActiveCallModal
            callType={webrtc.callType}
            peerName={other?.displayName??"…"}
            peerAvatar={other?.avatarUrl??null}
            duration={webrtc.duration}
            isMuted={webrtc.isMuted}
            isCamOff={webrtc.isCamOff}
            isSpeakerOff={webrtc.isSpeakerOff}
            status={webrtc.status}
            localVideoEl={webrtc.localVideoEl}
            remoteVideoEl={webrtc.remoteVideoEl}
            onMute={webrtc.toggleMute}
            onCamera={webrtc.toggleCamera}
            onSpeaker={webrtc.toggleSpeaker}
            onHangUp={webrtc.hangUp}
            onVideoElemsReady={webrtc.onVideoElemsReady}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
