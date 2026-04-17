package inventory

import (
	"ecom/go/internal/middlewares"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes registers all inventory routes
func RegisterRoutes(r *gin.RouterGroup) {
	repo := NewRepository()
	service := NewService(repo)
	controller := NewController(service)

	inventory := r.Group("/inventory").Use(middlewares.AdminAuthMiddleware())
	{
		// Product routes
		inventory.POST("/products", controller.CreateProduct)
		inventory.GET("/products", controller.GetAllProducts)
		inventory.GET("/products/:id", controller.GetProductByID)
		inventory.PUT("/products/:id", controller.UpdateProduct)
		inventory.DELETE("/products/:id", controller.DeleteProduct)

		// Stock movement routes
		inventory.POST("/stock-movements", controller.AddStockMovement)
		inventory.GET("/stock-movements", controller.GetStockMovements)

		// Image routes
		inventory.POST("/products/:product_id/images", controller.UploadImages)
		inventory.DELETE("/images/:image_id", controller.DeleteProductImage)

		// Color routes
		inventory.POST("/products/:product_id/colors", controller.AddProductColors)

		// Low stock routes
		inventory.GET("/low-stock", controller.GetLowStockProducts)
	}
}
