package auth

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
)

var ErrUnauthorized = errors.New("unauthorized")

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

func (r *Repository) FindSessionUser(ctx context.Context, userID string) (*SessionUser, error) {
	const query = `
		select u.id::text, u.email, u.full_name, cm.clinic_id::text
		from public.users u
		join public.clinic_members cm on cm.user_id = u.id
		where u.id = $1
			and cm.status = 'active'
		order by cm.created_at asc
		limit 1
	`

	var user SessionUser
	if err := r.db.QueryRowContext(ctx, query, userID).Scan(
		&user.ID,
		&user.Email,
		&user.FullName,
		&user.ClinicID,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrUnauthorized
		}
		return nil, fmt.Errorf("find session user: %w", err)
	}

	return &user, nil
}
