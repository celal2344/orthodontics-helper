package patients

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
)

type Repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{db: db}
}

var ErrNotFound = errors.New("patient not found")

func (r *Repository) ListByClinic(ctx context.Context, clinicID string, search string) ([]Patient, error) {
	const query = `
		select
			p.id::text,
			p.clinic_id::text,
			p.full_name,
			p.phone,
			p.status,
			p.treatment_note,
			p.internal_note,
			coalesce(p.created_by_user_id::text, ''),
			coalesce(p.updated_by_user_id::text, ''),
			p.created_at,
			p.updated_at,
			(
				select min(a.starts_at)
				from public.appointments a
				where a.clinic_id = p.clinic_id
					and a.patient_id = p.id
					and a.deleted_at is null
					and a.starts_at >= now()
					and a.status in ('planned', 'confirmed')
			) as next_appointment
		from public.patients p
		where p.clinic_id = $1
			and p.deleted_at is null
			and (
				$2 = ''
				or p.full_name ilike '%' || $2 || '%'
				or p.phone ilike '%' || $2 || '%'
			)
		order by p.updated_at desc
	`

	rows, err := r.db.QueryContext(ctx, query, clinicID, strings.TrimSpace(search))
	if err != nil {
		return nil, fmt.Errorf("list patients: %w", err)
	}
	defer rows.Close()

	patients := make([]Patient, 0)
	for rows.Next() {
		patient, err := scanPatient(rows)
		if err != nil {
			return nil, err
		}
		patients = append(patients, patient)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate patients: %w", err)
	}

	return patients, nil
}

func (r *Repository) GetByID(ctx context.Context, clinicID string, patientID string) (*Patient, error) {
	const query = `
		select
			p.id::text,
			p.clinic_id::text,
			p.full_name,
			p.phone,
			p.status,
			p.treatment_note,
			p.internal_note,
			coalesce(p.created_by_user_id::text, ''),
			coalesce(p.updated_by_user_id::text, ''),
			p.created_at,
			p.updated_at,
			(
				select min(a.starts_at)
				from public.appointments a
				where a.clinic_id = p.clinic_id
					and a.patient_id = p.id
					and a.deleted_at is null
					and a.starts_at >= now()
					and a.status in ('planned', 'confirmed')
			) as next_appointment
		from public.patients p
		where p.clinic_id = $1
			and p.id = $2
			and p.deleted_at is null
	`

	patient, err := scanPatient(r.db.QueryRowContext(ctx, query, clinicID, patientID))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}

	return &patient, nil
}

func (r *Repository) Create(ctx context.Context, clinicID string, actorUserID string, input CreatePatientRequest) (*Patient, error) {
	const query = `
		insert into public.patients (
			clinic_id,
			full_name,
			phone,
			status,
			treatment_note,
			internal_note,
			created_by_user_id,
			updated_by_user_id
		)
		values ($1, $2, $3, $4, $5, $6, $7, $7)
		returning
			id::text,
			clinic_id::text,
			full_name,
			phone,
			status,
			treatment_note,
			internal_note,
			coalesce(created_by_user_id::text, ''),
			coalesce(updated_by_user_id::text, ''),
			created_at,
			updated_at,
			null::timestamptz as next_appointment
	`

	patient, err := scanPatient(r.db.QueryRowContext(
		ctx,
		query,
		clinicID,
		strings.TrimSpace(input.FullName),
		strings.TrimSpace(input.Phone),
		input.Status,
		input.TreatmentNote,
		input.InternalNote,
		actorUserID,
	))
	if err != nil {
		return nil, fmt.Errorf("create patient: %w", err)
	}

	return &patient, nil
}

func (r *Repository) Update(ctx context.Context, clinicID string, actorUserID string, patientID string, input UpdatePatientRequest) (*Patient, error) {
	const query = `
		update public.patients
		set full_name = $3,
			phone = $4,
			status = $5,
			treatment_note = $6,
			internal_note = $7,
			updated_by_user_id = $8,
			updated_at = now()
		where clinic_id = $1
			and id = $2
			and deleted_at is null
		returning
			id::text,
			clinic_id::text,
			full_name,
			phone,
			status,
			treatment_note,
			internal_note,
			coalesce(created_by_user_id::text, ''),
			coalesce(updated_by_user_id::text, ''),
			created_at,
			updated_at,
			(
				select min(a.starts_at)
				from public.appointments a
				where a.clinic_id = patients.clinic_id
					and a.patient_id = patients.id
					and a.deleted_at is null
					and a.starts_at >= now()
					and a.status in ('planned', 'confirmed')
			) as next_appointment
	`

	patient, err := scanPatient(r.db.QueryRowContext(
		ctx,
		query,
		clinicID,
		patientID,
		strings.TrimSpace(input.FullName),
		strings.TrimSpace(input.Phone),
		input.Status,
		input.TreatmentNote,
		input.InternalNote,
		actorUserID,
	))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, fmt.Errorf("update patient: %w", err)
	}

	return &patient, nil
}

func (r *Repository) SoftDelete(ctx context.Context, clinicID string, actorUserID string, patientID string) error {
	const query = `
		update public.patients
		set deleted_at = now(),
			updated_by_user_id = $3,
			updated_at = now()
		where clinic_id = $1
			and id = $2
			and deleted_at is null
	`

	result, err := r.db.ExecContext(ctx, query, clinicID, patientID, actorUserID)
	if err != nil {
		return fmt.Errorf("soft delete patient: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("soft delete patient rows affected: %w", err)
	}
	if rowsAffected == 0 {
		return ErrNotFound
	}

	return nil
}

type patientScanner interface {
	Scan(dest ...any) error
}

func scanPatient(scanner patientScanner) (Patient, error) {
	var patient Patient
	var nextAppointment sql.NullTime

	if err := scanner.Scan(
		&patient.ID,
		&patient.ClinicID,
		&patient.FullName,
		&patient.Phone,
		&patient.Status,
		&patient.TreatmentNote,
		&patient.InternalNote,
		&patient.CreatedByUserID,
		&patient.UpdatedByUserID,
		&patient.CreatedAt,
		&patient.UpdatedAt,
		&nextAppointment,
	); err != nil {
		return Patient{}, err
	}

	if nextAppointment.Valid {
		patient.NextAppointment = &nextAppointment.Time
	}

	return patient, nil
}
