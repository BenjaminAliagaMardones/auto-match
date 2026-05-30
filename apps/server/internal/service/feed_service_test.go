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
