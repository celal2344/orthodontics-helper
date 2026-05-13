import type { SendManualSMSInput, SMSTemplate } from "@orthodontics-helper/api-client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

export const defaultSMSTemplates: SMSTemplate[] = [
  {
    id: "default-appointment-reminder",
    key: "appointment_reminder",
    title: "Appointment reminder",
    body: "Merhaba {patientName}, {appointmentDate} saatindeki randevunuzu hatirlatmak isteriz.",
    enabled: true,
  },
  {
    id: "default-checkup-followup",
    key: "checkup_followup",
    title: "Check-up follow-up",
    body: "Merhaba {patientName}, kontrol randevunuz icin uygun oldugunuzda klinigimizle iletisime gecebilirsiniz.",
    enabled: true,
  },
  {
    id: "default-payment-note",
    key: "payment_note",
    title: "Payment note",
    body: "Merhaba {patientName}, odeme bilginizle ilgili klinigimizden destek alabilirsiniz.",
    enabled: true,
  },
];

export function useSMSTemplates() {
  return useQuery({
    queryKey: ["sms-templates"],
    queryFn: async () => {
      const templates = await apiClient.listSMSTemplates();
      return templates.length > 0 ? templates : defaultSMSTemplates;
    },
  });
}

export function useSendManualSMS() {
  return useMutation({
    mutationFn: (input: SendManualSMSInput) => apiClient.sendManualSMS(input),
  });
}
