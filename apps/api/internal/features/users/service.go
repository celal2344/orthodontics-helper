package users

import "context"

type Service struct {
	repository *Repository
}

func NewService(repository *Repository) *Service {
	return &Service{repository: repository}
}

func (s *Service) ListColleagues(ctx context.Context) ([]ColleagueResponse, error) {
	_ = ctx
	_ = s.repository

	return []ColleagueResponse{}, nil
}
