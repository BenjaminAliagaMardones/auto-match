package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/BenjaminAliagaMardones/automatch/internal/domain"
	"github.com/google/uuid"
)

type MatchRepository interface {
	Create(ctx context.Context, m *domain.Match) error
	FindByID(ctx context.Context, id uuid.UUID) (*domain.Match, error)
	ListForUser(ctx context.Context, userID uuid.UUID) ([]*domain.Match, error)
}

type postgresMatchRepository struct {
	db *sql.DB
}

func NewPostgresMatchRepository(db *sql.DB) MatchRepository {
	return &postgresMatchRepository{db: db}
}

func (r *postgresMatchRepository) Create(ctx context.Context, m *domain.Match) error {
	const q = `
		INSERT INTO matches (id, buyer_id, listing_id, created_at)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (buyer_id, listing_id) DO NOTHING
	`
	_, err := r.db.ExecContext(ctx, q, m.ID, m.BuyerID, m.ListingID, m.CreatedAt)
	return err
}

func (r *postgresMatchRepository) FindByID(ctx context.Context, id uuid.UUID) (*domain.Match, error) {
	const q = `SELECT id, buyer_id, listing_id, created_at FROM matches WHERE id = $1`
	var m domain.Match
	err := r.db.QueryRowContext(ctx, q, id).Scan(&m.ID, &m.BuyerID, &m.ListingID, &m.CreatedAt)
	if errors.Is(err, sql.ErrNoRows) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, err
	}
	return &m, nil
}

// ListForUser devuelve los matches en los que el usuario participa,
// ya sea como buyer o como seller (dueño del listing).
func (r *postgresMatchRepository) ListForUser(ctx context.Context, userID uuid.UUID) ([]*domain.Match, error) {
	const q = `
		SELECT m.id, m.buyer_id, m.listing_id, m.created_at
		FROM matches m
		JOIN listings l ON l.id = m.listing_id
		WHERE m.buyer_id = $1 OR l.seller_id = $1
		ORDER BY m.created_at DESC
	`
	rows, err := r.db.QueryContext(ctx, q, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []*domain.Match{}
	for rows.Next() {
		var m domain.Match
		if err := rows.Scan(&m.ID, &m.BuyerID, &m.ListingID, &m.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, &m)
	}
	return out, rows.Err()
}
