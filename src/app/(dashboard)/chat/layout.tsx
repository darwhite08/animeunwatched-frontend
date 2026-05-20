"use client"

import { useState, useRef, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { useConversations, useStartConversation, useChatSocket } from "@/hooks/useChat"
import { useAuthStore } from "@/stores/auth.store"
import { useClubs } from "@/hooks/useClubs"
import { useNotificationsQuery } from "@/hooks/useNotificationsQuery"
import * as ep from "@/lib/api/endpoints"
import type { User } from "@/lib/api/types"
import { format, isToday, isYesterday } from "date-fns"

/* ─── CSS variables ────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&display=swap');
  :root {
    --bg-0:#0a0c12; --bg-1:#0f121b; --bg-2:#151926; --bg-3:#1c2132; --bg-elev:#1f2438;
    --line:rgba(255,255,255,0.055); --line-strong:rgba(255,255,255,0.10);
    --ink:#ECEEF5; --ink-2:#B8BDD0; --ink-3:#8088A0; --ink-4:#545B73;
    --indigo:oklch(0.66 0.18 282); --indigo-soft:oklch(0.66 0.18 282/0.16); --indigo-ring:oklch(0.66 0.18 282/0.35);
    --mint:oklch(0.80 0.14 162); --amber:oklch(0.80 0.14 75); --rose:oklch(0.72 0.17 18);
    --r-sm:8px; --r-md:12px; --r-lg:16px; --r-xl:22px;
  }
  *{box-sizing:border-box}
  button,input,textarea{font-family:inherit;color:inherit}
  .mono{font-family:'JetBrains Mono',ui-monospace,monospace}
  ::-webkit-scrollbar{width:5px;height:5px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.06);border-radius:99px}
  ::-webkit-scrollbar-thumb:hover{background:rgba(255,255,255,0.12)}
  @keyframes msg-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  @keyframes pulse-dot{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.8)}}
  @keyframes typing-bounce{0%,60%,100%{transform:translateY(0);opacity:.5}30%{transform:translateY(-3px);opacity:1}}
  @keyframes spin{to{transform:rotate(360deg)}}
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
        : <div style={{ width:size, height:size, borderRadius:"50%", background:`linear-gradient(135deg,oklch(0.72 0.16 ${hue}),oklch(0.55 0.18 ${hue+30}))`, display:"grid", placeItems:"center", color:"rgba(255,255,255,0.95)", fontWeight:600, fontSize:size*0.38, letterSpacing:"-0.02em", boxShadow:ring?`0 0 0 2px var(--bg-1), 0 0 0 3px var(--indigo)`:"inset 0 1px 0 rgba(255,255,255,0.16)" }}>{initials}</div>
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
          <input ref={ref} value={q} onChange={e=>setQ(e.target.value)} placeholder="Find someone to message…" style={{ flex:1, background:"transparent", border:"none", color:"var(--ink)", fontSize:13.5, outline:"none" }}/>
          {busy && <div style={{ width:14, height:14, border:"2px solid var(--indigo)", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.6s linear infinite" }}/>}
          <button onClick={onClose} style={{ background:"none", border:"none", color:"var(--ink-4)", cursor:"pointer", fontSize:16, lineHeight:1, padding:2 }}>✕</button>
        </div>
        <div style={{ maxHeight:280, overflowY:"auto" }}>
          {!q.trim() && <p style={{ textAlign:"center", color:"var(--ink-4)", fontSize:12, padding:"28px 16px" }}>Search for a Shinobi to message</p>}
          {q.trim()&&!busy&&!res.length&&<p style={{ textAlign:"center", color:"var(--ink-4)", fontSize:12, padding:"20px" }}>No results</p>}
          {res.map(u=>(
            <div key={u.id} onClick={()=>open(u.id)} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 16px", cursor:"pointer", transition:"background 100ms" }} onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.04)")} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}>
              <Avatar name={u.displayName} src={u.avatarUrl} size={36} showStatus/>
              <div><div style={{ fontSize:13.5, fontWeight:600, color:"var(--ink)" }}>{u.displayName}</div><div style={{ fontSize:11, color:"var(--ink-3)", marginTop:1 }}>@{u.username}</div></div>
            </div>
          ))}
        </div>
        <div style={{ padding:"10px 16px", borderTop:"1px solid var(--line)", display:"flex", alignItems:"center", gap:5 }}>
          <svg width={9} height={9} viewBox="0 0 24 24" fill="none" stroke="var(--mint)" strokeWidth={2.4} strokeLinecap="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
          <span style={{ fontSize:11, color:"var(--ink-4)" }}>End-to-end encrypted · ECDH P-256</span>
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

/* ─── Community Rail (far-left icon strip) ─────────────────────────────────── */
function CommunityRail({ activeCommunity, onSelect }: { activeCommunity:string|null; onSelect:(id:string|null)=>void }) {
  const { data: clubData } = useClubs()
  const { data: notifData } = useNotificationsQuery()
  const unreadCount = notifData?.data?.filter(n=>!n.read).length ?? 0
  const clubs = (clubData?.data ?? []).slice(0, 6)

  return (
    <div style={{ width:54, flexShrink:0, background:"var(--bg-0)", borderRight:"1px solid var(--line)", display:"flex", flexDirection:"column", alignItems:"center", padding:"12px 0", gap:6, overflowY:"auto" }}>
      {/* Home/Inbox */}
      <div style={{ position:"relative" }}>
        <button onClick={()=>onSelect(null)} style={{ width:38, height:38, borderRadius:activeCommunity===null?14:18, background:activeCommunity===null?"var(--indigo-soft)":"var(--bg-2)", border:`1px solid ${activeCommunity===null?"var(--indigo-ring)":"var(--line)"}`, display:"grid", placeItems:"center", cursor:"pointer", transition:"all 200ms", color:activeCommunity===null?"var(--indigo)":"var(--ink-3)" }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>
        </button>
        {unreadCount>0 && <div style={{ position:"absolute", top:-3, right:-3, minWidth:16, height:16, borderRadius:8, background:"oklch(0.72 0.17 18)", color:"#fff", fontSize:9.5, fontWeight:700, display:"grid", placeItems:"center", padding:"0 4px", border:"2px solid var(--bg-0)" }}>{unreadCount}</div>}
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
              style={{ width:38, height:38, borderRadius:active?14:18, background:`linear-gradient(135deg,oklch(0.65 0.18 ${hue}),oklch(0.50 0.20 ${hue+20}))`, border:`2px solid ${active?"transparent":"rgba(0,0,0,0)"}`, display:"grid", placeItems:"center", cursor:"pointer", transition:"all 200ms", color:"rgba(255,255,255,0.95)", fontWeight:700, fontSize:14, boxShadow:"inset 0 1px 0 rgba(255,255,255,0.18)" }}
              onMouseEnter={e=>{if(!active)(e.currentTarget as HTMLElement).style.borderRadius="14px"}}
              onMouseLeave={e=>{if(!active)(e.currentTarget as HTMLElement).style.borderRadius="18px"}}
            >{letter}</button>
          </div>
        )
      })}

      {/* Add community */}
      <button style={{ width:38, height:38, borderRadius:18, background:"var(--bg-2)", border:"2px dashed var(--line-strong)", display:"grid", placeItems:"center", cursor:"pointer", color:"var(--mint)", transition:"all 200ms" }}
        onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.borderRadius="14px";(e.currentTarget as HTMLElement).style.background="var(--bg-3)"}}
        onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.borderRadius="18px";(e.currentTarget as HTMLElement).style.background="var(--bg-2)"}}>
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
      </button>

      {/* Search at bottom */}
      <div style={{ marginTop:"auto" }}>
        <button style={{ width:38, height:38, borderRadius:18, background:"var(--bg-2)", border:"1px solid var(--line)", display:"grid", placeItems:"center", cursor:"pointer", color:"var(--ink-4)", transition:"all 150ms" }}>
          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        </button>
      </div>
    </div>
  )
}

/* ─── Channel Item ──────────────────────────────────────────────────────────── */
function ChannelItem({ name, locked=false, badge=0, dot=false, active=false, onClick, kind="text" }:{
  name:string; locked?:boolean; badge?:number; dot?:boolean; active?:boolean; onClick:()=>void; kind?:"text"|"voice"
}) {
  return (
    <div onClick={onClick} style={{ display:"flex", alignItems:"center", gap:8, padding:"5px 9px", borderRadius:"var(--r-sm)", cursor:"pointer", background:active?"rgba(255,255,255,0.06)":"transparent", transition:"background 100ms", color:active?"var(--ink)":"var(--ink-3)", minHeight:28 }}
      onMouseEnter={e=>{ if(!active)(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.03)"; (e.currentTarget as HTMLElement).style.color="var(--ink)" }}
      onMouseLeave={e=>{ if(!active)(e.currentTarget as HTMLElement).style.background="transparent"; if(!active)(e.currentTarget as HTMLElement).style.color="var(--ink-3)" }}>
      {kind==="voice"
        ? <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>
        : locked
          ? <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--mint)" strokeWidth={1.8} strokeLinecap="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>
          : <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round"><path d="M4 9h16M4 15h16M10 3 8 21M16 3l-2 18"/></svg>
      }
      <span style={{ flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", fontSize:13.5 }}>{name}</span>
      {badge>0 && <span style={{ minWidth:18, height:18, borderRadius:9, background:"var(--indigo)", color:"#fff", fontSize:10.5, fontWeight:600, display:"grid", placeItems:"center", padding:"0 5px" }}>{badge}</span>}
      {dot && !badge && <div style={{ width:7, height:7, borderRadius:"50%", background:"var(--indigo)", marginLeft:"auto" }}/>}
    </div>
  )
}

/* ─── Voice Participant ─────────────────────────────────────────────────────── */
function VoiceParticipant({ name, avatarUrl, hue }:{ name:string; avatarUrl?:string|null; hue:number }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, padding:"3px 6px 3px 26px", borderRadius:"var(--r-sm)", fontSize:12, color:"var(--ink-2)", transition:"background 100ms" }}
      onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.03)")}
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
      {onAdd && <div onClick={e=>{e.stopPropagation();onAdd()}} style={{ width:18, height:18, display:"grid", placeItems:"center", cursor:"pointer", borderRadius:4, transition:"background 120ms" }} onMouseEnter={e=>(e.currentTarget.style.background="rgba(255,255,255,0.06)")} onMouseLeave={e=>(e.currentTarget.style.background="transparent")}><svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg></div>}
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

  const { data: conversations=[], isLoading } = useConversations()
  const { data: clubData } = useClubs()
  const clubs = clubData?.data ?? []
  useChatSocket(activeId ?? null)

  const filtered = conversations.filter(c=>
    c.otherUser.displayName.toLowerCase().includes(search.toLowerCase())||
    c.otherUser.username.toLowerCase().includes(search.toLowerCase())
  )

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

      <div style={{ display:"flex", height:"100vh", width:"100%", overflow:"hidden", background:"var(--bg-0)" }}>

        {/* ══ COMMUNITY RAIL (far left, 54px) ══════════════════════════════ */}
        <CommunityRail activeCommunity={activeCom} onSelect={setActiveCom}/>

        {/* ══ SIDEBAR (middle, 272px) ═══════════════════════════════════════ */}
        <aside style={{ width:272, flexShrink:0, display:"flex", flexDirection:"column", background:"var(--bg-1)", borderRight:"1px solid var(--line)" }}>

          {/* Header */}
          <div style={{ padding:"14px 14px 10px", borderBottom:"1px solid var(--line)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
              {activeCom && activeClub ? (
                <>
                  <div style={{ width:30, height:30, borderRadius:"var(--r-sm)", background:`linear-gradient(135deg,oklch(0.65 0.18 282),oklch(0.50 0.20 302))`, display:"grid", placeItems:"center", color:"rgba(255,255,255,0.95)", fontWeight:700, fontSize:13, flexShrink:0 }}>{activeClub.name[0]}</div>
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
                  <div style={{ width:30, height:30, borderRadius:"var(--r-sm)", background:"linear-gradient(135deg,oklch(0.40 0.04 280),oklch(0.25 0.03 270))", display:"grid", placeItems:"center", border:"1px solid var(--line-strong)", flexShrink:0 }}>
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth={2} strokeLinecap="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:13.5, fontWeight:600, color:"var(--ink)" }}>Direct Messages</div>
                    <div style={{ fontSize:10.5, color:"var(--ink-4)", marginTop:1, display:"flex", alignItems:"center", gap:4 }}>
                      <span style={{ width:6, height:6, borderRadius:"50%", background:"oklch(0.78 0.16 145)", display:"inline-block" }}/>
                      End-to-end encrypted
                    </div>
                  </div>
                </>
              )}
              <button onClick={()=>setShowNew(true)} title="New message" style={{ width:26, height:26, borderRadius:"var(--r-sm)", background:"var(--indigo-soft)", border:"1px solid var(--indigo-ring)", display:"grid", placeItems:"center", cursor:"pointer", flexShrink:0 }}>
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="var(--indigo)" strokeWidth={2.5} strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
              </button>
            </div>

            {/* Search */}
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 10px", background:"var(--bg-2)", border:"1px solid var(--line)", borderRadius:"var(--r-sm)", cursor:"text" }}>
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="var(--ink-4)" strokeWidth={2} strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search" style={{ flex:1, background:"transparent", border:"none", color:"var(--ink)", fontSize:12.5, outline:"none" }}/>
              <span style={{ fontSize:10, padding:"1px 5px", borderRadius:4, background:"rgba(255,255,255,0.04)", color:"var(--ink-4)", border:"1px solid var(--line)", fontFamily:"monospace" }}>⌘K</span>
            </div>
          </div>

          {/* Scrollable content */}
          <div style={{ flex:1, overflowY:"auto", padding:"4px 8px 8px" }}>

            {activeCom && activeClub ? (
              /* ─── Community view: channels + voice rooms ─── */
              <>
                <CatHeader label="General"/>
                <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
                  <ChannelItem name="announcements" active={false} onClick={()=>{}} />
                  <ChannelItem name="general"       active={false} onClick={()=>{}} />
                  <ChannelItem name="random"        active={false} onClick={()=>{}} />
                </div>

                <CatHeader label="Community" onAdd={()=>{}}/>
                <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
                  <ChannelItem name={activeClub.name.toLowerCase().replace(/\s/g,"-")} locked dot active onClick={()=>{}}/>
                  <ChannelItem name="discussions" locked badge={3} onClick={()=>{}}/>
                  <ChannelItem name="reviews"     locked onClick={()=>{}}/>
                  <ChannelItem name="spoilers"    locked onClick={()=>{}}/>
                </div>

                <CatHeader label="Watch Parties" onAdd={()=>{}}/>
                <div style={{ display:"flex", flexDirection:"column", gap:1 }}>
                  {watchParties.map(wp=>(
                    <div key={wp.id}>
                      <ChannelItem name={wp.name} kind="voice" active={false} onClick={()=>{}}/>
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
                    { icon:<svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><path d="M3 11l19-9-9 19-2-8-8-2z"/></svg>, label:"Inbox" },
                    { icon:<svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>, label:"Threads" },
                    { icon:<svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/></svg>, label:"Mentions" },
                    { icon:<svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>, label:"Drafts" },
                  ].map(({icon,label})=>(
                    <div key={label} style={{ display:"flex", alignItems:"center", gap:8, padding:"6px 9px", borderRadius:"var(--r-sm)", cursor:"pointer", color:"var(--ink-3)", fontSize:13.5, transition:"background 100ms,color 100ms" }} onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.background="rgba(255,255,255,0.03)";(e.currentTarget as HTMLElement).style.color="var(--ink)"}} onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.background="transparent";(e.currentTarget as HTMLElement).style.color="var(--ink-3)"}}>
                      {icon}<span style={{ flex:1 }}>{label}</span>
                    </div>
                  ))}
                </div>

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
                        const hasUnread=!conv.lastMessage?.readAt&&!!conv.lastMessage
                        return (
                          <Link key={conv.id} href={`/chat/${conv.id}`} style={{ textDecoration:"none" }}>
                            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 9px", borderRadius:"var(--r-md)", cursor:"pointer", background:active?"var(--bg-2)":"transparent", boxShadow:active?"inset 0 0 0 1px var(--line-strong)":"none", position:"relative", transition:"background 100ms", marginBottom:1 }}
                              onMouseEnter={e=>{if(!active)(e.currentTarget as HTMLDivElement).style.background="rgba(255,255,255,0.03)"}}
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
                                  {hasUnread?<strong>New message</strong>:"Encrypted message"}
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

        {/* ══ MAIN ════════════════════════════════════════════════════════════ */}
        <main style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>{children}</main>
      </div>

      <AnimatePresence>{showNew&&<NewDMModal onClose={()=>setShowNew(false)}/>}</AnimatePresence>
    </>
  )
}
