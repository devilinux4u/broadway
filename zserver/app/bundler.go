package app

import (
	"ecom/go/internal/db"
	"ecom/go/internal/middlewares"
	"ecom/go/internal/modules/admin"
	"ecom/go/internal/modules/auth"
	"ecom/go/internal/modules/cart"
	mainpage "ecom/go/internal/modules/main"
	"ecom/go/internal/modules/order"
	"ecom/go/internal/modules/shop"
	"log"
	"os"

	"github.com/gin-gonic/gin"
)

func BundleApp(r *gin.Engine) {
	// Initialize database
	if err := db.InitDB(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Serve uploads directory as static files
	if _, err := os.Stat("uploads"); err == nil {
		r.Static("/uploads", "./uploads")
		log.Println("Serving static files from ./uploads directory")
	}

	// Create API v1 group
	v1 := r.Group("/api/v1")

	// Register user auth routes
	auth.RegisterRoutes(v1)

	// Register admin routes
	admin.RegisterRoutes(v1)

	// Register main page routes
	mainpage.RegisterRoutes(v1)

	// Register shop routes
	shop.RegisterRoutes(v1)

	// Register cart routes with user auth middleware
	cart.RegisterRoutes(v1, middlewares.UserAuthMiddleware())

	// Register order routes with user auth middleware
	order.RegisterRoutes(v1, middlewares.UserAuthMiddleware())

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})
}
