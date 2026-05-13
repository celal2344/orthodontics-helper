package users

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
)

type Service struct {
	repository             *Repository
	supabaseURL            string
	supabaseServiceRoleKey string
}

func NewService(repository *Repository, supabaseURL string, supabaseServiceRoleKey string) *Service {
	return &Service{
		repository:             repository,
		supabaseURL:            strings.TrimRight(supabaseURL, "/"),
		supabaseServiceRoleKey: supabaseServiceRoleKey,
	}
}

func (s *Service) ListColleagues(ctx context.Context, clinicID string) ([]ColleagueResponse, error) {
	colleagues, err := s.repository.ListColleagues(ctx, clinicID)
	if err != nil {
		return nil, err
	}

	responses := make([]ColleagueResponse, 0, len(colleagues))
	for _, colleague := range colleagues {
		responses = append(responses, ColleagueResponse{
			ID:       colleague.ID,
			FullName: colleague.FullName,
			Email:    colleague.Email,
			Clinic:   colleague.Clinic,
			JoinedAt: colleague.JoinedAt.Format("2006-01-02T15:04:05Z07:00"),
		})
	}

	return responses, nil
}

func (s *Service) CreateClinicMember(ctx context.Context, clinicID string, request CreateClinicMemberRequest) (*ColleagueResponse, error) {
	fullName := strings.TrimSpace(request.FullName)
	email := strings.TrimSpace(request.Email)
	if fullName == "" || email == "" || len(request.TemporaryPassword) < 8 {
		return nil, fmt.Errorf("invalid clinic member input")
	}

	userID, err := s.createSupabaseUser(ctx, fullName, email, request.TemporaryPassword)
	if err != nil {
		return nil, err
	}

	if err := s.repository.UpsertUser(ctx, userID, fullName, email); err != nil {
		_ = s.deleteSupabaseUser(ctx, userID)
		return nil, err
	}
	if err := s.repository.AddClinicMember(ctx, clinicID, userID); err != nil {
		_ = s.deleteSupabaseUser(ctx, userID)
		return nil, err
	}

	colleagues, err := s.ListColleagues(ctx, clinicID)
	if err != nil {
		return nil, err
	}
	for _, colleague := range colleagues {
		if colleague.ID == userID {
			return &colleague, nil
		}
	}

	return nil, fmt.Errorf("created clinic member not found")
}

func (s *Service) createSupabaseUser(ctx context.Context, fullName string, email string, password string) (string, error) {
	if s.supabaseURL == "" || s.supabaseServiceRoleKey == "" {
		return "", fmt.Errorf("supabase admin config is required")
	}

	payload := map[string]any{
		"email":         email,
		"password":      password,
		"email_confirm": true,
		"user_metadata": map[string]any{
			"full_name": fullName,
		},
	}
	body, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	httpRequest, err := http.NewRequestWithContext(ctx, http.MethodPost, s.supabaseURL+"/auth/v1/admin/users", bytes.NewReader(body))
	if err != nil {
		return "", err
	}
	httpRequest.Header.Set("Content-Type", "application/json")
	httpRequest.Header.Set("apikey", s.supabaseServiceRoleKey)
	httpRequest.Header.Set("Authorization", "Bearer "+s.supabaseServiceRoleKey)

	response, err := http.DefaultClient.Do(httpRequest)
	if err != nil {
		return "", err
	}
	defer response.Body.Close()

	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return "", fmt.Errorf("supabase admin create user failed: %s", response.Status)
	}

	var payloadResponse struct {
		ID string `json:"id"`
	}
	if err := json.NewDecoder(response.Body).Decode(&payloadResponse); err != nil {
		return "", err
	}
	if payloadResponse.ID == "" {
		return "", fmt.Errorf("supabase admin create user returned empty id")
	}

	return payloadResponse.ID, nil
}

func (s *Service) deleteSupabaseUser(ctx context.Context, userID string) error {
	if s.supabaseURL == "" || s.supabaseServiceRoleKey == "" {
		return fmt.Errorf("supabase admin config is required")
	}

	httpRequest, err := http.NewRequestWithContext(ctx, http.MethodDelete, s.supabaseURL+"/auth/v1/admin/users/"+userID, nil)
	if err != nil {
		return err
	}
	httpRequest.Header.Set("apikey", s.supabaseServiceRoleKey)
	httpRequest.Header.Set("Authorization", "Bearer "+s.supabaseServiceRoleKey)

	response, err := http.DefaultClient.Do(httpRequest)
	if err != nil {
		return err
	}
	defer response.Body.Close()

	if response.StatusCode < 200 || response.StatusCode >= 300 {
		return fmt.Errorf("supabase admin delete user failed: %s", response.Status)
	}

	return nil
}
