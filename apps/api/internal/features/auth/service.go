package auth

import "context"

type Service struct {
	repository *Repository
}

func NewService(repository *Repository) *Service {
	return &Service{repository: repository}
}

func (s *Service) CurrentUser(ctx context.Context) (*CurrentUserResponse, error) {
	_ = ctx
	_ = s.repository

	return &CurrentUserResponse{
		ID:       "user_demo",
		Email:    "doctor@example.com",
		FullName: "Demo Doctor",
		ClinicID: "clinic_demo",
	}, nil
}
