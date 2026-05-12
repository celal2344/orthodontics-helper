package sms

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

func (r *Repository) ListTemplates(ctx context.Context, clinicID string) ([]Template, error) {
	_ = ctx
	_ = r.db
	_ = clinicID

	return []Template{}, nil
}

func (r *Repository) CreateReminderMessages(ctx context.Context) error {
	_ = ctx
	_ = r.db

	return nil
}
