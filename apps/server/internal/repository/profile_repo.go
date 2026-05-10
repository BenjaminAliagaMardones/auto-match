package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/BenjaminAliagaMardones/automatch/internal/domain"
	"github.com/google/uuid"
)

type ProfileRepository interface {
	Get(ctx context.Context, userID uuid.UUID) (*domain.BuyerProfile, error)
	Upsert(ctx context.Context, p *domain.BuyerProfile) error
}

type postgresProfileRepository struct {
	db *sql.DB
}

func NewPostgresProfileRepository(db *sql.DB) ProfileRepository {
	return &postgresProfileRepository{db: db}
}

func (r *postgresProfileRepository) Get(ctx context.Context, userID uuid.UUID) (*domain.BuyerProfile, error) {
	const q = `
		SELECT user_id, vehicle_type, budget_min, budget_max, updated_at
		FROM buyer_profiles WHERE user_id = $1
	`
	var p domain.BuyerProfile
	var vehicleType sql.NullString
	var bMin, bMax sql.NullInt64
	err := r.db.QueryRowContext(ctx, q, userID).Scan(
		&p.UserID, &vehicleType, &bMin, &bMax, &p.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	if vehicleType.Valid {
		p.VehicleType = vehicleType.String
	}
	if bMin.Valid {
		v := int(bMin.Int64)
		p.BudgetMin = &v
	}
	if bMax.Valid {
		v := int(bMax.Int64)
		p.BudgetMax = &v
	}
	return &p, nil
}

func (r *postgresProfileRepository) Upsert(ctx context.Context, p *domain.BuyerProfile) error {
	const q = `
		INSERT INTO buyer_profiles (user_id, vehicle_type, budget_min, budget_max, updated_at)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (user_id) DO UPDATE SET
			vehicle_type = EXCLUDED.vehicle_type,
			budget_min   = EXCLUDED.budget_min,
			budget_max   = EXCLUDED.budget_max,
			updated_at   = EXCLUDED.updated_at
	`
	_, err := r.db.ExecContext(ctx, q,
		p.UserID,
		nullString(p.VehicleType),
		nullInt(p.BudgetMin),
		nullInt(p.BudgetMax),
		p.UpdatedAt,
	)
	return err
}

func nullString(s string) any {
	if s == "" {
		return nil
	}
	return s
}

func nullInt(v *int) any {
	if v == nil {
		return nil
	}
	return *v
}
