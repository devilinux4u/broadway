package auth

import (
	"github.com/gin-gonic/gin"
)

// RegisterRoutes registers all auth routes
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
		auth.POST("/login", controller.Login)
		auth.POST("/register", controller.Register)
		auth.POST("/logout", controller.Logout)
	}
}
