package sms

import "time"

type Template struct {
	ID        string
	ClinicID  string
	Key       string
	Title     string
	Body      string
	Enabled   bool
	CreatedAt time.Time
	UpdatedAt time.Time
}

type Message struct {
	ID                string
	ClinicID          string
	PatientID         string
	AppointmentID     string
	TemplateID        string
	Phone             string
	Message           string
	Status            string
	Provider          string
	ProviderMessageID string
	ErrorMessage      string
	ReminderType      string
	DaysBefore        int
	SentAt            *time.Time
	CreatedByUserID   string
	CreatedAt         time.Time
	UpdatedAt         time.Time
}
