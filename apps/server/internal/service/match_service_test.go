package service_test

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/BenjaminAliagaMardones/automatch/internal/domain"
	"github.com/BenjaminAliagaMardones/automatch/internal/repository"
	"github.com/BenjaminAliagaMardones/automatch/internal/service"
	"github.com/google/uuid"
)

// fakeSwipeRepo / fakeMatchRepo / fakeMessageRepo — mocks en memoria
// que demuestran el valor del patrón Repository: testear el service
// completo sin Postgres.

type fakeSwipeRepo struct {
	swipes []*domain.Swipe
}

func (f *fakeSwipeRepo) Create(_ context.Context, s *domain.Swipe) error {
	f.swipes = append(f.swipes, s)
	return nil
}
func (f *fakeSwipeRepo) HasSwiped(_ context.Context, buyerID, listingID uuid.UUID) (bool, error) {
	for _, s := range f.swipes {
		if s.BuyerID == buyerID && s.ListingID == listingID {
			return true, nil
		}
	}
	return false, nil
}

type fakeMatchRepo struct {
	matches map[uuid.UUID]*domain.Match
	// key = buyer:listing para detectar duplicados (la DB lo hace con UNIQUE).
	byPair map[string]*domain.Match
}

func newFakeMatchRepo() *fakeMatchRepo {
	return &fakeMatchRepo{
		matches: map[uuid.UUID]*domain.Match{},
		byPair:  map[string]*domain.Match{},
	}
}
func pairKey(b, l uuid.UUID) string { return b.String() + ":" + l.String() }

func (f *fakeMatchRepo) Create(_ context.Context, m *domain.Match) error {
	if _, ok := f.byPair[pairKey(m.BuyerID, m.ListingID)]; ok {
		return nil // ON CONFLICT DO NOTHING
	}
	f.matches[m.ID] = m
	f.byPair[pairKey(m.BuyerID, m.ListingID)] = m
	return nil
}
func (f *fakeMatchRepo) FindByID(_ context.Context, id uuid.UUID) (*domain.Match, error) {
	m, ok := f.matches[id]
	if !ok {
		return nil, repository.ErrNotFound
	}
	return m, nil
}
func (f *fakeMatchRepo) ListForUser(_ context.Context, userID uuid.UUID) ([]*domain.Match, error) {
	out := []*domain.Match{}
	for _, m := range f.matches {
		if m.BuyerID == userID {
			out = append(out, m)
		}
	}
	return out, nil
}

type fakeMessageRepo struct {
	byMatch map[uuid.UUID][]*domain.Message
}

func newFakeMessageRepo() *fakeMessageRepo {
	return &fakeMessageRepo{byMatch: map[uuid.UUID][]*domain.Message{}}
}
func (f *fakeMessageRepo) Create(_ context.Context, m *domain.Message) error {
	f.byMatch[m.MatchID] = append(f.byMatch[m.MatchID], m)
	return nil
}
func (f *fakeMessageRepo) ListByMatch(_ context.Context, matchID uuid.UUID) ([]*domain.Message, error) {
	return f.byMatch[matchID], nil
}

// Helpers de setup
type matchSUT struct {
	svc         *service.MatchService
	buyerID     uuid.UUID
	sellerID    uuid.UUID
	listingRepo *fakeListingRepo
	matchRepo   *fakeMatchRepo
}

func newMatchSUT(t *testing.T) *matchSUT {
	t.Helper()
	listingRepo := newFakeListingRepo()
	userRepo := newFakeUserRepoWithRole()
	swipeRepo := &fakeSwipeRepo{}
	matchRepo := newFakeMatchRepo()
	messageRepo := newFakeMessageRepo()

	buyerID := uuid.New()
	sellerID := uuid.New()
	userRepo.users[buyerID] = &domain.User{ID: buyerID, Role: domain.RoleBuyer}
	userRepo.users[sellerID] = &domain.User{ID: sellerID, Role: domain.RoleSeller}

	svc := service.NewMatchService(userRepo, listingRepo, swipeRepo, matchRepo, messageRepo)
	return &matchSUT{
		svc:         svc,
		buyerID:     buyerID,
		sellerID:    sellerID,
		listingRepo: listingRepo,
		matchRepo:   matchRepo,
	}
}

func (s *matchSUT) addActiveListing() *domain.Listing {
	l := &domain.Listing{
		ID:        uuid.New(),
		SellerID:  s.sellerID,
		Brand:     "X", Model: "Y", Price: 1000,
		Status:    domain.ListingActive,
		CreatedAt: time.Now(), UpdatedAt: time.Now(),
	}
	s.listingRepo.byID[l.ID] = l
	return l
}

func TestSwipe_Like_CreatesMatch(t *testing.T) {
	s := newMatchSUT(t)
	l := s.addActiveListing()

	res, err := s.svc.Swipe(context.Background(), s.buyerID, l.ID, domain.SwipeLike)
	if err != nil {
		t.Fatalf("swipe: %v", err)
	}
	if !res.Created || res.Match == nil {
		t.Fatalf("debería haberse creado match")
	}
	if res.Match.BuyerID != s.buyerID || res.Match.ListingID != l.ID {
		t.Errorf("match mal armado: %+v", res.Match)
	}
}

func TestSwipe_Pass_NoMatch(t *testing.T) {
	s := newMatchSUT(t)
	l := s.addActiveListing()

	res, err := s.svc.Swipe(context.Background(), s.buyerID, l.ID, domain.SwipePass)
	if err != nil {
		t.Fatal(err)
	}
	if res.Created || res.Match != nil {
		t.Fatalf("pass no debería crear match")
	}
}

func TestSwipe_OwnListing_Rejected(t *testing.T) {
	s := newMatchSUT(t)
	l := s.addActiveListing()
	// Forzar que el buyer sea seller del listing.
	l.SellerID = s.buyerID

	_, err := s.svc.Swipe(context.Background(), s.buyerID, l.ID, domain.SwipeLike)
	if !errors.Is(err, service.ErrCannotSwipeOwnListing) {
		t.Fatalf("esperaba ErrCannotSwipeOwnListing, got %v", err)
	}
}

func TestSwipe_InactiveListing_Rejected(t *testing.T) {
	s := newMatchSUT(t)
	l := s.addActiveListing()
	l.Status = domain.ListingPaused

	_, err := s.svc.Swipe(context.Background(), s.buyerID, l.ID, domain.SwipeLike)
	if !errors.Is(err, service.ErrListingNotActive) {
		t.Fatalf("esperaba ErrListingNotActive, got %v", err)
	}
}

func TestSwipe_AsSeller_Rejected(t *testing.T) {
	s := newMatchSUT(t)
	l := s.addActiveListing()

	_, err := s.svc.Swipe(context.Background(), s.sellerID, l.ID, domain.SwipeLike)
	if !errors.Is(err, service.ErrNotBuyer) {
		t.Fatalf("esperaba ErrNotBuyer, got %v", err)
	}
}

func TestSendMessage_OK(t *testing.T) {
	s := newMatchSUT(t)
	l := s.addActiveListing()

	res, err := s.svc.Swipe(context.Background(), s.buyerID, l.ID, domain.SwipeLike)
	if err != nil {
		t.Fatal(err)
	}
	msg, err := s.svc.SendMessage(context.Background(), res.Match.ID, s.buyerID, "hola!")
	if err != nil {
		t.Fatalf("send: %v", err)
	}
	if msg.Body != "hola!" || msg.SenderID != s.buyerID {
		t.Errorf("mensaje mal: %+v", msg)
	}
}

func TestSendMessage_NotParticipant_Forbidden(t *testing.T) {
	s := newMatchSUT(t)
	l := s.addActiveListing()
	res, _ := s.svc.Swipe(context.Background(), s.buyerID, l.ID, domain.SwipeLike)

	otro := uuid.New()
	_, err := s.svc.SendMessage(context.Background(), res.Match.ID, otro, "hola")
	if !errors.Is(err, service.ErrNotMatchParticipant) {
		t.Fatalf("esperaba ErrNotMatchParticipant, got %v", err)
	}
}

func TestSendMessage_EmptyBody_Rejected(t *testing.T) {
	s := newMatchSUT(t)
	l := s.addActiveListing()
	res, _ := s.svc.Swipe(context.Background(), s.buyerID, l.ID, domain.SwipeLike)

	_, err := s.svc.SendMessage(context.Background(), res.Match.ID, s.buyerID, "   ")
	if !errors.Is(err, domain.ErrEmptyMessage) {
		t.Fatalf("esperaba ErrEmptyMessage, got %v", err)
	}
}

func TestSwipe_Like_Idempotent(t *testing.T) {
	s := newMatchSUT(t)
	l := s.addActiveListing()
	_, _ = s.svc.Swipe(context.Background(), s.buyerID, l.ID, domain.SwipeLike)
	// Segundo like al mismo listing — el repo de match hace ON CONFLICT
	// DO NOTHING, así que no debería duplicar.
	res, err := s.svc.Swipe(context.Background(), s.buyerID, l.ID, domain.SwipeLike)
	if err != nil {
		t.Fatal(err)
	}
	if len(s.matchRepo.matches) != 1 {
		t.Errorf("debería haber 1 match, hay %d", len(s.matchRepo.matches))
	}
	// El segundo swipe igual responde con un Match (pero con un ID nuevo del local).
	_ = res
}
