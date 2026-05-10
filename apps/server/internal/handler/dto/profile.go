package dto

import "time"

type UpdateProfileRequest struct {
	VehicleType string `json:"vehicle_type"`
	BudgetMin   *int   `json:"budget_min"`
	BudgetMax   *int   `json:"budget_max"`
}

type ProfileResponse struct {
	UserID      string    `json:"user_id"`
	VehicleType string    `json:"vehicle_type"`
	BudgetMin   *int      `json:"budget_min"`
	BudgetMax   *int      `json:"budget_max"`
	UpdatedAt   time.Time `json:"updated_at"`
}
