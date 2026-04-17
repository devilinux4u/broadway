package order

import "github.com/gin-gonic/gin"

// RegisterRoutes registers all order routes
func RegisterRoutes(r *gin.RouterGroup, authMiddleware gin.HandlerFunc) {
	repo := NewRepository()
	service := NewService(repo)
	controller := NewController(service)

	// Public route for payment verification (Khalti callback)
	r.GET("/orders/verify-payment", controller.VerifyKhaltiPayment)

	orders := r.Group("/orders")
	orders.Use(authMiddleware) // All order routes require authentication
	{
		// Get user's orders
		orders.GET("", controller.GetOrders)

		// Checkout and create order
		orders.POST("/checkout", controller.Checkout)

		// Get specific order with items
		orders.GET("/:orderId", controller.GetOrderDetail)
	}
}
