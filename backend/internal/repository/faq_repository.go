package repository

import (
	"database/sql"
	"time"
)

type FAQ struct {
	ID        string    `json:"id"`
	Question  string    `json:"question"`
	Answer    string    `json:"answer"`
	Category  string    `json:"category"`
	SortOrder int       `json:"sort_order"`
	IsActive  bool      `json:"is_active"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type FAQRepository struct{ db *sql.DB }

func NewFAQRepository(db *sql.DB) *FAQRepository { return &FAQRepository{db: db} }

func (r *FAQRepository) GetActive() ([]FAQ, error) {
	rows, err := r.db.Query(`
		SELECT id, question, answer, category, sort_order, is_active, created_at, updated_at
		FROM faqs WHERE is_active = true ORDER BY sort_order ASC, created_at ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return r.scan(rows)
}

func (r *FAQRepository) GetAll() ([]FAQ, error) {
	rows, err := r.db.Query(`
		SELECT id, question, answer, category, sort_order, is_active, created_at, updated_at
		FROM faqs ORDER BY sort_order ASC, created_at ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return r.scan(rows)
}

func (r *FAQRepository) Create(question, answer, category string, sortOrder int) (*FAQ, error) {
	var f FAQ
	err := r.db.QueryRow(`
		INSERT INTO faqs (question, answer, category, sort_order)
		VALUES ($1, $2, $3, $4)
		RETURNING id, question, answer, category, sort_order, is_active, created_at, updated_at
	`, question, answer, category, sortOrder).Scan(
		&f.ID, &f.Question, &f.Answer, &f.Category, &f.SortOrder, &f.IsActive, &f.CreatedAt, &f.UpdatedAt,
	)
	return &f, err
}

func (r *FAQRepository) Update(id, question, answer, category string, sortOrder int, isActive bool) error {
	_, err := r.db.Exec(`
		UPDATE faqs SET question=$1, answer=$2, category=$3, sort_order=$4, is_active=$5, updated_at=NOW()
		WHERE id=$6
	`, question, answer, category, sortOrder, isActive, id)
	return err
}

func (r *FAQRepository) Delete(id string) error {
	_, err := r.db.Exec(`DELETE FROM faqs WHERE id=$1`, id)
	return err
}

func (r *FAQRepository) scan(rows *sql.Rows) ([]FAQ, error) {
	var faqs []FAQ
	for rows.Next() {
		var f FAQ
		if err := rows.Scan(&f.ID, &f.Question, &f.Answer, &f.Category, &f.SortOrder, &f.IsActive, &f.CreatedAt, &f.UpdatedAt); err != nil {
			return nil, err
		}
		faqs = append(faqs, f)
	}
	return faqs, nil
}
