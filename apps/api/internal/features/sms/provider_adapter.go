package sms

import (
	"context"

	smsplatform "github.com/celal2344/orthodontics-helper/apps/api/internal/platform/sms"
)

type ProviderAdapter struct {
	provider smsplatform.Provider
}

func NewProviderAdapter(provider smsplatform.Provider) *ProviderAdapter {
	return &ProviderAdapter{provider: provider}
}

func (p *ProviderAdapter) SendSMS(ctx context.Context, to string, message string) (*ProviderResult, error) {
	result, err := p.provider.SendSMS(ctx, to, message)
	if err != nil {
		return nil, err
	}

	return &ProviderResult{ProviderMessageID: result.ProviderMessageID}, nil
}
