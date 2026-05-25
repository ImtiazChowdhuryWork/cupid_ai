package main

import (
	"log"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"

	"cupid_ai/backend/internal/config"
	"cupid_ai/backend/internal/database"
	"cupid_ai/backend/internal/handlers"
	"cupid_ai/backend/internal/middleware"
	"cupid_ai/backend/internal/repository"
	"cupid_ai/backend/internal/services"
	"cupid_ai/backend/internal/ws"
)

func main() {
	cfg := config.Load()

	db := database.Connect(cfg)
	defer db.Close()

	database.RunMigrations(db)

	// Repositories
	userRepo          := repository.NewUserRepository(db)
	analysisRepo      := repository.NewAnalysisRepository(db)
	settingsRepo      := repository.NewSettingsRepository(db)
	refreshTokenRepo  := repository.NewRefreshTokenRepository(db)
	challengeRepo     := repository.NewChallengeRepository(db)

	// Services
	authService     := services.NewAuthService(userRepo, cfg.JWTSecret)
	analysisService := services.NewAnalysisService(analysisRepo, settingsRepo, cfg.AIServiceURL)

	// Verification-code repos (emailed codes for signup + sensitive actions)
	twoFactorRepo := repository.NewTwoFactorRepository(db)
	pendingRepo   := repository.NewPendingSignupRepository(db)

	// Handlers
	authHandler     := handlers.NewAuthHandler(authService, refreshTokenRepo, userRepo, twoFactorRepo, pendingRepo, settingsRepo, cfg)
	analysisHandler := handlers.NewAnalysisHandler(analysisService, userRepo)
	profileHandler  := handlers.NewProfileHandler(userRepo, analysisRepo, twoFactorRepo, refreshTokenRepo, settingsRepo, cfg)
	settingsHandler   := handlers.NewSettingsHandler(settingsRepo, cfg.AIServiceURL)
	challengeHandler  := handlers.NewChallengeHandler(challengeRepo)
	supportRepo      := repository.NewSupportRepository(db)
	dataReqRepo      := repository.NewDataRequestRepository(db)
	notifRepo        := repository.NewNotificationRepository(db)
	dataReqHandler   := handlers.NewDataRequestHandler(dataReqRepo, userRepo, settingsRepo, notifRepo, db, cfg)
	faqRepo          := repository.NewFAQRepository(db)
	faqHandler       := handlers.NewFAQHandler(faqRepo)
	topicRepo        := repository.NewHelpTopicRepository(db)
	topicHandler     := handlers.NewHelpTopicHandler(topicRepo)
	supportHandler   := handlers.NewSupportHandler(supportRepo, userRepo, notifRepo, settingsRepo)
	notifHandler     := handlers.NewNotificationHandler(notifRepo)

	// Router
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "X-Admin-Token"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: false,
		MaxAge:           12 * time.Hour,
	}))

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	// Public app config — legal URLs, app version (no auth required)
	r.GET("/api/v1/app-config", func(c *gin.Context) {
		settings, err := settingsRepo.Get()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(200, gin.H{
			"privacy_policy_url": settings.PrivacyPolicyURL,
			"terms_url":          settings.TermsURL,
			"cookie_policy_url":  settings.CookiePolicyURL,
			"app_version":        settings.AppVersion,
		})
	})

	// Auth — public
	auth := r.Group("/api/v1/auth")
	{
		auth.POST("/register",         authHandler.Register)
		auth.POST("/register/verify",  authHandler.VerifyRegistration)
		auth.POST("/register/resend",  authHandler.ResendRegistration)
		auth.POST("/login",            authHandler.Login)
		auth.POST("/forgot-password",  authHandler.ForgotPassword)
		auth.POST("/reset-password",   authHandler.ResetPassword)
		auth.POST("/refresh",          authHandler.Refresh)
		auth.POST("/logout",           authHandler.Logout)
		auth.POST("/google",           authHandler.GoogleSignIn)
	}

	// User routes — require valid JWT
	api := r.Group("/api/v1")
	api.Use(middleware.AuthRequired(cfg.JWTSecret))
	{
		api.POST("/analysis",        analysisHandler.Analyze)
		api.GET("/analysis/history", analysisHandler.GetHistory)
		api.GET("/profile",            profileHandler.GetProfile)
		api.PATCH("/profile",          profileHandler.UpdateProfile)
		api.GET("/challenge/today",          challengeHandler.GetTodaysChallenge)
		api.PATCH("/profile/fcm-token",      profileHandler.UpdateFCMToken)
		api.POST("/profile/change-password", profileHandler.ChangePassword)
		api.POST("/profile/change-email",    profileHandler.ChangeEmail)
		api.POST("/profile/send-code",       profileHandler.SendActionCode)
		api.DELETE("/account",               authHandler.DeleteAccount)
		api.POST("/data-requests",           dataReqHandler.Create)
		api.POST("/support/contact",         supportHandler.SubmitTicket)
		api.GET("/support/faqs",             faqHandler.GetActive)
		api.GET("/support/topics",           topicHandler.GetActive)
		api.GET("/notifications",            notifHandler.GetNotifications)
		api.GET("/notifications/unread",     notifHandler.UnreadCount)
		api.PATCH("/notifications/read",     notifHandler.MarkAllRead)
	}

	// Admin routes — require X-Admin-Token header
	admin := r.Group("/api/v1/admin")
	admin.Use(middleware.AdminRequired(cfg.AdminToken))
	{
		admin.GET("/settings",              settingsHandler.GetSettings)
		admin.PATCH("/settings",            settingsHandler.UpdateSettings)
		admin.POST("/settings/test",        settingsHandler.TestAPIKey)
		admin.POST("/settings/verify-mail", settingsHandler.VerifyMail)
			admin.GET("/support/tickets",         supportHandler.GetAllTickets)
		admin.GET("/data-requests",                  dataReqHandler.GetAll)
		admin.PATCH("/data-requests/:id",            dataReqHandler.UpdateStatus)
		admin.GET("/data-requests/:id/export",       dataReqHandler.GenerateExport)
		admin.POST("/data-requests/:id/send-email",  dataReqHandler.SendExportEmail)
		admin.GET("/faqs",                   faqHandler.GetAll)
		admin.POST("/faqs",                  faqHandler.Create)
		admin.PATCH("/faqs/:id",             faqHandler.Update)
		admin.DELETE("/faqs/:id",            faqHandler.Delete)
		admin.GET("/topics",                 topicHandler.GetAll)
		admin.POST("/topics",                topicHandler.Create)
		admin.PATCH("/topics/:id",           topicHandler.Update)
		admin.DELETE("/topics/:id",          topicHandler.Delete)
		admin.PATCH("/support/tickets/:id", supportHandler.UpdateTicket)
	}

	// WebSocket — user connects for real-time notification badge updates
	r.GET("/ws/notifications", func(c *gin.Context) {
		token := c.Query("token")
		userID, err := middleware.ExtractUserID(token, cfg.JWTSecret)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}
		ws.Users.Register(c.Writer, c.Request, userID)
	})

	// WebSocket — dashboard connects here for real-time ticket events
	// Uses X-Admin-Token query param because WS headers aren't easy to set from browsers
	r.GET("/ws/support", func(c *gin.Context) {
		token := c.Query("token")
		if cfg.AdminToken != "" && token != cfg.AdminToken {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		ws.Global.Register(c.Writer, c.Request)
	})

	log.Printf("Backend running on port %s", cfg.Port)
	r.Run(":" + cfg.Port)
}
