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

type AuthHandler struct {
	auth *service.AuthService
}

func NewAuthHandler(auth *service.AuthService) *AuthHandler {
	return &AuthHandler{auth: auth}
}

// Register godoc
// @Summary      Registrar usuario
// @Description  Crea una cuenta nueva (rol: buyer o seller).
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        body  body  dto.RegisterRequest  true  "Datos de registro"
// @Success      201  {object}  dto.UserResponse
// @Failure      400  {object}  dto.ErrorResponse  "Body inválido o password débil"
// @Failure      409  {object}  dto.ErrorResponse  "Email ya registrado"
// @Router       /auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	var req dto.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
		return
	}
	u, err := h.auth.Register(c.Request.Context(), service.RegisterInput{
		Email:    req.Email,
		Password: req.Password,
		Role:     domain.Role(req.Role),
	})
	if err != nil {
		switch {
		case errors.Is(err, service.ErrEmailTaken):
			c.JSON(http.StatusConflict, dto.ErrorResponse{Error: err.Error()})
		case errors.Is(err, service.ErrWeakPassword),
			errors.Is(err, domain.ErrInvalidEmail),
			errors.Is(err, domain.ErrInvalidRole):
			c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
		default:
			c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "error interno"})
		}
		return
	}
	c.JSON(http.StatusCreated, toUserResponse(u))
}

// Login godoc
// @Summary      Login
// @Description  Autentica un usuario y devuelve un JWT (válido por 24h).
// @Tags         auth
// @Accept       json
// @Produce      json
// @Param        body  body  dto.LoginRequest  true  "Credenciales"
// @Success      200  {object}  dto.LoginResponse
// @Failure      400  {object}  dto.ErrorResponse
// @Failure      401  {object}  dto.ErrorResponse  "Credenciales inválidas"
// @Router       /auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
		return
	}
	token, u, err := h.auth.Login(c.Request.Context(), req.Email, req.Password)
	if err != nil {
		if errors.Is(err, service.ErrInvalidCredentials) {
			c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "error interno"})
		return
	}
	c.JSON(http.StatusOK, dto.LoginResponse{Token: token, User: toUserResponse(u)})
}

// Me godoc
// @Summary      Usuario autenticado
// @Description  Devuelve los datos del usuario dueño del token.
// @Tags         auth
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  dto.UserResponse
// @Failure      401  {object}  dto.ErrorResponse
// @Router       /auth/me [get]
func (h *AuthHandler) Me(c *gin.Context) {
	userID, ok := middleware.UserIDFrom(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "no autenticado"})
		return
	}
	u, err := h.auth.Me(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "error interno"})
		return
	}
	c.JSON(http.StatusOK, toUserResponse(u))
}

func toUserResponse(u *domain.User) dto.UserResponse {
	return dto.UserResponse{
		ID:        u.ID.String(),
		Email:     u.Email,
		Role:      string(u.Role),
		CreatedAt: u.CreatedAt,
	}
}
