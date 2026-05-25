package repository

import (
	"database/sql"
	"time"
)

type DataRequest struct {
	ID             string     `json:"id"`
	UserID         string     `json:"user_id"`
	Email          string     `json:"email"`
	RequestType    string     `json:"request_type"`
	Status         string     `json:"status"`
	Note           string     `json:"note,omitempty"`
	DeliveredVia   string     `json:"delivered_via,omitempty"`   // email | download
	DeliveredAt    *time.Time `json:"delivered_at,omitempty"`
	DeliveredBy    string     `json:"delivered_by,omitempty"`
	DeliveryNote   string     `json:"delivery_note,omitempty"`
	AnalysesCount  int        `json:"analyses_count"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

type DataRequestRepository struct{ db *sql.DB }

func NewDataRequestRepository(db *sql.DB) *DataRequestRepository {
	return &DataRequestRepository{db: db}
}

func (r *DataRequestRepository) Create(userID, email, reqType, note string) (*DataRequest, error) {
	var d DataRequest
	err := r.db.QueryRow(`
		INSERT INTO data_requests (user_id, email, request_type, note)
		VALUES ($1, $2, $3, $4)
		RETURNING id, user_id, email, request_type, status, COALESCE(note,''), created_at, updated_at
	`, userID, email, reqType, note).Scan(
		&d.ID, &d.UserID, &d.Email, &d.RequestType, &d.Status, &d.Note, &d.CreatedAt, &d.UpdatedAt,
	)
	return &d, err
}

func (r *DataRequestRepository) GetAll() ([]DataRequest, error) {
	rows, err := r.db.Query(`
		SELECT id, user_id, email, request_type, status,
		       COALESCE(note,''), COALESCE(delivered_via,''), delivered_at,
		       COALESCE(delivered_by,''), COALESCE(delivery_note,''),
		       COALESCE(analyses_count,0), created_at, updated_at
		FROM data_requests ORDER BY created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []DataRequest
	for rows.Next() {
		var d DataRequest
		if err := rows.Scan(
			&d.ID, &d.UserID, &d.Email, &d.RequestType, &d.Status,
			&d.Note, &d.DeliveredVia, &d.DeliveredAt,
			&d.DeliveredBy, &d.DeliveryNote,
			&d.AnalysesCount, &d.CreatedAt, &d.UpdatedAt,
		); err != nil {
			return nil, err
		}
		out = append(out, d)
	}
	return out, nil
}

func (r *DataRequestRepository) UpdateStatus(id, status string) error {
	_, err := r.db.Exec(`
		UPDATE data_requests SET status=$1, updated_at=NOW() WHERE id=$2
	`, status, id)
	return err
}

// RecordDelivery marks a request as completed and stores delivery metadata.
func (r *DataRequestRepository) RecordDelivery(id, via, deliveredBy, note string, analysesCount int) error {
	now := time.Now()
	_, err := r.db.Exec(`
		UPDATE data_requests
		SET status='completed', delivered_via=$1, delivered_at=$2,
		    delivered_by=$3, delivery_note=$4, analyses_count=$5, updated_at=NOW()
		WHERE id=$6
	`, via, now, deliveredBy, note, analysesCount, id)
	return err
}
