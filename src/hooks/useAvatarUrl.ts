import { useQuery } from "@tanstack/react-query";
import { getAvatarUrl } from "@/services/profile.service";

export function useAvatarUrl(path?: string | null) {
  return useQuery({
    queryKey: ["avatar-url", path],
    queryFn: () => getAvatarUrl(path),
    enabled: Boolean(path),
    staleTime: 50 * 60 * 1000,
  });
}
