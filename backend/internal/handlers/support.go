package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"cupid_ai/backend/internal/repository"
	"cupid_ai/backend/internal/services"
	"cupid_ai/backend/internal/ws"
)

type SupportHandler struct {
	repo         *repository.SupportRepository
	userRepo     *repository.UserRepository
	notifRepo    *repository.NotificationRepository
	settingsRepo *repository.SettingsRepository
}

func NewSupportHandler(
	repo *repository.SupportRepository,
	userRepo *repository.UserRepository,
	notifRepo *repository.NotificationRepository,
	settingsRepo *repository.SettingsRepository,
) *SupportHandler {
	return &SupportHandler{repo: repo, userRepo: userRepo, notifRepo: notifRepo, settingsRepo: settingsRepo}
}

// POST /api/v1/support/contact — authenticated user submits a message
func (h *SupportHandler) SubmitTicket(c *gin.Context) {
	userID := c.GetString("user_id")

	var req struct {
		Category string `json:"category" binding:"required"`
		Message  string `json:"message"  binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "category and message are required"})
		return
	}

	user, err := h.userRepo.FindByID(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not fetch user"})
		return
	}

	ticket, err := h.repo.Create(userID, user.Email, req.Category, req.Message)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Push new ticket to all connected dashboard clients in real-time
	if payload, err := json.Marshal(map[string]any{"event": "new_ticket", "ticket": ticket}); err == nil {
		go ws.Global.Broadcast(payload)
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Support ticket submitted. We'll reply within 24 hours.",
		"id":      ticket.ID,
	})
}

// GET /api/v1/admin/support/tickets — admin sees all tickets
func (h *SupportHandler) GetAllTickets(c *gin.Context) {
	tickets, err := h.repo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if tickets == nil {
		tickets = []repository.SupportTicket{}
	}
	c.JSON(http.StatusOK, tickets)
}

// PATCH /api/v1/admin/support/tickets/:id — admin updates status + optional reply
func (h *SupportHandler) UpdateTicket(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Status string `json:"status"`
		Reply  string `json:"reply"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	// Fetch ticket before updating so we have the user_id
	ticket, err := h.repo.GetByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "ticket not found"})
		return
	}

	if err := h.repo.UpdateStatus(id, req.Status, req.Reply); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// If admin sent a reply — create in-app notification + FCM push
	if req.Reply != "" {
		title := "💬 Reply from Cupid AI Support"
		body  := req.Reply
		if req.Status == "resolved" {
			title = "✅ Your support request is resolved"
		}

		// In-app notification (shown in bell icon)
		if h.notifRepo != nil {
			go h.notifRepo.Create(ticket.UserID, title, body, "support_reply") //nolint
		}

		// FCM push notification (shown even if app is closed)
		// Key is read from app_settings — managed via the dashboard Settings page
		go func() {
			fcmToken, err := h.userRepo.GetFCMToken(ticket.UserID)
			if err != nil {
				log.Printf("FCM: error getting token for user %s: %v", ticket.UserID, err)
				return
			}
			if fcmToken == "" {
				log.Printf("FCM: no token for user %s — did the app register after login?", ticket.UserID)
				return
			}
			log.Printf("FCM: found token for user %s, sending push…", ticket.UserID)
			fcmKey, _ := h.settingsRepo.GetFCMKey()
			services.SendPush(fcmKey, fcmToken, title, body) //nolint
		}()
	}

	c.JSON(http.StatusOK, gin.H{"message": "ticket updated"})
}
