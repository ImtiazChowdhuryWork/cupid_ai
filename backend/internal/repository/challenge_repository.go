package repository

import (
	"database/sql"
	"time"

	"cupid_ai/backend/internal/models"
)

type ChallengeRepository struct {
	db *sql.DB
}

func NewChallengeRepository(db *sql.DB) *ChallengeRepository {
	return &ChallengeRepository{db: db}
}

// GetTodaysChallenge returns (or creates) today's challenge for the user.
func (r *ChallengeRepository) GetTodaysChallenge(userID string) (*models.DailyChallenge, error) {
	today := time.Now().Format("2006-01-02")

	var ch models.DailyChallenge
	var dateStr string

	err := r.db.QueryRow(`
		SELECT id, challenge_type, title, description, target, progress, completed, reward, date
		FROM daily_challenges
		WHERE user_id = $1 AND date = $2
	`, userID, today).Scan(
		&ch.ID, &ch.Type, &ch.Title, &ch.Description,
		&ch.Target, &ch.Progress, &ch.Completed, &ch.Reward, &dateStr,
	)

	if err == sql.ErrNoRows {
		// Create today's challenge
		return r.createTodaysChallenge(userID)
	}
	if err != nil {
		return nil, err
	}

	ch.Date, _ = time.Parse("2006-01-02", today)
	return &ch, nil
}

func (r *ChallengeRepository) createTodaysChallenge(userID string) (*models.DailyChallenge, error) {
	challengeType, title, desc, target, reward := models.GetTodaysChallengeDef()
	today := time.Now().Format("2006-01-02")

	var id string
	err := r.db.QueryRow(`
		INSERT INTO daily_challenges (user_id, challenge_type, title, description, target, progress, completed, reward, date)
		VALUES ($1, $2, $3, $4, $5, 0, false, $6, $7)
		RETURNING id
	`, userID, string(challengeType), title, desc, target, reward, today).Scan(&id)

	if err != nil {
		return nil, err
	}

	return &models.DailyChallenge{
		ID:          id,
		Type:        challengeType,
		Title:       title,
		Description: desc,
		Target:      target,
		Progress:    0,
		Completed:   false,
		Reward:      reward,
		Date:        time.Now(),
	}, nil
}

// UpdateProgress increments the challenge progress after an analysis.
func (r *ChallengeRepository) UpdateProgress(userID string, analysisMode string) error {
	today := time.Now().Format("2006-01-02")

	// Get today's challenge
	var challengeType string
	var target, progress int
	var completed bool
	var challengeID string

	err := r.db.QueryRow(`
		SELECT id, challenge_type, target, progress, completed
		FROM daily_challenges
		WHERE user_id = $1 AND date = $2
	`, userID, today).Scan(&challengeID, &challengeType, &target, &progress, &completed)

	if err != nil || completed {
		return err
	}

	newProgress := progress + 1
	newCompleted := newProgress >= target

	_, err = r.db.Exec(`
		UPDATE daily_challenges
		SET progress = $1, completed = $2
		WHERE id = $3
	`, newProgress, newCompleted, challengeID)

	return err
}
