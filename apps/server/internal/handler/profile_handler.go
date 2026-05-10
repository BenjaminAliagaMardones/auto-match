package handler

import (
	"errors"
	"net/http"

	"github.com/BenjaminAliagaMardones/automatch/internal/domain"
	"github.com/BenjaminAliagaMardones/automatch/internal/handler/dto"
	"github.com/BenjaminAliagaMardones/automatch/internal/middleware"
	"github.com/BenjaminAliagaMardones/automatch/internal/service"
	"github.com/gin-gonic/gin"
)

type ProfileHandler struct {
	profiles *service.ProfileService
}

func NewProfileHandler(profiles *service.ProfileService) *ProfileHandler {
	return &ProfileHandler{profiles: profiles}
}

// GetMe godoc
// @Summary      Mi perfil
// @Description  Devuelve el perfil de preferencias del usuario autenticado. Si aún no fue configurado, devuelve un perfil vacío.
// @Tags         profile
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  dto.ProfileResponse
// @Failure      401  {object}  dto.ErrorResponse
// @Router       /profile/me [get]
func (h *ProfileHandler) GetMe(c *gin.Context) {
	userID, ok := middleware.UserIDFrom(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "no autenticado"})
		return
	}
	p, err := h.profiles.Get(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "error interno"})
		return
	}
	c.JSON(http.StatusOK, toProfileResponse(p))
}

// UpdateMe godoc
// @Summary      Actualizar preferencias del comprador
// @Description  Configura tipo de vehículo y rango de presupuesto.
// @Tags         profile
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        body  body  dto.UpdateProfileRequest  true  "Preferencias"
// @Success      200  {object}  dto.ProfileResponse
// @Failure      400  {object}  dto.ErrorResponse  "Presupuesto inválido"
// @Failure      401  {object}  dto.ErrorResponse
// @Router       /profile/me [put]
func (h *ProfileHandler) UpdateMe(c *gin.Context) {
	userID, ok := middleware.UserIDFrom(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "no autenticado"})
		return
	}
	var req dto.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
		return
	}
	p, err := h.profiles.Update(c.Request.Context(), userID, service.UpdatePreferencesInput{
		VehicleType: req.VehicleType,
		BudgetMin:   req.BudgetMin,
		BudgetMax:   req.BudgetMax,
	})
	if err != nil {
		if errors.Is(err, domain.ErrInvalidBudget) {
			c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "error interno"})
		return
	}
	c.JSON(http.StatusOK, toProfileResponse(p))
}

func toProfileResponse(p *domain.BuyerProfile) dto.ProfileResponse {
	return dto.ProfileResponse{
		UserID:      p.UserID.String(),
		VehicleType: p.VehicleType,
		BudgetMin:   p.BudgetMin,
		BudgetMax:   p.BudgetMax,
		UpdatedAt:   p.UpdatedAt,
	}
}
