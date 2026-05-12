package clinics

import "context"

type Service struct {
	repository *Repository
}

func NewService(repository *Repository) *Service {
	return &Service{repository: repository}
}

func (s *Service) CurrentClinic(ctx context.Context) (*ClinicResponse, error) {
	_ = ctx
	_ = s.repository

	return &ClinicResponse{ID: "clinic_demo", Name: "Ortodonti Klinik"}, nil
}
