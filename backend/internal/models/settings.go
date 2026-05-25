package models

type AppSettings struct {
	AnthropicAPIKey    string `json:"anthropic_api_key"`
	FreeTierDailyLimit int    `json:"free_tier_daily_limit"`
	MaintenanceMode    bool   `json:"maintenance_mode"`
	AppVersion         string `json:"app_version"`
	PrivacyPolicyURL   string `json:"privacy_policy_url"`
	TermsURL           string `json:"terms_url"`
	CookiePolicyURL    string `json:"cookie_policy_url"`
	SMTPHost           string `json:"smtp_host"`
	SMTPPort           int    `json:"smtp_port"`
	SMTPUser           string `json:"smtp_user"`
	SMTPPassword       string `json:"-"` // never serialised
	SMTPFrom           string `json:"smtp_from"`
	SupportEmail       string `json:"support_email"`
	SupportWhatsApp    string `json:"support_whatsapp"`
}

type UpdateSettingsRequest struct {
	AnthropicAPIKey    *string `json:"anthropic_api_key"`
	FreeTierDailyLimit *int    `json:"free_tier_daily_limit"`
	MaintenanceMode    *bool   `json:"maintenance_mode"`
	PrivacyPolicyURL   *string `json:"privacy_policy_url"`
	TermsURL           *string `json:"terms_url"`
	CookiePolicyURL    *string `json:"cookie_policy_url"`
}
