import "./globals.css"
import ToastContainer from "@/components/layout/ToastContainer"
import { QueryProvider } from "@/providers/QueryProvider"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        <QueryProvider>
          {children}
          <ToastContainer />
        </QueryProvider>
      </body>
    </html>
  )
}
