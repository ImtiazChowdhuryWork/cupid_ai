package repository

import (
	"database/sql"
	"crypto/rand"
	"errors"
	"fmt"
	"math/big"
	"time"
)

type TwoFactorRepository struct {
	db *sql.DB
}

func NewTwoFactorRepository(db *sql.DB) *TwoFactorRepository {
	return &TwoFactorRepository{db: db}
}

// Rate-limit configuration
const (
	MaxCodesPerHour    = 5 // max codes a user can request in 60 minutes
	MaxAttemptsPerCode = 5 // max wrong tries before that code is burned
)

// CodesIssuedRecently returns how many codes were generated for the user
// within the last hour. Used for rate limiting before sending a new code.
func (r *TwoFactorRepository) CodesIssuedRecently(userID string) (int, error) {
	var n int
	err := r.db.QueryRow(
		`SELECT COUNT(*) FROM two_factor_codes
		 WHERE user_id = $1 AND created_at > NOW() - INTERVAL '60 minutes'`,
		userID,
	).Scan(&n)
	return n, err
}

// GenerateCode creates a 6-digit code and stores it with a 10-min expiry.
// `purpose` is one of: "change_password" | "change_email" | "delete".
// Caller must check rate limit (CodesIssuedRecently) BEFORE calling this.
func (r *TwoFactorRepository) GenerateCode(userID, purpose string) (string, error) {
	// 6-digit number, padded with zeros
	n, err := rand.Int(rand.Reader, big.NewInt(1000000))
	if err != nil {
		return "", err
	}
	code := fmt.Sprintf("%06d", n.Int64())

	// Invalidate any previous unused codes of the same purpose for this user
	_, _ = r.db.Exec(
		`UPDATE two_factor_codes SET used = true WHERE user_id = $1 AND purpose = $2 AND used = false`,
		userID, purpose,
	)

	expiresAt := time.Now().Add(10 * time.Minute)
	_, err = r.db.Exec(
		`INSERT INTO two_factor_codes (user_id, code, purpose, expires_at) VALUES ($1, $2, $3, $4)`,
		userID, code, purpose, expiresAt,
	)
	return code, err
}

// VerifyAndConsume checks the code, marks it used on success, increments
// attempt_count on failure, and burns a code that hits MaxAttemptsPerCode.
func (r *TwoFactorRepository) VerifyAndConsume(userID, code, purpose string) error {
	// First, locate the latest non-expired unused code for this user+purpose
	var id string
	var storedCode string
	var attempts int
	err := r.db.QueryRow(`
		SELECT id, code, attempt_count FROM two_factor_codes
		WHERE user_id = $1 AND purpose = $2
		  AND used = false AND expires_at > NOW()
		ORDER BY created_at DESC LIMIT 1
	`, userID, purpose).Scan(&id, &storedCode, &attempts)

	if errors.Is(err, sql.ErrNoRows) {
		return errors.New("invalid or expired code")
	}
	if err != nil {
		return err
	}

	if storedCode != code {
		// Wrong code → increment attempt_count, possibly burn the code
		attempts++
		if attempts >= MaxAttemptsPerCode {
			_, _ = r.db.Exec(`UPDATE two_factor_codes SET used = true, attempt_count = $1 WHERE id = $2`, attempts, id)
		} else {
			_, _ = r.db.Exec(`UPDATE two_factor_codes SET attempt_count = $1 WHERE id = $2`, attempts, id)
		}
		return errors.New("invalid or expired code")
	}

	// Success
	_, err = r.db.Exec(`UPDATE two_factor_codes SET used = true WHERE id = $1`, id)
	return err
}
