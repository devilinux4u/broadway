package analytics

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// Controller handles analytics HTTP requests.
type Controller struct {
	service *Service
}

// NewController creates a new analytics controller.
func NewController(service *Service) *Controller {
	return &Controller{service: service}
}

// GetFullAnalytics returns complete analytics payload.
func (c *Controller) GetFullAnalytics(ctx *gin.Context) {
	months, _ := strconv.Atoi(ctx.DefaultQuery("months", "12"))
	limit, _ := strconv.Atoi(ctx.DefaultQuery("top_products_limit", "10"))

	data, err := c.service.GetFullAnalytics(months, limit)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get analytics data: " + err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    data,
	})
}

// GetOverview returns top-level analytics KPIs.
func (c *Controller) GetOverview(ctx *gin.Context) {
	data, err := c.service.GetOverview()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get analytics overview: " + err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    data,
	})
}

// GetMonthlySales returns monthly sales/income trend.
func (c *Controller) GetMonthlySales(ctx *gin.Context) {
	months, _ := strconv.Atoi(ctx.DefaultQuery("months", "12"))

	data, err := c.service.GetMonthlySales(months)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get monthly sales: " + err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    data,
	})
}

// GetTopProducts returns top-selling products.
func (c *Controller) GetTopProducts(ctx *gin.Context) {
	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "10"))

	data, err := c.service.GetTopProducts(limit)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get top products: " + err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    data,
	})
}

// GetPaymentIncome returns payment-method income breakdown.
func (c *Controller) GetPaymentIncome(ctx *gin.Context) {
	data, err := c.service.GetPaymentIncomeBreakdown()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get payment income: " + err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    data,
	})
}
