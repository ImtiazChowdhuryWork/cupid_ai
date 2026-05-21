package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"cupid_ai/backend/internal/models"
	"cupid_ai/backend/internal/repository"
)

type ProfileHandler struct {
	userRepo     *repository.UserRepository
	analysisRepo *repository.AnalysisRepository
}

func NewProfileHandler(userRepo *repository.UserRepository, analysisRepo *repository.AnalysisRepository) *ProfileHandler {
	return &ProfileHandler{userRepo: userRepo, analysisRepo: analysisRepo}
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
