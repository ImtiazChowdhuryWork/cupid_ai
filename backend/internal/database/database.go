package database

import (
	"database/sql"
	"fmt"
	"log"

	_ "github.com/lib/pq"
	"cupid_ai/backend/internal/config"
)

func Connect(cfg *config.Config) *sql.DB {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable",
		cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPassword, cfg.DBName,
	)

	db, err := sql.Open("postgres", dsn)
	if err != nil {
		log.Fatalf("Failed to open database: %v", err)
	}

	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	log.Println("Database connected successfully")
	return db
}

func RunMigrations(db *sql.DB) {
	queries := []string{
		`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,

		`CREATE TABLE IF NOT EXISTS users (
			id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
			email            VARCHAR(255) UNIQUE NOT NULL,
			password_hash    TEXT NOT NULL,
			display_name     VARCHAR(100) NOT NULL DEFAULT '',
			subscription_tier VARCHAR(20) NOT NULL DEFAULT 'free',
			created_at       TIMESTAMP NOT NULL DEFAULT NOW()
		)`,

		`CREATE TABLE IF NOT EXISTS analyses (
			id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
			user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			conversation_text TEXT NOT NULL,
			suggestions       JSONB NOT NULL,
			sentiment         VARCHAR(20) NOT NULL DEFAULT 'neutral',
			created_at        TIMESTAMP NOT NULL DEFAULT NOW()
		)`,

		`CREATE TABLE IF NOT EXISTS daily_usage (
			user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			date           DATE NOT NULL DEFAULT CURRENT_DATE,
			analysis_count INT NOT NULL DEFAULT 0,
			PRIMARY KEY (user_id, date)
		)`,

		`CREATE TABLE IF NOT EXISTS refresh_tokens (
			id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
			user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			token      TEXT NOT NULL,
			expires_at TIMESTAMP NOT NULL,
			created_at TIMESTAMP NOT NULL DEFAULT NOW()
		)`,
	}

	for _, q := range queries {
		if _, err := db.Exec(q); err != nil {
			log.Fatalf("Migration failed: %v\nQuery: %s", err, q)
		}
	}

	log.Println("Database migrations completed")
}
