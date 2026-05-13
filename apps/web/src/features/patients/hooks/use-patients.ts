import type { Patient, PatientInput } from "@orthodontics-helper/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useClinicContext } from "@/features/auth/components/clinic-context-provider";
import { apiClient } from "@/lib/api/client";

function useClinicApiClient() {
  const { user } = useClinicContext();
  return apiClient.withHeaders({ "X-User-ID": user.id });
}

export function usePatients(query: string) {
  const client = useClinicApiClient();

  return useQuery({
    queryKey: ["patients", query],
    queryFn: () => client.listPatients(query),
  });
}

export function useCreatePatient() {
  const client = useClinicApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PatientInput) => client.createPatient(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

export function useUpdatePatient() {
  const client = useClinicApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: PatientInput }) =>
      client.updatePatient(id, input),
    onSuccess: (patient: Patient) => {
      queryClient.setQueryData(["patient", patient.id], patient);
      void queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

export function useDeletePatient() {
  const client = useClinicApiClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => client.deletePatient(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}
