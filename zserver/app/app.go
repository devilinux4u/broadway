package app

import (
	"ecom/go/internal/middlewares"
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

type App struct {
	Engine *gin.Engine
}

func Init() *App {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Set Gin to config mode
	if os.Getenv("APP_ENV") == "production" {
		gin.SetMode(gin.ReleaseMode)
	} else {
		gin.SetMode(gin.DebugMode)
	}

	// Initialize Gin engine
	r := gin.Default()
	r.Use(middlewares.CORSMiddleware())

	log.Println("Setting up routes...")
	BundleApp(r)
	log.Println("Routes setup completed")

	return &App{
		Engine: r,
	}
}
