package main

import (
	"log"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"cupid_ai/backend/internal/config"
	"cupid_ai/backend/internal/database"
	"cupid_ai/backend/internal/handlers"
	"cupid_ai/backend/internal/middleware"
	"cupid_ai/backend/internal/repository"
	"cupid_ai/backend/internal/services"
)

func main() {
	cfg := config.Load()

	db := database.Connect(cfg)
	defer db.Close()

	database.RunMigrations(db)

	// Repositories
	userRepo := repository.NewUserRepository(db)
	analysisRepo := repository.NewAnalysisRepository(db)

	// Services
	authService := services.NewAuthService(userRepo, cfg.JWTSecret)
	analysisService := services.NewAnalysisService(analysisRepo, cfg.AIServiceURL)

	// Handlers
	authHandler := handlers.NewAuthHandler(authService)
	analysisHandler := handlers.NewAnalysisHandler(analysisService, userRepo)
	profileHandler := handlers.NewProfileHandler(userRepo, analysisRepo)

	// Router
	r := gin.Default()

	// CORS — allow Flutter web (Chrome) and mobile requests
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: false,
		MaxAge:           12 * time.Hour,
	}))

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Auth routes (public)
	auth := r.Group("/api/v1/auth")
	{
		auth.POST("/register", authHandler.Register)
		auth.POST("/login", authHandler.Login)
	}

	// Protected routes
	api := r.Group("/api/v1")
	api.Use(middleware.AuthRequired(cfg.JWTSecret))
	{
		api.POST("/analysis", analysisHandler.Analyze)
		api.GET("/analysis/history", analysisHandler.GetHistory)

		api.GET("/profile", profileHandler.GetProfile)
		api.PATCH("/profile", profileHandler.UpdateProfile)
	}

	log.Printf("Backend running on port %s", cfg.Port)
	r.Run(":" + cfg.Port)
}
