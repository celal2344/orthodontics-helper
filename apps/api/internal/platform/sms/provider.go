package sms

import (
	"context"

	"go.uber.org/zap"
)

type Result struct {
	ProviderMessageID string
}

type Provider interface {
	SendSMS(ctx context.Context, to string, message string) (*Result, error)
}

type NoopProvider struct {
	logger *zap.Logger
}

func NewNoopProvider(logger *zap.Logger) *NoopProvider {
	return &NoopProvider{logger: logger}
}

func (p *NoopProvider) SendSMS(ctx context.Context, to string, message string) (*Result, error) {
	_ = ctx
	p.logger.Info("noop sms send", zap.String("to", to), zap.Int("message_length", len(message)))
	return &Result{ProviderMessageID: "noop"}, nil
}
