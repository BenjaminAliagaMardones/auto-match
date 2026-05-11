package repository

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"

	"github.com/BenjaminAliagaMardones/automatch/internal/domain"
	"github.com/google/uuid"
	"github.com/lib/pq"
)

// ListingRepository expone las operaciones de persistencia de listings.
// Mismo patrón que UserRepository: el service depende de esta interface
// y no de SQL. Tests con mocks viables; cambiar Postgres por otro motor
// no toca capa de servicio.
type ListingRepository interface {
	Create(ctx context.Context, l *domain.Listing) error
	FindByID(ctx context.Context, id uuid.UUID) (*domain.Listing, error)
	Search(ctx context.Context, f domain.ListingFilter) ([]*domain.Listing, error)
	ListBySeller(ctx context.Context, sellerID uuid.UUID) ([]*domain.Listing, error)
	Update(ctx context.Context, l *domain.Listing) error
	Delete(ctx context.Context, id uuid.UUID) error
}

type postgresListingRepository struct {
	db *sql.DB
}

func NewPostgresListingRepository(db *sql.DB) ListingRepository {
	return &postgresListingRepository{db: db}
}

func (r *postgresListingRepository) Create(ctx context.Context, l *domain.Listing) error {
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	const qListing = `
		INSERT INTO listings (id, seller_id, brand, model, year, price, vehicle_type,
		                     description, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`
	if _, err := tx.ExecContext(ctx, qListing,
		l.ID, l.SellerID, l.Brand, l.Model, nullInt(l.Year), l.Price,
		nullString(l.VehicleType), nullString(l.Description), string(l.Status),
		l.CreatedAt, l.UpdatedAt,
	); err != nil {
		return err
	}

	if err := insertPhotos(ctx, tx, l.ID, l.Photos); err != nil {
		return err
	}

	return tx.Commit()
}

func (r *postgresListingRepository) FindByID(ctx context.Context, id uuid.UUID) (*domain.Listing, error) {
	const q = `
		SELECT id, seller_id, brand, model, year, price, vehicle_type,
		       description, status, created_at, updated_at
		FROM listings WHERE id = $1
	`
	l, err := scanListing(r.db.QueryRowContext(ctx, q, id))
	if err != nil {
		return nil, err
	}
	photos, err := r.loadPhotos(ctx, id)
	if err != nil {
		return nil, err
	}
	l.Photos = photos
	return l, nil
}

func (r *postgresListingRepository) Search(ctx context.Context, f domain.ListingFilter) ([]*domain.Listing, error) {
	conds := []string{}
	args := []any{}

	if f.Status != nil {
		args = append(args, string(*f.Status))
		conds = append(conds, fmt.Sprintf("status = $%d", len(args)))
	}
	if f.VehicleType != nil {
		args = append(args, *f.VehicleType)
		conds = append(conds, fmt.Sprintf("vehicle_type = $%d", len(args)))
	}
	if f.PriceMin != nil {
		args = append(args, *f.PriceMin)
		conds = append(conds, fmt.Sprintf("price >= $%d", len(args)))
	}
	if f.PriceMax != nil {
		args = append(args, *f.PriceMax)
		conds = append(conds, fmt.Sprintf("price <= $%d", len(args)))
	}
	if f.ExcludeSellerID != nil {
		args = append(args, *f.ExcludeSellerID)
		conds = append(conds, fmt.Sprintf("seller_id <> $%d", len(args)))
	}
	if f.ExcludeSwipedBy != nil {
		args = append(args, *f.ExcludeSwipedBy)
		conds = append(conds, fmt.Sprintf(
			"id NOT IN (SELECT listing_id FROM swipes WHERE buyer_id = $%d)",
			len(args),
		))
	}

	where := ""
	if len(conds) > 0 {
		where = "WHERE " + strings.Join(conds, " AND ")
	}

	limit := f.Limit
	if limit <= 0 || limit > 100 {
		limit = 20
	}
	offset := f.Offset
	if offset < 0 {
		offset = 0
	}
	args = append(args, limit, offset)

	q := fmt.Sprintf(`
		SELECT id, seller_id, brand, model, year, price, vehicle_type,
		       description, status, created_at, updated_at
		FROM listings %s
		ORDER BY created_at DESC
		LIMIT $%d OFFSET $%d
	`, where, len(args)-1, len(args))

	return r.queryListings(ctx, q, args...)
}

func (r *postgresListingRepository) ListBySeller(ctx context.Context, sellerID uuid.UUID) ([]*domain.Listing, error) {
	const q = `
		SELECT id, seller_id, brand, model, year, price, vehicle_type,
		       description, status, created_at, updated_at
		FROM listings WHERE seller_id = $1 ORDER BY created_at DESC
	`
	return r.queryListings(ctx, q, sellerID)
}

func (r *postgresListingRepository) Update(ctx context.Context, l *domain.Listing) error {
	const q = `
		UPDATE listings SET
		  brand = $2, model = $3, year = $4, price = $5,
		  vehicle_type = $6, description = $7, status = $8,
		  updated_at = $9
		WHERE id = $1
	`
	res, err := r.db.ExecContext(ctx, q,
		l.ID, l.Brand, l.Model, nullInt(l.Year), l.Price,
		nullString(l.VehicleType), nullString(l.Description),
		string(l.Status), l.UpdatedAt,
	)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *postgresListingRepository) Delete(ctx context.Context, id uuid.UUID) error {
	res, err := r.db.ExecContext(ctx, `DELETE FROM listings WHERE id = $1`, id)
	if err != nil {
		return err
	}
	n, _ := res.RowsAffected()
	if n == 0 {
		return ErrNotFound
	}
	return nil
}

// --- helpers ---

func (r *postgresListingRepository) queryListings(ctx context.Context, q string, args ...any) ([]*domain.Listing, error) {
	rows, err := r.db.QueryContext(ctx, q, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	listings := []*domain.Listing{}
	ids := []uuid.UUID{}
	for rows.Next() {
		l, err := scanListing(rows)
		if err != nil {
			return nil, err
		}
		listings = append(listings, l)
		ids = append(ids, l.ID)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	if len(listings) == 0 {
		return listings, nil
	}

	// Cargar fotos en batch para evitar N+1.
	photosByListing, err := r.loadPhotosByListings(ctx, ids)
	if err != nil {
		return nil, err
	}
	for _, l := range listings {
		l.Photos = photosByListing[l.ID]
	}
	return listings, nil
}

func (r *postgresListingRepository) loadPhotos(ctx context.Context, listingID uuid.UUID) ([]domain.Photo, error) {
	const q = `SELECT id, url, position FROM listing_photos WHERE listing_id = $1 ORDER BY position`
	rows, err := r.db.QueryContext(ctx, q, listingID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	photos := []domain.Photo{}
	for rows.Next() {
		var p domain.Photo
		if err := rows.Scan(&p.ID, &p.URL, &p.Position); err != nil {
			return nil, err
		}
		photos = append(photos, p)
	}
	return photos, rows.Err()
}

func (r *postgresListingRepository) loadPhotosByListings(ctx context.Context, ids []uuid.UUID) (map[uuid.UUID][]domain.Photo, error) {
	if len(ids) == 0 {
		return map[uuid.UUID][]domain.Photo{}, nil
	}
	idStrs := make([]string, len(ids))
	for i, id := range ids {
		idStrs[i] = id.String()
	}
	const q = `
		SELECT listing_id, id, url, position
		FROM listing_photos
		WHERE listing_id = ANY($1::uuid[])
		ORDER BY listing_id, position
	`
	rows, err := r.db.QueryContext(ctx, q, pq.Array(idStrs))
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := map[uuid.UUID][]domain.Photo{}
	for rows.Next() {
		var lid uuid.UUID
		var p domain.Photo
		if err := rows.Scan(&lid, &p.ID, &p.URL, &p.Position); err != nil {
			return nil, err
		}
		out[lid] = append(out[lid], p)
	}
	return out, rows.Err()
}

func insertPhotos(ctx context.Context, tx *sql.Tx, listingID uuid.UUID, photos []domain.Photo) error {
	const q = `INSERT INTO listing_photos (id, listing_id, url, position) VALUES ($1, $2, $3, $4)`
	for _, p := range photos {
		if _, err := tx.ExecContext(ctx, q, p.ID, listingID, p.URL, p.Position); err != nil {
			return err
		}
	}
	return nil
}

func scanListing(row rowScanner) (*domain.Listing, error) {
	var l domain.Listing
	var year sql.NullInt64
	var vehicleType, description sql.NullString
	var status string
	if err := row.Scan(
		&l.ID, &l.SellerID, &l.Brand, &l.Model, &year, &l.Price,
		&vehicleType, &description, &status, &l.CreatedAt, &l.UpdatedAt,
	); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	if year.Valid {
		v := int(year.Int64)
		l.Year = &v
	}
	if vehicleType.Valid {
		l.VehicleType = vehicleType.String
	}
	if description.Valid {
		l.Description = description.String
	}
	l.Status = domain.ListingStatus(status)
	return &l, nil
}
