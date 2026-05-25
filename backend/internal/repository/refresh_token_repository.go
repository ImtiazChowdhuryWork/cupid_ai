package repository

import (
	"database/sql"
	"errors"
	"time"
)

type RefreshTokenRepository struct {
	db *sql.DB
}

func NewRefreshTokenRepository(db *sql.DB) *RefreshTokenRepository {
	return &RefreshTokenRepository{db: db}
}

// Save stores a refresh token with a 7-day expiry.
func (r *RefreshTokenRepository) Save(userID, token string) error {
	_, err := r.db.Exec(`
		INSERT INTO refresh_tokens (user_id, token, expires_at)
		VALUES ($1, $2, $3)
	`, userID, token, time.Now().Add(7*24*time.Hour))
	return err
}

// ValidateAndGetUserID checks the token is valid and not expired, returns the owning user ID.
func (r *RefreshTokenRepository) ValidateAndGetUserID(token string) (string, error) {
	var userID string
	var expiresAt time.Time

	err := r.db.QueryRow(`
		SELECT user_id, expires_at FROM refresh_tokens
		WHERE token = $1
	`, token).Scan(&userID, &expiresAt)

	if errors.Is(err, sql.ErrNoRows) {
		return "", errors.New("token not found")
	}
	if err != nil {
		return "", err
	}
	if time.Now().After(expiresAt) {
		// Clean up expired token
		r.db.Exec(`DELETE FROM refresh_tokens WHERE token = $1`, token)
		return "", errors.New("token expired")
	}

	return userID, nil
}

// Revoke deletes a refresh token (used on logout).
func (r *RefreshTokenRepository) Revoke(token string) error {
	_, err := r.db.Exec(`DELETE FROM refresh_tokens WHERE token = $1`, token)
	return err
}

// RevokeAllForUser deletes all refresh tokens for a user (logout all devices).
func (r *RefreshTokenRepository) RevokeAllForUser(userID string) error {
	_, err := r.db.Exec(`DELETE FROM refresh_tokens WHERE user_id = $1`, userID)
	return err
}

// RevokeAllForUserExcept deletes every refresh token for a user except the one
// supplied — used after a password change so the initiating device stays
// signed in while all other sessions are kicked.
func (r *RefreshTokenRepository) RevokeAllForUserExcept(userID, keepToken string) error {
	_, err := r.db.Exec(
		`DELETE FROM refresh_tokens WHERE user_id = $1 AND token <> $2`,
		userID, keepToken,
	)
	return err
}
