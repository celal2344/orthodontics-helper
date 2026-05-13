package patients

type CreatePatientRequest struct {
	FullName           string `json:"fullName"`
	Phone              string `json:"phone"`
	Status             string `json:"status"`
	TreatmentNote      string `json:"treatmentNote"`
	InternalNote       string `json:"internalNote"`
	RemindersEnabled   *bool  `json:"remindersEnabled"`
	ReminderDaysBefore []int  `json:"reminderDaysBefore"`
	ReminderSendHour   *int   `json:"reminderSendHour"`
}

type UpdatePatientRequest = CreatePatientRequest

type PatientResponse struct {
	ID                 string `json:"id"`
	FullName           string `json:"fullName"`
	Phone              string `json:"phone"`
	Status             string `json:"status"`
	TreatmentNote      string `json:"treatmentNote,omitempty"`
	InternalNote       string `json:"internalNote,omitempty"`
	RemindersEnabled   bool   `json:"remindersEnabled"`
	ReminderDaysBefore []int  `json:"reminderDaysBefore"`
	ReminderSendHour   int    `json:"reminderSendHour"`
	NextAppointment    string `json:"nextAppointment,omitempty"`
	UpdatedAt          string `json:"updatedAt"`
}
