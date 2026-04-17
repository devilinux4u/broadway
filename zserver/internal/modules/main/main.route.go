package mainpage

import (
	"github.com/gin-gonic/gin"
)

// RegisterRoutes registers all main page routes
func RegisterRoutes(r *gin.RouterGroup) {
	repo := NewRepository()
	service := NewService(repo)
	controller := NewController(service)

	main := r.Group("/main")
	{
		// Get all page content sections
		main.GET("", controller.GetPageContent)

		// Get specific section
		main.GET("/section", controller.GetSectionContent)
	}
}
