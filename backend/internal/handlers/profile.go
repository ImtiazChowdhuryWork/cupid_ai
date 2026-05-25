package handlers

import (
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"

	"cupid_ai/backend/internal/config"
	"cupid_ai/backend/internal/models"
	"cupid_ai/backend/internal/repository"
	"cupid_ai/backend/internal/services"
)

type ProfileHandler struct {
	userRepo         *repository.UserRepository
	analysisRepo     *repository.AnalysisRepository
	twoFactorRepo    *repository.TwoFactorRepository
	refreshTokenRepo *repository.RefreshTokenRepository
	settingsRepo     *repository.SettingsRepository
	cfg              *config.Config
}

func NewProfileHandler(
	userRepo *repository.UserRepository,
	analysisRepo *repository.AnalysisRepository,
	twoFactorRepo *repository.TwoFactorRepository,
	refreshTokenRepo *repository.RefreshTokenRepository,
	settingsRepo *repository.SettingsRepository,
	cfg *config.Config,
) *ProfileHandler {
	return &ProfileHandler{
		userRepo:         userRepo,
		analysisRepo:     analysisRepo,
		twoFactorRepo:    twoFactorRepo,
		refreshTokenRepo: refreshTokenRepo,
		settingsRepo:     settingsRepo,
		cfg:              cfg,
	}
}

func (h *ProfileHandler) GetProfile(c *gin.Context) {
	userID := c.GetString("user_id")

	user, err := h.userRepo.FindByID(userID)
	if err != nil || user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	totalAnalyses, _ := h.analysisRepo.GetTotalCount(userID)
	dailyUsed, _ := h.analysisRepo.GetDailyUsage(userID)
	currentStreak, bestStreak, _ := h.analysisRepo.GetStreak(userID)

	dailyLimit := models.FreeTierDailyLimit
	if user.SubscriptionTier != "free" {
		dailyLimit = 999
	}

	c.JSON(http.StatusOK, gin.H{
		"id":                   user.ID,
		"email":                user.Email,
		"display_name":         user.DisplayName,
		"subscription_tier":    user.SubscriptionTier,
		"total_analyses":       totalAnalyses,
		"daily_analyses_used":  dailyUsed,
		"daily_analyses_limit": dailyLimit,
		"current_streak":       currentStreak,
		"best_streak":          bestStreak,
		"created_at":           user.CreatedAt,
	})
}

func (h *ProfileHandler) UpdateProfile(c *gin.Context) {
	userID := c.GetString("user_id")

	var req struct {
		DisplayName string `json:"display_name" binding:"required,min=2,max=100"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.userRepo.UpdateDisplayName(userID, req.DisplayName); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "profile updated"})
}

// POST /api/v1/profile/change-password
// Requires the current password AND a fresh emailed verification code.
// Google-signup accounts are rejected — they manage credentials via Google.
func (h *ProfileHandler) ChangePassword(c *gin.Context) {
	userID := c.GetString("user_id")

	var req struct {
		CurrentPassword     string `json:"current_password" binding:"required"`
		NewPassword         string `json:"new_password"     binding:"required,min=8"`
		Code                string `json:"code"`
		CurrentRefreshToken string `json:"current_refresh_token"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Both current and new passwords are required (new must be 8+ chars)"})
		return
	}

	currentHash, err := h.userRepo.GetPasswordHash(userID)
	if err != nil || currentHash == "" {
		c.JSON(http.StatusNotFound, gin.H{"error": "Account not found"})
		return
	}
	if strings.HasPrefix(currentHash, "google:") {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "This account uses Google Sign-In. Manage your password from your Google account.",
		})
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(currentHash), []byte(req.CurrentPassword)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Current password is incorrect"})
		return
	}

	// Step-up: a fresh emailed code is required to change the password.
	if req.Code == "" {
		c.JSON(http.StatusForbidden, gin.H{
			"error":         "Verification code required",
			"requires_code": true,
		})
		return
	}
	if err := h.twoFactorRepo.VerifyAndConsume(userID, req.Code, "change_password"); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired verification code"})
		return
	}

	newHash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not hash new password"})
		return
	}
	if err := h.userRepo.UpdatePassword(userID, string(newHash)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Sign out other sessions; keep the device that made the change.
	if req.CurrentRefreshToken != "" {
		_ = h.refreshTokenRepo.RevokeAllForUserExcept(userID, req.CurrentRefreshToken)
	} else {
		_ = h.refreshTokenRepo.RevokeAllForUser(userID)
	}

	c.JSON(http.StatusOK, gin.H{
		"message":          "Password updated successfully",
		"sessions_revoked": true,
	})
}

// ── Helper: pulls SMTP settings from DB (set via dashboard), .env fallback ─
func (h *ProfileHandler) smtpConfig() (host string, port int, user, pass, from string) {
	if s, err := h.settingsRepo.Get(); err == nil && s != nil {
		host = s.SMTPHost
		port = s.SMTPPort
		user = s.SMTPUser
		from = s.SMTPFrom
	}
	if pwd, err := h.settingsRepo.GetSMTPPassword(); err == nil {
		pass = pwd
	}
	if host == "" { host = h.cfg.SMTPHost }
	if port == 0  { port = h.cfg.SMTPPort }
	if user == "" { user = h.cfg.SMTPUser }
	if from == "" { from = h.cfg.SMTPFrom }
	if pass == "" { pass = h.cfg.SMTPPassword }
	return
}

// POST /api/v1/profile/change-email
// Requires the current password AND a fresh emailed verification code.
func (h *ProfileHandler) ChangeEmail(c *gin.Context) {
	userID := c.GetString("user_id")

	var req struct {
		CurrentPassword string `json:"current_password" binding:"required"`
		NewEmail        string `json:"new_email"        binding:"required,email"`
		Code            string `json:"code"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Current password and a valid new email are required"})
		return
	}

	newEmail := strings.ToLower(strings.TrimSpace(req.NewEmail))

	currentHash, err := h.userRepo.GetPasswordHash(userID)
	if err != nil || currentHash == "" {
		c.JSON(http.StatusNotFound, gin.H{"error": "Account not found"})
		return
	}
	if strings.HasPrefix(currentHash, "google:") {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "This account uses Google Sign-In. Change your email in your Google account.",
		})
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(currentHash), []byte(req.CurrentPassword)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Current password is incorrect"})
		return
	}

	existing, _ := h.userRepo.FindByEmail(newEmail)
	if existing != nil && existing.ID != userID {
		c.JSON(http.StatusConflict, gin.H{"error": "That email is already in use by another account"})
		return
	}
	current, _ := h.userRepo.FindByID(userID)
	if current != nil && strings.EqualFold(current.Email, newEmail) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "New email is the same as your current email"})
		return
	}

	// Step-up: a fresh emailed code is required. Checked last so the code is
	// only consumed once all other validation passes.
	if req.Code == "" {
		c.JSON(http.StatusForbidden, gin.H{
			"error":         "Verification code required",
			"requires_code": true,
		})
		return
	}
	if err := h.twoFactorRepo.VerifyAndConsume(userID, req.Code, "change_email"); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired verification code"})
		return
	}

	if err := h.userRepo.UpdateEmail(userID, newEmail); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Email updated successfully",
		"email":   newEmail,
	})
}

// POST /api/v1/profile/send-code
// Emails a 6-digit code for a sensitive action.
// Body: { "purpose": "change_password" | "change_email" | "delete" }
func (h *ProfileHandler) SendActionCode(c *gin.Context) {
	userID := c.GetString("user_id")

	var req struct {
		Purpose string `json:"purpose"`
	}
	c.ShouldBindJSON(&req)

	labels := map[string]string{
		"change_password": "Change Password",
		"change_email":    "Change Email",
		"delete":          "Delete Account",
	}
	label, ok := labels[req.Purpose]
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Unsupported verification purpose"})
		return
	}

	user, err := h.userRepo.FindByID(userID)
	if err != nil || user == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Account not found"})
		return
	}

	// Google accounts can't change password/email here (managed by Google), but
	// they CAN delete their account — so only block the credential purposes.
	currentHash, _ := h.userRepo.GetPasswordHash(userID)
	if strings.HasPrefix(currentHash, "google:") && req.Purpose != "delete" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Google accounts manage security at myaccount.google.com",
		})
		return
	}

	if issued, _ := h.twoFactorRepo.CodesIssuedRecently(userID); issued >= repository.MaxCodesPerHour {
		c.JSON(http.StatusTooManyRequests, gin.H{
			"error": "Too many code requests. Please wait an hour and try again.",
		})
		return
	}

	code, err := h.twoFactorRepo.GenerateCode(userID, req.Purpose)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate code"})
		return
	}

	if h.cfg.LogCodes {
		log.Printf("[DEV] %s code for %s: %s", req.Purpose, user.Email, code)
	}

	host, port, smtpUser, pass, from := h.smtpConfig()
	sendErr := services.SendTwoFactorCode(host, port, smtpUser, pass, from, user.Email, user.DisplayName, code, label)
	if sendErr != nil && !h.cfg.LogCodes {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not send code: " + sendErr.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":            "Verification code sent to " + user.Email,
		"expires_in_minutes": 10,
	})
}

// PATCH /api/v1/profile/fcm-token — Flutter sends device token after login
func (h *ProfileHandler) UpdateFCMToken(c *gin.Context) {
	userID := c.GetString("user_id")
	var req struct {
		FCMToken string `json:"fcm_token" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "fcm_token required"})
		return
	}
	if err := h.userRepo.UpdateFCMToken(userID, req.FCMToken); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "token registered"})
}
