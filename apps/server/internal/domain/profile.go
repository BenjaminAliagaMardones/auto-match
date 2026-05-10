package domain

import (
	"errors"
	"time"

	"github.com/google/uuid"
)

type BuyerProfile struct {
	UserID      uuid.UUID
	VehicleType string
	BudgetMin   *int
	BudgetMax   *int
	UpdatedAt   time.Time
}

var ErrInvalidBudget = errors.New("presupuesto inválido")

// SetPreferences valida y actualiza las preferencias del comprador.
func (p *BuyerProfile) SetPreferences(vehicleType string, budgetMin, budgetMax *int) error {
	if budgetMin != nil && *budgetMin < 0 {
		return ErrInvalidBudget
	}
	if budgetMax != nil && *budgetMax < 0 {
		return ErrInvalidBudget
	}
	if budgetMin != nil && budgetMax != nil && *budgetMin > *budgetMax {
		return ErrInvalidBudget
	}
	p.VehicleType = vehicleType
	p.BudgetMin = budgetMin
	p.BudgetMax = budgetMax
	p.UpdatedAt = time.Now().UTC()
	return nil
}
