package middlewares

import (
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func CORSMiddleware() gin.HandlerFunc {
	return cors.New(cors.Config{
		AllowOrigins: []string{
			"http://localhost:8080", // dev frontend
			"http://localhost:3000", // dev vite
			"http://127.0.0.1:8080",
			"http://127.0.0.1:3000",
			"https://*.trycloudflare.com",
			"https://trainers-anderson-diego-charges.trycloudflare.com",
			"https://broadway-alpha.vercel.app", // Vercel deployments
			// Add your production domain here:
			// "https://your-domain.com",
			// "https://www.your-domain.com",
		},
		AllowMethods: []string{
			"GET",
			"POST",
			"PUT",
			"DELETE",
			"PATCH",
			"OPTIONS",
		},
		AllowHeaders: []string{
			"Authorization",
			"Content-Type",
			"Accept",
			"ngrok-skip-browser-warning",
		},
		ExposeHeaders: []string{
			"Content-Length",
		},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	})
}
