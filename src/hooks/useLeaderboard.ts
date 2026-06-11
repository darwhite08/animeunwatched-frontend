import { useQuery } from "@tanstack/react-query"
import * as ep from "@/lib/api/endpoints"

export function useLeaderboard(limit = 50, period = "all-time") {
  return useQuery({
    queryKey: ["leaderboard", limit, period],
    queryFn: () => ep.getLeaderboard(limit, period),
    staleTime: 2 * 60_000,
  })
}

export function useBoardLeaderboard(board: string, window: string, audience: string, limit = 50) {
  return useQuery({
    queryKey: ["leaderboard-board", board, window, audience, limit],
    queryFn: () => ep.getBoardLeaderboard(board, window, audience, limit),
    staleTime: 60_000,
    placeholderData: prev => prev, // keep the previous board visible while switching
  })
}
