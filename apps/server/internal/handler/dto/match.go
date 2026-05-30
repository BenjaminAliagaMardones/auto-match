package dto

import "time"

type SwipeRequest struct {
	ListingID string `json:"listing_id" binding:"required,uuid"`
	Direction string `json:"direction" binding:"required,oneof=like pass"`
}

type SwipeResponse struct {
	ListingID    string         `json:"listing_id"`
	Direction    string         `json:"direction"`
	MatchCreated bool           `json:"match_created"`
	Match        *MatchResponse `json:"match,omitempty"`
}

type MatchResponse struct {
	ID               string    `json:"id"`
	BuyerID          string    `json:"buyer_id"`
	ListingID        string    `json:"listing_id"`
	ListingBrand     string    `json:"listing_brand,omitempty"`
	ListingModel     string    `json:"listing_model,omitempty"`
	OtherUserEmail   string    `json:"other_user_email,omitempty"`
	CreatedAt        time.Time `json:"created_at"`
}

type MatchListResponse struct {
	Items []MatchResponse `json:"items"`
	Count int             `json:"count"`
}

type SendMessageRequest struct {
	Body string `json:"body" binding:"required,min=1"`
}

type MessageResponse struct {
	ID        string    `json:"id"`
	MatchID   string    `json:"match_id"`
	SenderID  string    `json:"sender_id"`
	Body      string    `json:"body"`
	CreatedAt time.Time `json:"created_at"`
}

type MessageListResponse struct {
	Items []MessageResponse `json:"items"`
	Count int               `json:"count"`
}
