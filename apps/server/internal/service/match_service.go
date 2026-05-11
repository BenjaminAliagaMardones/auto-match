package service

import (
	"context"
	"errors"

	"github.com/BenjaminAliagaMardones/automatch/internal/domain"
	"github.com/BenjaminAliagaMardones/automatch/internal/repository"
	"github.com/google/uuid"
)

var (
	ErrCannotSwipeOwnListing  = errors.New("no puedes swipear tu propio listing")
	ErrListingNotActive       = errors.New("el listing no está activo")
	ErrNotMatchParticipant    = errors.New("no participas en este match")
	ErrMatchNotFound          = errors.New("match no encontrado")
)

// MatchService coordina:
//   - Registro de swipes (like / pass)
//   - Creación automática de match cuando un buyer hace 'like' a un
//     listing activo (FR-19)
//   - Chat dentro de un match
//
// Depende solo de interfaces de repositorio (Repository + DI).
type MatchService struct {
	users    repository.UserRepository
	listings repository.ListingRepository
	swipes   repository.SwipeRepository
	matches  repository.MatchRepository
	messages repository.MessageRepository
}

func NewMatchService(
	users repository.UserRepository,
	listings repository.ListingRepository,
	swipes repository.SwipeRepository,
	matches repository.MatchRepository,
	messages repository.MessageRepository,
) *MatchService {
	return &MatchService{
		users:    users,
		listings: listings,
		swipes:   swipes,
		matches:  matches,
		messages: messages,
	}
}

type SwipeResult struct {
	Swipe   *domain.Swipe
	Match   *domain.Match // nil cuando direction = pass o ya existía
	Created bool          // true si se creó un Match nuevo en este swipe
}

func (s *MatchService) Swipe(
	ctx context.Context,
	buyerID, listingID uuid.UUID,
	dir domain.SwipeDirection,
) (*SwipeResult, error) {
	u, err := s.users.FindByID(ctx, buyerID)
	if err != nil {
		return nil, err
	}
	if u.Role != domain.RoleBuyer {
		return nil, ErrNotBuyer
	}

	listing, err := s.listings.FindByID(ctx, listingID)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return nil, ErrListingNotFound
		}
		return nil, err
	}
	if listing.SellerID == buyerID {
		return nil, ErrCannotSwipeOwnListing
	}
	if listing.Status != domain.ListingActive {
		return nil, ErrListingNotActive
	}

	sw, err := domain.NewSwipe(buyerID, listingID, dir)
	if err != nil {
		return nil, err
	}
	if err := s.swipes.Create(ctx, sw); err != nil {
		return nil, err
	}

	res := &SwipeResult{Swipe: sw}
	if dir != domain.SwipeLike {
		return res, nil
	}

	// like → asegurar que exista el match.
	m := domain.NewMatch(buyerID, listingID)
	if err := s.matches.Create(ctx, m); err != nil {
		return nil, err
	}
	res.Match = m
	res.Created = true
	return res, nil
}

func (s *MatchService) ListMatches(ctx context.Context, userID uuid.UUID) ([]*domain.Match, error) {
	return s.matches.ListForUser(ctx, userID)
}

func (s *MatchService) GetMatch(ctx context.Context, matchID, userID uuid.UUID) (*domain.Match, error) {
	m, err := s.matches.FindByID(ctx, matchID)
	if err != nil {
		if errors.Is(err, repository.ErrNotFound) {
			return nil, ErrMatchNotFound
		}
		return nil, err
	}
	if err := s.assertParticipant(ctx, m, userID); err != nil {
		return nil, err
	}
	return m, nil
}

func (s *MatchService) ListMessages(ctx context.Context, matchID, userID uuid.UUID) ([]*domain.Message, error) {
	if _, err := s.GetMatch(ctx, matchID, userID); err != nil {
		return nil, err
	}
	return s.messages.ListByMatch(ctx, matchID)
}

func (s *MatchService) SendMessage(ctx context.Context, matchID, senderID uuid.UUID, body string) (*domain.Message, error) {
	if _, err := s.GetMatch(ctx, matchID, senderID); err != nil {
		return nil, err
	}
	msg, err := domain.NewMessage(matchID, senderID, body)
	if err != nil {
		return nil, err
	}
	if err := s.messages.Create(ctx, msg); err != nil {
		return nil, err
	}
	return msg, nil
}

// assertParticipant verifica que userID sea o el buyer o el seller del
// listing asociado al match. Política de autorización aplicada a nivel
// de servicio (los handlers no la duplican).
func (s *MatchService) assertParticipant(ctx context.Context, m *domain.Match, userID uuid.UUID) error {
	if m.BuyerID == userID {
		return nil
	}
	listing, err := s.listings.FindByID(ctx, m.ListingID)
	if err != nil {
		return err
	}
	if listing.SellerID == userID {
		return nil
	}
	return ErrNotMatchParticipant
}
