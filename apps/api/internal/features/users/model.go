package users

import "time"

type User struct {
	ID        string
	Email     string
	FullName  string
	CreatedAt time.Time
	UpdatedAt time.Time
}

type ClinicMember struct {
	ID        string
	ClinicID  string
	UserID    string
	Status    string
	CreatedAt time.Time
	UpdatedAt time.Time
}
