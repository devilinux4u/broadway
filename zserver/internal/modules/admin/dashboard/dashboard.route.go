package dashboard

import (
	"ecom/go/internal/middlewares"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes registers all dashboard routes
func RegisterRoutes(r *gin.RouterGroup) {
	repo := NewRepository()
	service := NewService(repo)
	controller := NewController(service)

	dashboard := r.Group("/dashboard").Use(middlewares.AdminAuthMiddleware())
	{
		// Main dashboard data endpoint
		dashboard.GET("", controller.GetDashboardData)

		// Order statistics
		dashboard.GET("/orders", controller.GetOrderStats)
		dashboard.GET("/orders/recent", controller.GetRecentOrders)

		// Inventory statistics
		dashboard.GET("/inventory", controller.GetInventoryStats)

		// Revenue statistics
		dashboard.GET("/revenue", controller.GetRevenueStats)

		// Low stock items
		dashboard.GET("/low-stock", controller.GetLowStockItems)
	}
}
