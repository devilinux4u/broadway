package auth

import (
	"github.com/gin-gonic/gin"
)

// RegisterRoutes registers all user auth routes
func RegisterRoutes(r *gin.RouterGroup) {
	repo := NewAuthRepository()
	service := NewAuthService(repo)
	controller := NewAuthController(service)
	RegisterControllerRoutes(r, controller)
}

// RegisterControllerRoutes registers all auth routes for the controller
func RegisterControllerRoutes(r *gin.RouterGroup, controller *AuthController) {
	auth := r.Group("/auth")
	{
		// Public routes
		auth.POST("/login", controller.Login)
		auth.POST("/signup", controller.Signup)
		auth.POST("/forgot-password", controller.ForgotPassword)
		auth.POST("/reset-password", controller.ResetPassword)

		// Protected routes (would need auth middleware)
		auth.GET("/profile", controller.GetProfile)
		auth.POST("/logout", controller.Logout)
	}
}
