package service

import (
	"context"
	"errors"

	"github.com/BenjaminAliagaMardones/automatch/internal/auth"
	"github.com/BenjaminAliagaMardones/automatch/internal/domain"
	"github.com/BenjaminAliagaMardones/automatch/internal/repository"
)

var (
	ErrInvalidCredentials = errors.New("credenciales inválidas")
	ErrEmailTaken         = errors.New("email ya registrado")
	ErrWeakPassword       = errors.New("password debe tener al menos 6 caracteres")
)

// AuthService orquesta el registro y autenticación. Depende de
// abstracciones (UserRepository, PasswordHasher, JWTIssuer), no de
// implementaciones concretas: ejemplo claro de Inversión de Dependencias.
type AuthService struct {
	users  repository.UserRepository
	hasher auth.PasswordHasher
	jwt    *auth.JWTIssuer
}

func NewAuthService(users repository.UserRepository, hasher auth.PasswordHasher, jwt *auth.JWTIssuer) *AuthService {
	return &AuthService{users: users, hasher: hasher, jwt: jwt}
}

type RegisterInput struct {
	Email    string
	Password string
}

func (s *AuthService) Register(ctx context.Context, in RegisterInput) (*domain.User, error) {
	if len(in.Password) < 6 {
		return nil, ErrWeakPassword
	}
	hash, err := s.hasher.Hash(in.Password)
	if err != nil {
		return nil, err
	}
	u, err := domain.NewUser(in.Email, hash)
	if err != nil {
		return nil, err
	}
	if err := s.users.Create(ctx, u); err != nil {
		if errors.Is(err, repository.ErrEmailConflict) {
			return nil, ErrEmailTaken
		}
		return nil, err
	}
	return u, nil
}

func (s *AuthService) Login(ctx context.Context, email, password string) (token string, user *domain.User, err error) {
	u, err := s.users.FindByEmail(ctx, normalizeEmail(email))
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return "", nil, ErrInvalidCredentials
		}
		return "", nil, err
	}
	if err := s.hasher.Verify(password, u.PasswordHash); err != nil {
		return "", nil, ErrInvalidCredentials
	}
	token, err = s.jwt.Issue(u.ID)
	if err != nil {
		return "", nil, err
	}
	return token, u, nil
}
