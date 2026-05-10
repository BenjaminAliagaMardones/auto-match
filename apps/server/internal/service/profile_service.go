package service

import (
	"context"
	"errors"
	"strings"
	"time"

	"github.com/BenjaminAliagaMardones/automatch/internal/domain"
	"github.com/BenjaminAliagaMardones/automatch/internal/repository"
	"github.com/google/uuid"
)

type ProfileService struct {
	profiles repository.ProfileRepository
}

func NewProfileService(profiles repository.ProfileRepository) *ProfileService {
	return &ProfileService{profiles: profiles}
}

// Get devuelve el perfil del comprador, o uno vacío si aún no fue configurado.
func (s *ProfileService) Get(ctx context.Context, userID uuid.UUID) (*domain.BuyerProfile, error) {
	p, err := s.profiles.Get(ctx, userID)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return &domain.BuyerProfile{UserID: userID, UpdatedAt: time.Now().UTC()}, nil
		}
		return nil, err
	}
	return p, nil
}

type UpdatePreferencesInput struct {
	VehicleType string
	BudgetMin   *int
	BudgetMax   *int
}

func (s *ProfileService) Update(ctx context.Context, userID uuid.UUID, in UpdatePreferencesInput) (*domain.BuyerProfile, error) {
	p, err := s.Get(ctx, userID)
	if err != nil {
		return nil, err
	}
	if err := p.SetPreferences(strings.TrimSpace(in.VehicleType), in.BudgetMin, in.BudgetMax); err != nil {
		return nil, err
	}
	if err := s.profiles.Upsert(ctx, p); err != nil {
		return nil, err
	}
	return p, nil
}

func normalizeEmail(s string) string {
	return strings.TrimSpace(strings.ToLower(s))
}
