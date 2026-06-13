"use client"

import { useState, useRef, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { useConversations, useStartConversation, useChatSocket } from "@/hooks/useChat"
import { useAuthStore } from "@/stores/auth.store"
import { useClubs, useCreateClub, useSearchClubs } from "@/hooks/useClubs"
import { useNotificationsQuery } from "@/hooks/useNotificationsQuery"
import { useToast } from "@/stores/toast.store"
import * as ep from "@/lib/api/endpoints"
import { isE2EAvailable } from "@/lib/e2e-crypto"
import type { User } from "@/lib/api/types"
import { format, isToday, isYesterday } from "date-fns"

/* ─── CSS variables ────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap');
  :root {
    /* Warm neutral dark surfaces (de-blued) to pair with the Kaiveron gold accent. */
    --bg-0:var(--app-bg); --bg-1:var(--app-bg); --bg-2:#17161d; --bg-3:#201e28; --bg-elev:#241f2e;
    --line:color-mix(in srgb, var(--app-fg) 5.5%, transparent); --line-strong:color-mix(in srgb, var(--app-fg) 10%, transparent);
    --ink:#F1EFEA; --ink-2:#C5C0B6; --ink-3:#8C857A; --ink-4:#5C5648;
    /* Accent is Kaiveron gold (var name kept as --indigo to avoid a sweeping rename). */
    --indigo:oklch(0.82 0.15 79); --indigo-soft:oklch(0.82 0.15 79/0.14); --indigo-ring:oklch(0.82 0.15 79/0.40);
    --gold-1:#fbbf24; --gold-2:#f59e0b;
    --mint:oklch(0.80 0.14 162); --amber:oklch(0.80 0.14 75); --rose:oklch(0.72 0.17 18);
    --r-sm:8px; --r-md:12px; --r-lg:16px; --r-xl:22px;
  }
  *{box-sizing:border-box}
  button,input,textarea{font-family:inherit;color:inherit}
  .mono{font-family:'JetBrains Mono',ui-monospace,monospace}
  ::-webkit-scrollbar{width:5px;height:5px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:color-mix(in srgb, var(--app-fg) 6%, transparent);border-radius:99px}
  ::-webkit-scrollbar-thumb:hover{background:color-mix(in srgb, var(--app-fg) 12%, transparent)}
  @keyframes msg-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.8)}}
  @keyframes typing-bounce{0%,60%,100%{transform:translateY(0);opacity:.5}30%{transform:translateY(-3px);opacity:1}}
  @keyframes spin{to{transform:rotate(360deg)}}
  /* Mobile chat = full-screen single pane. The dashboard bottom tab bar is fixed
     and ~4rem tall + safe-area; reserve that space so the composer never hides
     behind it, and use dvh so the iOS URL bar doesn't clip the input. */
  .kv-chat-shell{height:100vh;height:100dvh}
  @media (max-width:767px){
    .kv-chat-shell{height:calc(100vh - 4rem - env(safe-area-inset-bottom));height:calc(100dvh - 4rem - env(safe-area-inset-bottom))}
  }
  /* Momentum scroll on iOS for every chat scroll region. */
  .kv-momentum{-webkit-overflow-scrolling:touch}
  /* Keyboard-shortcut hints under the composer are desktop-only — hide on phones
     to declutter and give the composer more breathing room. */
  @media (max-width:767px){ .composer-hint{display:none !important} }
  /* Tighter horizontal gutters for message rows on phones so bubbles get more
     width (desktop keeps the roomy 24px gutter + 52px avatar column). */
  @media (max-width:767px){
    .kv-msgrow{padding-left:12px !important;padding-right:12px !important;grid-template-columns:40px minmax(0,1fr) !important}
    .kv-msggutter{padding-left:12px !important;padding-right:12px !important;grid-template-columns:40px minmax(0,1fr) !important}
  }
`

/* ─── Avatar ────────────────────────────────────────────────────────────────── */
export function Avatar({ name, src, hue=282, size=28, showStatus=false, online=true, ring=false }:{
  name:string; src?:string|null; hue?:number; size?:number; showStatus?:boolean; online?:boolean; ring?:boolean
}) {
  const initials = name.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase()
  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      {src
        ? <Image src={src} alt={name} width={size} height={size} style={{ width:size, height:size, borderRadius:"50%", objectFit:"cover", boxShadow:ring?`0 0 0 2px var(--bg-1), 0 0 0 3px var(--indigo)`:undefined }} />
        : <div style={{ width:size, height:size, borderRadius:"50%", background:`linear-gradient(135deg,oklch(0.72 0.16 ${hue}),oklch(0.55 0.18 ${hue+30}))`, display:"grid", placeItems:"center", color:"color-mix(in srgb, var(--app-fg) 95%, transparent)", fontWeight:600, fontSize:size*0.38, letterSpacing:"-0.02em", boxShadow:ring?`0 0 0 2px var(--bg-1), 0 0 0 3px var(--indigo)`:"inset 0 1px 0 color-mix(in srgb, var(--app-fg) 16%, transparent)" }}>{initials}</div>
      }
      {showStatus && <div style={{ position:"absolute", right:-1, bottom:-1, width:Math.max(8,size*0.32), height:Math.max(8,size*0.32), background:online?"oklch(0.78 0.16 145)":"var(--bg-3)", border:"2px solid var(--bg-1)", borderRadius:"50%" }}/>}
    </div>
  )
}

/* ─── New DM modal ──────────────────────────────────────────────────────────── */
function NewDMModal({ onClose }: { onClose:()=>void }) {
  const [q,setQ]=useState(""); const [res,setRes]=useState<User[]>([]); const [busy,setBusy]=useState(false)
  const router=useRouter(); const ref=useRef<HTMLInputElement>(null)
  useEffect(()=>{ ref.current?.focus() },[])
  useEffect(()=>{
    if (!q.trim()) { setRes([]); return }
    const t=setTimeout(async()=>{ setBusy(true); try{ setRes(((await ep.search(q,"users")).data as User[]).slice(0,8)) } catch{setRes([])} finally{setBusy(false)} },260)
    return ()=>clearTimeout(t)
  },[q])
  async function open(id:string) { try{ const {conversation}=await ep.startConversation(id); router.push(`/chat/${conversation.id}`); onClose() } catch{} }
  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(4px)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }} onClick={onClose}>
      <motion.div initial={{scale:0.94,y:12}} animate={{scale:1,y:0}} exit={{scale:0.94,y:12}} onClick={e=>e.stopPropagation()}
        style={{ width:"100%", maxWidth:420, background:"var(--bg-1)", border:"1px solid var(--line-strong)", borderRadius:"var(--r-xl)", overflow:"hidden", boxShadow:"0 32px 80px rgba(0,0,0,0.8)" }}>
        <div style={{ padding:"14px 16px", borderBottom:"1px solid var(--line)", display:"flex", alignItems:"center", gap:10 }}>
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth={2} strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
          <input ref={ref} value={q} onChange={e=>setQ(e.target.value)} placeholder="Find someone to message…" className="text-base sm:text-[13.5px]" style={{ flex:1, background:"transparent", border:"none", color:"var(--ink)", outline:"none" }}/>
          {busy && <div style={{ width:14, height:14, border:"2px solid var(--indigo)", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.6s linear infinite" }}/>}
          <button onClick={onClose} style={{ background:"none", border:"none", color:"var(--ink-4)", cursor:"pointer", fontSize:16, lineHeight:1, padding:2 }}>✕</button>
        </div>
        <div style={{ maxHeight:280, overflowY:"auto" }}>
          {!q.trim() && <p style={{ textAlign:"center", color:"var(--ink-4)", fontSize:12, padding:"28px 16px" }}>Search for a Shinobi to message</p>}
          {q.trim()&&!busy&&!res.length&&<p style={{ textAlign:"center", color:"var(--ink-4)", fontSize:12, padding:"20px" }}>No results</p>}
          {res.map(u=>(
            <div key={u.id} onClick={()=>open(u.id)} className="active:scale-[0.98]" style={{ display:"flex", alignItems:"center", gap:12, minHeight:44, padding:"10px 16px", cursor:"pointer", transition:"background 100ms,transform 120ms" }} onMouseEnter={e=>(e.currentTarget.style.background="color-mix(in srgb, var(--app-fg) 4%, transparent)")} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
              <Avatar name={u.displayName} src={u.avatarUrl} size={36} showStatus/>
              <div><div style={{ fontSize:13.5, fontWeight:600, color:"var(--ink)" }}>{u.displayName}</div><div style={{ fontSize:11, color:"var(--ink-3)", marginTop:1 }}>@{u.username}</div></div>
            </div>
          ))}
        </div>
        <div style={{ padding:"10px 16px", borderTop:"1px solid var(--line)", display:"flex", alignItems:"center", gap:5 }}>
          <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="var(--mint)" strokeWidth={2.4} strokeLinecap="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
          <span style={{ fontSize:11, color:"var(--ink-4)" }}>{isE2EAvailable ? "End-to-end encrypted · ECDH P-256" : "Private · encrypted in transit"}</span>
        </div>
      </motion.div>
    </motion.div>
  )
}

function convTime(iso:string) {
  const d=new Date(iso)
  if(isToday(d)) return format(d,"HH:mm")
  if(isYesterday(d)) return "Yesterday"
  return format(d,"MMM d")
}

/* Sidebar preview for the last message. Plain-marker messages (the normal
   case while E2E sending is off) are base64 plaintext — show the real text.
   True E2E ciphertext stays a generic label. */
function lastMessagePreview(msg: { ciphertext: string; iv: string } | null): string {
  if (!msg) return "Encrypted message"
  if (msg.iv !== "PLAIN_NO_E2E") return "Encrypted message"
  let text: string
  try { text = decodeURIComponent(escape(atob(msg.ciphertext))) } catch { return "Encrypted message" }
  // Collapse attachment markers into compact labels
  text = text
    .replace(/^📷 \[Image: [^\]]*\]$/gm, "📷 Photo")
    .replace(/^📎 \[File: [^\]]*\]$/gm, "📎 File")
    .replace(/\s+/g, " ")
    .trim()
  return text || "Encrypted message"
}

/* ─── Quick "Create Community" modal ───────────────────────────────────────── */
function NewCommunityModal({ onClose, onCreated }: { onClose:()=>void; onCreated:(slug:string)=>void }) {
  const { push } = useToast()
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const createMut = useCreateClub()
  const ref = useRef<HTMLInputElement>(null)
  useEffect(()=>{ ref.current?.focus() },[])

  // Derive a URL-safe slug from the name as the user types
  const slug = name.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 40)

  const canSubmit = name.trim().length >= 3 && slug.length >= 3 && !createMut.isPending

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    try {
      const { club } = await createMut.mutateAsync({
        name: name.trim(),
        slug,
        description: description.trim() || undefined,
      })
      push(`Community "${club.name}" created`, "success")
      onCreated(club.slug)
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not create community"
      push(msg, "error")
    }
  }

  return (
    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(4px)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
      onClick={onClose}
    >
      <motion.form initial={{scale:0.94,y:12}} animate={{scale:1,y:0}} exit={{scale:0.94,y:12}}
        onClick={e=>e.stopPropagation()} onSubmit={submit}
        style={{ width:"100%", maxWidth:460, background:"var(--bg-1)", border:"1px solid var(--line-strong)", borderRadius:"var(--r-xl)", overflow:"hidden", boxShadow:"0 32px 80px rgba(0,0,0,0.8)" }}
      >
        <div style={{ padding:"16px 20px", borderBottom:"1px solid var(--line)", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:14, fontWeight:700, color:"var(--ink)" }}>Create a community</div>
            <div style={{ fontSize:11.5, color:"var(--ink-4)", marginTop:2 }}>Start a public club anyone can join.</div>
          </div>
          <button type="button" onClick={onClose} style={{ background:"none", border:"none", color:"var(--ink-4)", cursor:"pointer", fontSize:18, lineHeight:1, padding:2 }}>✕</button>
        </div>

        <div style={{ padding:"18px 20px", display:"flex", flexDirection:"column", gap:14 }}>
          <label style={{ display:"flex", flexDirection:"column", gap:6 }}>
            <span style={{ fontSize:11, fontWeight:600, color:"var(--ink-3)", textTransform:"uppercase", letterSpacing:"0.08em" }}>Name</span>
            <input ref={ref} value={name} onChange={e=>setName(e.target.value)} maxLength={50}
              placeholder="Demon Slayer Fans" autoComplete="off"
              style={{ background:"var(--bg-2)", border:"1px solid var(--line-strong)", borderRadius:8, padding:"10px 12px", fontSize:13.5, color:"var(--ink)", outline:"none" }}
              onFocus={e=>(e.currentTarget.style.borderColor="var(--indigo)")}
              onBlur={e=>(e.currentTarget.style.borderColor="var(--line-strong)")}
            />
          </label>

          {slug.length >= 1 && (
            <div style={{ fontSize:11, color:"var(--ink-4)" }}>
              URL: <span style={{ color:"var(--ink-3)", fontFamily:"monospace" }}>/clubs/{slug}</span>
            </div>
          )}

          <label style={{ display:"flex", flexDirection:"column", gap:6 }}>
            <span style={{ fontSize:11, fontWeight:600, color:"var(--ink-3)", textTransform:"uppercase", letterSpacing:"0.08em" }}>Description <span style={{ opacity:0.5, textTransform:"none", letterSpacing:0 }}>· optional</span></span>
            <textarea value={description} onChange={e=>setDescription(e.target.value)} maxLength={280} rows={3}
              placeholder="What's this community about?"
              style={{ background:"var(--bg-2)", border:"1px solid var(--line-strong)", borderRadius:8, padding:"10px 12px", fontSize:13.5, color:"var(--ink)", outline:"none", resize:"vertical", fontFamily:"inherit" }}
              onFocus={e=>(e.currentTarget.style.borderColor="var(--indigo)")}
              onBlur={e=>(e.currentTarget.style.borderColor="var(--line-strong)")}
            />
          </label>
        </div>

        <div style={{ padding:"14px 20px", borderTop:"1px solid var(--line)", display:"flex", justifyContent:"flex-end", gap:8, background:"var(--bg-0)" }}>
          <button type="button" onClick={onClose}
            style={{ background:"none", border:"1px solid var(--line-strong)", color:"var(--ink-3)", padding:"8px 14px", borderRadius:8, fontSize:12.5, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}
          >Cancel</button>
          <button type="submit" disabled={!canSubmit}
            style={{ background:canSubmit?"linear-gradient(135deg,var(--gold-1),var(--gold-2))":"var(--bg-3)", color:canSubmit?"#1a1405":"var(--ink-4)", border:"none", padding:"8px 16px", borderRadius:8, fontSize:12.5, fontWeight:700, cursor:canSubmit?"pointer":"not-allowed", fontFamily:"inherit", boxShadow:canSubmit?"0 4px 14px oklch(0.72 0.16 79/0.35)":"none", transition:"all 150ms" }}
          >{createMut.isPending ? "Creating…" : "Create"}</button>
        </div>
      </motion.form>
    </motion.div>
  )
}

/* ─── Community Rail (far-left icon strip) ─────────────────────────────────── */
function CommunityRail({ activeCommunity, onSelect }: { activeCommunity:string|null; onSelect:(id:string|null)=>void }) {
  const router = useRouter()
  const [showNewCommunity, setShowNewCommunity] = useState(false)
  const { data: clubData } = useClubs()
  const { data: notifData } = useNotificationsQuery()
  const unreadCount = notifData?.data?.filter(n=>!n.read).length ?? 0
  const clubs = (clubData?.data ?? []).slice(0, 6)

  return (
    <div style={{ width:54, flexShrink:0, background:"var(--bg-0)", borderRight:"1px solid var(--line)", display:"flex", flexDirection:"column", alignItems:"center", padding:"12px 0", gap:6, overflowY:"auto" }}>
      {/* Back to Kaiveron feed — exits the chat surface entirely (Discord-style home). */}
      <Link href="/community" title="Back to Kaiveron feed"
        style={{ width:40, height:40, borderRadius:13, display:"grid", placeItems:"center", background:"#0a0a0a", border:"1px solid var(--line-strong)", textDecoration:"none", flexShrink:0, transition:"all 180ms", boxShadow:"0 2px 10px rgba(0,0,0,0.3)" }}
        onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderColor="oklch(0.70 0.15 80)";(e.currentTarget as HTMLElement).style.transform="translateY(-1px)"}}
        onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderColor="var(--line-strong)";(e.currentTarget as HTMLElement).style.transform="translateY(0)"}}>
        <svg width={24} height={24} viewBox="0 0 100 100">
          <defs><linearGradient id="railK" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#fbbf24"/><stop offset="100%" stopColor="#f59e0b"/></linearGradient></defs>
          <path d="M 30 28 L 40 28 L 40 46 L 47 46 L 54 28 L 64 28 L 53 50 L 50 50 L 60 72 L 50 72 L 44 60 L 40 60 L 40 72 L 30 72 Z" fill="url(#railK)"/>
        </svg>
      </Link>
      <div style={{ width:28, height:1, background:"var(--line-strong)", margin:"2px 0" }}/>

      {/* Home/Inbox */}
      <div style={{ position:"relative" }}>
        <button onClick={()=>onSelect(null)} style={{ width:38, height:38, borderRadius:activeCommunity===null?14:18, background:activeCommunity===null?"var(--indigo-soft)":"var(--bg-2)", border:`1px solid ${activeCommunity===null?"var(--indigo-ring)":"var(--line)"}`, display:"grid", placeItems:"center", cursor:"pointer", transition:"all 200ms", color:activeCommunity===null?"var(--indigo)":"var(--ink-3)" }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
        </button>
        {unreadCount>0 && <div style={{ position:"absolute", top:-3, right:-3, minWidth:16, height:16, borderRadius:8, background:"oklch(0.72 0.17 18)", color:"var(--app-fg)", fontSize:9.5, fontWeight:700, display:"grid", placeItems:"center", padding:"0 4px", border:"2px solid var(--bg-0)" }}>{unreadCount}</div>}
      </div>

      {/* Divider */}
      <div style={{ width:28, height:1, background:"var(--line-strong)", margin:"2px 0" }}/>

      {/* Community icons (clubs) */}
      {clubs.map((club, i) => {
        const hue = [282,162,30,18,320,145][i%6]
        const letter = club.name[0].toUpperCase()
        const active = activeCommunity === club.slug
        return (
          <div key={club.id} style={{ position:"relative" }}>
            {active && <div style={{ position:"absolute", left:-12, top:"50%", transform:"translateY(-50%)", width:3, height:22, background:"var(--ink)", borderRadius:"0 2px 2px 0" }}/>}
            <button onClick={()=>onSelect(club.slug)} title={club.name}
              style={{ width:38, height:38, borderRadius:active?14:18, background:`linear-gradient(135deg,oklch(0.65 0.18 ${hue}),oklch(0.50 0.20 ${hue+20}))`, border:`2px solid ${active?"transparent":"rgba(0,0,0,0)"}`, display:"grid", placeItems:"center", cursor:"pointer", transition:"all 200ms", color:"color-mix(in srgb, var(--app-fg) 95%, transparent)", fontWeight:700, fontSize:14, boxShadow:"inset 0 1px 0 color-mix(in srgb, var(--app-fg) 18%, transparent)" }}
              onMouseEnter={e=>{if(!active)(e.currentTarget as HTMLElement).style.borderRadius="14px"}}
              onMouseLeave={e=>{if(!active)(e.currentTarget as HTMLElement).style.borderRadius="18px"}}
            >{letter}</button>
          </div>
        )
      })}

      {/* Add community */}
      <button
        onClick={() => setShowNewCommunity(true)}
        title="Create community"
        style={{ width:38, height:38, borderRadius:18, background:"var(--bg-2)", border:"2px dashed var(--line-strong)", display:"grid", placeItems:"center", cursor:"pointer", color:"var(--mint)", transition:"all 200ms" }}
        onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderRadius="14px";(e.currentTarget as HTMLElement).style.background="var(--bg-3)"}}
        onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderRadius="18px";(e.currentTarget as HTMLElement).style.background="var(--bg-2)"}}>
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
      </button>

      {/* Search at bottom */}
      <div style={{ marginTop:"auto" }}>
        <button
          onClick={() => router.push("/clubs")}
          title="Browse all communities"
          style={{ width:38, height:38, borderRadius:18, background:"var(--bg-2)", border:"1px solid var(--line)", display:"grid", placeItems:"center", cursor:"pointer", color:"var(--ink-4)", transition:"all 150ms" }}
        >
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        </button>
      </div>

      <AnimatePresence>
        {showNewCommunity && (
          <NewCommunityModal
            onClose={() => setShowNewCommunity(false)}
            onCreated={(slug) => { onSelect(slug); router.push(`/clubs/${slug}`) }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Channel Item ──────────────────────────────────────────────────────────── */
function ChannelItem({ name, locked=false, badge=0, dot=false, active=false, onClick, kind="text" }:{
  name:string; locked?:boolean; badge?:number; dot?:boolean; active?:boolean; onClick:()=>void; kind?:"text"|"voice"
}) {
  return (
    <div onClick={onClick} style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 9px", borderRadius:"var(--r-sm)", cursor:"pointer", background:active?"color-mix(in srgb, var(--app-fg) 6%, transparent)":"transparent", transition:"background 100ms", color:active?"var(--ink)":"var(--ink-3)", minHeight:28 }}
      onMouseEnter={e=>{ if(!active)(e.currentTarget as HTMLElement).style.background="color-mix(in srgb, var(--app-fg) 3%, transparent)"; (e.currentTarget as HTMLElement).style.color="var(--ink)" }}
      onMouseLeave={e=>{ if(!active)(e.currentTarget as HTMLElement).style.background="transparent"; if(!active)(e.currentTarget as HTMLElement).style.color="var(--ink-3)" }}>
      {kind==="voice"
        ? <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
        : locked
          ? <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--mint)" strokeWidth={1.8} strokeLinecap="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
          : <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round"><path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/></svg>
      }
      <span style={{ flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontSize:13.5 }}>{name}</span>
      {badge>0 && <span style={{ minWidth:18, height:18, borderRadius:9, background:"var(--indigo)", color:"var(--app-fg)", fontSize:10.5, fontWeight:600, display:"grid", placeItems:"center", padding:"0 5px" }}>{badge}</span>}
      {dot && !badge && <div style={{ width:7, height:7, borderRadius:"50%", background:"var(--indigo)", marginLeft:"auto" }}/>}
    </div>
  )
}

/* ─── Voice Participant ─────────────────────────────────────────────────────── */
function VoiceParticipant({ name, avatarUrl, hue }:{ name:string; avatarUrl?:string|null; hue:number }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, padding:"3px 6px 3px 26px", borderRadius:"var(--r-sm)", fontSize:12, color:"var(--ink-2)", transition:"background 100ms" }}
      onMouseEnter={e=>(e.currentTarget.style.background="color-mix(in srgb, var(--app-fg) 3%, transparent)")}
      onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
      <div style={{ position:"relative" }}>
        <Avatar name={name} src={avatarUrl} hue={hue} size={18} showStatus={false}/>
        <div style={{ position:"absolute", inset:-2, border:"1.5px solid oklch(0.70 0.16 145)", borderRadius:"50%", animation:"pulse-dot 1.4s ease-in-out infinite" }}/>
      </div>
      <span style={{ flex:1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{name.split(" ")[0]}</span>
      <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="oklch(0.70 0.16 145)" strokeWidth={2} strokeLinecap="round"><rect x="9" y="3" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg>
    </div>
  )
}

/* ─── Category header ───────────────────────────────────────────────────────── */
function CatHeader({ label, onAdd }:{ label:string; onAdd?:()=>void }) {
  const [open,setOpen]=useState(true)
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6, padding:"14px 6px 6px", fontSize:10.5, fontWeight:600, color:"var(--ink-4)", textTransform:"uppercase", letterSpacing:"0.08em", cursor:"pointer", userSelect:"none" }} onClick={()=>setOpen(o=>!o)}>
      <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" style={{ transition:"transform 160ms", transform:open?"rotate(0)":"rotate(-90deg)" }}><path d="m6 9 6 6 6-6"/></svg>
      <span style={{ flex:1 }}>{label}</span>
      {onAdd && <div onClick={e=>{e.stopPropagation();onAdd()}} style={{ width:18, height:18, display:"grid", placeItems:"center", cursor:"pointer", borderRadius:4, transition:"background 120ms" }} onMouseEnter={e=>(e.currentTarget.style.background="color-mix(in srgb, var(--app-fg) 6%, transparent)")} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}><svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg></div>}
    </div>
  )
}

/* ─── Layout ─────────────────────────────────────────────────────────────────── */
export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const params   = useParams()
  const activeId = params?.id as string|undefined
  const me       = useAuthStore(s=>s.user)
  const [showNew,     setShowNew]     = useState(false)
  const [search,      setSearch]      = useState("")
  const [activeCom,   setActiveCom]   = useState<string|null>(null) // null = Home/DMs

  // Mobile = single pane: show the DM list, or the open conversation, never both.
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    const update = () => setIsMobile(mq.matches)
    update(); mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])
  const showList = !isMobile || !activeId   // on mobile, list only when no chat is open

  const { data: conversations=[], isLoading } = useConversations()
  const { data: clubData } = useClubs()
  const { push } = useToast()
  const channelSoon = () => push("Community channels are coming with the next release", "info")
  const clubs = clubData?.data ?? []
  useChatSocket(activeId ?? null)

  const filtered = conversations.filter(c=>
    c.otherUser.displayName.toLowerCase().includes(search.toLowerCase())||
    c.otherUser.username.toLowerCase().includes(search.toLowerCase())
  )

  // Community search — only fires when the user types something
  const { data: communitySearchData, isFetching: communitySearchLoading } = useSearchClubs(search)
  const communityMatches = (communitySearchData?.data ?? []).slice(0, 6)
  const searchActive = search.trim().length >= 1

  const activeClub = clubs.find(c=>c.slug===activeCom)

  // Simulated voice room data (watch parties)
  const watchParties = [
    { id:"wp1", name:"Frieren Watch Party", participants:[{ name:"Otaku Arch", hue:282 }, { name:"Shadow Watcher", hue:200 }] },
    { id:"wp2", name:"Seasonal Reacts",     participants:[{ name:"Void Seeker", hue:145 }] },
    { id:"wp3", name:"Chill Lounge",        participants:[] },
  ]

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: GLOBAL_CSS }}/>

      <div className="kv-chat-shell" style={{ display:"flex", width:"100%", overflow:"hidden", background:"var(--bg-0)" }}>

        {/* ══ COMMUNITY RAIL (far left, 54px) — hidden on mobile ═══════════ */}
        {!isMobile && <CommunityRail activeCommunity={activeCom} onSelect={setActiveCom}/>}

        {/* ══ SIDEBAR (DM list) — 272px on desktop, full-width on mobile when
              no conversation is open; hidden on mobile while in a chat. ═══════ */}
        {showList && (
        <aside style={{ width: isMobile ? "100%" : 272, flexShrink:0, display:"flex", flexDirection:"column", background:"var(--bg-1)", borderRight: isMobile ? "none" : "1px solid var(--line)" }}>
          {/* Mobile-only: get back to the feed (the rail is hidden on mobile). */}
          {isMobile && (
            <Link href="/community" className="active:scale-95" style={{ display:"flex", alignItems:"center", gap:8, minHeight:44, padding:"12px 16px", borderBottom:"1px solid var(--line)", color:"var(--ink-3)", textDecoration:"none", fontSize:14, fontWeight:600, transition:"transform 120ms" }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              Back to Kaiveron
            </Link>
          )}

          {/* Header */}
          <div style={{ padding:"14px 14px 10px", borderBottom:"1px solid var(--line)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
              {activeCom && activeClub ? (
                <>
                  <div style={{ width:30, height:30, borderRadius:"var(--r-sm)", background:`linear-gradient(135deg,oklch(0.65 0.18 282),oklch(0.50 0.20 302))`, display:"grid", placeItems:"center", color:"color-mix(in srgb, var(--app-fg) 95%, transparent)", fontWeight:700, fontSize:13, flexShrink:0 }}>{activeClub.name[0]}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13.5, fontWeight:600, color:"var(--ink)", display:"flex", alignItems:"center", gap:5 }}>
                      {activeClub.name}
                      <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                    <div style={{ fontSize:10.5, color:"var(--ink-4)", marginTop:1, display:"flex", alignItems:"center", gap:4 }}>
                      <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="var(--mint)" strokeWidth={2.5} strokeLinecap="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
                      Private · {activeClub.reputation ?? "—"} rep
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ width:30, height:30, borderRadius:"var(--r-sm)", background:"linear-gradient(135deg,var(--gold-1),var(--gold-2))", display:"grid", placeItems:"center", boxShadow:"0 2px 9px oklch(0.72 0.16 79/0.38), inset 0 1px 0 rgba(255,255,255,0.3)", flexShrink:0 }}>
                    {/* Kaiveron DM mark — twin speech bubbles (a conversation), not an arrow. */}
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#241803" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 8.5a4.5 4.5 0 0 1-4.5 4.5H8l-3 2.5V8.5A4.5 4.5 0 0 1 9.5 4h2A4.5 4.5 0 0 1 16 8.5Z"/>
                      <path d="M18 10.5a4 4 0 0 1 3 3.9V20l-2.6-2h-2.9a4 4 0 0 1-2.5-.9"/>
                    </svg>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13.5, fontWeight:600, color:"var(--ink)" }}>Direct Messages</div>
                    <div style={{ fontSize:10.5, color:"var(--ink-4)", marginTop:1, display:"flex", alignItems:"center", gap:4 }}>
                      <span style={{ width:6, height:6, borderRadius:"50%", background:"oklch(0.78 0.16 145)", display:"inline-block" }}/>
                      {isE2EAvailable ? "End-to-end encrypted" : "Private messages"}
                    </div>
                  </div>
                </>
              )}
              <button onClick={()=>setShowNew(true)} title="New message" style={{ width:26, height:26, borderRadius:"var(--r-sm)", background:"var(--indigo-soft)", border:"1px solid var(--indigo-ring)", display:"grid", placeItems:"center", cursor:"pointer", flexShrink:0 }}>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="var(--indigo)" strokeWidth={2.5} strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              </button>
            </div>

            {/* Search */}
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 10px", background:"var(--bg-2)", border:"1px solid var(--line)", borderRadius:"var(--r-sm)", cursor:"text", minHeight:40 }}>
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="var(--ink-4)" strokeWidth={2} strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search" className="text-base sm:text-[12.5px]" style={{ flex:1, background:"transparent", border:"none", color:"var(--ink)", outline:"none" }}/>
              <span style={{ fontSize:10, padding:"1px 5px", borderRadius:4, background:"color-mix(in srgb, var(--app-fg) 4%, transparent)", color:"var(--ink-4)", border:"1px solid var(--line)", fontFamily:"monospace" }}>⌘K</span>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="kv-momentum" style={{ flex:1, overflowY:"auto", overscrollBehavior:"contain", padding:"4px 8px 8px" }}>

            {activeCom && activeClub ? (
              /* ─── Community view: channels + voice rooms ─── */
              <>
                <CatHeader label="General"/>
                <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
                  <ChannelItem name="announcements" active={false} onClick={channelSoon} />
                  <ChannelItem name="general"       active={false} onClick={channelSoon} />
                  <ChannelItem name="random"        active={false} onClick={channelSoon} />
                </div>

                <CatHeader label="Community" onAdd={channelSoon}/>
                <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
                  <ChannelItem name={activeClub.name.toLowerCase().replace(/\s/g,"-")} locked dot active onClick={channelSoon}/>
                  <ChannelItem name="discussions" locked badge={3} onClick={channelSoon}/>
                  <ChannelItem name="reviews"     locked onClick={channelSoon}/>
                  <ChannelItem name="spoilers"    locked onClick={channelSoon}/>
                </div>

                <CatHeader label="Watch Parties" onAdd={channelSoon}/>
                <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
                  {watchParties.map(wp=>(
                    <div key={wp.id}>
                      <ChannelItem name={wp.name} kind="voice" active={false} onClick={channelSoon}/>
                      {wp.participants.map(p=>(
                        <VoiceParticipant key={p.name} name={p.name} hue={p.hue}/>
                      ))}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              /* ─── Home view: quick filters + DMs ─── */
              <>
                {/* Quick filters */}
                <div style={{ display:"flex", flexDirection:"column", gap:1, paddingTop:6 }}>
                  {[
                    { icon:<svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>, label:"Inbox" },
                    { icon:<svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, label:"Threads" },
                    { icon:<svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/></svg>, label:"Mentions" },
                    { icon:<svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>, label:"Drafts" },
                  ].map(({icon,label})=>(
                    <div key={label} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 9px", borderRadius:"var(--r-sm)", cursor:"pointer", color:"var(--ink-3)", fontSize:13.5, transition:"background 100ms,color 100ms" }} onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="color-mix(in srgb, var(--app-fg) 3%, transparent)";(e.currentTarget as HTMLElement).style.color="var(--ink)"}} onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="transparent";(e.currentTarget as HTMLElement).style.color="var(--ink-3)"}}>
                      {icon}<span style={{ flex:1 }}>{label}</span>
                    </div>
                  ))}
                </div>

                {/* Community search results — only when user is searching */}
                {searchActive && (
                  <>
                    <CatHeader label="Communities" />
                    <div style={{ display:"flex", flexDirection:"column", gap:1, marginBottom:6 }}>
                      {communitySearchLoading && communityMatches.length === 0 && (
                        <p style={{ textAlign:"center", color:"var(--ink-4)", fontSize:11, padding:"10px 12px" }}>Searching…</p>
                      )}
                      {!communitySearchLoading && communityMatches.length === 0 && (
                        <p style={{ textAlign:"center", color:"var(--ink-4)", fontSize:11, padding:"10px 12px" }}>No communities match &ldquo;{search}&rdquo;.</p>
                      )}
                      {communityMatches.map(club => {
                        const hue = (club.slug.charCodeAt(0) * 13) % 360
                        const letter = club.name[0]?.toUpperCase() ?? "#"
                        return (
                          <Link key={club.id} href={`/clubs/${club.slug}`} style={{ textDecoration:"none" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 9px", borderRadius:"var(--r-md)", cursor:"pointer", transition:"background 100ms" }}
                              onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.background="color-mix(in srgb, var(--app-fg) 3%, transparent)"}}
                              onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.background="transparent"}}>
                              <div style={{ width:32, height:32, borderRadius:10, background:`linear-gradient(135deg,oklch(0.65 0.18 ${hue}),oklch(0.50 0.20 ${hue+30}))`, display:"grid", placeItems:"center", color:"color-mix(in srgb, var(--app-fg) 95%, transparent)", fontWeight:700, fontSize:13, boxShadow:"inset 0 1px 0 color-mix(in srgb, var(--app-fg) 16%, transparent)", flexShrink:0 }}>
                                {letter}
                              </div>
                              <div style={{ flex:1, minWidth:0 }}>
                                <div style={{ fontSize:13, fontWeight:500, color:"var(--ink)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{club.name}</div>
                                <div style={{ fontSize:11.5, color:"var(--ink-4)", marginTop:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                                  {club._count?.members ?? 0} {(club._count?.members ?? 0) === 1 ? "member" : "members"} · /{club.slug}
                                </div>
                              </div>
                            </div>
                          </Link>
                        )
                      })}
                      <Link href={`/clubs?q=${encodeURIComponent(search)}`} style={{ textDecoration:"none" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6, padding:"6px 11px", color:"var(--indigo)", fontSize:11.5, fontWeight:600, cursor:"pointer" }}>
                          Browse all communities →
                        </div>
                      </Link>
                    </div>
                  </>
                )}

                <CatHeader label="Direct messages" onAdd={()=>setShowNew(true)}/>
                <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
                  {isLoading ? [...Array(4)].map((_,i)=>(
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 9px" }}>
                      <div style={{ width:32, height:32, borderRadius:"50%", background:"var(--bg-2)", flexShrink:0 }}/>
                      <div style={{ flex:1, display:"flex", flexDirection:"column", gap:5 }}>
                        <div style={{ width:"55%", height:10, borderRadius:4, background:"var(--bg-2)" }}/>
                        <div style={{ width:"75%", height:8, borderRadius:4, background:"var(--bg-3)" }}/>
                      </div>
                    </div>
                  )) : filtered.length===0
                    ? <p style={{ textAlign:"center", color:"var(--ink-4)", fontSize:11.5, padding:"24px 12px", lineHeight:1.6 }}>{search?"No matches.":"No DMs yet.\nClick + to message someone."}</p>
                    : filtered.map(conv=>{
                        const active=conv.id===activeId
                        // Unread = the OTHER user sent the last message and I haven't
                        // read it. My own unread-by-them messages don't count.
                        const hasUnread=!!conv.lastMessage&&conv.lastMessage.senderId!==me?.id&&!conv.lastMessage.readAt
                        return (
                          <Link key={conv.id} href={`/chat/${conv.id}`} className="active:scale-[0.98]" style={{ textDecoration:"none", display:"block", transition:"transform 120ms" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:10, minHeight:44, padding:"8px 9px", borderRadius:"var(--r-md)", cursor:"pointer", background:active?"var(--bg-2)":"transparent", boxShadow:active?"inset 0 0 0 1px var(--line-strong)":"none", position:"relative", transition:"background 100ms", marginBottom:1 }}
                              onMouseEnter={e=>{if(!active)(e.currentTarget as HTMLDivElement).style.background="color-mix(in srgb, var(--app-fg) 3%, transparent)"}}
                              onMouseLeave={e=>{if(!active)(e.currentTarget as HTMLDivElement).style.background="transparent"}}>
                              {active&&<div style={{ position:"absolute", left:0, top:"50%", transform:"translateY(-50%)", width:3, height:18, background:"var(--indigo)", borderRadius:"0 2px 2px 0" }}/>}
                              <Avatar name={conv.otherUser.displayName} src={conv.otherUser.avatarUrl} size={32} showStatus online/>
                              <div style={{ flex:1, minWidth:0 }}>
                                <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", gap:6 }}>
                                  <span style={{ fontSize:13, fontWeight:hasUnread?600:500, color:"var(--ink)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{conv.otherUser.displayName}</span>
                                  {conv.updatedAt&&<span style={{ fontSize:10.5, color:"var(--ink-4)", flexShrink:0 }}>{convTime(conv.updatedAt)}</span>}
                                </div>
                                <div style={{ fontSize:11.5, color:hasUnread?"var(--ink-2)":"var(--ink-4)", marginTop:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:4 }}>
                                  <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="var(--mint)" strokeWidth={2.4} strokeLinecap="round" style={{ flexShrink:0, opacity:.7 }}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
                                  {hasUnread
                                    ? <strong style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{lastMessagePreview(conv.lastMessage)}</strong>
                                    : <span style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{lastMessagePreview(conv.lastMessage)}</span>}
                                </div>
                              </div>
                              {hasUnread&&<div style={{ width:7, height:7, borderRadius:"50%", background:"var(--indigo)", flexShrink:0 }}/>}
                            </div>
                          </Link>
                        )
                      })
                  }
                </div>
              </>
            )}
          </div>

          {/* Me bar */}
          {me && (
            <div style={{ padding:"10px 12px", borderTop:"1px solid var(--line)", display:"flex", alignItems:"center", gap:10 }}>
              <Avatar name={me.displayName} src={me.avatarUrl} size={28} showStatus online/>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12.5, fontWeight:600, color:"var(--ink)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{me.displayName}</div>
                <div style={{ fontSize:10.5, color:"var(--ink-4)", display:"flex", alignItems:"center", gap:4, marginTop:1 }}>
                  <svg width={8} height={8} viewBox="0 0 24 24" fill="none" stroke="var(--mint)" strokeWidth={2.4} strokeLinecap="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
                  Available · keys verified
                </div>
              </div>
              <Link href="/me/settings/account" style={{ background:"transparent", border:"none", color:"var(--ink-4)", cursor:"pointer", padding:4, display:"grid", placeItems:"center", borderRadius:6, textDecoration:"none" }}>
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>
              </Link>
            </div>
          )}
        </aside>
        )}

        {/* ══ MAIN (conversation) — hidden on mobile until a chat is opened ════ */}
        {(!isMobile || activeId) && (
          <main style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>{children}</main>
        )}
      </div>

      <AnimatePresence>{showNew&&<NewDMModal onClose={()=>setShowNew(false)}/>}</AnimatePresence>
    </>
  )
}
