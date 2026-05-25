package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Port           string
	DBHost         string
	DBPort         string
	DBUser         string
	DBPassword     string
	DBName         string
	JWTSecret      string
	AIServiceURL   string
	AnthropicKey   string
	AdminToken     string
	SMTPHost       string
	SMTPPort       int
	SMTPUser       string
	SMTPPassword   string
	SMTPFrom       string
	// LogCodes prints emailed verification codes to the server log and lets
	// code-sending actions succeed even if email delivery fails. DEV ONLY.
	LogCodes       bool
}

func Load() *Config {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, reading from environment")
	}

	return &Config{
		Port:         getEnv("PORT", "8080"),
		DBHost:       getEnv("DB_HOST", "localhost"),
		DBPort:       getEnv("DB_PORT", "5432"),
		DBUser:       getEnv("DB_USER", "postgres"),
		DBPassword:   getEnv("DB_PASSWORD", ""),
		DBName:       getEnv("DB_NAME", "cupid_ai"),
		JWTSecret:    getEnv("JWT_SECRET", "change-this-secret"),
		AIServiceURL: getEnv("AI_SERVICE_URL", "http://127.0.0.1:8001"),
		AnthropicKey: getEnv("ANTHROPIC_API_KEY", ""),
		AdminToken:   getEnv("ADMIN_TOKEN", ""),
		SMTPHost:     getEnv("SMTP_HOST", "smtp.gmail.com"),
		SMTPPort:     func() int { p, _ := strconv.Atoi(getEnv("SMTP_PORT", "587")); return p }(),
		SMTPUser:     getEnv("SMTP_USER", ""),
		SMTPPassword: getEnv("SMTP_PASSWORD", ""),
		SMTPFrom:     getEnv("SMTP_FROM", "noreply@cupidai.app"),
		LogCodes:     getEnv("LOG_CODES", "false") == "true",
	}
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
