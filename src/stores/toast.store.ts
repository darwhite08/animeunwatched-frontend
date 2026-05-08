import { create } from "zustand"

type Toast = {
  id: string
  message: string
  type: "success" | "error" | "info"
}

type ToastStore = {
  toasts: Toast[]
  push: (message: string, type?: Toast["type"]) => void
  dismiss: (id: string) => void
}

export const useToast = create<ToastStore>((set) => ({
  toasts: [],
  push: (message, type = "info") => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 3000)
  },
  dismiss: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
  },
}))
