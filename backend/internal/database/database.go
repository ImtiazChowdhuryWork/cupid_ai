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
			fcm_token        TEXT NOT NULL DEFAULT '',
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

		// Single-row settings table — key/value pairs for admin config
		`CREATE TABLE IF NOT EXISTS app_settings (
			key        VARCHAR(100) PRIMARY KEY,
			value      TEXT NOT NULL DEFAULT '',
			updated_at TIMESTAMP NOT NULL DEFAULT NOW()
		)`,

		`CREATE TABLE IF NOT EXISTS daily_challenges (
			id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
			user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			challenge_type VARCHAR(50) NOT NULL,
			title          VARCHAR(200) NOT NULL,
			description    TEXT NOT NULL,
			target         INT NOT NULL DEFAULT 1,
			progress       INT NOT NULL DEFAULT 0,
			completed      BOOLEAN NOT NULL DEFAULT false,
			reward         VARCHAR(200) NOT NULL DEFAULT '',
			date           DATE NOT NULL DEFAULT CURRENT_DATE,
			UNIQUE(user_id, date)
		)`,

		`CREATE TABLE IF NOT EXISTS data_requests (
			id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
			user_id        UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			email          VARCHAR(255) NOT NULL,
			request_type   VARCHAR(20)  NOT NULL DEFAULT 'export',
			status         VARCHAR(20)  NOT NULL DEFAULT 'pending',
			note           TEXT,
			delivered_via  VARCHAR(20),      -- 'email' | 'download' | null
			delivered_at   TIMESTAMP,        -- when data was sent/downloaded
			delivered_by   VARCHAR(255),     -- admin email who processed it
			delivery_note  TEXT,             -- summary of what was sent
			analyses_count INT DEFAULT 0,    -- how many analyses were in export
			created_at     TIMESTAMP NOT NULL DEFAULT NOW(),
			updated_at     TIMESTAMP NOT NULL DEFAULT NOW()
		)`,

		// Migrate existing table: add tracking columns if not present
		`ALTER TABLE data_requests ADD COLUMN IF NOT EXISTS delivered_via  VARCHAR(20)`,
		`ALTER TABLE data_requests ADD COLUMN IF NOT EXISTS delivered_at   TIMESTAMP`,
		`ALTER TABLE data_requests ADD COLUMN IF NOT EXISTS delivered_by   VARCHAR(255)`,
		`ALTER TABLE data_requests ADD COLUMN IF NOT EXISTS delivery_note  TEXT`,
		`ALTER TABLE data_requests ADD COLUMN IF NOT EXISTS analyses_count INT DEFAULT 0`,

		`CREATE TABLE IF NOT EXISTS help_topics (
			id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
			emoji      VARCHAR(10)  NOT NULL DEFAULT '💬',
			title      VARCHAR(100) NOT NULL,
			subtitle   VARCHAR(200) NOT NULL DEFAULT '',
			content    TEXT         NOT NULL DEFAULT '',
			sort_order INT          NOT NULL DEFAULT 0,
			is_active  BOOLEAN      NOT NULL DEFAULT true,
			created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMP    NOT NULL DEFAULT NOW()
		)`,

		`INSERT INTO help_topics (emoji, title, subtitle, content, sort_order) VALUES
			('💬', 'How to use',      'Paste a conversation, get 5 replies',     '1. Paste the conversation\nLabel each message as "Them:" or "You:" so the AI knows who said what.\n\n2. AI analyzes the vibe\nCupid reads the tone, context, and what they really mean.\n\n3. Pick your reply\nGet 5 responses across different styles. Witty, sincere, confident — you choose.\n\n4. Copy and send\nTap Copy on the response you like, paste it into your app, and send.', 1),
			('💳', 'Billing & Plans',  'Subscriptions, upgrades, refunds',        'Free Plan\n3 analyses per day, all 5 response styles included.\n\nMonthly — $14.99/mo\nUnlimited analyses, priority queue, full history.\n\nCancellation\nYou can pause or cancel at any time from Profile > Subscription. No hidden fees.\n\nRefunds\nContact support@cupidai.app within 7 days of purchase for a refund request.', 2),
			('🔧', 'Technical issues', 'App bugs and errors',                     'App not responding\nForce close the app and reopen it. If it persists, reinstall.\n\nAPI key not configured\nThe admin needs to set the Claude API key in the dashboard Settings page.\n\nResponses feel generic\nInclude more conversation context and clearly label Them: and You: messages.\n\nSession expired errors\nSign out from Profile and log back in to reset your session token.\n\nScreenshot import fails\nEnsure the screenshot has clear text. Blurry or small text may not be recognized.', 3),
			('🔒', 'Privacy & Data',   'Your data and account security',          'What we store\nYour analyses, responses, and streak data.\n\nWhat we never do\nSell your data, share with advertisers, or read your conversations for any purpose other than generating responses.\n\nDelete your data\nGo to Profile > Account Settings > Delete Account. All data is removed within 30 days.\n\nGDPR / Data export\nRequest a full export of your data from Profile > Privacy & Data.', 4)
		ON CONFLICT DO NOTHING`,

		`CREATE TABLE IF NOT EXISTS faqs (
			id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
			question   TEXT NOT NULL,
			answer     TEXT NOT NULL,
			category   VARCHAR(50) NOT NULL DEFAULT 'general',
			sort_order INT NOT NULL DEFAULT 0,
			is_active  BOOLEAN NOT NULL DEFAULT true,
			created_at TIMESTAMP NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMP NOT NULL DEFAULT NOW()
		)`,

		`INSERT INTO faqs (question, answer, category, sort_order) VALUES
			('How does the conversation analysis work?', 'Paste a conversation using "Them:" and "You:" labels. The AI reads the full context and generates 5 tailored responses across different styles.', 'usage', 1),
			('What is the difference between the 5 response styles?', 'Witty = clever & playful. Sincere = warm & genuine. Confident = bold & direct. Thoughtful = deep & caring. Casual = relaxed & easy-going.', 'usage', 2),
			('Is my conversation data private?', 'Yes. Your conversations are only used to generate responses and are never sold or shared with third parties.', 'privacy', 3),
			('Why am I limited to 3 analyses per day?', 'Free accounts get 3 analyses per day. Upgrade to Monthly for unlimited analyses with no daily cap.', 'billing', 4),
			('The AI responses do not feel right for my conversation.', 'Include more context, label messages clearly as Them: or You:, and try the Screenshot import to avoid copy-paste errors.', 'usage', 5),
			('How do I cancel or pause my subscription?', 'Go to Profile > Subscription. You can manage, pause, or cancel your plan at any time.', 'billing', 6)
		ON CONFLICT DO NOTHING`,

		`CREATE TABLE IF NOT EXISTS user_notifications (
			id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
			user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			title      VARCHAR(200) NOT NULL,
			body       TEXT NOT NULL,
			type       VARCHAR(50) NOT NULL DEFAULT 'system',
			read       BOOLEAN NOT NULL DEFAULT false,
			created_at TIMESTAMP NOT NULL DEFAULT NOW()
		)`,

		`CREATE TABLE IF NOT EXISTS support_tickets (
			id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
			user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			email      VARCHAR(255) NOT NULL,
			category   VARCHAR(100) NOT NULL,
			message    TEXT NOT NULL,
			status     VARCHAR(20) NOT NULL DEFAULT 'open',
			reply      TEXT,
			created_at TIMESTAMP NOT NULL DEFAULT NOW(),
			updated_at TIMESTAMP NOT NULL DEFAULT NOW()
		)`,

		// Add fcm_token column to existing tables (idempotent)
		`ALTER TABLE users ADD COLUMN IF NOT EXISTS fcm_token TEXT NOT NULL DEFAULT ''`,

		// Email verification codes for sensitive, logged-in actions.
		// purpose ∈ change_password | change_email | delete
		`CREATE TABLE IF NOT EXISTS two_factor_codes (
			id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
			user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
			code         VARCHAR(10) NOT NULL,
			purpose      VARCHAR(30) NOT NULL DEFAULT 'change_password',
			expires_at   TIMESTAMP NOT NULL,
			used         BOOLEAN NOT NULL DEFAULT false,
			attempt_count INT NOT NULL DEFAULT 0,                -- failed verifications against this code
			created_at   TIMESTAMP NOT NULL DEFAULT NOW()
		)`,
		`CREATE INDEX IF NOT EXISTS idx_2fa_codes_user ON two_factor_codes(user_id, used)`,
		`ALTER TABLE two_factor_codes ADD COLUMN IF NOT EXISTS attempt_count INT NOT NULL DEFAULT 0`,

		// Pending sign-ups — registration is held here until the emailed code is
		// verified, at which point the real users row is created.
		`CREATE TABLE IF NOT EXISTS pending_signups (
			email         VARCHAR(255) PRIMARY KEY,
			password_hash TEXT NOT NULL,
			display_name  VARCHAR(100) NOT NULL DEFAULT '',
			code          VARCHAR(10) NOT NULL,
			expires_at    TIMESTAMP NOT NULL,
			created_at    TIMESTAMP NOT NULL DEFAULT NOW()
		)`,

		// Seed default settings if not present
		`INSERT INTO app_settings (key, value) VALUES
			('anthropic_api_key',    ''),
			('fcm_server_key',       ''),
			('free_tier_daily_limit','3'),
			('maintenance_mode',     'false'),
			('app_version',          '1.0.0'),
			('privacy_policy_url',   'https://cupidai.app/privacy'),
			('terms_url',            'https://cupidai.app/terms'),
			('cookie_policy_url',    'https://cupidai.app/cookies'),
			('support_email',        'support@cupidai.app')
		ON CONFLICT (key) DO NOTHING`,
	}

	for _, q := range queries {
		if _, err := db.Exec(q); err != nil {
			log.Fatalf("Migration failed: %v\nQuery: %s", err, q)
		}
	}

	log.Println("Database migrations completed")
}
