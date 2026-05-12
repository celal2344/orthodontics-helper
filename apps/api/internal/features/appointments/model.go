package appointments

import "time"

type Appointment struct {
	ID           string
	ClinicID     string
	PatientID    string
	DoctorUserID string
	StartsAt     time.Time
	Status       string
	Note         string
	CreatedAt    time.Time
	UpdatedAt    time.Time
	DeletedAt    *time.Time
}
