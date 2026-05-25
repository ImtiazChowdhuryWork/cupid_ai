package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gopkg.in/gomail.v2"
	"cupid_ai/backend/internal/repository"
)

type SettingsHandler struct {
	repo         *repository.SettingsRepository
	aiServiceURL string
}

func NewSettingsHandler(repo *repository.SettingsRepository, aiServiceURL string) *SettingsHandler {
	return &SettingsHandler{repo: repo, aiServiceURL: aiServiceURL}
}

func (h *SettingsHandler) GetSettings(c *gin.Context) {
	settings, err := h.repo.Get()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Never expose the actual API key in full — mask it for security
	masked := settings.AnthropicAPIKey
	if len(masked) > 8 {
		masked = masked[:8] + "••••••••••••••••••••"
	}

	smtpConfigured := settings.SMTPUser != "" && settings.SMTPPassword != ""

	c.JSON(http.StatusOK, gin.H{
		"anthropic_api_key":     masked,
		"api_key_configured":    settings.AnthropicAPIKey != "",
		"free_tier_daily_limit": settings.FreeTierDailyLimit,
		"maintenance_mode":      settings.MaintenanceMode,
		"app_version":           settings.AppVersion,
		"privacy_policy_url":    settings.PrivacyPolicyURL,
		"terms_url":             settings.TermsURL,
		"cookie_policy_url":     settings.CookiePolicyURL,
		"smtp_host":             settings.SMTPHost,
		"smtp_port":             settings.SMTPPort,
		"smtp_user":             settings.SMTPUser,
		"smtp_from":             settings.SMTPFrom,
		"smtp_configured":       smtpConfigured,
		"support_email":         settings.SupportEmail,
		"support_whatsapp":      settings.SupportWhatsApp,
		// never expose password
	})
}

func (h *SettingsHandler) UpdateSettings(c *gin.Context) {
	var body map[string]interface{}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	for key, val := range body {
		switch key {
		case "anthropic_api_key", "app_version", "privacy_policy_url", "terms_url", "cookie_policy_url",
			"smtp_host", "smtp_port", "smtp_user", "smtp_password", "smtp_from", "support_email", "support_whatsapp":
			if s, ok := val.(string); ok {
				if err := h.repo.Set(key, s); err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
					return
				}
			}
		case "free_tier_daily_limit":
			if f, ok := val.(float64); ok {
				if err := h.repo.Set(key, strconv.Itoa(int(f))); err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
					return
				}
			}
		case "maintenance_mode":
			if b, ok := val.(bool); ok {
				v := "false"
				if b {
					v = "true"
				}
				if err := h.repo.Set(key, v); err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
					return
				}
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "settings updated"})
}

// VerifyMail tests SMTP credentials without sending an actual email.
func (h *SettingsHandler) VerifyMail(c *gin.Context) {
	var req struct {
		User     string `json:"smtp_user"`
		Password string `json:"smtp_password"`
		Host     string `json:"smtp_host"`
		Port     int    `json:"smtp_port"`
	}
	c.ShouldBindJSON(&req)

	// Fall back to stored settings if not provided
	if req.User == "" || req.Password == "" {
		s, _ := h.repo.Get()
		if req.User == "" {
			req.User = s.SMTPUser
		}
		if req.Password == "" {
			// Get raw password from DB
			raw, _ := h.repo.GetSMTPPassword()
			req.Password = raw
		}
		if req.Host == "" {
			req.Host = s.SMTPHost
		}
		if req.Port == 0 {
			req.Port = s.SMTPPort
		}
	}

	if req.User == "" || req.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"valid": false, "error": "SMTP credentials not configured"})
		return
	}

	d := gomail.NewDialer(req.Host, req.Port, req.User, req.Password)
	sc, err := d.Dial()
	if err != nil {
		c.JSON(http.StatusOK, gin.H{"valid": false, "error": err.Error()})
		return
	}
	sc.Close()
	c.JSON(http.StatusOK, gin.H{"valid": true, "message": "SMTP connection successful", "account": req.User})
}

// TestAPIKey actually calls Claude via the AI service to verify the key works.
func (h *SettingsHandler) TestAPIKey(c *gin.Context) {
	key, err := h.repo.GetAPIKey()
	if err != nil || key == "" {
		c.JSON(http.StatusBadRequest, gin.H{"valid": false, "error": "No API key configured. Save a key first."})
		return
	}

	// Forward to AI service real test endpoint
	req, err := http.NewRequest(http.MethodPost, h.aiServiceURL+"/test-key", nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"valid": false, "error": "Could not reach AI service"})
		return
	}
	req.Header.Set("X-Anthropic-Key", key)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"valid": false, "error": "AI service unreachable"})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusOK {
		c.JSON(http.StatusOK, gin.H{"valid": true, "message": "API key is valid and working with Claude"})
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"valid": false, "error": "API key is invalid or expired"})
	}
}
