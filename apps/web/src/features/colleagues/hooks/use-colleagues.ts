import type { CreateClinicMemberInput } from "@orthodontics-helper/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

export function useColleagues() {
  return useQuery({
    queryKey: ["colleagues"],
    queryFn: () => apiClient.listColleagues(),
  });
}

export function useCreateClinicMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateClinicMemberInput) => apiClient.createClinicMember(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["colleagues"] });
    },
  });
}
