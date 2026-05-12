package appointments

import (
	"context"

	"github.com/celal2344/orthodontics-helper/apps/api/internal/features/audit"
)

type Service struct {
	repository   *Repository
	auditService *audit.Service
}

func NewService(repository *Repository, auditService *audit.Service) *Service {
	return &Service{repository: repository, auditService: auditService}
}

func (s *Service) List(ctx context.Context, clinicID string) ([]AppointmentResponse, error) {
	appointments, err := s.repository.ListByClinic(ctx, clinicID)
	if err != nil {
		return nil, err
	}

	responses := make([]AppointmentResponse, 0, len(appointments))
	for _, appointment := range appointments {
		responses = append(responses, AppointmentResponse{
			ID:        appointment.ID,
			PatientID: appointment.PatientID,
			StartsAt:  appointment.StartsAt.Format("2006-01-02T15:04:05Z07:00"),
			Status:    appointment.Status,
			Note:      appointment.Note,
		})
	}

	return responses, nil
}
