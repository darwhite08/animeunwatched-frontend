"use client"

import Link from "next/link"
import { X } from "lucide-react"
import { useAuthStore } from "@/stores/auth.store"
import { NAV_ITEMS, ANIME_FLYOUT, LIBRARY_FLYOUT, PROFILE_FLYOUT, resolvePath, type FlyoutLink } from "../sidebarConfig"
import { SidebarItem } from "../Sidebar/SidebarItem"
import { SidebarGamification } from "../Sidebar/SidebarGamification"
import { useSidebarStore } from "../useSidebarStore"
import KaiveronLogo from "@/components/ui/KaiveronLogo"

/** Full-nav slide-in drawer for <md (overflow + all items). */
export function MobileDrawer() {
  const open = useSidebarStore((s) => s.mobileDrawerOpen)
  const close = () => useSidebarStore.getState().setMobileDrawer(false)
  const user = useAuthStore((s) => s.user)
  const slug = user?.slug

  if (!open) return null

  const Section = ({ title, links }: { title: string; links: FlyoutLink[] }) => (
    <>
      <p className="px-3 pb-1 pt-4 text-[10px] font-black uppercase tracking-widest text-subtle">{title}</p>
      {links.map((l) => {
        const LIcon = l.icon
        return (
          <Link key={l.label} href={resolvePath(l, slug)} onClick={close} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-muted hover:bg-white/5 hover:text-foreground">
            <LIcon size={18} className="shrink-0 text-accent-bright" />
            {l.label}
          </Link>
        )
      })}
    </>
  )

  return (
    <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-label="Navigation menu">
      <div className="absolute inset-0 bg-black/60" onClick={close} />
      <nav aria-label="Primary" className="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-border bg-background px-3 py-4">
        <div className="mb-6 flex items-center justify-between px-1">
          <Link href={slug ? `/user/${slug}/feed` : "/"} onClick={close}><KaiveronLogo size={30} /></Link>
          <button onClick={close} aria-label="Close menu" className="rounded-lg p-1.5 text-muted hover:text-foreground"><X size={18} /></button>
        </div>
        <div className="flex flex-1 flex-col gap-1 overflow-y-auto" onClick={close}>
          {NAV_ITEMS.map((item) => <SidebarItem key={item.key} item={item} slug={slug} collapsed={false} />)}
          <Section title="Explore Anime" links={ANIME_FLYOUT} />
          <Section title="My Space" links={LIBRARY_FLYOUT} />
          <Section title="Account" links={PROFILE_FLYOUT} />
        </div>
        <div className="mt-3"><SidebarGamification slug={slug} collapsed={false} /></div>
      </nav>
    </div>
  )
}
