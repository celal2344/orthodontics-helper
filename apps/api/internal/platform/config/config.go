package config

import (
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	AppEnv                 string
	HTTPAddr               string
	DatabaseURL            string
	JWTSecret              string
	SupabaseURL            string
	SupabaseJWTSecret      string
	SupabaseJWKSURL        string
	SupabaseJWTIssuer      string
	SupabaseJWTAudience    string
	SupabaseJWTAlgorithms  []string
	SupabaseServiceRoleKey string
	SMSProvider            string
	SMSAPIKey              string
	SMSAPISecret           string
	InternalJobSecret      string
}

func Load() Config {
	loadDotEnv()

	return Config{
		AppEnv:                 getEnv("APP_ENV", "development"),
		HTTPAddr:               getEnv("HTTP_ADDR", ":8080"),
		DatabaseURL:            os.Getenv("DATABASE_URL"),
		JWTSecret:              os.Getenv("JWT_SECRET"),
		SupabaseURL:            os.Getenv("SUPABASE_URL"),
		SupabaseJWTSecret:      getEnv("SUPABASE_JWT_SECRET", os.Getenv("JWT_SECRET")),
		SupabaseJWKSURL:        os.Getenv("SUPABASE_JWKS_URL"),
		SupabaseJWTIssuer:      os.Getenv("SUPABASE_JWT_ISSUER"),
		SupabaseJWTAudience:    os.Getenv("SUPABASE_JWT_AUDIENCE"),
		SupabaseJWTAlgorithms:  splitCSV(getEnv("SUPABASE_JWT_ALGORITHMS", "HS256")),
		SupabaseServiceRoleKey: os.Getenv("SUPABASE_SERVICE_ROLE_KEY"),
		SMSProvider:            getEnv("SMS_PROVIDER", "noop"),
		SMSAPIKey:              os.Getenv("SMS_API_KEY"),
		SMSAPISecret:           os.Getenv("SMS_API_SECRET"),
		InternalJobSecret:      os.Getenv("INTERNAL_JOB_SECRET"),
	}
}

func loadDotEnv() {
	_ = godotenv.Load(
		".env",
		"apps/api/.env",
	)
}

func getEnv(key string, fallback string) string {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	return value
}

func splitCSV(value string) []string {
	parts := strings.Split(value, ",")
	result := make([]string, 0, len(parts))
	for _, part := range parts {
		trimmed := strings.TrimSpace(part)
		if trimmed != "" {
			result = append(result, trimmed)
		}
	}
	return result
}
