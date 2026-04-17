package content

import (
	"ecom/go/internal/middlewares"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes registers all content routes
func RegisterRoutes(r *gin.RouterGroup) {
	repo := NewRepository()
	service := NewService(repo)
	controller := NewController(service)

	content := r.Group("/content").Use(middlewares.AdminAuthMiddleware())
	{
		// Get specific section
		content.GET("/section", controller.GetSection)

		// Get all sections
		content.GET("/sections", controller.GetAllSections)

		// Update or create section
		content.PUT("/section", controller.UpdateSection)

		// Delete section
		content.DELETE("/section", controller.DeleteSection)

		// Upload image
		content.POST("/upload", controller.UploadImage)

		// Featured products routes
		content.GET("/products", controller.GetProducts)
		content.PUT("/products/featured", controller.ToggleFeatured)
		content.PUT("/products/new-arrival", controller.ToggleNewArrival)
	}
}
