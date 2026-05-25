package handlers

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"cupid_ai/backend/internal/config"
	"cupid_ai/backend/internal/repository"
	"cupid_ai/backend/internal/services"
	"cupid_ai/backend/internal/ws"
	_ "gopkg.in/gomail.v2" // ensure gomail is linked
)

type DataRequestHandler struct {
	repo         *repository.DataRequestRepository
	userRepo     *repository.UserRepository
	settingsRepo *repository.SettingsRepository
	notifRepo    *repository.NotificationRepository
	db           *sql.DB
	cfg          *config.Config
}

func NewDataRequestHandler(repo *repository.DataRequestRepository, userRepo *repository.UserRepository, settingsRepo *repository.SettingsRepository, notifRepo *repository.NotificationRepository, db *sql.DB, cfg *config.Config) *DataRequestHandler {
	return &DataRequestHandler{repo: repo, userRepo: userRepo, settingsRepo: settingsRepo, notifRepo: notifRepo, db: db, cfg: cfg}
}

// POST /api/v1/data-requests — user submits a data export or deletion request
func (h *DataRequestHandler) Create(c *gin.Context) {
	userID := c.GetString("user_id")
	var req struct {
		Type string `json:"type"` // "export" | "deletion"
		Note string `json:"note"`
	}
	if err := c.ShouldBindJSON(&req); err != nil || req.Type == "" {
		req.Type = "export"
	}

	user, err := h.userRepo.FindByID(userID)
	if err != nil || user == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "user not found"})
		return
	}

	dr, err := h.repo.Create(userID, user.Email, req.Type, req.Note)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Broadcast to dashboard in real-time
	if payload, err := json.Marshal(map[string]any{"event": "new_data_request", "request": dr}); err == nil {
		go ws.Global.Broadcast(payload)
	}

	c.JSON(http.StatusCreated, gin.H{"message": "request submitted", "id": dr.ID})
}

// GET /api/v1/admin/data-requests
func (h *DataRequestHandler) GetAll(c *gin.Context) {
	requests, err := h.repo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if requests == nil {
		requests = []repository.DataRequest{}
	}
	c.JSON(http.StatusOK, requests)
}

// PATCH /api/v1/admin/data-requests/:id
func (h *DataRequestHandler) UpdateStatus(c *gin.Context) {
	var req struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "status required"})
		return
	}
	if err := h.repo.UpdateStatus(c.Param("id"), req.Status); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "updated"})
}

// GET /api/v1/admin/data-requests/:id/export — generate and return user data as JSON
func (h *DataRequestHandler) GenerateExport(c *gin.Context) {
	requestID := c.Param("id")

	// Get the data request to find the user_id
	all, err := h.repo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var userID string
	for _, r := range all {
		if r.ID == requestID {
			userID = r.UserID
			break
		}
	}
	if userID == "" {
		c.JSON(http.StatusNotFound, gin.H{"error": "request not found"})
		return
	}

	export, err := services.GenerateExport(h.db, userID, requestID)
	if err == nil {
		if s, _ := h.settingsRepo.Get(); s != nil {
			export.SupportEmail = s.SupportEmail
		}
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Record that the export was downloaded (partial audit trail)
	dlNote := fmt.Sprintf("Export downloaded by admin. Contains %d analyses.", len(export.Analyses))
	h.repo.RecordDelivery(requestID, "download", "admin", dlNote, len(export.Analyses))

	// Return as downloadable JSON file
	c.Header("Content-Disposition", `attachment; filename="cupidai_export_`+requestID[:8]+`.json"`)
	c.Header("Content-Type", "application/json")
	c.JSON(http.StatusOK, export)
}

// POST /api/v1/admin/data-requests/:id/send-email — generate and email user data
func (h *DataRequestHandler) SendExportEmail(c *gin.Context) {
	requestID := c.Param("id")

	all, err := h.repo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var userID, email string
	for _, r := range all {
		if r.ID == requestID {
			userID = r.UserID
			email  = r.Email
			break
		}
	}
	if userID == "" {
		c.JSON(http.StatusNotFound, gin.H{"error": "request not found"})
		return
	}

	export, err := services.GenerateExport(h.db, userID, requestID)
	if err == nil {
		if s, _ := h.settingsRepo.Get(); s != nil {
			export.SupportEmail = s.SupportEmail
		}
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Get display name for email
	user, _ := h.userRepo.FindByID(userID)
	name := email
	if user != nil && user.DisplayName != "" {
		name = user.DisplayName
	}

	// Read SMTP from DB (set via dashboard) — fall back to config/.env values
	dbSettings, _ := h.settingsRepo.Get()
	smtpHost := dbSettings.SMTPHost
	smtpPort := dbSettings.SMTPPort
	smtpUser := dbSettings.SMTPUser
	smtpFrom := dbSettings.SMTPFrom
	smtpPass, _ := h.settingsRepo.GetSMTPPassword()

	// Fall back to .env if DB has no value
	if smtpHost == "" { smtpHost = h.cfg.SMTPHost }
	if smtpPort == 0  { smtpPort = h.cfg.SMTPPort }
	if smtpUser == "" { smtpUser = h.cfg.SMTPUser }
	if smtpFrom == "" { smtpFrom = h.cfg.SMTPFrom }
	if smtpPass == "" { smtpPass = h.cfg.SMTPPassword }

	if err := services.SendDataExportEmail(
		smtpHost, smtpPort, smtpUser, smtpPass, smtpFrom,
		email, name, export,
	); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "email failed: " + err.Error()})
		return
	}

	// Record delivery with full audit trail
	note := fmt.Sprintf("PDF export emailed. Contained %d analyses, %d notifications, %d support tickets.",
		len(export.Analyses), len(export.Notifications), len(export.SupportTickets))
	h.repo.RecordDelivery(requestID, "email", smtpUser, note, len(export.Analyses))

	// In-app notification (bell icon) + FCM push (device notification bar)
	notifTitle := "Your data export is ready"
	notifBody  := fmt.Sprintf(
		"Your data export has been sent to %s as a PDF. It contains %d analyses, %d notifications and %d support tickets.",
		email, len(export.Analyses), len(export.Notifications), len(export.SupportTickets),
	)

	if h.notifRepo != nil {
		go h.notifRepo.Create(userID, notifTitle, notifBody, "data_export")
	}

	// FCM push — shows on device notification bar even when app is closed
	go func() {
		fcmToken, err := h.userRepo.GetFCMToken(userID)
		if err == nil && fcmToken != "" {
			fcmKey, _ := h.settingsRepo.GetFCMKey()
			services.SendPush(fcmKey, fcmToken, notifTitle, notifBody)
		}
	}()

	c.JSON(http.StatusOK, gin.H{
		"message":    "Data export sent to " + email,
		"analyses":   len(export.Analyses),
		"request_id": requestID,
	})
}
