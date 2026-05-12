package appointments

import (
	"context"
	"database/sql"
)

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) ListByClinic(ctx context.Context, clinicID string) ([]Appointment, error) {
	_ = ctx
	_ = r.db
	_ = clinicID

	return []Appointment{}, nil
}
