package auth

import (
	"context"
	"net/http"
)

type Service struct {
	repository *Repository
}

func NewService(repository *Repository) *Service {
	return &Service{repository: repository}
}

func (s *Service) CurrentUser(ctx context.Context, userID string) (*CurrentUserResponse, error) {
	user, err := s.repository.FindSessionUser(ctx, userID)
	if err != nil {
		return nil, err
	}

	return &CurrentUserResponse{
		ID:       user.ID,
		Email:    user.Email,
		FullName: user.FullName,
		ClinicID: user.ClinicID,
	}, nil
}

func (s *Service) AuthenticateRequest(r *http.Request) (*SessionUser, error) {
	userID := r.Header.Get("X-User-ID")
	if userID == "" {
		return nil, ErrUnauthorized
	}

	return s.repository.FindSessionUser(r.Context(), userID)
}
