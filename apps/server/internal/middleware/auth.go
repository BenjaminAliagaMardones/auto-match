package middleware

import (
	"net/http"
	"strings"

	"github.com/BenjaminAliagaMardones/automatch/internal/auth"
	"github.com/BenjaminAliagaMardones/automatch/internal/handler/dto"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

const (
	ctxKeyUserID = "auth.user_id"
)

// JWTAuth aplica el patrón Chain of Responsibility de Gin: valida el token
// antes de dejar pasar la request al handler.
func JWTAuth(j *auth.JWTIssuer) gin.HandlerFunc {
	return func(c *gin.Context) {
		header := c.GetHeader("Authorization")
		if header == "" || !strings.HasPrefix(header, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, dto.ErrorResponse{Error: "token requerido"})
			return
		}
		token := strings.TrimPrefix(header, "Bearer ")
		claims, err := j.Parse(token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, dto.ErrorResponse{Error: err.Error()})
			return
		}
		c.Set(ctxKeyUserID, claims.UserID)
		c.Next()
	}
}

func UserIDFrom(c *gin.Context) (uuid.UUID, bool) {
	v, exists := c.Get(ctxKeyUserID)
	if !exists {
		return uuid.Nil, false
	}
	id, ok := v.(uuid.UUID)
	return id, ok
}
