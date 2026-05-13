import { patientStatuses } from "@orthodontics-helper/constants";
import { z } from "zod";

export const patientSchema = z.object({
  fullName: z.string().min(2, "Patient name is required"),
  phone: z.string().min(7, "Phone is required"),
  status: z.enum(patientStatuses),
  treatmentNote: z.string().optional(),
  internalNote: z.string().optional(),
});

export type PatientFormValues = z.infer<typeof patientSchema>;
