package handler

import (
	"log"
	"net/http"

	"github.com/BenjaminAliagaMardones/automatch/internal/auth"
	"github.com/BenjaminAliagaMardones/automatch/internal/service"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // En producción, restringir a dominios permitidos
	},
}

type ChatHandler struct {
	hub       *service.ChatHub
	jwtIssuer *auth.JWTIssuer
}

func NewChatHandler(hub *service.ChatHub, jwtIssuer *auth.JWTIssuer) *ChatHandler {
	return &ChatHandler{
		hub:       hub,
		jwtIssuer: jwtIssuer,
	}
}

func (h *ChatHandler) Connect(c *gin.Context) {
	// Extraer token de la URL (query param) porque JS WebSockets no soportan headers nativos
	token := c.Query("token")
	if token == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token requerido"})
		return
	}

	claims, err := h.jwtIssuer.Parse(token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Println("Error upgrade websocket:", err)
		return
	}

	// Crear cliente y arrancar su ciclo de vida (esto lo registra en el Hub)
	client := service.NewChatClient(h.hub, conn, claims.UserID)
	client.Start()
}

