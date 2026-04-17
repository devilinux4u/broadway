package admin

import (
	"ecom/go/internal/modules/admin/auth"
	"ecom/go/internal/modules/admin/content"
	"ecom/go/internal/modules/admin/dashboard"
	"ecom/go/internal/modules/admin/inventory"
	"ecom/go/internal/modules/admin/order"

	"github.com/gin-gonic/gin"
)

// RegisterRoutes registers all admin routes
func RegisterRoutes(r *gin.RouterGroup) {
	admin := r.Group("/admin")
	{
		// Auth routes
		auth.RegisterRoutes(admin)

		// Dashboard routes
		dashboard.RegisterRoutes(admin)

		// Inventory routes
		inventory.RegisterRoutes(admin)

		// Content routes
		content.RegisterRoutes(admin)

		// Order routes
		order.RegisterRoutes(admin)
	}
}
