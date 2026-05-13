package users

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

func (r *Repository) ListColleagues(ctx context.Context, clinicID string) ([]Colleague, error) {
	const query = `
		select u.id::text, u.full_name, u.email, c.name, cm.created_at
		from public.clinic_members cm
		join public.users u on u.id = cm.user_id
		join public.clinics c on c.id = cm.clinic_id
		where cm.clinic_id = $1
			and cm.status = 'active'
		order by u.full_name asc
	`

	rows, err := r.db.QueryContext(ctx, query, clinicID)
	if err != nil {
		return nil, fmt.Errorf("list colleagues: %w", err)
	}
	defer rows.Close()

	colleagues := make([]Colleague, 0)
	for rows.Next() {
		var colleague Colleague
		if err := rows.Scan(
			&colleague.ID,
			&colleague.FullName,
			&colleague.Email,
			&colleague.Clinic,
			&colleague.JoinedAt,
		); err != nil {
			return nil, err
		}
		colleagues = append(colleagues, colleague)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate colleagues: %w", err)
	}

	return colleagues, nil
}

func (r *Repository) UpsertUser(ctx context.Context, userID string, fullName string, email string) error {
	const query = `
		insert into public.users (id, email, full_name)
		values ($1, $2, $3)
		on conflict (id) do update
		set email = excluded.email,
			full_name = excluded.full_name,
			updated_at = now()
	`

	if _, err := r.db.ExecContext(ctx, query, userID, email, fullName); err != nil {
		return fmt.Errorf("upsert user: %w", err)
	}

	return nil
}

func (r *Repository) AddClinicMember(ctx context.Context, clinicID string, userID string) error {
	const query = `
		insert into public.clinic_members (clinic_id, user_id, status)
		values ($1, $2, 'active')
		on conflict (clinic_id, user_id) do update
		set status = 'active',
			updated_at = now()
	`

	if _, err := r.db.ExecContext(ctx, query, clinicID, userID); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return err
		}
		return fmt.Errorf("add clinic member: %w", err)
	}

	return nil
}
