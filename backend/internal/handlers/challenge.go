package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"cupid_ai/backend/internal/repository"
)

type ChallengeHandler struct {
	repo *repository.ChallengeRepository
}

func NewChallengeHandler(repo *repository.ChallengeRepository) *ChallengeHandler {
	return &ChallengeHandler{repo: repo}
}

func (h *ChallengeHandler) GetTodaysChallenge(c *gin.Context) {
	userID := c.GetString("user_id")

	challenge, err := h.repo.GetTodaysChallenge(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, challenge)
}
