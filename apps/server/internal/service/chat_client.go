package service

import (
	"context"
	"encoding/json"
	"log"
	"time"

	"github.com/BenjaminAliagaMardones/automatch/internal/domain"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

const (
	writeWait      = 10 * time.Second
	pongWait       = 60 * time.Second
	pingPeriod     = (pongWait * 9) / 10
	maxMessageSize = 5120
)

// Client envuelve la conexión WebSocket para un usuario específico.
type Client struct {
	hub    *ChatHub
	conn   *websocket.Conn
	userID uuid.UUID
	send   chan *domain.Message
}

type incomingMessage struct {
	MatchID uuid.UUID `json:"matchId"`
	Body    string    `json:"text"`
}

func NewChatClient(hub *ChatHub, conn *websocket.Conn, userID uuid.UUID) *Client {
	return &Client{
		hub:    hub,
		conn:   conn,
		userID: userID,
		send:   make(chan *domain.Message, 256),
	}
}

func (c *Client) ReadPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error { c.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}

		var inc incomingMessage
		if err := json.Unmarshal(message, &inc); err != nil {
			log.Printf("Formato de mensaje inválido: %v", err)
			continue
		}

		ctx := context.Background()
		// 1. Validar y Guardar el mensaje usando el servicio existente (SRP + DRY)
		savedMsg, err := c.hub.matchService.SendMessage(ctx, inc.MatchID, c.userID, inc.Body)
		if err != nil {
			log.Printf("Error guardando mensaje de %s: %v", c.userID, err)
			continue
		}

		// 2. Transmitir el mensaje guardado (con su ID y CreatedAt real) al hub
		c.hub.broadcast <- savedMsg
	}
}

func (c *Client) WritePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// El hub cerró el canal
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			// Formatear el mensaje para el frontend
			out, err := json.Marshal(map[string]interface{}{
				"id":        message.ID,
				"matchId":   message.MatchID,
				"senderId":  message.SenderID,
				"text":      message.Body,
				"createdAt": message.CreatedAt,
			})
			if err != nil {
				return
			}

			if err := c.conn.WriteMessage(websocket.TextMessage, out); err != nil {
				return
			}

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// Start arranca los goroutines de lectura y escritura.
func (c *Client) Start() {
	c.hub.register <- c
	go c.WritePump()
	go c.ReadPump()
}
