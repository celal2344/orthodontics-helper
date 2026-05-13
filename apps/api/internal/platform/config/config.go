package config

import "os"

type Config struct {
	AppEnv                 string
	HTTPAddr               string
	DatabaseURL            string
	JWTSecret              string
	SupabaseURL            string
	SupabaseJWTSecret      string
	SupabaseServiceRoleKey string
	SMSProvider            string
	SMSAPIKey              string
	SMSAPISecret           string
	InternalJobSecret      string
}

func Load() Config {
	return Config{
		AppEnv:                 getEnv("APP_ENV", "development"),
		HTTPAddr:               getEnv("HTTP_ADDR", ":8080"),
		DatabaseURL:            os.Getenv("DATABASE_URL"),
		JWTSecret:              os.Getenv("JWT_SECRET"),
		SupabaseURL:            os.Getenv("SUPABASE_URL"),
		SupabaseJWTSecret:      getEnv("SUPABASE_JWT_SECRET", os.Getenv("JWT_SECRET")),
		SupabaseServiceRoleKey: os.Getenv("SUPABASE_SERVICE_ROLE_KEY"),
		SMSProvider:            getEnv("SMS_PROVIDER", "noop"),
		SMSAPIKey:              os.Getenv("SMS_API_KEY"),
		SMSAPISecret:           os.Getenv("SMS_API_SECRET"),
		InternalJobSecret:      os.Getenv("INTERNAL_JOB_SECRET"),
	}
}

func getEnv(key string, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	return value
}
