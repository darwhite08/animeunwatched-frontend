import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useAuthStore } from "@/stores/auth.store"
import * as ep from "@/lib/api/endpoints"

export function useMe() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  return useQuery({
    queryKey: ["auth/me"],
    queryFn:  async () => {
      const res = await ep.me()
      useAuthStore.getState().setUser(res.user)
      return res
    },
    enabled:  isAuthenticated,
    staleTime: 5 * 60_000,
  })
}

export function useLogin() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ep.login,
    onSuccess: (data) => {
      useAuthStore.getState().setAccess(data.accessToken)
      useAuthStore.getState().setUser(data.user)
      qc.invalidateQueries({ queryKey: ["auth/me"] })
    },
  })
}

export function useRegister() {
  return useMutation({
    mutationFn: ep.register,
    onSuccess: (data) => {
      useAuthStore.getState().setAccess(data.accessToken)
      useAuthStore.getState().setUser(data.user)
    },
  })
}

export function useLogout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ep.logout,
    onSuccess: () => {
      useAuthStore.getState().clear()
      qc.clear()
    },
  })
}
