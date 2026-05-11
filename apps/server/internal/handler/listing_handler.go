package handler

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/BenjaminAliagaMardones/automatch/internal/domain"
	"github.com/BenjaminAliagaMardones/automatch/internal/handler/dto"
	"github.com/BenjaminAliagaMardones/automatch/internal/middleware"
	"github.com/BenjaminAliagaMardones/automatch/internal/repository"
	"github.com/BenjaminAliagaMardones/automatch/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ListingHandler struct {
	listings *service.ListingService
}

func NewListingHandler(listings *service.ListingService) *ListingHandler {
	return &ListingHandler{listings: listings}
}

// Create godoc
// @Summary      Publicar un vehículo
// @Description  Crea un nuevo listing. Solo usuarios con rol seller pueden publicar.
// @Tags         listings
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        body  body  dto.CreateListingRequest  true  "Datos del vehículo"
// @Success      201  {object}  dto.ListingResponse
// @Failure      400  {object}  dto.ErrorResponse
// @Failure      401  {object}  dto.ErrorResponse
// @Failure      403  {object}  dto.ErrorResponse  "No eres seller"
// @Router       /listings [post]
func (h *ListingHandler) Create(c *gin.Context) {
	userID, ok := middleware.UserIDFrom(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "no autenticado"})
		return
	}
	var req dto.CreateListingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
		return
	}
	l, err := h.listings.Create(c.Request.Context(), service.CreateListingInput{
		SellerID:    userID,
		Brand:       req.Brand,
		Model:       req.Model,
		Year:        req.Year,
		Price:       req.Price,
		VehicleType: req.VehicleType,
		Description: req.Description,
		PhotoURLs:   req.PhotoURLs,
	})
	if err != nil {
		respondListingError(c, err)
		return
	}
	c.JSON(http.StatusCreated, toListingResponse(l))
}

// Search godoc
// @Summary      Buscar listings activos
// @Description  Pool público de listings activos con filtros opcionales.
// @Tags         listings
// @Produce      json
// @Param        vehicle_type  query  string  false  "Tipo de vehículo"
// @Param        price_min     query  int     false  "Precio mínimo"
// @Param        price_max     query  int     false  "Precio máximo"
// @Param        limit         query  int     false  "Cantidad (default 20, máx 100)"
// @Param        offset        query  int     false  "Offset para paginación"
// @Success      200  {object}  dto.ListingListResponse
// @Router       /listings [get]
func (h *ListingHandler) Search(c *gin.Context) {
	active := domain.ListingActive
	f := domain.ListingFilter{Status: &active}

	if v := c.Query("vehicle_type"); v != "" {
		f.VehicleType = &v
	}
	if v := c.Query("price_min"); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			f.PriceMin = &n
		}
	}
	if v := c.Query("price_max"); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			f.PriceMax = &n
		}
	}
	if v := c.Query("limit"); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			f.Limit = n
		}
	}
	if v := c.Query("offset"); v != "" {
		if n, err := strconv.Atoi(v); err == nil {
			f.Offset = n
		}
	}

	list, err := h.listings.Search(c.Request.Context(), f)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "error interno"})
		return
	}
	c.JSON(http.StatusOK, toListingListResponse(list))
}

// ListMine godoc
// @Summary      Mis listings (vendedor)
// @Description  Devuelve todos los listings del usuario autenticado.
// @Tags         listings
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  dto.ListingListResponse
// @Failure      401  {object}  dto.ErrorResponse
// @Router       /listings/me [get]
func (h *ListingHandler) ListMine(c *gin.Context) {
	userID, ok := middleware.UserIDFrom(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "no autenticado"})
		return
	}
	list, err := h.listings.ListMine(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "error interno"})
		return
	}
	c.JSON(http.StatusOK, toListingListResponse(list))
}

// GetByID godoc
// @Summary      Detalle de un listing
// @Tags         listings
// @Produce      json
// @Param        id  path  string  true  "Listing ID"
// @Success      200  {object}  dto.ListingResponse
// @Failure      404  {object}  dto.ErrorResponse
// @Router       /listings/{id} [get]
func (h *ListingHandler) GetByID(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "id inválido"})
		return
	}
	l, err := h.listings.Get(c.Request.Context(), id)
	if err != nil {
		respondListingError(c, err)
		return
	}
	c.JSON(http.StatusOK, toListingResponse(l))
}

// Update godoc
// @Summary      Editar un listing
// @Description  Solo el dueño del listing puede modificarlo.
// @Tags         listings
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id    path  string                     true  "Listing ID"
// @Param        body  body  dto.UpdateListingRequest  true  "Campos a actualizar"
// @Success      200  {object}  dto.ListingResponse
// @Failure      400  {object}  dto.ErrorResponse
// @Failure      401  {object}  dto.ErrorResponse
// @Failure      403  {object}  dto.ErrorResponse
// @Failure      404  {object}  dto.ErrorResponse
// @Router       /listings/{id} [patch]
func (h *ListingHandler) Update(c *gin.Context) {
	userID, ok := middleware.UserIDFrom(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "no autenticado"})
		return
	}
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "id inválido"})
		return
	}
	var req dto.UpdateListingRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
		return
	}

	in := service.UpdateListingInput{
		Brand:       req.Brand,
		Model:       req.Model,
		Year:        req.Year,
		Price:       req.Price,
		VehicleType: req.VehicleType,
		Description: req.Description,
	}
	if req.Status != nil {
		s := domain.ListingStatus(*req.Status)
		in.Status = &s
	}

	l, err := h.listings.Update(c.Request.Context(), id, userID, in)
	if err != nil {
		respondListingError(c, err)
		return
	}
	c.JSON(http.StatusOK, toListingResponse(l))
}

// Delete godoc
// @Summary      Eliminar un listing
// @Description  Solo el dueño puede eliminarlo.
// @Tags         listings
// @Produce      json
// @Security     BearerAuth
// @Param        id  path  string  true  "Listing ID"
// @Success      204  "No Content"
// @Failure      401  {object}  dto.ErrorResponse
// @Failure      403  {object}  dto.ErrorResponse
// @Failure      404  {object}  dto.ErrorResponse
// @Router       /listings/{id} [delete]
func (h *ListingHandler) Delete(c *gin.Context) {
	userID, ok := middleware.UserIDFrom(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "no autenticado"})
		return
	}
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "id inválido"})
		return
	}
	if err := h.listings.Delete(c.Request.Context(), id, userID); err != nil {
		respondListingError(c, err)
		return
	}
	c.Status(http.StatusNoContent)
}

func respondListingError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, service.ErrListingNotFound),
		errors.Is(err, repository.ErrNotFound):
		c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: "listing no encontrado"})
	case errors.Is(err, service.ErrNotListingOwner),
		errors.Is(err, service.ErrNotSeller):
		c.JSON(http.StatusForbidden, dto.ErrorResponse{Error: err.Error()})
	case errors.Is(err, domain.ErrInvalidBrand),
		errors.Is(err, domain.ErrInvalidModel),
		errors.Is(err, domain.ErrInvalidPrice),
		errors.Is(err, domain.ErrInvalidYear),
		errors.Is(err, domain.ErrInvalidStatus),
		errors.Is(err, domain.ErrPhotosRequired):
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
	default:
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "error interno"})
	}
}

func toListingResponse(l *domain.Listing) dto.ListingResponse {
	photos := make([]dto.PhotoResponse, 0, len(l.Photos))
	for _, p := range l.Photos {
		photos = append(photos, dto.PhotoResponse{
			ID:       p.ID.String(),
			URL:      p.URL,
			Position: p.Position,
		})
	}
	return dto.ListingResponse{
		ID:          l.ID.String(),
		SellerID:    l.SellerID.String(),
		Brand:       l.Brand,
		Model:       l.Model,
		Year:        l.Year,
		Price:       l.Price,
		VehicleType: l.VehicleType,
		Description: l.Description,
		Status:      string(l.Status),
		Photos:      photos,
		CreatedAt:   l.CreatedAt,
		UpdatedAt:   l.UpdatedAt,
	}
}

func toListingListResponse(ls []*domain.Listing) dto.ListingListResponse {
	items := make([]dto.ListingResponse, 0, len(ls))
	for _, l := range ls {
		items = append(items, toListingResponse(l))
	}
	return dto.ListingListResponse{Items: items, Count: len(items)}
}
