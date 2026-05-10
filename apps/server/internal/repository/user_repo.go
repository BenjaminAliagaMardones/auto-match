package repository

import (
	"context"
	"database/sql"
	"errors"

	"github.com/BenjaminAliagaMardones/automatch/internal/domain"
	"github.com/google/uuid"
)

var (
	ErrNotFound      = errors.New("registro no encontrado")
	ErrEmailConflict = errors.New("email ya registrado")
)

// UserRepository es la interface (patrón Repository) que el servicio
// consume. La capa de servicio nunca importa database/sql ni conoce el
// dialecto de la base. Esto permite mockear el repo en tests y, en teoría,
// reemplazar Postgres por otro motor sin tocar el servicio.
type UserRepository interface {
	Create(ctx context.Context, u *domain.User) error
	FindByEmail(ctx context.Context, email string) (*domain.User, error)
	FindByID(ctx context.Context, id uuid.UUID) (*domain.User, error)
}

type postgresUserRepository struct {
	db *sql.DB
}

func NewPostgresUserRepository(db *sql.DB) UserRepository {
	return &postgresUserRepository{db: db}
}

func (r *postgresUserRepository) Create(ctx context.Context, u *domain.User) error {
	const q = `
		INSERT INTO users (id, email, password_hash, role, created_at)
		VALUES ($1, $2, $3, $4, $5)
	`
	_, err := r.db.ExecContext(ctx, q, u.ID, u.Email, u.PasswordHash, string(u.Role), u.CreatedAt)
	if err != nil {
		if isUniqueViolation(err) {
			return ErrEmailConflict
		}
		return err
	}
	return nil
}

func (r *postgresUserRepository) FindByEmail(ctx context.Context, email string) (*domain.User, error) {
	const q = `SELECT id, email, password_hash, role, created_at FROM users WHERE email = $1`
	row := r.db.QueryRowContext(ctx, q, email)
	return scanUser(row)
}

func (r *postgresUserRepository) FindByID(ctx context.Context, id uuid.UUID) (*domain.User, error) {
	const q = `SELECT id, email, password_hash, role, created_at FROM users WHERE id = $1`
	row := r.db.QueryRowContext(ctx, q, id)
	return scanUser(row)
}

type rowScanner interface {
	Scan(dest ...any) error
}

func scanUser(row rowScanner) (*domain.User, error) {
	var u domain.User
	var role string
	if err := row.Scan(&u.ID, &u.Email, &u.PasswordHash, &role, &u.CreatedAt); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, ErrNotFound
		}
		return nil, err
	}
	u.Role = domain.Role(role)
	return &u, nil
}
