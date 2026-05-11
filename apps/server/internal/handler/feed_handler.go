package handler

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/BenjaminAliagaMardones/automatch/internal/handler/dto"
	"github.com/BenjaminAliagaMardones/automatch/internal/middleware"
	"github.com/BenjaminAliagaMardones/automatch/internal/service"
	"github.com/gin-gonic/gin"
)

type FeedHandler struct {
	feed *service.FeedService
}

func NewFeedHandler(feed *service.FeedService) *FeedHandler {
	return &FeedHandler{feed: feed}
}

// Get godoc
// @Summary      Feed del comprador
// @Description  Devuelve listings activos compatibles con las preferencias del comprador, excluyendo los ya swipeados.
// @Tags         feed
// @Produce      json
// @Security     BearerAuth
// @Param        limit   query  int  false  "Cantidad (default 20, máx 100)"
// @Param        offset  query  int  false  "Offset para paginación"
// @Success      200  {object}  dto.ListingListResponse
// @Failure      401  {object}  dto.ErrorResponse
// @Failure      403  {object}  dto.ErrorResponse  "No eres buyer"
// @Router       /feed [get]
func (h *FeedHandler) Get(c *gin.Context) {
	userID, ok := middleware.UserIDFrom(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "no autenticado"})
		return
	}
	limit, _ := strconv.Atoi(c.Query("limit"))
	offset, _ := strconv.Atoi(c.Query("offset"))

	list, err := h.feed.Build(c.Request.Context(), userID, limit, offset)
	if err != nil {
		if errors.Is(err, service.ErrNotBuyer) {
			c.JSON(http.StatusForbidden, dto.ErrorResponse{Error: err.Error()})
			return
		}
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "error interno"})
		return
	}
	c.JSON(http.StatusOK, toListingListResponse(list))
}
