package domain

import (
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID           uuid.UUID
	Email        string
	PasswordHash string
	CreatedAt    time.Time
}

var (
	ErrInvalidEmail = errors.New("email inválido")
	ErrEmptyHash    = errors.New("password hash vacío")
)

// NewUser actúa como Factory Method: garantiza invariantes al construir la
// entidad (email normalizado, hash presente).
func NewUser(email string, passwordHash string) (*User, error) {
	email = strings.TrimSpace(strings.ToLower(email))
	if email == "" || !strings.Contains(email, "@") {
		return nil, ErrInvalidEmail
	}
	if passwordHash == "" {
		return nil, ErrEmptyHash
	}
	return &User{
		ID:           uuid.New(),
		Email:        email,
		PasswordHash: passwordHash,
		CreatedAt:    time.Now().UTC(),
	}, nil
}
