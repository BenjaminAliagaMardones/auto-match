package service

import (
	"context"
	"log"
	"sync"

	"github.com/BenjaminAliagaMardones/automatch/internal/domain"
	"github.com/google/uuid"
)

// ChatHub gestiona las conexiones activas y enruta los mensajes.
// Sigue el Single Responsibility Principle.
type ChatHub struct {
	matchService *MatchService

	// clients mapea userID -> mapa de clientes (un usuario puede tener varias pestañas abiertas)
	clients map[uuid.UUID]map[*Client]bool
	mu      sync.RWMutex

	register   chan *Client
	unregister chan *Client
	broadcast  chan *domain.Message
}

func NewChatHub(matchService *MatchService) *ChatHub {
	return &ChatHub{
		matchService: matchService,
		clients:      make(map[uuid.UUID]map[*Client]bool),
		register:     make(chan *Client),
		unregister:   make(chan *Client),
		broadcast:    make(chan *domain.Message),
	}
}

func (h *ChatHub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			if _, ok := h.clients[client.userID]; !ok {
				h.clients[client.userID] = make(map[*Client]bool)
			}
			h.clients[client.userID][client] = true
			h.mu.Unlock()
			log.Printf("Cliente registrado: %s", client.userID)

		case client := <-h.unregister:
			h.mu.Lock()
			if connections, ok := h.clients[client.userID]; ok {
				if _, ok := connections[client]; ok {
					delete(connections, client)
					close(client.send)
					if len(connections) == 0 {
						delete(h.clients, client.userID)
					}
				}
			}
			h.mu.Unlock()
			log.Printf("Cliente desregistrado: %s", client.userID)

		case message := <-h.broadcast:
			// Obtener los participantes del match para saber a quién enviar el mensaje.
			ctx := context.Background()
			participants, err := h.matchService.GetParticipants(ctx, message.MatchID)
			if err != nil {
				log.Printf("Error obteniendo participantes del match %s: %v", message.MatchID, err)
				continue
			}

			// Lock de escritura: si un cliente tiene el buffer lleno se
			// desconecta aquí mismo (close + delete mutan el mapa).
			h.mu.Lock()
			for _, participantID := range participants {
				if connections, ok := h.clients[participantID]; ok {
					for client := range connections {
						select {
						case client.send <- message:
						default:
							close(client.send)
							delete(connections, client)
						}
					}
					if len(connections) == 0 {
						delete(h.clients, participantID)
					}
				}
			}
			h.mu.Unlock()
		}
	}
}
