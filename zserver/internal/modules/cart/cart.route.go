package cart

import "github.com/gin-gonic/gin"

// RegisterRoutes registers all cart routes
func RegisterRoutes(r *gin.RouterGroup, authMiddleware gin.HandlerFunc) {
	repo := NewRepository()
	service := NewService(repo)
	controller := NewController(service)

	cart := r.Group("/cart")
	cart.Use(authMiddleware) // All cart routes require authentication
	{
		// Get user's cart
		cart.GET("", controller.GetCart)

		// Add item to cart
		cart.POST("/add", controller.AddToCart)

		// Update cart item quantity
		cart.PUT("/update", controller.UpdateCartItem)

		// Remove item from cart
		cart.POST("/remove", controller.RemoveFromCart)

		// Clear entire cart
		cart.POST("/clear", controller.ClearCart)
	}
}
