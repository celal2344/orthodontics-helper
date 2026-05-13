package auth

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

type Service struct {
	repository             *Repository
	supabaseJWTSecret      string
	supabaseURL            string
	supabaseServiceRoleKey string
}

func NewService(repository *Repository, supabaseJWTSecret string, supabaseURL string, supabaseServiceRoleKey string) *Service {
	return &Service{
		repository:             repository,
		supabaseJWTSecret:      supabaseJWTSecret,
		supabaseURL:            strings.TrimRight(supabaseURL, "/"),
		supabaseServiceRoleKey: supabaseServiceRoleKey,
	}
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
	token := bearerToken(r)
	if token == "" {
		return nil, ErrUnauthorized
	}

	userID, err := s.verifyToken(token)
	if err != nil {
		return nil, err
	}

	return s.repository.FindSessionUser(r.Context(), userID)
}

func (s *Service) UpdateProfile(ctx context.Context, user *SessionUser, input UpdateProfileRequest) (*CurrentUserResponse, error) {
	fullName := strings.TrimSpace(input.FullName)
	email := strings.TrimSpace(input.Email)
	if fullName == "" || email == "" {
		return nil, ErrUnauthorized
	}

	if err := s.updateSupabaseUser(ctx, user.ID, map[string]any{
		"email": email,
		"user_metadata": map[string]any{
			"full_name": fullName,
		},
	}); err != nil {
		return nil, err
	}

	updatedUser, err := s.repository.UpdateUser(ctx, user.ID, fullName, email)
	if err != nil {
		return nil, err
	}

	return &CurrentUserResponse{
		ID:       updatedUser.ID,
		Email:    updatedUser.Email,
		FullName: updatedUser.FullName,
		ClinicID: updatedUser.ClinicID,
	}, nil
}

func (s *Service) UpdatePassword(ctx context.Context, user *SessionUser, input UpdatePasswordRequest) error {
	if len(input.Password) < 8 {
		return ErrUnauthorized
	}

	return s.updateSupabaseUser(ctx, user.ID, map[string]any{
		"password": input.Password,
	})
}

func (s *Service) verifyToken(tokenString string) (string, error) {
	if s.supabaseJWTSecret == "" {
		return "", ErrUnauthorized
	}

	token, err := jwt.ParseWithClaims(tokenString, jwt.MapClaims{}, func(token *jwt.Token) (any, error) {
		if token.Method.Alg() != jwt.SigningMethodHS256.Alg() {
			return nil, ErrUnauthorized
		}
		return []byte(s.supabaseJWTSecret), nil
	})
	if err != nil || !token.Valid {
		return "", ErrUnauthorized
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", ErrUnauthorized
	}

	sub, err := claims.GetSubject()
	if err != nil || sub == "" {
		return "", ErrUnauthorized
	}

	return sub, nil
}

func (s *Service) updateSupabaseUser(ctx context.Context, userID string, payload map[string]any) error {
	if s.supabaseURL == "" || s.supabaseServiceRoleKey == "" {
		return fmt.Errorf("supabase admin config is required")
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	request, err := http.NewRequestWithContext(ctx, http.MethodPut, fmt.Sprintf("%s/auth/v1/admin/users/%s", s.supabaseURL, userID), bytes.NewReader(body))
	if err != nil {
		return err
	}
	request.Header.Set("Content-Type", "application/json")
	request.Header.Set("apikey", s.supabaseServiceRoleKey)
	request.Header.Set("Authorization", "Bearer "+s.supabaseServiceRoleKey)

	response, err := http.DefaultClient.Do(request)
	if err != nil {
		return err
	}
	defer response.Body.Close()

	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return fmt.Errorf("supabase admin update user failed: %s", response.Status)
	}

	return nil
}

func bearerToken(r *http.Request) string {
	value := r.Header.Get("Authorization")
	if value == "" {
		return ""
	}

	token, ok := strings.CutPrefix(value, "Bearer ")
	if !ok {
		return ""
	}

	return strings.TrimSpace(token)
}
