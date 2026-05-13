package audit

import "context"

type Service struct {
	repository *Repository
}

func NewService(repository *Repository) *Service {
	return &Service{repository: repository}
}

func (s *Service) Record(ctx context.Context, input CreateLogInput) error {
	return s.repository.Create(ctx, input)
}

func (s *Service) ListForEntity(ctx context.Context, clinicID string, entityType string, entityID string) ([]LogResponse, error) {
	_ = ctx
	_ = s.repository
	_ = clinicID
	_ = entityType
	_ = entityID

	return []LogResponse{}, nil
}
