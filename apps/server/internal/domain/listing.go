package domain

import (
	"errors"
	"strings"
	"time"

	"github.com/google/uuid"
)

type ListingStatus string

const (
	ListingActive ListingStatus = "active"
	ListingPaused ListingStatus = "paused"
	ListingSold   ListingStatus = "sold"
)

func (s ListingStatus) Valid() bool {
	return s == ListingActive || s == ListingPaused || s == ListingSold
}

type Photo struct {
	ID       uuid.UUID
	URL      string
	Position int
}

type Listing struct {
	ID          uuid.UUID
	SellerID    uuid.UUID
	Brand       string
	Model       string
	Year        *int
	Price       int
	VehicleType string
	Description string
	Status      ListingStatus
	Photos      []Photo
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

var (
	ErrInvalidBrand   = errors.New("marca requerida")
	ErrInvalidModel   = errors.New("modelo requerido")
	ErrInvalidPrice   = errors.New("precio debe ser mayor a 0")
	ErrInvalidYear    = errors.New("año fuera de rango (1900-2100)")
	ErrInvalidStatus  = errors.New("status inválido")
	ErrPhotosRequired = errors.New("se requiere al menos 1 foto")
)

// NewListing aplica el patrón Factory Method: garantiza invariantes al
// crear un Listing (marca y modelo no vacíos, precio positivo, al menos
// una foto, año razonable). Devuelve siempre un Listing en estado
// "active".
func NewListing(
	sellerID uuid.UUID,
	brand, model string,
	year *int,
	price int,
	vehicleType, description string,
	photoURLs []string,
) (*Listing, error) {
	brand = strings.TrimSpace(brand)
	model = strings.TrimSpace(model)
	if brand == "" {
		return nil, ErrInvalidBrand
	}
	if model == "" {
		return nil, ErrInvalidModel
	}
	if price <= 0 {
		return nil, ErrInvalidPrice
	}
	if year != nil && (*year < 1900 || *year > 2100) {
		return nil, ErrInvalidYear
	}
	if len(photoURLs) == 0 {
		return nil, ErrPhotosRequired
	}

	photos := make([]Photo, 0, len(photoURLs))
	for i, u := range photoURLs {
		photos = append(photos, Photo{
			ID:       uuid.New(),
			URL:      strings.TrimSpace(u),
			Position: i,
		})
	}

	now := time.Now().UTC()
	return &Listing{
		ID:          uuid.New(),
		SellerID:    sellerID,
		Brand:       brand,
		Model:       model,
		Year:        year,
		Price:       price,
		VehicleType: strings.TrimSpace(vehicleType),
		Description: strings.TrimSpace(description),
		Status:      ListingActive,
		Photos:      photos,
		CreatedAt:   now,
		UpdatedAt:   now,
	}, nil
}

// CanBeModifiedBy aplica una política de autorización a nivel de
// dominio: solo el vendedor dueño del listing puede modificarlo.
// Patrón Policy / Specification embebido en la entidad.
func (l *Listing) CanBeModifiedBy(userID uuid.UUID) bool {
	return l.SellerID == userID
}

// ApplyUpdates aplica cambios parciales validando invariantes. Los
// punteros nil significan "no cambiar este campo".
func (l *Listing) ApplyUpdates(
	brand, model, vehicleType, description *string,
	year *int,
	price *int,
	status *ListingStatus,
) error {
	if brand != nil {
		v := strings.TrimSpace(*brand)
		if v == "" {
			return ErrInvalidBrand
		}
		l.Brand = v
	}
	if model != nil {
		v := strings.TrimSpace(*model)
		if v == "" {
			return ErrInvalidModel
		}
		l.Model = v
	}
	if vehicleType != nil {
		l.VehicleType = strings.TrimSpace(*vehicleType)
	}
	if description != nil {
		l.Description = strings.TrimSpace(*description)
	}
	if year != nil {
		if *year < 1900 || *year > 2100 {
			return ErrInvalidYear
		}
		l.Year = year
	}
	if price != nil {
		if *price <= 0 {
			return ErrInvalidPrice
		}
		l.Price = *price
	}
	if status != nil {
		if !status.Valid() {
			return ErrInvalidStatus
		}
		l.Status = *status
	}
	l.UpdatedAt = time.Now().UTC()
	return nil
}

// ListingFilter permite buscar listings según criterios opcionales.
// Aplica el patrón Specification de forma ligera: el repositorio
// interpreta este struct como un conjunto de condiciones combinadas con
// AND, sin que el servicio tenga que armar SQL.
type ListingFilter struct {
	Status      *ListingStatus
	VehicleType *string
	PriceMin    *int
	PriceMax    *int
	// ExcludeSwipedBy excluye listings ya swipeados (like o pass) por
	// el buyer indicado. Útil para construir el feed.
	ExcludeSwipedBy *uuid.UUID
	// ExcludeSellerID excluye listings publicados por este usuario.
	// El comprador no debería ver autos que él mismo publicó si
	// además es seller.
	ExcludeSellerID *uuid.UUID
	Limit           int
	Offset          int
}
