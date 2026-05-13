package clinics

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
)

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) GetByID(ctx context.Context, clinicID string) (*Clinic, error) {
	const query = `
		select id::text, name
		from public.clinics
		where id = $1
	`

	var clinic Clinic
	if err := r.db.QueryRowContext(ctx, query, clinicID).Scan(&clinic.ID, &clinic.Name); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("clinic not found")
		}
		return nil, fmt.Errorf("get clinic: %w", err)
	}

	return &clinic, nil
}
