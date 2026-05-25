package ws

import (
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true }, // allow all origins in dev
}

// Hub manages all connected dashboard WebSocket clients.
type Hub struct {
	mu      sync.RWMutex
	clients map[*websocket.Conn]bool
}

var Global = &Hub{clients: make(map[*websocket.Conn]bool)}

// Register accepts a new WebSocket connection from a dashboard client.
func (h *Hub) Register(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("ws upgrade error: %v", err)
		return
	}

	h.mu.Lock()
	h.clients[conn] = true
	h.mu.Unlock()

	log.Printf("ws: dashboard client connected (%d total)", len(h.clients))

	// Keep connection open; remove client on disconnect
	go func() {
		defer func() {
			h.mu.Lock()
			delete(h.clients, conn)
			h.mu.Unlock()
			conn.Close()
			log.Printf("ws: dashboard client disconnected (%d remaining)", len(h.clients))
		}()
		for {
			// Read and discard pings from the client; exit on error/close
			if _, _, err := conn.ReadMessage(); err != nil {
				break
			}
		}
	}()
}

// Broadcast sends a JSON payload to every connected dashboard client.
func (h *Hub) Broadcast(payload []byte) {
	h.mu.RLock()
	defer h.mu.RUnlock()

	for conn := range h.clients {
		if err := conn.WriteMessage(websocket.TextMessage, payload); err != nil {
			log.Printf("ws broadcast error: %v", err)
		}
	}
}
