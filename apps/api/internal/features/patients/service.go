package patients

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/celal2344/orthodontics-helper/apps/api/internal/features/audit"
	"github.com/celal2344/orthodontics-helper/apps/api/internal/features/auth"
)

type Service struct {
	repository   *Repository
	auditService *audit.Service
}

func NewService(repository *Repository, auditService *audit.Service) *Service {
	return &Service{repository: repository, auditService: auditService}
}

var ErrInvalidInput = errors.New("invalid patient input")

func (s *Service) List(ctx context.Context, clinicID string, search string) ([]PatientResponse, error) {
	patients, err := s.repository.ListByClinic(ctx, clinicID, search)
	if err != nil {
		return nil, err
	}

	responses := make([]PatientResponse, 0, len(patients))
	for _, patient := range patients {
		responses = append(responses, patientResponse(patient))
	}

	return responses, nil
}

func (s *Service) Get(ctx context.Context, clinicID string, patientID string) (*PatientResponse, error) {
	patient, err := s.repository.GetByID(ctx, clinicID, patientID)
	if err != nil {
		return nil, err
	}

	response := patientResponse(*patient)
	return &response, nil
}

func (s *Service) Create(ctx context.Context, user *auth.SessionUser, input CreatePatientRequest) (*PatientResponse, error) {
	if err := validatePatientInput(input); err != nil {
		return nil, err
	}

	patient, err := s.repository.Create(ctx, user.ClinicID, user.ID, input)
	if err != nil {
		return nil, err
	}

	if err := s.auditService.Record(ctx, audit.CreateLogInput{
		ClinicID:    user.ClinicID,
		ActorUserID: user.ID,
		EntityType:  "patient",
		EntityID:    patient.ID,
		Action:      "create",
		Summary:     fmt.Sprintf("Patient %s was created.", patient.FullName),
	}); err != nil {
		return nil, err
	}

	response := patientResponse(*patient)
	return &response, nil
}

func (s *Service) Update(ctx context.Context, user *auth.SessionUser, patientID string, input UpdatePatientRequest) (*PatientResponse, error) {
	if err := validatePatientInput(input); err != nil {
		return nil, err
	}

	patient, err := s.repository.Update(ctx, user.ClinicID, user.ID, patientID, input)
	if err != nil {
		return nil, err
	}

	if err := s.auditService.Record(ctx, audit.CreateLogInput{
		ClinicID:    user.ClinicID,
		ActorUserID: user.ID,
		EntityType:  "patient",
		EntityID:    patient.ID,
		Action:      "update",
		Summary:     fmt.Sprintf("Patient %s was updated.", patient.FullName),
	}); err != nil {
		return nil, err
	}

	response := patientResponse(*patient)
	return &response, nil
}

func (s *Service) SoftDelete(ctx context.Context, user *auth.SessionUser, patientID string) error {
	if err := s.repository.SoftDelete(ctx, user.ClinicID, user.ID, patientID); err != nil {
		return err
	}

	return s.auditService.Record(ctx, audit.CreateLogInput{
		ClinicID:    user.ClinicID,
		ActorUserID: user.ID,
		EntityType:  "patient",
		EntityID:    patientID,
		Action:      "soft_delete",
		Summary:     "Patient was soft deleted.",
	})
}

func validatePatientInput(input CreatePatientRequest) error {
	if strings.TrimSpace(input.FullName) == "" || strings.TrimSpace(input.Phone) == "" {
		return ErrInvalidInput
	}

	if normalizedReminderSendHour(input) < 0 || normalizedReminderSendHour(input) > 23 {
		return ErrInvalidInput
	}

	for _, day := range normalizedReminderDaysBefore(input) {
		if day < 0 {
			return ErrInvalidInput
		}
	}

	switch input.Status {
	case "active_treatment", "completed", "cancelled", "waiting", "inactive":
		return nil
	default:
		return ErrInvalidInput
	}
}

func normalizedRemindersEnabled(input CreatePatientRequest) bool {
	if input.RemindersEnabled == nil {
		return true
	}
	return *input.RemindersEnabled
}

func normalizedReminderDaysBefore(input CreatePatientRequest) []int {
	if len(input.ReminderDaysBefore) == 0 {
		return []int{1}
	}
	return input.ReminderDaysBefore
}

func normalizedReminderSendHour(input CreatePatientRequest) int {
	if input.ReminderSendHour == nil {
		return 9
	}
	return *input.ReminderSendHour
}

func patientResponse(patient Patient) PatientResponse {
	response := PatientResponse{
		ID:                 patient.ID,
		FullName:           patient.FullName,
		Phone:              patient.Phone,
		Status:             patient.Status,
		TreatmentNote:      patient.TreatmentNote,
		InternalNote:       patient.InternalNote,
		RemindersEnabled:   patient.RemindersEnabled,
		ReminderDaysBefore: patient.ReminderDaysBefore,
		ReminderSendHour:   patient.ReminderSendHour,
		UpdatedAt:          patient.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}

	if patient.NextAppointment != nil {
		response.NextAppointment = patient.NextAppointment.Format("2006-01-02T15:04:05Z07:00")
	}

	return response
}
