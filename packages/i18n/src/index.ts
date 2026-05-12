export const trErrorMessages: Record<string, string> = {
  UNAUTHORIZED: "Oturumunuzun suresi doldu.",
  INVALID_REQUEST: "Gonderilen bilgiler gecersiz.",
  PATIENT_NOT_FOUND: "Hasta bulunamadi.",
  PATIENT_LIST_FAILED: "Hasta listesi alinamadi.",
  PATIENT_DELETE_FAILED: "Hasta silinemedi.",
  APPOINTMENT_NOT_FOUND: "Randevu bulunamadi.",
  APPOINTMENT_LIST_FAILED: "Randevu listesi alinamadi.",
  SMS_TEMPLATE_LIST_FAILED: "SMS sablonlari alinamadi.",
  SMS_SEND_FAILED: "SMS gonderilemedi.",
  CLINIC_NOT_FOUND: "Klinik bulunamadi.",
  AUDIT_LOG_LIST_FAILED: "Islem gecmisi alinamadi.",
};

export function getTurkishErrorMessage(code: string) {
  return trErrorMessages[code] ?? "Beklenmeyen bir hata olustu.";
}
