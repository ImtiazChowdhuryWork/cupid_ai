package repository

import (
	"database/sql"
	"time"
)

type HelpTopic struct {
	ID        string    `json:"id"`
	Emoji     string    `json:"emoji"`
	Title     string    `json:"title"`
	Subtitle  string    `json:"subtitle"`
	Content   string    `json:"content"`
	SortOrder int       `json:"sort_order"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type HelpTopicRepository struct{ db *sql.DB }

func NewHelpTopicRepository(db *sql.DB) *HelpTopicRepository { return &HelpTopicRepository{db: db} }

func (r *HelpTopicRepository) GetActive() ([]HelpTopic, error) {
	return r.query(`WHERE is_active = true ORDER BY sort_order ASC`)
}

func (r *HelpTopicRepository) GetAll() ([]HelpTopic, error) {
	return r.query(`ORDER BY sort_order ASC`)
}

func (r *HelpTopicRepository) Create(emoji, title, subtitle, content string, sortOrder int) (*HelpTopic, error) {
	var t HelpTopic
	err := r.db.QueryRow(`
		INSERT INTO help_topics (emoji, title, subtitle, content, sort_order)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, emoji, title, subtitle, content, sort_order, is_active, created_at, updated_at
	`, emoji, title, subtitle, content, sortOrder).Scan(
		&t.ID, &t.Emoji, &t.Title, &t.Subtitle, &t.Content, &t.SortOrder, &t.IsActive, &t.CreatedAt, &t.UpdatedAt,
	)
	return &t, err
}

func (r *HelpTopicRepository) Update(id, emoji, title, subtitle, content string, sortOrder int, isActive bool) error {
	_, err := r.db.Exec(`
		UPDATE help_topics SET emoji=$1, title=$2, subtitle=$3, content=$4, sort_order=$5, is_active=$6, updated_at=NOW()
		WHERE id=$7
	`, emoji, title, subtitle, content, sortOrder, isActive, id)
	return err
}

func (r *HelpTopicRepository) Delete(id string) error {
	_, err := r.db.Exec(`DELETE FROM help_topics WHERE id=$1`, id)
	return err
}

func (r *HelpTopicRepository) query(where string) ([]HelpTopic, error) {
	rows, err := r.db.Query(`SELECT id, emoji, title, subtitle, content, sort_order, is_active, created_at, updated_at FROM help_topics ` + where)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var topics []HelpTopic
	for rows.Next() {
		var t HelpTopic
		if err := rows.Scan(&t.ID, &t.Emoji, &t.Title, &t.Subtitle, &t.Content, &t.SortOrder, &t.IsActive, &t.CreatedAt, &t.UpdatedAt); err != nil {
			return nil, err
		}
		topics = append(topics, t)
	}
	return topics, nil
}
