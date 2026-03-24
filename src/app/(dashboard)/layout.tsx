import Sidebar from "@/components/dashboard/Sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />
      <main className="flex-1 ml-72 min-h-screen relative">
        {/* Adds a background ambient glow for the whole dashboard */}
        <div className="fixed inset-0 bg-noise pointer-events-none" />
        {children}
      </main>
    </div>
  )
}