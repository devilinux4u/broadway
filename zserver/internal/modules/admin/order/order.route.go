package order

import (
	"ecom/go/internal/middlewares"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes registers all order routes
func RegisterRoutes(r *gin.RouterGroup) {
	repo := NewRepository()
	service := NewService(repo)
	controller := NewController(service)

	orders := r.Group("/orders").Use(middlewares.AdminAuthMiddleware())
	{
		// Order CRUD routes
		orders.POST("", controller.CreateOrder)
		orders.GET("", controller.GetAllOrders)
		orders.GET("/:id", controller.GetOrderByID)
		orders.PUT("/:id", controller.UpdateOrder)
		orders.DELETE("/:id", controller.DeleteOrder)

		// Order status routes
		orders.PUT("/:id/status", controller.UpdateOrderStatus)
		orders.PUT("/:id/payment-status", controller.UpdatePaymentStatus)

		// User orders
		orders.GET("/user/:user_id", controller.GetUserOrders)

		// Statistics and search
		orders.GET("/stats/overview", controller.GetOrderStats)
		orders.GET("/search", controller.SearchOrders)
	}
}
