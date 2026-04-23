package analytics

import (
	"ecom/go/internal/middlewares"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes registers all analytics routes.
func RegisterRoutes(r *gin.RouterGroup) {
	repo := NewRepository()
	service := NewService(repo)
	controller := NewController(service)

	analytics := r.Group("/analytics").Use(middlewares.AdminAuthMiddleware())
	{
		analytics.GET("", controller.GetFullAnalytics)
		analytics.GET("/overview", controller.GetOverview)
		analytics.GET("/monthly-sales", controller.GetMonthlySales)
		analytics.GET("/top-products", controller.GetTopProducts)
		analytics.GET("/payment-income", controller.GetPaymentIncome)
	}
}
