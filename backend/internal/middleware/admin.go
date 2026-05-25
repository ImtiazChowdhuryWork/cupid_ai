package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

// AdminRequired checks for a static admin token in the X-Admin-Token header.
// Set ADMIN_TOKEN in .env — the dashboard sends this on every admin request.
func AdminRequired(adminToken string) gin.HandlerFunc {
	return func(c *gin.Context) {
		if adminToken == "" {
			// If no admin token configured, allow (dev mode)
			c.Next()
			return
		}

		provided := c.GetHeader("X-Admin-Token")
		if provided == "" {
			// Also check Authorization: Bearer <token>
			auth := c.GetHeader("Authorization")
			provided = strings.TrimPrefix(auth, "Bearer ")
		}

		if provided != adminToken {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "Admin authentication required",
			})
			return
		}

		c.Next()
	}
}
