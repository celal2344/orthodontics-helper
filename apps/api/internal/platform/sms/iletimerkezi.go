package sms

import "context"

type IletiMerkeziProvider struct {
	apiKey    string
	apiSecret string
}

func NewIletiMerkeziProvider(apiKey string, apiSecret string) *IletiMerkeziProvider {
	return &IletiMerkeziProvider{apiKey: apiKey, apiSecret: apiSecret}
}

func (p *IletiMerkeziProvider) SendSMS(ctx context.Context, to string, message string) (*Result, error) {
	_ = ctx
	_ = to
	_ = message
	_ = p.apiKey
	_ = p.apiSecret

	return nil, ErrProviderNotImplemented
}
