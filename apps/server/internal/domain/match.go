package domain

import (
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
)

type SwipeDirection string

const (
	SwipeLike SwipeDirection = "like"
	SwipePass SwipeDirection = "pass"
)

func (d SwipeDirection) Valid() bool {
	return d == SwipeLike || d == SwipePass
}

type Swipe struct {
	BuyerID   uuid.UUID
	ListingID uuid.UUID
	Direction SwipeDirection
	CreatedAt time.Time
}

var ErrInvalidSwipeDirection = errors.New("dirección de swipe inválida")

// NewSwipe — Factory Method. Valida la dirección.
func NewSwipe(buyerID, listingID uuid.UUID, dir SwipeDirection) (*Swipe, error) {
	if !dir.Valid() {
		return nil, ErrInvalidSwipeDirection
	}
	return &Swipe{
		BuyerID:   buyerID,
		ListingID: listingID,
		Direction: dir,
		CreatedAt: time.Now().UTC(),
	}, nil
}

// Match: se crea automáticamente cuando un buyer hace swipe 'like'
// sobre un listing activo (FR-19).
type Match struct {
	ID        uuid.UUID
	BuyerID   uuid.UUID
	ListingID uuid.UUID
	CreatedAt time.Time
}

func NewMatch(buyerID, listingID uuid.UUID) *Match {
	return &Match{
		ID:        uuid.New(),
		BuyerID:   buyerID,
		ListingID: listingID,
		CreatedAt: time.Now().UTC(),
	}
}

// Message: cada mensaje del chat dentro de un match.
type Message struct {
	ID        uuid.UUID
	MatchID   uuid.UUID
	SenderID  uuid.UUID
	Body      string
	CreatedAt time.Time
}

var ErrEmptyMessage = errors.New("el mensaje no puede estar vacío")

// NewMessage — Factory Method. Valida que el cuerpo no esté vacío.
func NewMessage(matchID, senderID uuid.UUID, body string) (*Message, error) {
	body = strings.TrimSpace(body)
	if body == "" {
		return nil, ErrEmptyMessage
	}
	return &Message{
		ID:        uuid.New(),
		MatchID:   matchID,
		SenderID:  senderID,
		Body:      body,
		CreatedAt: time.Now().UTC(),
	}, nil
}
