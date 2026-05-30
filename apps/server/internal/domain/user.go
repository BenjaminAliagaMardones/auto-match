package domain

import (
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
)

// Role distingue compradores de vendedores. Coincide con el CHECK de la
// columna users.role en Postgres ('buyer' | 'seller').
type Role string

const (
	RoleBuyer  Role = "buyer"
	RoleSeller Role = "seller"
)

func (r Role) Valid() bool {
	return r == RoleBuyer || r == RoleSeller
}

type User struct {
	ID           uuid.UUID
	Email        string
	PasswordHash string
	Role         Role
	CreatedAt    time.Time
}

var (
	ErrInvalidEmail = errors.New("email inválido")
	ErrEmptyHash    = errors.New("password hash vacío")
	ErrInvalidRole  = errors.New("rol inválido: debe ser buyer o seller")
)

// NewUser actúa como Factory Method: garantiza invariantes al construir la
// entidad (email normalizado, hash presente, rol válido).
func NewUser(email string, passwordHash string, role Role) (*User, error) {
	email = strings.TrimSpace(strings.ToLower(email))
	if email == "" || !strings.Contains(email, "@") {
		return nil, ErrInvalidEmail
	}
	if passwordHash == "" {
		return nil, ErrEmptyHash
	}
	if !role.Valid() {
		return nil, ErrInvalidRole
	}
	return &User{
		ID:           uuid.New(),
		Email:        email,
		PasswordHash: passwordHash,
		Role:         role,
		CreatedAt:    time.Now().UTC(),
	}, nil
}
