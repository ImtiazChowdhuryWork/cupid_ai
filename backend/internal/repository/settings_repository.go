package repository

import (
	"database/sql"
	"strconv"
	"time"

	"cupid_ai/backend/internal/models"
)


type SettingsRepository struct {
	db *sql.DB
}

func NewSettingsRepository(db *sql.DB) *SettingsRepository {
	return &SettingsRepository{db: db}
}

func (r *SettingsRepository) Get() (*models.AppSettings, error) {
	rows, err := r.db.Query(`SELECT key, value FROM app_settings`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	kv := make(map[string]string)
	for rows.Next() {
		var k, v string
		if err := rows.Scan(&k, &v); err != nil {
			return nil, err
		}
		kv[k] = v
	}

	limit, _ := strconv.Atoi(kv["free_tier_daily_limit"])
	if limit == 0 {
		limit = 3
	}

	privacyURL := kv["privacy_policy_url"]
	if privacyURL == "" { privacyURL = "https://cupidai.app/privacy" }
	termsURL := kv["terms_url"]
	if termsURL == "" { termsURL = "https://cupidai.app/terms" }
	cookieURL := kv["cookie_policy_url"]
	if cookieURL == "" { cookieURL = "https://cupidai.app/cookies" }

	smtpHost := kv["smtp_host"]
	if smtpHost == "" { smtpHost = "smtp.gmail.com" }
	smtpPort, _ := strconv.Atoi(kv["smtp_port"])
	if smtpPort == 0 { smtpPort = 587 }
	smtpFrom := kv["smtp_from"]
	if smtpFrom == "" { smtpFrom = "noreply@cupidai.app" }

	supportEmail := kv["support_email"]
	if supportEmail == "" { supportEmail = "support@cupidai.app" }

	supportWhatsApp := kv["support_whatsapp"] // empty = WhatsApp option hidden in app

	return &models.AppSettings{
		AnthropicAPIKey:    kv["anthropic_api_key"],
		FreeTierDailyLimit: limit,
		MaintenanceMode:    kv["maintenance_mode"] == "true",
		AppVersion:         kv["app_version"],
		PrivacyPolicyURL:   privacyURL,
		TermsURL:           termsURL,
		CookiePolicyURL:    cookieURL,
		SMTPHost:           smtpHost,
		SMTPPort:           smtpPort,
		SMTPUser:           kv["smtp_user"],
		SMTPPassword:       kv["smtp_password"],
		SMTPFrom:           smtpFrom,
		SupportEmail:       supportEmail,
		SupportWhatsApp:    supportWhatsApp,
	}, nil
}

func (r *SettingsRepository) GetSMTPPassword() (string, error) {
	var val string
	err := r.db.QueryRow(`SELECT value FROM app_settings WHERE key = 'smtp_password'`).Scan(&val)
	if err == sql.ErrNoRows { return "", nil }
	return val, err
}

func (r *SettingsRepository) Set(key, value string) error {
	_, err := r.db.Exec(`
		INSERT INTO app_settings (key, value, updated_at)
		VALUES ($1, $2, $3)
		ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = $3
	`, key, value, time.Now())
	return err
}

// GetAPIKey is called on every analyze request — returns the stored Claude key.
func (r *SettingsRepository) GetAPIKey() (string, error) {
	var key string
	err := r.db.QueryRow(`SELECT value FROM app_settings WHERE key = 'anthropic_api_key'`).Scan(&key)
	return key, err
}

func (r *SettingsRepository) GetFCMKey() (string, error) {
	var key string
	err := r.db.QueryRow(`SELECT value FROM app_settings WHERE key = 'fcm_server_key'`).Scan(&key)
	return key, err
}

func (r *SettingsRepository) SetFCMKey(value string) error {
	return r.Set("fcm_server_key", value)
}
