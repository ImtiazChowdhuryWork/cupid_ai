package repository

import (
	"database/sql"
	"errors"

	"cupid_ai/backend/internal/models"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) Create(email, passwordHash, displayName string) (*models.User, error) {
	user := &models.User{}
	query := `
		INSERT INTO users (email, password_hash, display_name)
		VALUES ($1, $2, $3)
		RETURNING id, email, display_name, subscription_tier, created_at
	`
	err := r.db.QueryRow(query, email, passwordHash, displayName).Scan(
		&user.ID, &user.Email, &user.DisplayName, &user.SubscriptionTier, &user.CreatedAt,
	)
	return user, err
}

func (r *UserRepository) FindByEmail(email string) (*models.User, error) {
	user := &models.User{}
	query := `
		SELECT id, email, password_hash, display_name, subscription_tier, created_at
		FROM users WHERE email = $1
	`
	err := r.db.QueryRow(query, email).Scan(
		&user.ID, &user.Email, &user.PasswordHash,
		&user.DisplayName, &user.SubscriptionTier, &user.CreatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	return user, err
}

func (r *UserRepository) FindByID(id string) (*models.User, error) {
	user := &models.User{}
	query := `
		SELECT id, email, display_name, subscription_tier, created_at
		FROM users WHERE id = $1
	`
	err := r.db.QueryRow(query, id).Scan(
		&user.ID, &user.Email, &user.DisplayName, &user.SubscriptionTier, &user.CreatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	return user, err
}

func (r *UserRepository) UpdateDisplayName(id, displayName string) error {
	_, err := r.db.Exec(
		`UPDATE users SET display_name = $1 WHERE id = $2`,
		displayName, id,
	)
	return err
}

// GetPasswordHash returns the stored bcrypt hash for a user.
// For Google-signed-in accounts this returns "google:<uid>" — handle accordingly.
func (r *UserRepository) GetPasswordHash(id string) (string, error) {
	var hash string
	err := r.db.QueryRow(`SELECT password_hash FROM users WHERE id = $1`, id).Scan(&hash)
	if errors.Is(err, sql.ErrNoRows) {
		return "", nil
	}
	return hash, err
}

// UpdatePassword overwrites the stored password hash for a user.
func (r *UserRepository) UpdatePassword(id, newHash string) error {
	_, err := r.db.Exec(
		`UPDATE users SET password_hash = $1 WHERE id = $2`,
		newHash, id,
	)
	return err
}

// UpdateEmail changes the user's email after caller has verified password
// and ensured the new email is not already taken.
func (r *UserRepository) UpdateEmail(id, newEmail string) error {
	_, err := r.db.Exec(
		`UPDATE users SET email = $1 WHERE id = $2`,
		newEmail, id,
	)
	return err
}

func (r *UserRepository) UpdateFCMToken(id, token string) error {
	_, err := r.db.Exec(
		`UPDATE users SET fcm_token = $1 WHERE id = $2`,
		token, id,
	)
	return err
}

func (r *UserRepository) Delete(id string) error {
	_, err := r.db.Exec(`DELETE FROM users WHERE id = $1`, id)
	return err
}

func (r *UserRepository) GetFCMToken(id string) (string, error) {
	var token string
	err := r.db.QueryRow(`SELECT fcm_token FROM users WHERE id = $1`, id).Scan(&token)
	return token, err
}
