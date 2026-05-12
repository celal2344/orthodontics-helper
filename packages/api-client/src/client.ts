import { getTurkishErrorMessage } from "@orthodontics-helper/i18n";
import type { components } from "./schema";

export type ApiErrorPayload = components["schemas"]["ErrorResponse"];
export type Patient = components["schemas"]["Patient"];
export type PatientInput = components["schemas"]["PatientInput"];
export type Appointment = components["schemas"]["Appointment"];
export type AppointmentInput = components["schemas"]["AppointmentInput"];
export type CurrentUser = components["schemas"]["CurrentUser"];
export type Clinic = components["schemas"]["Clinic"];
export type Colleague = components["schemas"]["Colleague"];
export type SMSTemplate = components["schemas"]["SMSTemplate"];
export type SendManualSMSInput = components["schemas"]["SendManualSMSInput"];
export type SendSMSResponse = components["schemas"]["SendSMSResponse"];
export type AuditLog = components["schemas"]["AuditLog"];

export class ApiClientError extends Error {
  code: string;
  status: number;
  localizedMessage: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.localizedMessage = getTurkishErrorMessage(code);
  }
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  getCurrentUser() {
    return this.request<CurrentUser>("/v1/auth/me");
  }

  getCurrentClinic() {
    return this.request<Clinic>("/v1/clinics/current");
  }

  async listColleagues() {
    const response = await this.request<{ data: Colleague[] }>("/v1/colleagues");
    return response.data;
  }

  async listPatients(query?: string) {
    const search = query ? `?q=${encodeURIComponent(query)}` : "";
    const response = await this.request<{ data: Patient[] }>(`/v1/patients${search}`);
    return response.data;
  }

  createPatient(input: PatientInput) {
    return this.request<Patient>("/v1/patients", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async listAppointments(month?: string) {
    const search = month ? `?month=${encodeURIComponent(month)}` : "";
    const response = await this.request<{ data: Appointment[] }>(`/v1/appointments${search}`);
    return response.data;
  }

  createAppointment(input: AppointmentInput) {
    return this.request<Appointment>("/v1/appointments", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async listSMSTemplates() {
    const response = await this.request<{ data: SMSTemplate[] }>("/v1/sms/templates");
    return response.data;
  }

  sendManualSMS(input: SendManualSMSInput) {
    return this.request<SendSMSResponse>("/v1/sms/send", {
      method: "POST",
      body: JSON.stringify(input),
    });
  }

  async listAuditLogs(entityType: string, entityId: string) {
    const search = new URLSearchParams({ entityType, entityId });
    const response = await this.request<{ data: AuditLog[] }>(`/v1/audit-logs?${search}`);
    return response.data;
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init.headers,
      },
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as ApiErrorPayload | null;
      const code = payload?.error?.code ?? "UNEXPECTED_ERROR";
      const message = payload?.error?.message ?? "Unexpected API error";
      throw new ApiClientError(response.status, code, message);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }
}
