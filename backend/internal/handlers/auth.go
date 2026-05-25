package handlers

import (
	"context"
	"errors"
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	firebase "firebase.google.com/go/v4"
	"golang.org/x/crypto/bcrypt"
	"google.golang.org/api/option"

	"cupid_ai/backend/internal/config"
	"cupid_ai/backend/internal/models"
	"cupid_ai/backend/internal/repository"
	"cupid_ai/backend/internal/services"
)

// friendlyValidationError converts go-playground/validator errors into
// short, user-facing messages instead of leaking field-tag jargon.
func friendlyValidationError(err error, _ string) string {
	var ve validator.ValidationErrors
	if !errors.As(err, &ve) {
		return err.Error()
	}
	if len(ve) == 0 {
		return "Invalid request"
	}
	f := ve[0]
	field := strings.ToLower(f.Field())
	switch f.Tag() {
	case "required":
		return capitaliseFirst(field) + " is required"
	case "email":
		return "Please enter a valid email address"
	case "min":
		return capitaliseFirst(field) + " must be at least " + f.Param() + " characters"
	case "max":
		return capitaliseFirst(field) + " must be at most " + f.Param() + " characters"
	}
	return "Invalid " + field
}

func capitaliseFirst(s string) string {
	if s == "" {
		return s
	}
	return strings.ToUpper(s[:1]) + s[1:]
}

type AuthHandler struct {
	authService      *services.AuthService
	refreshTokenRepo *repository.RefreshTokenRepository
	userRepo         *repository.UserRepository
	twoFactorRepo    *repository.TwoFactorRepository
	pendingRepo      *repository.PendingSignupRepository
	settingsRepo     *repository.SettingsRepository
	cfg              *config.Config
}

func NewAuthHandler(
	authService *services.AuthService,
	refreshTokenRepo *repository.RefreshTokenRepository,
	userRepo *repository.UserRepository,
	twoFactorRepo *repository.TwoFactorRepository,
	pendingRepo *repository.PendingSignupRepository,
	settingsRepo *repository.SettingsRepository,
	cfg *config.Config,
) *AuthHandler {
	return &AuthHandler{
		authService:      authService,
		refreshTokenRepo: refreshTokenRepo,
		userRepo:         userRepo,
		twoFactorRepo:    twoFactorRepo,
		pendingRepo:      pendingRepo,
		settingsRepo:     settingsRepo,
		cfg:              cfg,
	}
}

// Register does NOT create the account yet — it holds the sign-up and emails a
// verification code. The account is created once /auth/register/verify succeeds.
func (h *AuthHandler) Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": friendlyValidationError(err, "register")})
		return
	}

	email := strings.ToLower(strings.TrimSpace(req.Email))

	existing, _ := h.userRepo.FindByEmail(email)
	if existing != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "An account with this email already exists"})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not process password"})
		return
	}

	code, err := h.pendingRepo.CreateCode(email, string(hash), req.DisplayName)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not start sign-up"})
		return
	}

	sendErr := h.sendVerificationEmail(email, req.DisplayName, code, "Verify your email")
	if h.cfg.LogCodes {
		log.Printf("[DEV] signup verification code for %s: %s", email, code)
	}
	if sendErr != nil && !h.cfg.LogCodes {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not send verification code: " + sendErr.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "Verification code sent to " + email,
		"email":      email,
		"email_hint": maskEmail(email),
	})
}

// VerifyRegistration confirms the emailed code, creates the user, and logs them in.
func (h *AuthHandler) VerifyRegistration(c *gin.Context) {
	var req struct {
		Email string `json:"email" binding:"required,email"`
		Code  string `json:"code"  binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email and the verification code are required"})
		return
	}
	email := strings.ToLower(strings.TrimSpace(req.Email))

	hash, displayName, err := h.pendingRepo.Verify(email, strings.TrimSpace(req.Code))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired code"})
		return
	}

	user, err := h.userRepo.Create(email, hash, displayName)
	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "An account with this email already exists"})
		return
	}
	_ = h.pendingRepo.Delete(email)

	resp, err := h.authService.IssueTokens(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not issue tokens"})
		return
	}
	h.refreshTokenRepo.Save(resp.User.ID, resp.RefreshToken)

	c.JSON(http.StatusCreated, resp)
}

// ResendRegistration re-issues a sign-up code for a pending email.
func (h *AuthHandler) ResendRegistration(c *gin.Context) {
	var req struct {
		Email string `json:"email" binding:"required,email"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email is required"})
		return
	}
	email := strings.ToLower(strings.TrimSpace(req.Email))

	if secs := h.pendingRepo.SecondsSinceLastRequest(email); secs >= 0 && secs < 30 {
		c.JSON(http.StatusTooManyRequests, gin.H{"error": "Please wait a moment before requesting another code"})
		return
	}

	code, err := h.pendingRepo.ResendCode(email)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Start sign-up again — this request has expired"})
		return
	}
	if h.cfg.LogCodes {
		log.Printf("[DEV] signup verification code for %s: %s", email, code)
	}
	go h.sendVerificationEmail(email, "", code, "Verify your email")

	c.JSON(http.StatusOK, gin.H{"message": "Code resent to " + maskEmail(email)})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": friendlyValidationError(err, "login")})
		return
	}

	resp, err := h.authService.Login(&req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	h.refreshTokenRepo.Save(resp.User.ID, resp.RefreshToken)
	c.JSON(http.StatusOK, resp)
}

// ForgotPassword emails a reset code if the account exists. The response is
// intentionally uniform so it can't be used to discover which emails are
// registered. Google accounts never get a code (they have no password).
func (h *AuthHandler) ForgotPassword(c *gin.Context) {
	var req struct {
		Email string `json:"email" binding:"required,email"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "A valid email is required"})
		return
	}
	email := strings.ToLower(strings.TrimSpace(req.Email))

	if user, _ := h.userRepo.FindByEmail(email); user != nil {
		hash, _ := h.userRepo.GetPasswordHash(user.ID)
		if !strings.HasPrefix(hash, "google:") {
			if issued, _ := h.twoFactorRepo.CodesIssuedRecently(user.ID); issued < repository.MaxCodesPerHour {
				if code, err := h.twoFactorRepo.GenerateCode(user.ID, "reset_password"); err == nil {
					if h.cfg.LogCodes {
						log.Printf("[DEV] password reset code for %s: %s", user.Email, code)
					}
					go h.sendVerificationEmail(user.Email, user.DisplayName, code, "Reset your password")
				}
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "If an account exists for that email, we've sent a reset code.",
	})
}

// ResetPassword verifies the emailed code and sets a new password, then revokes
// all existing sessions so a possibly-compromised account is fully reset.
func (h *AuthHandler) ResetPassword(c *gin.Context) {
	var req struct {
		Email       string `json:"email"        binding:"required,email"`
		Code        string `json:"code"         binding:"required"`
		NewPassword string `json:"new_password" binding:"required,min=8"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email, code, and a new password (8+ chars) are required"})
		return
	}
	email := strings.ToLower(strings.TrimSpace(req.Email))

	user, _ := h.userRepo.FindByEmail(email)
	if user == nil {
		// No account / no code was ever issued — uniform failure, no enumeration.
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired code"})
		return
	}

	if err := h.twoFactorRepo.VerifyAndConsume(user.ID, strings.TrimSpace(req.Code), "reset_password"); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired code"})
		return
	}

	newHash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not process new password"})
		return
	}
	if err := h.userRepo.UpdatePassword(user.ID, string(newHash)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not update password"})
		return
	}
	_ = h.refreshTokenRepo.RevokeAllForUser(user.ID)

	c.JSON(http.StatusOK, gin.H{"message": "Password reset successfully. Please log in."})
}

// ── Email helpers ───────────────────────────────────────────────────────

func (h *AuthHandler) sendVerificationEmail(toEmail, toName, code, purposeLabel string) error {
	host, port, user, pass, from := h.smtpConfig()
	return services.SendTwoFactorCode(host, port, user, pass, from, toEmail, toName, code, purposeLabel)
}

func (h *AuthHandler) smtpConfig() (host string, port int, user, pass, from string) {
	if s, _ := h.settingsRepo.Get(); s != nil {
		host, port, user, from = s.SMTPHost, s.SMTPPort, s.SMTPUser, s.SMTPFrom
	}
	if pwd, _ := h.settingsRepo.GetSMTPPassword(); pwd != "" {
		pass = pwd
	}
	if host == "" { host = h.cfg.SMTPHost }
	if port == 0  { port = h.cfg.SMTPPort }
	if user == "" { user = h.cfg.SMTPUser }
	if from == "" { from = h.cfg.SMTPFrom }
	if pass == "" { pass = h.cfg.SMTPPassword }
	return
}

// maskEmail turns "alice@example.com" → "a***e@example.com" for safe display.
func maskEmail(e string) string {
	at := strings.IndexByte(e, '@')
	if at <= 1 {
		return e
	}
	local := e[:at]
	domain := e[at:]
	if len(local) <= 2 {
		return string(local[0]) + "***" + domain
	}
	return string(local[0]) + strings.Repeat("*", len(local)-2) + string(local[len(local)-1]) + domain
}

// Refresh issues a new access token given a valid refresh token.
func (h *AuthHandler) Refresh(c *gin.Context) {
	var req struct {
		RefreshToken string `json:"refresh_token" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "refresh_token is required"})
		return
	}

	newAccessToken, err := h.authService.RefreshAccessToken(req.RefreshToken, h.refreshTokenRepo)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired refresh token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"access_token": newAccessToken,
		"expires_in":   900, // 15 minutes in seconds
	})
}

// GoogleSignIn verifies a Firebase ID token from Google Sign-In
// and creates/logs in the user, returning a JWT.
func (h *AuthHandler) GoogleSignIn(c *gin.Context) {
	var req struct {
		FirebaseToken string `json:"firebase_token" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "firebase_token is required"})
		return
	}

	opt := option.WithCredentialsFile("firebase-service-account.json")
	app, err := firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "firebase init failed"})
		return
	}
	authClient, err := app.Auth(context.Background())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "firebase auth failed"})
		return
	}
	token, err := authClient.VerifyIDToken(context.Background(), req.FirebaseToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired Google token"})
		return
	}

	email, _ := token.Claims["email"].(string)
	displayName, _ := token.Claims["name"].(string)
	if email == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email not found in token"})
		return
	}

	user, err := h.userRepo.FindByEmail(email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error"})
		return
	}
	if user == nil {
		// New Google user — password field stores "google:{uid}", never used for comparison.
		user, err = h.userRepo.Create(email, "google:"+token.UID, strings.TrimSpace(displayName))
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create user"})
			return
		}
	}

	resp, err := h.authService.IssueTokens(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not issue token"})
		return
	}

	h.refreshTokenRepo.Save(resp.User.ID, resp.RefreshToken)
	c.JSON(http.StatusOK, resp)
}

// DeleteAccount permanently deletes the authenticated user and all their data.
// Requires a fresh emailed verification code.
func (h *AuthHandler) DeleteAccount(c *gin.Context) {
	userID := c.GetString("user_id")

	var req struct {
		Code string `json:"code"`
	}
	c.ShouldBindJSON(&req)

	if req.Code == "" {
		c.JSON(http.StatusForbidden, gin.H{
			"error":         "Verification code required",
			"requires_code": true,
		})
		return
	}
	if err := h.twoFactorRepo.VerifyAndConsume(userID, req.Code, "delete"); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired verification code"})
		return
	}

	if err := h.userRepo.Delete(userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not delete account"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "account deleted"})
}

// Logout revokes the refresh token.
func (h *AuthHandler) Logout(c *gin.Context) {
	var req struct {
		RefreshToken string `json:"refresh_token"`
	}
	c.ShouldBindJSON(&req)

	if req.RefreshToken != "" {
		h.refreshTokenRepo.Revoke(req.RefreshToken)
	}

	c.JSON(http.StatusOK, gin.H{"message": "logged out"})
}
