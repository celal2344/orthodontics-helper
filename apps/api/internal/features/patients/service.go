package patients

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

func (s *Service) List(ctx context.Context, clinicID string) ([]PatientResponse, error) {
	patients, err := s.repository.ListByClinic(ctx, clinicID)
	if err != nil {
		return nil, err
	}

	responses := make([]PatientResponse, 0, len(patients))
	for _, patient := range patients {
		responses = append(responses, PatientResponse{
			ID:        patient.ID,
			FullName:  patient.FullName,
			Phone:     patient.Phone,
			Status:    patient.Status,
			UpdatedAt: patient.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
		})
	}

	return responses, nil
}

func (s *Service) SoftDelete(ctx context.Context, clinicID string, patientID string) error {
	_ = clinicID
	_ = patientID

	return s.auditService.Record(ctx, audit.CreateLogInput{
		ClinicID:   clinicID,
		EntityType: "patient",
		EntityID:   patientID,
		Action:     "soft_delete",
		Summary:    "Patient was soft deleted.",
	})
}
