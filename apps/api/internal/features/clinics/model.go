package clinics

import "time"

type Clinic struct {
	ID        string
	Name      string
	CreatedAt time.Time
	UpdatedAt time.Time
}
