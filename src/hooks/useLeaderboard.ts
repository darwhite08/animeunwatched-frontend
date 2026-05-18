import { useQuery } from "@tanstack/react-query"
import * as ep from "@/lib/api/endpoints"

export function useLeaderboard(limit = 50, period = "all-time") {
  return useQuery({
    queryKey: ["leaderboard", limit, period],
    queryFn: () => ep.getLeaderboard(limit, period),
    staleTime: 2 * 60_000,
  })
}
