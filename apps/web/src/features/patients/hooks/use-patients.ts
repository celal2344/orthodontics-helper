import type { Patient, PatientInput } from "@orthodontics-helper/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

export function usePatients(query: string) {
  return useQuery({
    queryKey: ["patients", query],
    queryFn: () => apiClient.listPatients(query),
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PatientInput) => apiClient.createPatient(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: PatientInput }) =>
      apiClient.updatePatient(id, input),
    onSuccess: (patient: Patient) => {
      queryClient.setQueryData(["patient", patient.id], patient);
      void queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deletePatient(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}
