package logger

import "go.uber.org/zap"

func New(appEnv string) (*zap.Logger, error) {
	if appEnv == "production" {
		return zap.NewProduction()
	}

	return zap.NewDevelopment()
}
