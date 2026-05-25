package handlers

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"cupid_ai/backend/internal/repository"
)

type HelpTopicHandler struct{ repo *repository.HelpTopicRepository }

func NewHelpTopicHandler(repo *repository.HelpTopicRepository) *HelpTopicHandler {
	return &HelpTopicHandler{repo: repo}
}

func (h *HelpTopicHandler) GetActive(c *gin.Context) {
	topics, err := h.repo.GetActive()
	if err != nil { c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()}); return }
	if topics == nil { topics = []repository.HelpTopic{} }
	c.JSON(http.StatusOK, topics)
}

func (h *HelpTopicHandler) GetAll(c *gin.Context) {
	topics, err := h.repo.GetAll()
	if err != nil { c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()}); return }
	if topics == nil { topics = []repository.HelpTopic{} }
	c.JSON(http.StatusOK, topics)
}

func (h *HelpTopicHandler) Create(c *gin.Context) {
	var req struct {
		Emoji     string `json:"emoji"`
		Title     string `json:"title"    binding:"required"`
		Subtitle  string `json:"subtitle"`
		Content   string `json:"content"  binding:"required"`
		SortOrder int    `json:"sort_order"`
	}
	if err := c.ShouldBindJSON(&req); err != nil { c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()}); return }
	if req.Emoji == "" { req.Emoji = "💬" }
	t, err := h.repo.Create(req.Emoji, req.Title, req.Subtitle, req.Content, req.SortOrder)
	if err != nil { c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()}); return }
	c.JSON(http.StatusCreated, t)
}

func (h *HelpTopicHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Emoji     string `json:"emoji"`
		Title     string `json:"title"`
		Subtitle  string `json:"subtitle"`
		Content   string `json:"content"`
		SortOrder int    `json:"sort_order"`
		IsActive  bool   `json:"is_active"`
	}
	if err := c.ShouldBindJSON(&req); err != nil { c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()}); return }
	if err := h.repo.Update(id, req.Emoji, req.Title, req.Subtitle, req.Content, req.SortOrder, req.IsActive); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()}); return
	}
	c.JSON(http.StatusOK, gin.H{"message": "updated"})
}

func (h *HelpTopicHandler) Delete(c *gin.Context) {
	if err := h.repo.Delete(c.Param("id")); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()}); return
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}
