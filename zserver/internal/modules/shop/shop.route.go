package shop

import "github.com/gin-gonic/gin"

// RegisterRoutes registers all shop routes
func RegisterRoutes(r *gin.RouterGroup) {
	repo := NewRepository()
	service := NewService(repo)
	controller := NewController(service)

	shop := r.Group("/shop")
	{
		// Get all products
		shop.GET("/products", controller.GetAllProducts)

		// Get products by category
		shop.GET("/products/category", controller.GetProductsByCategory)

		// Search products
		shop.GET("/products/search", controller.SearchProducts)

		// Get product by ID
		shop.GET("/products/:id", controller.GetProductByID)
	}
}
