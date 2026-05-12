package sms

import "context"

type NetgsmProvider struct {
	apiKey    string
	apiSecret string
}

func NewNetgsmProvider(apiKey string, apiSecret string) *NetgsmProvider {
	return &NetgsmProvider{apiKey: apiKey, apiSecret: apiSecret}
}

func (p *NetgsmProvider) SendSMS(ctx context.Context, to string, message string) (*Result, error) {
	_ = ctx
	_ = to
	_ = message
	_ = p.apiKey
	_ = p.apiSecret

	return nil, ErrProviderNotImplemented
}
