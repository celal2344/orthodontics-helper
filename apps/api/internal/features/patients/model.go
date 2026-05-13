package patients

import "time"

type Patient struct {
	ID              string
	ClinicID        string
	FullName        string
	Phone           string
	Status          string
	TreatmentNote   string
	InternalNote    string
	CreatedByUserID string
	UpdatedByUserID string
	CreatedAt       time.Time
	UpdatedAt       time.Time
	DeletedAt       *time.Time
	NextAppointment *time.Time
}
