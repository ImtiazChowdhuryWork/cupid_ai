package services

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"

	"cupid_ai/backend/internal/models"
	"cupid_ai/backend/internal/repository"
)

type AnalysisService struct {
	analysisRepo *repository.AnalysisRepository
	aiServiceURL string
}

func NewAnalysisService(analysisRepo *repository.AnalysisRepository, aiServiceURL string) *AnalysisService {
	return &AnalysisService{
		analysisRepo: analysisRepo,
		aiServiceURL: aiServiceURL,
	}
}

type aiServiceRequest struct {
	Conversation string `json:"conversation"`
}

type aiServiceResponse struct {
	Suggestions []models.ResponseSuggestion `json:"suggestions"`
	Sentiment   string                      `json:"sentiment"`
}

func (s *AnalysisService) Analyze(userID, conversationText string, tier string) (*models.AnalysisResult, error) {
	// Rate limit check for free tier
	if tier == "free" {
		usage, err := s.analysisRepo.GetDailyUsage(userID)
		if err != nil {
			return nil, err
		}
		if usage >= models.FreeTierDailyLimit {
			return nil, errors.New("daily limit reached — upgrade to continue")
		}
	}

	// Call AI microservice
	aiResp, err := s.callAIService(conversationText)
	if err != nil {
		return nil, fmt.Errorf("AI service error: %w", err)
	}

	// Save to database
	result, err := s.analysisRepo.Save(userID, conversationText, aiResp.Suggestions, aiResp.Sentiment)
	if err != nil {
		return nil, err
	}

	// Increment daily usage counter
	s.analysisRepo.IncrementDailyUsage(userID)

	return result, nil
}

func (s *AnalysisService) GetHistory(userID string, page, limit int) ([]models.AnalysisResult, error) {
	return s.analysisRepo.GetHistory(userID, page, limit)
}

func (s *AnalysisService) callAIService(conversationText string) (*aiServiceResponse, error) {
	body, _ := json.Marshal(aiServiceRequest{Conversation: conversationText})

	resp, err := http.Post(
		s.aiServiceURL+"/analyze",
		"application/json",
		bytes.NewBuffer(body),
	)
	if err != nil {
		return nil, fmt.Errorf("could not reach AI service: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("AI service returned status %d", resp.StatusCode)
	}

	var aiResp aiServiceResponse
	if err := json.NewDecoder(resp.Body).Decode(&aiResp); err != nil {
		return nil, fmt.Errorf("could not decode AI service response: %w", err)
	}

	return &aiResp, nil
}
