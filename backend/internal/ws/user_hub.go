package ws

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

// UserHub manages WebSocket connections per authenticated user.
type UserHub struct {
	mu    sync.RWMutex
	conns map[string][]*websocket.Conn // userID → connections
}

var Users = &UserHub{conns: make(map[string][]*websocket.Conn)}

// Register opens a WebSocket for a specific user.
func (h *UserHub) Register(w http.ResponseWriter, r *http.Request, userID string) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("user ws upgrade error: %v", err)
		return
	}

	h.mu.Lock()
	h.conns[userID] = append(h.conns[userID], conn)
	count := len(h.conns[userID])
	h.mu.Unlock()

	log.Printf("[UserHub] user %s registered — now %d connection(s)", userID[:8], count)

	go func() {
		defer func() {
			h.mu.Lock()
			list := h.conns[userID]
			for i, c := range list {
				if c == conn {
					h.conns[userID] = append(list[:i], list[i+1:]...)
					break
				}
			}
			remaining := len(h.conns[userID])
			h.mu.Unlock()
			conn.Close()
			log.Printf("[UserHub] user %s disconnected — %d connection(s) remaining", userID[:8], remaining)
		}()
		for {
			if _, _, err := conn.ReadMessage(); err != nil {
				log.Printf("[UserHub] user %s ReadMessage error: %v", userID[:8], err)
				break
			}
		}
	}()
}

// SendToUser pushes a JSON payload to all connections for a user.
func (h *UserHub) SendToUser(userID string, payload []byte) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	conns := h.conns[userID]
	log.Printf("[UserHub] SendToUser %s — %d active connection(s)", userID[:8], len(conns))
	for i, conn := range conns {
		if err := conn.WriteMessage(websocket.TextMessage, payload); err != nil {
			log.Printf("[UserHub] WriteMessage conn[%d] error: %v", i, err)
		} else {
			log.Printf("[UserHub] WriteMessage conn[%d] OK", i)
		}
	}
}

// NotifyUser sends a badge-increment event to the user's connected Flutter app.
func NotifyUser(userID, title, body, notifType string) {
	log.Printf("[UserHub] NotifyUser %s — title=%q", userID[:8], title)
	payload, _ := json.Marshal(map[string]any{
		"event": "new_notification",
		"notification": map[string]any{
			"title": title,
			"body":  body,
			"type":  notifType,
		},
	})
	Users.SendToUser(userID, payload)
}
