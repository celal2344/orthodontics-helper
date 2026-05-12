package sms

type TemplateResponse struct {
	ID      string `json:"id"`
	Key     string `json:"key"`
	Title   string `json:"title"`
	Body    string `json:"body"`
	Enabled bool   `json:"enabled"`
}

type SendManualSMSRequest struct {
	PatientID     string `json:"patientId"`
	AppointmentID string `json:"appointmentId"`
	TemplateID    string `json:"templateId"`
}

type SendSMSResponse struct {
	MessageID string `json:"messageId"`
	Status    string `json:"status"`
}
