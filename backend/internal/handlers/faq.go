package handlers

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"cupid_ai/backend/internal/repository"
)

type FAQHandler struct{ repo *repository.FAQRepository }

func NewFAQHandler(repo *repository.FAQRepository) *FAQHandler { return &FAQHandler{repo: repo} }

// GET /api/v1/support/faqs — Flutter fetches active FAQs
func (h *FAQHandler) GetActive(c *gin.Context) {
	faqs, err := h.repo.GetActive()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if faqs == nil {
		faqs = []repository.FAQ{}
	}
	c.JSON(http.StatusOK, faqs)
}

// GET /api/v1/admin/faqs — all FAQs including inactive
func (h *FAQHandler) GetAll(c *gin.Context) {
	faqs, err := h.repo.GetAll()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if faqs == nil {
		faqs = []repository.FAQ{}
	}
	c.JSON(http.StatusOK, faqs)
}

// POST /api/v1/admin/faqs
func (h *FAQHandler) Create(c *gin.Context) {
	var req struct {
		Question  string `json:"question"  binding:"required"`
		Answer    string `json:"answer"    binding:"required"`
		Category  string `json:"category"`
		SortOrder int    `json:"sort_order"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if req.Category == "" {
		req.Category = "general"
	}
	faq, err := h.repo.Create(req.Question, req.Answer, req.Category, req.SortOrder)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, faq)
}

// PATCH /api/v1/admin/faqs/:id
func (h *FAQHandler) Update(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Question  string `json:"question"`
		Answer    string `json:"answer"`
		Category  string `json:"category"`
		SortOrder int    `json:"sort_order"`
		IsActive  bool   `json:"is_active"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if err := h.repo.Update(id, req.Question, req.Answer, req.Category, req.SortOrder, req.IsActive); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "updated"})
}

// DELETE /api/v1/admin/faqs/:id
func (h *FAQHandler) Delete(c *gin.Context) {
	if err := h.repo.Delete(c.Param("id")); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "deleted"})
}
