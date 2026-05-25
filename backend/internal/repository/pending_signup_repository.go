package repository

import (
	"crypto/rand"
	"database/sql"
	"errors"
	"fmt"
	"math/big"
	"time"
)

type PendingSignupRepository struct{ db *sql.DB }

func NewPendingSignupRepository(db *sql.DB) *PendingSignupRepository {
	return &PendingSignupRepository{db: db}
}

// CreateCode stores (or refreshes) a pending sign-up for the email with a fresh
// 6-digit code and 10-minute expiry, returning the plain code to email.
func (r *PendingSignupRepository) CreateCode(email, passwordHash, displayName string) (string, error) {
	n, err := rand.Int(rand.Reader, big.NewInt(1000000))
	if err != nil {
		return "", err
	}
	code := fmt.Sprintf("%06d", n.Int64())
	expires := time.Now().Add(10 * time.Minute)

	_, err = r.db.Exec(`
		INSERT INTO pending_signups (email, password_hash, display_name, code, expires_at, created_at)
		VALUES ($1, $2, $3, $4, $5, NOW())
		ON CONFLICT (email) DO UPDATE
		  SET password_hash = EXCLUDED.password_hash,
		      display_name  = EXCLUDED.display_name,
		      code          = EXCLUDED.code,
		      expires_at    = EXCLUDED.expires_at,
		      created_at    = NOW()
	`, email, passwordHash, displayName, code, expires)
	return code, err
}

// ResendCode refreshes only the code for an existing pending sign-up.
// Returns the new code, or an error if there is no pending sign-up for the email.
func (r *PendingSignupRepository) ResendCode(email string) (string, error) {
	n, err := rand.Int(rand.Reader, big.NewInt(1000000))
	if err != nil {
		return "", err
	}
	code := fmt.Sprintf("%06d", n.Int64())
	expires := time.Now().Add(10 * time.Minute)

	res, err := r.db.Exec(
		`UPDATE pending_signups SET code = $2, expires_at = $3, created_at = NOW() WHERE email = $1`,
		email, code, expires,
	)
	if err != nil {
		return "", err
	}
	if affected, _ := res.RowsAffected(); affected == 0 {
		return "", errors.New("no pending sign-up for this email")
	}
	return code, nil
}

// Verify checks the code for the email. On success it returns the stored
// password hash and display name so the caller can create the user.
func (r *PendingSignupRepository) Verify(email, code string) (passwordHash, displayName string, err error) {
	var expiresAt time.Time
	err = r.db.QueryRow(
		`SELECT password_hash, display_name, expires_at FROM pending_signups WHERE email = $1 AND code = $2`,
		email, code,
	).Scan(&passwordHash, &displayName, &expiresAt)
	if errors.Is(err, sql.ErrNoRows) {
		return "", "", errors.New("invalid or expired code")
	}
	if err != nil {
		return "", "", err
	}
	if time.Now().After(expiresAt) {
		return "", "", errors.New("invalid or expired code")
	}
	return passwordHash, displayName, nil
}

// Delete removes a pending sign-up (after the user is created).
func (r *PendingSignupRepository) Delete(email string) error {
	_, err := r.db.Exec(`DELETE FROM pending_signups WHERE email = $1`, email)
	return err
}

// SecondsSinceLastRequest returns how many seconds ago the pending code for the
// email was last (re)issued, or -1 if there is no pending sign-up. Used to
// throttle resends.
func (r *PendingSignupRepository) SecondsSinceLastRequest(email string) int {
	var secs float64
	err := r.db.QueryRow(
		`SELECT EXTRACT(EPOCH FROM (NOW() - created_at)) FROM pending_signups WHERE email = $1`,
		email,
	).Scan(&secs)
	if err != nil {
		return -1
	}
	return int(secs)
}
