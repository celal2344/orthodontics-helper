package users

import "time"

type Colleague struct {
	ID       string
	FullName string
	Email    string
	Clinic   string
	JoinedAt time.Time
}

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
