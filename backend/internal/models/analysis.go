package models

import "time"

type ResponseSuggestion struct {
	Mode       string  `json:"mode"`
	Text       string  `json:"text"`
	Confidence float64 `json:"confidence"`
}

type AnalysisResult struct {
	ID               string               `json:"id" db:"id"`
	UserID           string               `json:"user_id" db:"user_id"`
	ConversationText string               `json:"conversation_text" db:"conversation_text"`
	Suggestions      []ResponseSuggestion `json:"suggestions"`
	Sentiment        string               `json:"sentiment" db:"sentiment"`
	CreatedAt        time.Time            `json:"created_at" db:"created_at"`
}

type AnalyzeRequest struct {
	ConversationText string `json:"conversation_text" binding:"required,min=10"`
}

type DailyUsage struct {
	UserID        string    `db:"user_id"`
	Date          time.Time `db:"date"`
	AnalysisCount int       `db:"analysis_count"`
}

// Free tier daily limit
const FreeTierDailyLimit = 3
