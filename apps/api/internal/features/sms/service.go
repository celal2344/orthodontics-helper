package sms

import (
	"context"

	"github.com/celal2344/orthodontics-helper/apps/api/internal/features/audit"
	"go.uber.org/zap"
)

type Provider interface {
	SendSMS(ctx context.Context, to string, message string) (*ProviderResult, error)
}

type ProviderResult struct {
	ProviderMessageID string
}

type Service struct {
	repository   *Repository
	provider     Provider
	auditService *audit.Service
}

func NewService(repository *Repository, provider Provider, auditService *audit.Service) *Service {
	return &Service{repository: repository, provider: provider, auditService: auditService}
}

func (s *Service) ListTemplates(ctx context.Context, clinicID string) ([]TemplateResponse, error) {
	templates, err := s.repository.ListTemplates(ctx, clinicID)
	if err != nil {
		return nil, err
	}

	responses := make([]TemplateResponse, 0, len(templates))
	for _, template := range templates {
		responses = append(responses, TemplateResponse{
			ID:      template.ID,
			Key:     template.Key,
			Title:   template.Title,
			Body:    template.Body,
			Enabled: template.Enabled,
		})
	}

	return responses, nil
}

func (s *Service) SendManual(ctx context.Context, request SendManualSMSRequest) (*SendSMSResponse, error) {
	_ = s.auditService
	_ = request

	result, err := s.provider.SendSMS(ctx, "+900000000000", "template-rendered-message")
	if err != nil {
		return nil, err
	}

	return &SendSMSResponse{MessageID: result.ProviderMessageID, Status: "sent"}, nil
}

type ReminderService struct {
	repository   *Repository
	provider     Provider
	auditService *audit.Service
	logger       *zap.Logger
}

func NewReminderService(repository *Repository, provider Provider, auditService *audit.Service, logger *zap.Logger) *ReminderService {
	return &ReminderService{
		repository:   repository,
		provider:     provider,
		auditService: auditService,
		logger:       logger,
	}
}

func (s *ReminderService) SendDailyReminders(ctx context.Context) error {
	s.logger.Info("daily reminder job started")
	if err := s.repository.CreateReminderMessages(ctx); err != nil {
		return err
	}
	s.logger.Info("daily reminder job finished")
	return nil
}
