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

func TestFeed_RejectsSeller(t *testing.T) {
	userRepo := newFakeUserRepoWithRole()
	sellerID := uuid.New()
	userRepo.users[sellerID] = &domain.User{ID: sellerID, Role: domain.RoleSeller}
	feed := service.NewFeedService(userRepo, newFakeProfileRepo(), newFakeListingRepo())

	_, err := feed.Build(context.Background(), sellerID, 10, 0)
	if !errors.Is(err, service.ErrNotBuyer) {
		t.Fatalf("esperaba ErrNotBuyer, got %v", err)
	}
}

func TestFeed_OK_WithoutProfile(t *testing.T) {
	userRepo := newFakeUserRepoWithRole()
	buyerID := uuid.New()
	userRepo.users[buyerID] = &domain.User{ID: buyerID, Role: domain.RoleBuyer}
	feed := service.NewFeedService(userRepo, newFakeProfileRepo(), newFakeListingRepo())

	out, err := feed.Build(context.Background(), buyerID, 10, 0)
	if err != nil {
		t.Fatalf("build: %v", err)
	}
	if len(out) != 0 {
		t.Errorf("sin listings, feed debería estar vacío")
	}
}
