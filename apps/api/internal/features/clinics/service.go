package clinics

import "context"

type Service struct {
	repository *Repository
}

func NewService(repository *Repository) *Service {
	return &Service{repository: repository}
}

func (s *Service) CurrentClinic(ctx context.Context, clinicID string) (*ClinicResponse, error) {
	clinic, err := s.repository.GetByID(ctx, clinicID)
	if err != nil {
		return nil, err
	}

	return &ClinicResponse{ID: clinic.ID, Name: clinic.Name}, nil
}
