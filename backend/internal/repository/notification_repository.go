package repository

import (
	"database/sql"
	"time"

	"cupid_ai/backend/internal/ws"
)

type UserNotification struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	Title     string    `json:"title"`
	Body      string    `json:"body"`
	Type      string    `json:"type"`
	Read      bool      `json:"read"`
	CreatedAt time.Time `json:"created_at"`
}

type NotificationRepository struct {
	db *sql.DB
}

func NewNotificationRepository(db *sql.DB) *NotificationRepository {
	return &NotificationRepository{db: db}
}

func (r *NotificationRepository) Create(userID, title, body, notifType string) (*UserNotification, error) {
	var n UserNotification
	err := r.db.QueryRow(`
		INSERT INTO user_notifications (user_id, title, body, type)
		VALUES ($1, $2, $3, $4)
		RETURNING id, user_id, title, body, type, read, created_at
	`, userID, title, body, notifType).Scan(
		&n.ID, &n.UserID, &n.Title, &n.Body, &n.Type, &n.Read, &n.CreatedAt,
	)
	if err == nil {
		// Push real-time event to any connected Flutter app for this user
		go ws.NotifyUser(userID, title, body, notifType)
	}
	return &n, err
}

func (r *NotificationRepository) GetForUser(userID string) ([]UserNotification, error) {
	rows, err := r.db.Query(`
		SELECT id, user_id, title, body, type, read, created_at
		FROM user_notifications
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT 50
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notifications []UserNotification
	for rows.Next() {
		var n UserNotification
		if err := rows.Scan(&n.ID, &n.UserID, &n.Title, &n.Body, &n.Type, &n.Read, &n.CreatedAt); err != nil {
			return nil, err
		}
		notifications = append(notifications, n)
	}
	return notifications, nil
}

func (r *NotificationRepository) MarkAllRead(userID string) error {
	_, err := r.db.Exec(`
		UPDATE user_notifications SET read = true WHERE user_id = $1
	`, userID)
	return err
}

func (r *NotificationRepository) UnreadCount(userID string) (int, error) {
	var count int
	err := r.db.QueryRow(`
		SELECT COUNT(*) FROM user_notifications WHERE user_id = $1 AND read = false
	`, userID).Scan(&count)
	return count, err
}
