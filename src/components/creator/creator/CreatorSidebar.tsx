"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Rss,
  FileText,
  Vote,
  BarChart3,
  Plus,
  ChevronDown,
  Folder,
  Trash2,
  Edit2,
  FolderPlus,
  Sparkles,
  X,
} from "lucide-react"

/* ================= TYPES ================= */

type FolderType = {
  id: string
  name: string
  category: "feed" | "blog" | "polls"
}

/* ================= LEVEL CARD ================= */

function SidebarLevelCard({
  level,
  xp,
  maxXp,
}: {
  level: number
  xp: number
  maxXp: number
}) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const hidden = localStorage.getItem("hideLevelCard")
    if (hidden === "true") setVisible(false)
  }, [])

  const progress = Math.min((xp / maxXp) * 100, 100)

  const handleClose = () => {
    localStorage.setItem("hideLevelCard", "true")
    setVisible(false)
  }
  const router = useRouter()

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.35 }}
          className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40 backdrop-blur-md p-4"
        >
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-white/40 hover:text-white transition"
          >
            <X size={16} />
          </button>

          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-indigo-400" />
              <span className="text-sm font-medium text-white">
                Level {level}
              </span>
            </div>

            <div>
              <div className="flex justify-between text-xs text-white/50 mb-1">
                <span>XP</span>
                <span>
                  {xp}/{maxXp}
                </span>
              </div>

              <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8 }}
                  className="h-full bg-indigo-500 rounded-full"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ================= MAIN SIDEBAR ================= */

export default function CreatorSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const folderFromUrl = searchParams.get("folder")

  const [folders, setFolders] = useState<FolderType[]>([
    { id: "1", name: "Theories", category: "feed" },
    { id: "2", name: "Power Scaling", category: "feed" },
    { id: "3", name: "Reviews", category: "blog" },
    { id: "4", name: "Rankings", category: "blog" },
    { id: "5", name: "Community Votes", category: "polls" },
  ])

  const [expandedFeed, setExpandedFeed] = useState(true)
  const [expandedBlog, setExpandedBlog] = useState(true)
  const [expandedPolls, setExpandedPolls] = useState(true)
  const [creatingCategory, setCreatingCategory] =
    useState<"feed" | "blog" | "polls" | null>(null)
  const [newFolderName, setNewFolderName] = useState("")
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<FolderType | null>(null)

  const isActive = (href: string) => pathname === href

  const handleCreateFolder = () => {
    if (!newFolderName.trim() || !creatingCategory) return
    setFolders(prev => [
      ...prev,
      {
        id: Date.now().toString(),
        name: newFolderName,
        category: creatingCategory,
      },
    ])
    setNewFolderName("")
    setCreatingCategory(null)
  }

  const handleRename = (id: string) => {
    if (!renameValue.trim()) return
    setFolders(prev =>
      prev.map(folder =>
        folder.id === id ? { ...folder, name: renameValue } : folder
      )
    )
    setEditingFolderId(null)
  }

  const confirmDelete = () => {
    if (!deleteTarget) return

    setFolders(prev =>
      prev.filter(folder => folder.id !== deleteTarget.id)
    )

    setDeleteTarget(null)
  }
  const feedFolders = folders.filter(f => f.category === "feed")
  const blogFolders = folders.filter(f => f.category === "blog")
  const pollFolders = folders.filter(f => f.category === "polls")

  return (
    <>
      <aside className="w-80 h-screen sticky top-0 left-0 flex flex-col bg-zinc-900 border-r border-white/10 p-6 overflow-hidden">

        {/* HEADER */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold bg-gradient-to-r from-white to-[#748298] bg-clip-text text-transparent">
            Creator Hub
          </h2>

          <SidebarLevelCard level={20} xp={840} maxXp={1000} />
        </div>

        {/* NAVIGATION */}
        <nav className="space-y-2 mt-6">
          <NavItem href="/creator" label="Overview" icon={LayoutDashboard} active={isActive("/creator")} />
          <NavItem href="/creator/feed" label="Feed Content" icon={Rss} active={isActive("/creator/feed")} />
          <NavItem href="/creator/blog" label="Blog Articles" icon={FileText} active={isActive("/creator/blog")} />
          <NavItem href="/creator/polls" label="Polls" icon={Vote} active={isActive("/creator/polls")} />
          <NavItem href="/creator/analytics" label="Analytics" icon={BarChart3} active={isActive("/creator/analytics")} />
        </nav>

        {/* FOLDERS */}
        <div className="mt-8 flex-1 overflow-y-auto space-y-6 pr-2">
          <div
            onClick={() => router.push("/creators")}
            className={`px-3 py-2 rounded-lg text-sm cursor-pointer
    ${!folderFromUrl
                ? "bg-indigo-600/20 text-white"
                : "text-white/60 hover:bg-white/5"
              }`}
          >
            All Content
          </div>
          <FolderSection
            title="Feed Folders"
            expanded={expandedFeed}
            setExpanded={setExpandedFeed}
            folders={feedFolders}
            activeFolder={folderFromUrl}
            router={router}
            onCreate={() => setCreatingCategory("feed")}
            onEdit={(folder: FolderType) => {
              setEditingFolderId(folder.id)
              setRenameValue(folder.name)
            }}
            onDelete={(folder: FolderType) => setDeleteTarget(folder)}
            editingFolderId={editingFolderId}
            renameValue={renameValue}
            setRenameValue={setRenameValue}
            onRename={handleRename}

          />

          <FolderSection
            title="Blog Folders"
            expanded={expandedBlog}
            setExpanded={setExpandedBlog}
            folders={blogFolders}
            activeFolder={folderFromUrl}
            router={router}
            onCreate={() => setCreatingCategory("blog")}
            onEdit={(folder: FolderType) => {
              setEditingFolderId(folder.id)
              setRenameValue(folder.name)
            }}
            onDelete={(folder: FolderType) => setDeleteTarget(folder)}
            editingFolderId={editingFolderId}
            renameValue={renameValue}
            setRenameValue={setRenameValue}
            onRename={handleRename}
          />
          <FolderSection
            title="Poll Folders"
            expanded={expandedPolls}
            setExpanded={setExpandedPolls}
            folders={pollFolders}
            activeFolder={folderFromUrl}
            router={router}
            onCreate={() => setCreatingCategory("polls")}
            onEdit={(folder: FolderType) => {
              setEditingFolderId(folder.id)
              setRenameValue(folder.name)
            }}
            onDelete={(folder: FolderType) => setDeleteTarget(folder)}
            editingFolderId={editingFolderId}
            renameValue={renameValue}
            setRenameValue={setRenameValue}
            onRename={handleRename}
          />

          {creatingCategory && (
            <div className="bg-black/30 border border-white/10 rounded-xl p-3 space-y-3">
              <p className="text-xs text-white/40">
                New {creatingCategory} folder
              </p>

              <input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                className="w-full bg-zinc-800 rounded-lg px-3 py-2 text-sm outline-none"
              />

              <div className="flex gap-2">
                <button
                  onClick={handleCreateFolder}
                  className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition text-sm"
                >
                  Create
                </button>

                <button
                  onClick={() => setCreatingCategory(null)}
                  className="flex-1 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 transition text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM */}
        <div className="border-t border-white/10 pt-4">
          <Link
            href="/creator/create"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 transition"
          >
            <Plus size={16} />
            Create Content
          </Link>
        </div>
      </aside>

      {deleteTarget && (
        <DeleteModal
          folder={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      )}
    </>
  )
}

/* ================= NAV ITEM ================= */

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string
  label: string
  icon: any
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition
        ${active
          ? "bg-indigo-600/20 border border-indigo-500/40 text-white"
          : "text-white/60 hover:bg-white/5 hover:text-white"
        }`}
    >
      <Icon size={18} />
      <span className="text-sm">{label}</span>
    </Link>
  )
}

/* ================= FOLDER SECTION ================= */

function FolderSection({
  router,
  title,
  expanded,
  setExpanded,
  folders,
  activeFolder,
  onCreate,
  onEdit,
  onDelete,
  editingFolderId,
  renameValue,
  setRenameValue,
  onRename,
}: any) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-xs text-white/50"
        >
          <ChevronDown
            size={14}
            className={`transition ${expanded ? "rotate-0" : "-rotate-90"}`}
          />
          {title}
        </button>

        <FolderPlus
          size={14}
          onClick={onCreate}
          className="cursor-pointer text-white/40 hover:text-white transition"
        />
      </div>

      {expanded && (
        <div className="space-y-1">
          {folders.map((folder: FolderType) => (
            <div
              key={folder.id}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm group cursor-pointer
                ${activeFolder === folder.id
                  ? "bg-indigo-600/20 text-white"
                  : "text-white/60 hover:bg-white/5"
                }`}
            onClick={() =>
  router.push(
    `/creators/${folder.category}?folder=${folder.id}`
  )
}
            >
              <div className="flex items-center gap-2">
                <Folder size={14} />
                {editingFolderId === folder.id ? (
                  <input
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => onRename(folder.id)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && onRename(folder.id)
                    }
                    className="bg-zinc-800 px-2 py-1 text-sm rounded outline-none"
                    autoFocus
                  />
                ) : (
                  folder.name
                )}
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                <Edit2
                  size={14}
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(folder)
                  }}
                />
                <Trash2
                  size={14}
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(folder)
                  }}
                  className="text-red-400"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ================= DELETE MODAL ================= */

function DeleteModal({
  folder,
  onCancel,
  onConfirm,
}: {
  folder: FolderType
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 w-80 space-y-4">
        <h3 className="text-lg font-semibold">Delete Folder</h3>
        <p className="text-sm text-white/60">
          Are you sure you want to delete "{folder.name}"?
        </p>

        <div className="flex gap-2">
          <button
            onClick={onConfirm}
            className="flex-1 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm"
          >
            Delete
          </button>

          <button
            onClick={onCancel}
            className="flex-1 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}