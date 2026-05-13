package audit

import (
	"context"
	"database/sql"
	"fmt"
)

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) Create(ctx context.Context, input CreateLogInput) error {
	const query = `
		insert into public.audit_logs (
			clinic_id,
			actor_user_id,
			entity_type,
			entity_id,
			action,
			summary
		)
		values ($1, nullif($2, '')::uuid, $3, $4, $5, $6)
	`

	if _, err := r.db.ExecContext(
		ctx,
		query,
		input.ClinicID,
		input.ActorUserID,
		input.EntityType,
		input.EntityID,
		input.Action,
		input.Summary,
	); err != nil {
		return fmt.Errorf("create audit log: %w", err)
	}

	return nil
}
