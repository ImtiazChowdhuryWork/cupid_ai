package handlers

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"

	"cupid_ai/backend/internal/models"
	"cupid_ai/backend/internal/repository"
	"cupid_ai/backend/internal/services"
)

type AnalysisHandler struct {
	analysisService *services.AnalysisService
	userRepo        *repository.UserRepository
}

func NewAnalysisHandler(analysisService *services.AnalysisService, userRepo *repository.UserRepository) *AnalysisHandler {
	return &AnalysisHandler{analysisService: analysisService, userRepo: userRepo}
}

func (h *AnalysisHandler) Analyze(c *gin.Context) {
	userID := c.GetString("user_id")

	var req models.AnalyzeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := h.userRepo.FindByID(userID)
	if err != nil || user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
		return
	}

	result, err := h.analysisService.Analyze(userID, req.ConversationText, user.SubscriptionTier)
	if err != nil {
		if strings.Contains(err.Error(), "daily limit") {
			c.JSON(http.StatusTooManyRequests, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

func (h *AnalysisHandler) GetHistory(c *gin.Context) {
	userID := c.GetString("user_id")

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 50 {
		limit = 20
	}

	results, err := h.analysisService.GetHistory(userID, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Always return an array, never null
	if results == nil {
		results = []models.AnalysisResult{}
	}

	c.JSON(http.StatusOK, gin.H{"items": results, "page": page, "limit": limit})
}
