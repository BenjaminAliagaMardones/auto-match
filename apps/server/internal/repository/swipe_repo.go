package repository

import (
	"context"
	"database/sql"

	"github.com/BenjaminAliagaMardones/automatch/internal/domain"
	"github.com/google/uuid"
)

type SwipeRepository interface {
	Create(ctx context.Context, s *domain.Swipe) error
	HasSwiped(ctx context.Context, buyerID, listingID uuid.UUID) (bool, error)
}

type postgresSwipeRepository struct {
	db *sql.DB
}

func NewPostgresSwipeRepository(db *sql.DB) SwipeRepository {
	return &postgresSwipeRepository{db: db}
}

func (r *postgresSwipeRepository) Create(ctx context.Context, s *domain.Swipe) error {
	const q = `
		INSERT INTO swipes (buyer_id, listing_id, direction, created_at)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (buyer_id, listing_id) DO UPDATE SET
		  direction  = EXCLUDED.direction,
		  created_at = EXCLUDED.created_at
	`
	_, err := r.db.ExecContext(ctx, q, s.BuyerID, s.ListingID, string(s.Direction), s.CreatedAt)
	return err
}

func (r *postgresSwipeRepository) HasSwiped(ctx context.Context, buyerID, listingID uuid.UUID) (bool, error) {
	const q = `SELECT 1 FROM swipes WHERE buyer_id = $1 AND listing_id = $2`
	var x int
	err := r.db.QueryRowContext(ctx, q, buyerID, listingID).Scan(&x)
	if err == sql.ErrNoRows {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	return true, nil
}
