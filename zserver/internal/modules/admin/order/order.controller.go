package order

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

// Controller handles HTTP requests for orders
type Controller struct {
	service *Service
}

// NewController creates a new order controller
func NewController(service *Service) *Controller {
	return &Controller{
		service: service,
	}
}

// CreateOrder godoc
// @Summary Create a new order
// @Description Create a new order with items
// @Tags Orders
// @Accept json
// @Produce json
// @Param request body CreateOrderRequest true "Order details"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Router /admin/orders [post]
func (c *Controller) CreateOrder(ctx *gin.Context) {
	var req CreateOrderRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
		return
	}

	// Get user ID from context (set by middleware)
	userID, exists := ctx.Get("user_id")
	if !exists {
		userID = "" // Allow anonymous orders or set default
	}

	order, err := c.service.CreateOrder(&req, userID.(string))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Order created successfully",
		"data":    order.ToDTO(),
	})
}

// GetAllOrders godoc
// @Summary Get all orders
// @Description Retrieve all orders with optional filtering and pagination
// @Tags Orders
// @Produce json
// @Param status query string false "Filter by order status"
// @Param payment_status query string false "Filter by payment status"
// @Param city query string false "Filter by shipping city"
// @Param user_id query string false "Filter by user ID"
// @Param start_date query string false "Filter orders from this date (YYYY-MM-DD)"
// @Param end_date query string false "Filter orders until this date (YYYY-MM-DD)"
// @Param limit query integer false "Results limit (default: 50)"
// @Param offset query integer false "Results offset (default: 0)"
// @Param sort_by query string false "Field to sort by (default: created_at)"
// @Param sort_direction query string false "Sort direction (asc/desc, default: desc)"
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} map[string]string
// @Router /admin/orders [get]
func (c *Controller) GetAllOrders(ctx *gin.Context) {
	var params OrderListQueryParams
	if err := ctx.ShouldBindQuery(&params); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid query parameters"})
		return
	}

	filters := make(map[string]interface{})
	if params.Status != nil && *params.Status != "" {
		filters["status"] = *params.Status
	}
	if params.PaymentStatus != nil && *params.PaymentStatus != "" {
		filters["payment_status"] = *params.PaymentStatus
	}
	if params.City != nil && *params.City != "" {
		filters["city"] = *params.City
	}
	if params.UserID != nil && *params.UserID != "" {
		filters["user_id"] = *params.UserID
	}

	// Parse dates
	if params.StartDate != nil && *params.StartDate != "" {
		startDate, err := c.service.ParseDateFilter(*params.StartDate)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		filters["start_date"] = startDate
	}
	if params.EndDate != nil && *params.EndDate != "" {
		endDate, err := c.service.ParseDateFilter(*params.EndDate)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		filters["end_date"] = endDate
	}

	orders, total, err := c.service.GetAllOrders(filters, params.Limit, params.Offset, params.SortBy, params.SortDirection)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	orderDTOs := make([]interface{}, len(orders))
	for i, order := range orders {
		orderDTOs[i] = order.ToDTO()
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    orderDTOs,
		"total":   total,
		"limit":   params.Limit,
		"offset":  params.Offset,
	})
}

// GetOrderByID godoc
// @Summary Get order by ID
// @Description Retrieve a specific order with all its items
// @Tags Orders
// @Produce json
// @Param id path string true "Order ID"
// @Success 200 {object} map[string]interface{}
// @Failure 404 {object} map[string]string
// @Router /admin/orders/:id [get]
func (c *Controller) GetOrderByID(ctx *gin.Context) {
	orderID := ctx.Param("id")
	if orderID == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Order ID is required"})
		return
	}

	order, err := c.service.GetOrderByID(orderID)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    order.ToDTO(),
	})
}

// GetUserOrders godoc
// @Summary Get orders for a user
// @Description Retrieve all orders for a specific user
// @Tags Orders
// @Produce json
// @Param user_id path string true "User ID"
// @Param limit query integer false "Results limit (default: 50)"
// @Param offset query integer false "Results offset (default: 0)"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Router /admin/orders/user/:user_id [get]
func (c *Controller) GetUserOrders(ctx *gin.Context) {
	userID := ctx.Param("user_id")
	if userID == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
		return
	}

	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(ctx.DefaultQuery("offset", "0"))

	orders, total, err := c.service.GetOrdersByUserID(userID, limit, offset)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	orderDTOs := make([]interface{}, len(orders))
	for i, order := range orders {
		orderDTOs[i] = order.ToDTO()
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    orderDTOs,
		"total":   total,
	})
}

// UpdateOrderStatus godoc
// @Summary Update order status
// @Description Update the status of an order
// @Tags Orders
// @Accept json
// @Produce json
// @Param id path string true "Order ID"
// @Param request body UpdateOrderStatusRequest true "New status"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Router /admin/orders/:id/status [put]
func (c *Controller) UpdateOrderStatus(ctx *gin.Context) {
	orderID := ctx.Param("id")
	if orderID == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Order ID is required"})
		return
	}

	var req UpdateOrderStatusRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	if err := c.service.UpdateOrderStatus(orderID, req.Status); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	order, _ := c.service.GetOrderByID(orderID)
	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Order status updated",
		"data":    order.ToDTO(),
	})
}

// UpdatePaymentStatus godoc
// @Summary Update payment status
// @Description Update the payment status of an order
// @Tags Orders
// @Accept json
// @Produce json
// @Param id path string true "Order ID"
// @Param request body UpdatePaymentStatusRequest true "New payment status"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Router /admin/orders/:id/payment-status [put]
func (c *Controller) UpdatePaymentStatus(ctx *gin.Context) {
	orderID := ctx.Param("id")
	if orderID == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Order ID is required"})
		return
	}

	var req UpdatePaymentStatusRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	if err := c.service.UpdatePaymentStatus(orderID, req.PaymentStatus); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	order, _ := c.service.GetOrderByID(orderID)
	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Payment status updated",
		"data":    order.ToDTO(),
	})
}

// UpdateOrder godoc
// @Summary Update order details
// @Description Update order shipping and other details
// @Tags Orders
// @Accept json
// @Produce json
// @Param id path string true "Order ID"
// @Param request body UpdateOrderRequest true "Order updates"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Router /admin/orders/:id [put]
func (c *Controller) UpdateOrder(ctx *gin.Context) {
	orderID := ctx.Param("id")
	if orderID == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Order ID is required"})
		return
	}

	var req UpdateOrderRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	order, err := c.service.UpdateOrder(orderID, &req)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Order updated",
		"data":    order.ToDTO(),
	})
}

// DeleteOrder godoc
// @Summary Delete order
// @Description Delete an order
// @Tags Orders
// @Produce json
// @Param id path string true "Order ID"
// @Success 200 {object} map[string]interface{}
// @Failure 404 {object} map[string]string
// @Router /admin/orders/:id [delete]
func (c *Controller) DeleteOrder(ctx *gin.Context) {
	orderID := ctx.Param("id")
	if orderID == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Order ID is required"})
		return
	}

	if err := c.service.DeleteOrder(orderID); err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Order deleted",
	})
}

// GetOrderStats godoc
// @Summary Get order statistics
// @Description Retrieve order statistics (total orders, revenue, etc.)
// @Tags Orders
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Failure 500 {object} map[string]string
// @Router /admin/orders/stats/overview [get]
func (c *Controller) GetOrderStats(ctx *gin.Context) {
	stats, err := c.service.GetOrderStats()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    stats,
	})
}

// SearchOrders godoc
// @Summary Search orders
// @Description Search for orders by customer name, phone, or order ID
// @Tags Orders
// @Produce json
// @Param q query string true "Search keyword"
// @Param limit query integer false "Results limit (default: 50)"
// @Param offset query integer false "Results offset (default: 0)"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Router /admin/orders/search [get]
func (c *Controller) SearchOrders(ctx *gin.Context) {
	keyword := ctx.Query("q")
	if keyword == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Search keyword is required"})
		return
	}

	limit, _ := strconv.Atoi(ctx.DefaultQuery("limit", "50"))
	offset, _ := strconv.Atoi(ctx.DefaultQuery("offset", "0"))

	orders, err := c.service.SearchOrders(keyword, limit, offset)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	orderDTOs := make([]interface{}, len(orders))
	for i, order := range orders {
		orderDTOs[i] = order.ToDTO()
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    orderDTOs,
	})
}
