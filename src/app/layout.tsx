import "./globals.css"
import ToastContainer from "@/components/layout/ToastContainer"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        {children}
        <ToastContainer />
      </body>
    </html>
  )
}
