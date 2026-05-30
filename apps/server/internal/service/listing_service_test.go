package service_test

import (
	"context"
	"errors"
	"testing"

	"github.com/BenjaminAliagaMardones/automatch/internal/domain"
	"github.com/BenjaminAliagaMardones/automatch/internal/repository"
	"github.com/BenjaminAliagaMardones/automatch/internal/service"
	"github.com/google/uuid"
)

type fakeListingRepo struct {
	byID map[uuid.UUID]*domain.Listing
}

func newFakeListingRepo() *fakeListingRepo {
	return &fakeListingRepo{byID: map[uuid.UUID]*domain.Listing{}}
}

func (f *fakeListingRepo) Create(_ context.Context, l *domain.Listing) error {
	f.byID[l.ID] = l
	return nil
}
func (f *fakeListingRepo) FindByID(_ context.Context, id uuid.UUID) (*domain.Listing, error) {
	l, ok := f.byID[id]
	if !ok {
		return nil, repository.ErrNotFound
	}
	return l, nil
}
func (f *fakeListingRepo) Search(_ context.Context, _ domain.ListingFilter) ([]*domain.Listing, error) {
	out := []*domain.Listing{}
	for _, l := range f.byID {
		out = append(out, l)
	}
	return out, nil
}
func (f *fakeListingRepo) ListBySeller(_ context.Context, sellerID uuid.UUID) ([]*domain.Listing, error) {
	out := []*domain.Listing{}
	for _, l := range f.byID {
		if l.SellerID == sellerID {
			out = append(out, l)
		}
	}
	return out, nil
}
func (f *fakeListingRepo) Update(_ context.Context, l *domain.Listing) error {
	if _, ok := f.byID[l.ID]; !ok {
		return repository.ErrNotFound
	}
	f.byID[l.ID] = l
	return nil
}
func (f *fakeListingRepo) Delete(_ context.Context, id uuid.UUID) error {
	if _, ok := f.byID[id]; !ok {
		return repository.ErrNotFound
	}
	delete(f.byID, id)
	return nil
}

// fakeUserRepoMock permite simular los usuarios en BD.
type fakeUserRepoMock struct {
	users map[uuid.UUID]*domain.User
}

func newFakeUserRepoMock() *fakeUserRepoMock {
	return &fakeUserRepoMock{users: map[uuid.UUID]*domain.User{}}
}
func (f *fakeUserRepoMock) Create(_ context.Context, _ *domain.User) error { return nil }
func (f *fakeUserRepoMock) FindByEmail(_ context.Context, _ string) (*domain.User, error) {
	return nil, nil
}
func (f *fakeUserRepoMock) FindByID(_ context.Context, id uuid.UUID) (*domain.User, error) {
	u, ok := f.users[id]
	if !ok {
		return nil, repository.ErrNotFound
	}
	return u, nil
}

func newListingSUT() (*service.ListingService, *fakeListingRepo, uuid.UUID) {
	listingRepo := newFakeListingRepo()
	userRepo := newFakeUserRepoMock()
	sellerID := uuid.New()
	userRepo.users[sellerID] = &domain.User{ID: sellerID}
	svc := service.NewListingService(listingRepo, userRepo)
	return svc, listingRepo, sellerID
}

func validCreateInput(sellerID uuid.UUID) service.CreateListingInput {
	year := 2020
	return service.CreateListingInput{
		SellerID:    sellerID,
		Brand:       "Toyota",
		Model:       "Corolla",
		Year:        &year,
		Price:       9_000_000,
		VehicleType: "sedan",
		Description: "auto cuidado",
		PhotoURLs:   []string{"https://x/1.jpg"},
	}
}

func TestCreate_OK(t *testing.T) {
	svc, _, sellerID := newListingSUT()
	l, err := svc.Create(context.Background(), validCreateInput(sellerID))
	if err != nil {
		t.Fatalf("err: %v", err)
	}
	if l.Status != domain.ListingActive {
		t.Errorf("status inicial debería ser active, got %q", l.Status)
	}
	if len(l.Photos) != 1 {
		t.Errorf("debería tener 1 foto, got %d", len(l.Photos))
	}
}



func TestCreate_InvalidPrice(t *testing.T) {
	svc, _, sellerID := newListingSUT()
	in := validCreateInput(sellerID)
	in.Price = 0
	_, err := svc.Create(context.Background(), in)
	if !errors.Is(err, domain.ErrInvalidPrice) {
		t.Fatalf("esperaba ErrInvalidPrice, got %v", err)
	}
}

func TestCreate_NoPhotos(t *testing.T) {
	svc, _, sellerID := newListingSUT()
	in := validCreateInput(sellerID)
	in.PhotoURLs = nil
	_, err := svc.Create(context.Background(), in)
	if !errors.Is(err, domain.ErrPhotosRequired) {
		t.Fatalf("esperaba ErrPhotosRequired, got %v", err)
	}
}

func TestUpdate_OnlyOwner(t *testing.T) {
	svc, _, sellerID := newListingSUT()
	l, err := svc.Create(context.Background(), validCreateInput(sellerID))
	if err != nil {
		t.Fatal(err)
	}
	otro := uuid.New()
	newPrice := 5_000_000
	_, err = svc.Update(context.Background(), l.ID, otro, service.UpdateListingInput{Price: &newPrice})
	if !errors.Is(err, service.ErrNotListingOwner) {
		t.Fatalf("esperaba ErrNotListingOwner, got %v", err)
	}
}

func TestUpdate_OK(t *testing.T) {
	svc, _, sellerID := newListingSUT()
	l, err := svc.Create(context.Background(), validCreateInput(sellerID))
	if err != nil {
		t.Fatal(err)
	}
	newPrice := 5_000_000
	status := domain.ListingPaused
	updated, err := svc.Update(context.Background(), l.ID, sellerID, service.UpdateListingInput{
		Price:  &newPrice,
		Status: &status,
	})
	if err != nil {
		t.Fatalf("update: %v", err)
	}
	if updated.Price != newPrice {
		t.Errorf("precio no actualizado: %d", updated.Price)
	}
	if updated.Status != domain.ListingPaused {
		t.Errorf("status no actualizado: %q", updated.Status)
	}
}

func TestDelete_OnlyOwner(t *testing.T) {
	svc, _, sellerID := newListingSUT()
	l, err := svc.Create(context.Background(), validCreateInput(sellerID))
	if err != nil {
		t.Fatal(err)
	}
	otro := uuid.New()
	if err := svc.Delete(context.Background(), l.ID, otro); !errors.Is(err, service.ErrNotListingOwner) {
		t.Fatalf("esperaba ErrNotListingOwner, got %v", err)
	}
	if err := svc.Delete(context.Background(), l.ID, sellerID); err != nil {
		t.Fatalf("dueño debería poder borrar: %v", err)
	}
}

func TestGet_NotFound(t *testing.T) {
	svc, _, _ := newListingSUT()
	_, err := svc.Get(context.Background(), uuid.New())
	if !errors.Is(err, service.ErrListingNotFound) {
		t.Fatalf("esperaba ErrListingNotFound, got %v", err)
	}
}
