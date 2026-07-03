package service_test

import (
	"context"
	"testing"

	"github.com/BenjaminAliagaMardones/automatch/internal/domain"
	"github.com/BenjaminAliagaMardones/automatch/internal/repository"
	"github.com/BenjaminAliagaMardones/automatch/internal/service"
	"github.com/google/uuid"
)

type fakeProfileRepo struct {
	byUser map[uuid.UUID]*domain.BuyerProfile
}

func newFakeProfileRepo() *fakeProfileRepo {
	return &fakeProfileRepo{byUser: map[uuid.UUID]*domain.BuyerProfile{}}
}
func (f *fakeProfileRepo) Get(_ context.Context, userID uuid.UUID) (*domain.BuyerProfile, error) {
	p, ok := f.byUser[userID]
	if !ok {
		return nil, repository.ErrNotFound
	}
	return p, nil
}
func (f *fakeProfileRepo) Upsert(_ context.Context, p *domain.BuyerProfile) error {
	f.byUser[p.UserID] = p
	return nil
}



// spyListingRepo captura el filtro que el FeedService le pasa a Search.
type spyListingRepo struct {
	*fakeListingRepo
	lastFilter domain.ListingFilter
}

func (s *spyListingRepo) Search(ctx context.Context, f domain.ListingFilter) ([]*domain.Listing, error) {
	s.lastFilter = f
	return s.fakeListingRepo.Search(ctx, f)
}

func TestFeed_ExcludesOwnListingsAndSwiped(t *testing.T) {
	userRepo := newFakeUserRepoMock()
	buyerID := uuid.New()
	userRepo.users[buyerID] = &domain.User{ID: buyerID}
	spy := &spyListingRepo{fakeListingRepo: newFakeListingRepo()}
	feed := service.NewFeedService(userRepo, newFakeProfileRepo(), spy)

	if _, err := feed.Build(context.Background(), buyerID, 10, 0); err != nil {
		t.Fatalf("build: %v", err)
	}
	if spy.lastFilter.ExcludeSellerID == nil || *spy.lastFilter.ExcludeSellerID != buyerID {
		t.Errorf("el feed debe excluir las publicaciones del propio usuario (ExcludeSellerID)")
	}
	if spy.lastFilter.ExcludeSwipedBy == nil || *spy.lastFilter.ExcludeSwipedBy != buyerID {
		t.Errorf("el feed debe excluir listings ya swipeados (ExcludeSwipedBy)")
	}
	if spy.lastFilter.Status == nil || *spy.lastFilter.Status != domain.ListingActive {
		t.Errorf("el feed debe filtrar solo listings activos")
	}
}

func TestFeed_OK_WithoutProfile(t *testing.T) {
	userRepo := newFakeUserRepoMock()
	buyerID := uuid.New()
	userRepo.users[buyerID] = &domain.User{ID: buyerID}
	feed := service.NewFeedService(userRepo, newFakeProfileRepo(), newFakeListingRepo())

	out, err := feed.Build(context.Background(), buyerID, 10, 0)
	if err != nil {
		t.Fatalf("build: %v", err)
	}
	if len(out) != 0 {
		t.Errorf("sin listings, feed debería estar vacío")
	}
}
