package dto

import "time"

type CreateListingRequest struct {
	Brand       string   `json:"brand" binding:"required"`
	Model       string   `json:"model" binding:"required"`
	Year        *int     `json:"year"`
	Price       int      `json:"price" binding:"required,gt=0"`
	VehicleType string   `json:"vehicle_type"`
	Description string   `json:"description"`
	PhotoURLs   []string `json:"photo_urls" binding:"required,min=1,dive,required"`
}

type UpdateListingRequest struct {
	Brand       *string `json:"brand"`
	Model       *string `json:"model"`
	Year        *int    `json:"year"`
	Price       *int    `json:"price"`
	VehicleType *string `json:"vehicle_type"`
	Description *string `json:"description"`
	Status      *string `json:"status" binding:"omitempty,oneof=active paused sold"`
}

type PhotoResponse struct {
	ID       string `json:"id"`
	URL      string `json:"url"`
	Position int    `json:"position"`
}

type ListingResponse struct {
	ID          string          `json:"id"`
	SellerID    string          `json:"seller_id"`
	Brand       string          `json:"brand"`
	Model       string          `json:"model"`
	Year        *int            `json:"year"`
	Price       int             `json:"price"`
	VehicleType string          `json:"vehicle_type"`
	Description string          `json:"description"`
	Status      string          `json:"status"`
	Photos      []PhotoResponse `json:"photos"`
	CreatedAt   time.Time       `json:"created_at"`
	UpdatedAt   time.Time       `json:"updated_at"`
}

type ListingListResponse struct {
	Items []ListingResponse `json:"items"`
	Count int               `json:"count"`
}
