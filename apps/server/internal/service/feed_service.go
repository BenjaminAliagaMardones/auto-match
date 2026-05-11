package service

import (
	"context"
	"errors"

	"github.com/BenjaminAliagaMardones/automatch/internal/domain"
	"github.com/BenjaminAliagaMardones/automatch/internal/repository"
	"github.com/google/uuid"
)

var ErrNotBuyer = errors.New("solo los compradores pueden usar el feed")

// FeedService construye el feed del comprador: listings activos, no
// publicados por él, que aún no swipeó, filtrados por sus preferencias
// (vehicle_type / budget) cuando estén configuradas.
//
// Las dependencias son interfaces (Repository pattern) y se inyectan
// por constructor (DI). El service no toca SQL.
type FeedService struct {
	users    repository.UserRepository
	profiles repository.ProfileRepository
	listings repository.ListingRepository
}

func NewFeedService(
	users repository.UserRepository,
	profiles repository.ProfileRepository,
	listings repository.ListingRepository,
) *FeedService {
	return &FeedService{users: users, profiles: profiles, listings: listings}
}

func (s *FeedService) Build(ctx context.Context, buyerID uuid.UUID, limit, offset int) ([]*domain.Listing, error) {
	u, err := s.users.FindByID(ctx, buyerID)
	if err != nil {
		return nil, err
	}
	if u.Role != domain.RoleBuyer {
		return nil, ErrNotBuyer
	}

	// Aplicar preferencias del perfil si están configuradas. El
	// ProfileService.Get devuelve un perfil vacío si no existe, así que
	// los campos pueden estar en cero/empty y simplemente no filtran.
	p, err := s.profiles.Get(ctx, buyerID)
	if err != nil && !errors.Is(err, repository.ErrNotFound) {
		return nil, err
	}

	active := domain.ListingActive
	f := domain.ListingFilter{
		Status:          &active,
		ExcludeSwipedBy: &buyerID,
		Limit:           limit,
		Offset:          offset,
	}
	if p != nil {
		if p.VehicleType != "" {
			vt := p.VehicleType
			f.VehicleType = &vt
		}
		if p.BudgetMin != nil {
			f.PriceMin = p.BudgetMin
		}
		if p.BudgetMax != nil {
			f.PriceMax = p.BudgetMax
		}
	}
	return s.listings.Search(ctx, f)
}
