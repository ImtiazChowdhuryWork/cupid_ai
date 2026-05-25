package repository

import (
	"database/sql"
	"time"
)

type SupportTicket struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	Email     string    `json:"email"`
	Category  string    `json:"category"`
	Message   string    `json:"message"`
	Status    string    `json:"status"`
	Reply     string    `json:"reply,omitempty"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type SupportRepository struct {
	db *sql.DB
}

func NewSupportRepository(db *sql.DB) *SupportRepository {
	return &SupportRepository{db: db}
}

func (r *SupportRepository) Create(userID, email, category, message string) (*SupportTicket, error) {
	var t SupportTicket
	err := r.db.QueryRow(`
		INSERT INTO support_tickets (user_id, email, category, message)
		VALUES ($1, $2, $3, $4)
		RETURNING id, user_id, email, category, message, status, COALESCE(reply,''), created_at, updated_at
	`, userID, email, category, message).Scan(
		&t.ID, &t.UserID, &t.Email, &t.Category,
		&t.Message, &t.Status, &t.Reply, &t.CreatedAt, &t.UpdatedAt,
	)
	return &t, err
}

func (r *SupportRepository) GetAll() ([]SupportTicket, error) {
	rows, err := r.db.Query(`
		SELECT id, user_id, email, category, message, status, COALESCE(reply,''), created_at, updated_at
		FROM support_tickets
		ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tickets []SupportTicket
	for rows.Next() {
		var t SupportTicket
		if err := rows.Scan(&t.ID, &t.UserID, &t.Email, &t.Category,
			&t.Message, &t.Status, &t.Reply, &t.CreatedAt, &t.UpdatedAt); err != nil {
			return nil, err
		}
		tickets = append(tickets, t)
	}
	return tickets, nil
}

func (r *SupportRepository) GetByID(id string) (*SupportTicket, error) {
	var t SupportTicket
	err := r.db.QueryRow(`
		SELECT id, user_id, email, category, message, status, COALESCE(reply,''), created_at, updated_at
		FROM support_tickets WHERE id = $1
	`, id).Scan(&t.ID, &t.UserID, &t.Email, &t.Category, &t.Message, &t.Status, &t.Reply, &t.CreatedAt, &t.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *SupportRepository) UpdateStatus(id, status, reply string) error {
	_, err := r.db.Exec(`
		UPDATE support_tickets
		SET status = $1, reply = $2, updated_at = NOW()
		WHERE id = $3
	`, status, reply, id)
	return err
}
