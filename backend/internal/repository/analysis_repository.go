package repository

import (
	"database/sql"
	"encoding/json"
	"time"

	"cupid_ai/backend/internal/models"
)

type AnalysisRepository struct {
	db *sql.DB
}

func NewAnalysisRepository(db *sql.DB) *AnalysisRepository {
	return &AnalysisRepository{db: db}
}

func (r *AnalysisRepository) Save(userID, conversationText string, suggestions []models.ResponseSuggestion, sentiment string) (*models.AnalysisResult, error) {
	suggestionsJSON, err := json.Marshal(suggestions)
	if err != nil {
		return nil, err
	}

	result := &models.AnalysisResult{}
	query := `
		INSERT INTO analyses (user_id, conversation_text, suggestions, sentiment)
		VALUES ($1, $2, $3, $4)
		RETURNING id, user_id, conversation_text, suggestions, sentiment, created_at
	`
	var rawSuggestions []byte
	err = r.db.QueryRow(query, userID, conversationText, suggestionsJSON, sentiment).Scan(
		&result.ID, &result.UserID, &result.ConversationText,
		&rawSuggestions, &result.Sentiment, &result.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	json.Unmarshal(rawSuggestions, &result.Suggestions)
	return result, nil
}

func (r *AnalysisRepository) GetHistory(userID string, page, limit int) ([]models.AnalysisResult, error) {
	offset := (page - 1) * limit
	query := `
		SELECT id, user_id, conversation_text, suggestions, sentiment, created_at
		FROM analyses WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`
	rows, err := r.db.Query(query, userID, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []models.AnalysisResult
	for rows.Next() {
		var result models.AnalysisResult
		var rawSuggestions []byte
		err := rows.Scan(
			&result.ID, &result.UserID, &result.ConversationText,
			&rawSuggestions, &result.Sentiment, &result.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		json.Unmarshal(rawSuggestions, &result.Suggestions)
		results = append(results, result)
	}
	return results, nil
}

func (r *AnalysisRepository) GetDailyUsage(userID string) (int, error) {
	var count int
	query := `
		SELECT COALESCE(analysis_count, 0) FROM daily_usage
		WHERE user_id = $1 AND date = CURRENT_DATE
	`
	err := r.db.QueryRow(query, userID).Scan(&count)
	if err == sql.ErrNoRows {
		return 0, nil
	}
	return count, err
}

func (r *AnalysisRepository) IncrementDailyUsage(userID string) error {
	query := `
		INSERT INTO daily_usage (user_id, date, analysis_count)
		VALUES ($1, CURRENT_DATE, 1)
		ON CONFLICT (user_id, date)
		DO UPDATE SET analysis_count = daily_usage.analysis_count + 1
	`
	_, err := r.db.Exec(query, userID)
	return err
}

func (r *AnalysisRepository) GetTotalCount(userID string) (int, error) {
	var count int
	err := r.db.QueryRow(
		`SELECT COUNT(*) FROM analyses WHERE user_id = $1`, userID,
	).Scan(&count)
	return count, err
}

func (r *AnalysisRepository) GetStreak(userID string) (current int, best int, err error) {
	rows, err := r.db.Query(`
		SELECT date FROM daily_usage
		WHERE user_id = $1 AND analysis_count > 0
		ORDER BY date DESC
	`, userID)
	if err != nil {
		return 0, 0, err
	}
	defer rows.Close()

	var dates []time.Time
	for rows.Next() {
		var d time.Time
		if err := rows.Scan(&d); err != nil {
			return 0, 0, err
		}
		dates = append(dates, d)
	}

	if len(dates) == 0 {
		return 0, 0, nil
	}

	today := time.Now().Truncate(24 * time.Hour)
	currentStreak := 0
	if dates[0].Truncate(24 * time.Hour).Equal(today) {
		currentStreak = 1
		for i := 1; i < len(dates); i++ {
			diff := dates[i-1].Truncate(24 * time.Hour).Sub(dates[i].Truncate(24 * time.Hour))
			if diff == 24*time.Hour {
				currentStreak++
			} else {
				break
			}
		}
	}

	bestStreak := 1
	streak := 1
	for i := 1; i < len(dates); i++ {
		diff := dates[i-1].Truncate(24 * time.Hour).Sub(dates[i].Truncate(24 * time.Hour))
		if diff == 24*time.Hour {
			streak++
			if streak > bestStreak {
				bestStreak = streak
			}
		} else {
			streak = 1
		}
	}

	return currentStreak, bestStreak, nil
}
