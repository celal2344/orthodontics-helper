import { patientStatuses } from "@orthodontics-helper/constants";
import { z } from "zod";

export const patientSchema = z.object({
  fullName: z.string().min(2, "Patient name is required"),
  phone: z.string().min(7, "Phone is required"),
  status: z.enum(patientStatuses),
  treatmentNote: z.string().optional(),
  internalNote: z.string().optional(),
  remindersEnabled: z.boolean(),
  reminderDaysBefore: z
    .array(z.number().int().min(0))
    .min(1, "At least one reminder day is required"),
  reminderSendHour: z.number().int().min(0).max(23),
});

export type PatientFormValues = z.infer<typeof patientSchema>;
