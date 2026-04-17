package dashboard

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// Controller handles HTTP requests for dashboard
type Controller struct {
	service *Service
}

// NewController creates a new dashboard controller
func NewController(service *Service) *Controller {
	return &Controller{
		service: service,
	}
}

// GetDashboardData godoc
// @Summary Get complete dashboard data
// @Description Retrieve all dashboard statistics, recent orders, and low stock items
// @Tags Dashboard
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} map[string]string
// @Router /admin/dashboard [get]
func (c *Controller) GetDashboardData(ctx *gin.Context) {
	data, err := c.service.GetDashboardData()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get dashboard data: " + err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    data,
	})
}

// GetOrderStats godoc
// @Summary Get order statistics
// @Description Retrieve orders grouped by status
// @Tags Dashboard
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} map[string]string
// @Router /admin/dashboard/orders [get]
func (c *Controller) GetOrderStats(ctx *gin.Context) {
	breakdown, err := c.service.GetOrderStats()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get order stats: " + err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    breakdown,
	})
}

// GetInventoryStats godoc
// @Summary Get inventory statistics
// @Description Retrieve inventory summary information
// @Tags Dashboard
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} map[string]string
// @Router /admin/dashboard/inventory [get]
func (c *Controller) GetInventoryStats(ctx *gin.Context) {
	summary, err := c.service.GetInventoryStats()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get inventory stats: " + err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    summary,
	})
}

// GetRevenueStats godoc
// @Summary Get revenue statistics
// @Description Retrieve revenue information by payment status
// @Tags Dashboard
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} map[string]string
// @Router /admin/dashboard/revenue [get]
func (c *Controller) GetRevenueStats(ctx *gin.Context) {
	stats, err := c.service.GetRevenueData()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get revenue stats: " + err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    stats,
	})
}

// GetRecentOrders godoc
// @Summary Get recent orders
// @Description Retrieve recent orders with optional limit
// @Tags Dashboard
// @Produce json
// @Param limit query integer false "Number of orders to retrieve (default: 10, max: 100)"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /admin/dashboard/orders/recent [get]
func (c *Controller) GetRecentOrders(ctx *gin.Context) {
	limitStr := ctx.DefaultQuery("limit", "10")
	limit, err := strconv.Atoi(limitStr)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid limit parameter",
		})
		return
	}

	orders, err := c.service.GetRecentOrdersList(limit)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get recent orders: " + err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    orders,
	})
}

// GetLowStockItems godoc
// @Summary Get low stock items
// @Description Retrieve all products with stock below threshold
// @Tags Dashboard
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} map[string]string
// @Router /admin/dashboard/low-stock [get]
func (c *Controller) GetLowStockItems(ctx *gin.Context) {
	items, err := c.service.GetLowStockItems()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to get low stock items: " + err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    items,
	})
}
