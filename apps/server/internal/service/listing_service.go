package service

import (
	"context"
	"errors"

	"github.com/BenjaminAliagaMardones/automatch/internal/domain"
	"github.com/BenjaminAliagaMardones/automatch/internal/repository"
	"github.com/google/uuid"
)

var (
	ErrListingNotFound = errors.New("listing no encontrado")
	ErrNotListingOwner = errors.New("no eres dueño de este listing")
	ErrNotSeller       = errors.New("solo los vendedores pueden publicar")
)

// ListingService orquesta el CRUD de listings + validaciones de dominio.
// Depende de abstracciones: ListingRepository (Repository) y
// UserRepository (para verificar el rol del autor). DI vía constructor.
type ListingService struct {
	listings repository.ListingRepository
	users    repository.UserRepository
}

func NewListingService(listings repository.ListingRepository, users repository.UserRepository) *ListingService {
	return &ListingService{listings: listings, users: users}
}

type CreateListingInput struct {
	SellerID    uuid.UUID
	Brand       string
	Model       string
	Year        *int
	Price       int
	VehicleType string
	Description string
	PhotoURLs   []string
}

func (s *ListingService) Create(ctx context.Context, in CreateListingInput) (*domain.Listing, error) {
	u, err := s.users.FindByID(ctx, in.SellerID)
	if err != nil {
		return nil, err
	}
	if u.Role != domain.RoleSeller {
		return nil, ErrNotSeller
	}

	l, err := domain.NewListing(
		in.SellerID, in.Brand, in.Model, in.Year, in.Price,
		in.VehicleType, in.Description, in.PhotoURLs,
	)
	if err != nil {
		return nil, err
	}
	if err := s.listings.Create(ctx, l); err != nil {
		return nil, err
	}
	return l, nil
}

func (s *ListingService) Get(ctx context.Context, id uuid.UUID) (*domain.Listing, error) {
	l, err := s.listings.FindByID(ctx, id)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return nil, ErrListingNotFound
		}
		return nil, err
	}
	return l, nil
}

func (s *ListingService) Search(ctx context.Context, f domain.ListingFilter) ([]*domain.Listing, error) {
	return s.listings.Search(ctx, f)
}

func (s *ListingService) ListMine(ctx context.Context, sellerID uuid.UUID) ([]*domain.Listing, error) {
	return s.listings.ListBySeller(ctx, sellerID)
}

type UpdateListingInput struct {
	Brand       *string
	Model       *string
	Year        *int
	Price       *int
	VehicleType *string
	Description *string
	Status      *domain.ListingStatus
}

func (s *ListingService) Update(ctx context.Context, listingID, userID uuid.UUID, in UpdateListingInput) (*domain.Listing, error) {
	l, err := s.Get(ctx, listingID)
	if err != nil {
		return nil, err
	}
	if !l.CanBeModifiedBy(userID) {
		return nil, ErrNotListingOwner
	}
	if err := l.ApplyUpdates(in.Brand, in.Model, in.VehicleType, in.Description, in.Year, in.Price, in.Status); err != nil {
		return nil, err
	}
	if err := s.listings.Update(ctx, l); err != nil {
		return nil, err
	}
	return l, nil
}

func (s *ListingService) Delete(ctx context.Context, listingID, userID uuid.UUID) error {
	l, err := s.Get(ctx, listingID)
	if err != nil {
		return err
	}
	if !l.CanBeModifiedBy(userID) {
		return ErrNotListingOwner
	}
	return s.listings.Delete(ctx, listingID)
}
