package domain

import (
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
)

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
	ErrInvalidRole  = errors.New("rol inválido")
	ErrEmptyHash    = errors.New("password hash vacío")
)

// NewUser actúa como Factory Method: garantiza invariantes al construir la
// entidad (email normalizado, rol válido, hash presente).
func NewUser(email string, passwordHash string, role Role) (*User, error) {
	email = strings.TrimSpace(strings.ToLower(email))
	if email == "" || !strings.Contains(email, "@") {
		return nil, ErrInvalidEmail
	}
	if !role.Valid() {
		return nil, ErrInvalidRole
	}
	if passwordHash == "" {
		return nil, ErrEmptyHash
	}
	return &User{
		ID:           uuid.New(),
		Email:        email,
		PasswordHash: passwordHash,
		Role:         role,
		CreatedAt:    time.Now().UTC(),
	}, nil
}
