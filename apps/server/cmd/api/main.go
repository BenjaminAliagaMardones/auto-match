package main

import (
	"log"
	"net/http"
	"time"

	_ "github.com/BenjaminAliagaMardones/automatch/docs"
	"github.com/BenjaminAliagaMardones/automatch/internal/auth"
	"github.com/BenjaminAliagaMardones/automatch/internal/handler"
	"github.com/BenjaminAliagaMardones/automatch/internal/middleware"
	"github.com/BenjaminAliagaMardones/automatch/internal/repository"
	"github.com/BenjaminAliagaMardones/automatch/internal/service"
	"github.com/BenjaminAliagaMardones/automatch/internal/shared/config"
	"github.com/BenjaminAliagaMardones/automatch/internal/shared/db"
	"github.com/gin-gonic/gin"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"golang.org/x/crypto/bcrypt"
)

// @title           AutoMatch API
// @version         0.1
// @description     Backend de AutoMatch — primera entrega (Auth + Perfil).
// @description     Plataforma de matchmaking para vehículos usados (proyecto UCT).
// @host            localhost:8080
// @BasePath        /api/v1
// @schemes         http
// @securityDefinitions.apikey BearerAuth
// @in              header
// @name            Authorization
// @description     Pegar el token devuelto por /auth/login con el prefijo "Bearer ". Ejemplo: "Bearer eyJhbGciOi..."
func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config: %v", err)
	}

	conn, err := db.Open(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("db: %v", err)
	}
	defer conn.Close()

	// Composition root: aquí (y solo aquí) se construye el grafo de
	// dependencias. Cada capa recibe sus colaboradores por constructor.
	hasher := auth.NewBcryptHasher(bcrypt.DefaultCost)
	jwtIssuer := auth.NewJWTIssuer(cfg.JWTSecret, 24*time.Hour)

	userRepo := repository.NewPostgresUserRepository(conn)
	profileRepo := repository.NewPostgresProfileRepository(conn)
	listingRepo := repository.NewPostgresListingRepository(conn)
	swipeRepo := repository.NewPostgresSwipeRepository(conn)
	matchRepo := repository.NewPostgresMatchRepository(conn)
	messageRepo := repository.NewPostgresMessageRepository(conn)

	authService := service.NewAuthService(userRepo, hasher, jwtIssuer)
	profileService := service.NewProfileService(profileRepo)
	listingService := service.NewListingService(listingRepo, userRepo)
	feedService := service.NewFeedService(userRepo, profileRepo, listingRepo)
	matchService := service.NewMatchService(userRepo, listingRepo, swipeRepo, matchRepo, messageRepo)

	authHandler := handler.NewAuthHandler(authService)
	profileHandler := handler.NewProfileHandler(profileService)
	listingHandler := handler.NewListingHandler(listingService)
	feedHandler := handler.NewFeedHandler(feedService)
	matchHandler := handler.NewMatchHandler(matchService)

	chatHub := service.NewChatHub(matchService)
	go chatHub.Run()
	chatHandler := handler.NewChatHandler(chatHub, jwtIssuer)

	r := gin.Default()

	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, PATCH, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})
	r.GET("/api/v1/health", healthCheck)
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))


	api := r.Group("/api/v1")
	{
		api.POST("/auth/register", authHandler.Register)
		api.POST("/auth/login", authHandler.Login)

		// Endpoints públicos de listings (catálogo y detalle).
		api.GET("/listings", listingHandler.Search)
		api.GET("/listings/:id", listingHandler.GetByID)

		protected := api.Group("/")
		protected.Use(middleware.JWTAuth(jwtIssuer))
		{
			protected.GET("/profile/me", profileHandler.GetMe)
			protected.PUT("/profile/me", profileHandler.UpdateMe)

			protected.POST("/listings", listingHandler.Create)
			protected.GET("/listings/me", listingHandler.ListMine)
			protected.PATCH("/listings/:id", listingHandler.Update)
			protected.DELETE("/listings/:id", listingHandler.Delete)

			protected.GET("/feed", feedHandler.Get)
			protected.POST("/swipes", matchHandler.Swipe)

			protected.GET("/matches", matchHandler.ListMine)
			protected.GET("/matches/:id/messages", matchHandler.ListMessages)
			protected.POST("/matches/:id/messages", matchHandler.SendMessage)
		}

		// WebSockets (valida token desde el handler)
		api.GET("/ws/chat", chatHandler.Connect)
	}


	log.Printf("automatch api escuchando en :%s", cfg.Port)
	log.Printf("swagger UI en http://localhost:%s/swagger/index.html", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("server: %v", err)
	}
}

// healthCheck godoc
// @Summary      Healthcheck
// @Description  Verifica que el server responde.
// @Tags         system
// @Produce      json
// @Success      200  {object}  map[string]string
// @Router       /health [get]
func healthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"status": "ok"})
}
