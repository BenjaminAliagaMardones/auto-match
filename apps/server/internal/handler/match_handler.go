package handler

import (
	"errors"
	"net/http"

	"github.com/BenjaminAliagaMardones/automatch/internal/domain"
	"github.com/BenjaminAliagaMardones/automatch/internal/handler/dto"
	"github.com/BenjaminAliagaMardones/automatch/internal/middleware"
	"github.com/BenjaminAliagaMardones/automatch/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type MatchHandler struct {
	matches *service.MatchService
}

func NewMatchHandler(matches *service.MatchService) *MatchHandler {
	return &MatchHandler{matches: matches}
}

// Swipe godoc
// @Summary      Registrar swipe (like / pass)
// @Description  Si la dirección es 'like' y el listing está activo, se crea automáticamente un Match (FR-19).
// @Tags         feed
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        body  body  dto.SwipeRequest  true  "Swipe"
// @Success      200  {object}  dto.SwipeResponse
// @Failure      400  {object}  dto.ErrorResponse
// @Failure      401  {object}  dto.ErrorResponse
// @Failure      403  {object}  dto.ErrorResponse
// @Failure      404  {object}  dto.ErrorResponse
// @Router       /swipes [post]
func (h *MatchHandler) Swipe(c *gin.Context) {
	userID, ok := middleware.UserIDFrom(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "no autenticado"})
		return
	}
	var req dto.SwipeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
		return
	}
	listingID, _ := uuid.Parse(req.ListingID)
	res, err := h.matches.Swipe(c.Request.Context(), userID, listingID, domain.SwipeDirection(req.Direction))
	if err != nil {
		respondMatchError(c, err)
		return
	}
	out := dto.SwipeResponse{
		ListingID:    res.Swipe.ListingID.String(),
		Direction:    string(res.Swipe.Direction),
		MatchCreated: res.Created,
	}
	if res.Match != nil {
		m := toMatchResponse(res.Match)
		out.Match = &m
	}
	c.JSON(http.StatusOK, out)
}

// ListMine godoc
// @Summary      Mis matches
// @Description  Listado de matches en los que el usuario participa (como buyer o como seller del listing).
// @Tags         matches
// @Produce      json
// @Security     BearerAuth
// @Success      200  {object}  dto.MatchListResponse
// @Failure      401  {object}  dto.ErrorResponse
// @Router       /matches [get]
func (h *MatchHandler) ListMine(c *gin.Context) {
	userID, ok := middleware.UserIDFrom(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "no autenticado"})
		return
	}
	list, err := h.matches.ListMatches(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "error interno"})
		return
	}
	items := make([]dto.MatchResponse, 0, len(list))
	for _, m := range list {
		resp := toMatchResponse(m)
		if listing, err := h.matches.GetListing(c.Request.Context(), m.ListingID); err == nil {
			resp.ListingBrand = listing.Brand
			resp.ListingModel = listing.Model
			
			otherUserID := m.BuyerID
			if userID == m.BuyerID {
				otherUserID = listing.SellerID
			}
			if otherUser, err := h.matches.GetUser(c.Request.Context(), otherUserID); err == nil {
				resp.OtherUserEmail = otherUser.Email
			}
		}
		items = append(items, resp)
	}
	c.JSON(http.StatusOK, dto.MatchListResponse{Items: items, Count: len(items)})
}

// ListMessages godoc
// @Summary      Historial de mensajes de un match
// @Tags         matches
// @Produce      json
// @Security     BearerAuth
// @Param        id  path  string  true  "Match ID"
// @Success      200  {object}  dto.MessageListResponse
// @Failure      401  {object}  dto.ErrorResponse
// @Failure      403  {object}  dto.ErrorResponse  "No participas en este match"
// @Failure      404  {object}  dto.ErrorResponse
// @Router       /matches/{id}/messages [get]
func (h *MatchHandler) ListMessages(c *gin.Context) {
	userID, ok := middleware.UserIDFrom(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "no autenticado"})
		return
	}
	matchID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "id inválido"})
		return
	}
	msgs, err := h.matches.ListMessages(c.Request.Context(), matchID, userID)
	if err != nil {
		respondMatchError(c, err)
		return
	}
	items := make([]dto.MessageResponse, 0, len(msgs))
	for _, m := range msgs {
		items = append(items, toMessageResponse(m))
	}
	c.JSON(http.StatusOK, dto.MessageListResponse{Items: items, Count: len(items)})
}

// SendMessage godoc
// @Summary      Enviar mensaje en un match
// @Tags         matches
// @Accept       json
// @Produce      json
// @Security     BearerAuth
// @Param        id    path  string                  true  "Match ID"
// @Param        body  body  dto.SendMessageRequest  true  "Mensaje"
// @Success      201  {object}  dto.MessageResponse
// @Failure      400  {object}  dto.ErrorResponse
// @Failure      401  {object}  dto.ErrorResponse
// @Failure      403  {object}  dto.ErrorResponse
// @Failure      404  {object}  dto.ErrorResponse
// @Router       /matches/{id}/messages [post]
func (h *MatchHandler) SendMessage(c *gin.Context) {
	userID, ok := middleware.UserIDFrom(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "no autenticado"})
		return
	}
	matchID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "id inválido"})
		return
	}
	var req dto.SendMessageRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
		return
	}
	msg, err := h.matches.SendMessage(c.Request.Context(), matchID, userID, req.Body)
	if err != nil {
		respondMatchError(c, err)
		return
	}
	c.JSON(http.StatusCreated, toMessageResponse(msg))
}

func respondMatchError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, service.ErrMatchNotFound),
		errors.Is(err, service.ErrListingNotFound):
		c.JSON(http.StatusNotFound, dto.ErrorResponse{Error: err.Error()})
	case errors.Is(err, service.ErrNotMatchParticipant),
		errors.Is(err, service.ErrNotBuyer),
		errors.Is(err, service.ErrCannotSwipeOwnListing),
		errors.Is(err, service.ErrListingNotActive):
		c.JSON(http.StatusForbidden, dto.ErrorResponse{Error: err.Error()})
	case errors.Is(err, domain.ErrInvalidSwipeDirection),
		errors.Is(err, domain.ErrEmptyMessage):
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: err.Error()})
	default:
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "error interno"})
	}
}

func toMatchResponse(m *domain.Match) dto.MatchResponse {
	return dto.MatchResponse{
		ID:        m.ID.String(),
		BuyerID:   m.BuyerID.String(),
		ListingID: m.ListingID.String(),
		CreatedAt: m.CreatedAt,
	}
}

func toMessageResponse(m *domain.Message) dto.MessageResponse {
	return dto.MessageResponse{
		ID:        m.ID.String(),
		MatchID:   m.MatchID.String(),
		SenderID:  m.SenderID.String(),
		Body:      m.Body,
		CreatedAt: m.CreatedAt,
	}
}
