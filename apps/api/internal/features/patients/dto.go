package patients

type CreatePatientRequest struct {
	FullName      string `json:"fullName"`
	Phone         string `json:"phone"`
	Status        string `json:"status"`
	TreatmentNote string `json:"treatmentNote"`
	InternalNote  string `json:"internalNote"`
}

type UpdatePatientRequest = CreatePatientRequest

type PatientResponse struct {
	ID              string `json:"id"`
	FullName        string `json:"fullName"`
	Phone           string `json:"phone"`
	Status          string `json:"status"`
	NextAppointment string `json:"nextAppointment,omitempty"`
	UpdatedAt       string `json:"updatedAt"`
}
