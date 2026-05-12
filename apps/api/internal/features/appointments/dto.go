package appointments

type CreateAppointmentRequest struct {
	PatientID    string `json:"patientId"`
	DoctorUserID string `json:"doctorUserId"`
	StartsAt     string `json:"startsAt"`
	Status       string `json:"status"`
	Note         string `json:"note"`
}

type UpdateAppointmentRequest = CreateAppointmentRequest

type AppointmentResponse struct {
	ID        string `json:"id"`
	PatientID string `json:"patientId"`
	StartsAt  string `json:"startsAt"`
	Status    string `json:"status"`
	Note      string `json:"note,omitempty"`
}
