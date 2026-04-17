package order

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// CheckoutItemRequest represents an item in checkout request
type CheckoutItemRequest struct {
	ProductID    string  `json:"product_id" binding:"required"`
	ProductName  string  `json:"product_name" binding:"required"`
	ProductImage string  `json:"product_image" binding:"required"`
	Quantity     int     `json:"quantity" binding:"required,min=1"`
	Price        float64 `json:"price" binding:"required,gt=0"`
}

// CheckoutRequestFull represents the complete checkout request with cart items
type CheckoutRequestFull struct {
	ShippingName    string                `json:"shipping_name" binding:"required"`
	ShippingPhone   string                `json:"shipping_phone" binding:"required"`
	ShippingAddress string                `json:"shipping_address" binding:"required"`
	ShippingCity    string                `json:"shipping_city" binding:"required"`
	PaymentMethod   string                `json:"payment_method" binding:"required"`
	TotalAmount     float64               `json:"total_amount" binding:"required,gt=0"`
	Items           []CheckoutItemRequest `json:"items" binding:"required,min=1"`
	Notes           *string               `json:"notes"`
}

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

// GetOrders godoc
// @Summary Get user's orders
// @Description Retrieve all orders for the authenticated user
// @Tags Orders
// @Produce json
// @Security Bearer
// @Success 200 {object} GetOrdersResponse
// @Failure 401 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/orders [get]
func (c *Controller) GetOrders(ctx *gin.Context) {
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "Unauthorized",
			Error:   "user_id not found in context",
		})
		return
	}

	response, err := c.service.GetUserOrders(userID.(string))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to get orders",
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, response)
}

// VerifyKhaltiPayment godoc
// @Summary Verify Khalti payment
// @Description Verify Khalti payment and update order status
// @Tags Orders
// @Produce json
// @Param pidx query string true "Payment ID"
// @Param transaction_id query string true "Transaction ID"
// @Param status query string true "Payment Status"
// @Param purchase_order_id query string true "Purchase Order ID"
// @Param amount query int true "Amount in paisa"
// @Success 200 {object} VerifyPaymentResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/orders/verify-payment [get]
func (c *Controller) VerifyKhaltiPayment(ctx *gin.Context) {
	var req VerifyPaymentRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid request",
			Error:   err.Error(),
		})
		return
	}

	response, err := c.service.VerifyKhaltiPayment(&req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Payment verification failed",
			Error:   err.Error(),
		})
		return
	}

	if response.Success {
		ctx.JSON(http.StatusOK, response)
	} else {
		ctx.JSON(http.StatusBadRequest, response)
	}
} // Checkout godoc
// @Summary Checkout and create order
// @Description Create an order from cart items. For COD: order is confirmed. For Khalti: returns payment URL
// @Tags Orders
// @Accept json
// @Produce json
// @Security Bearer
// @Param body body CheckoutRequestFull true "Checkout request with items"
// @Success 200 {object} CheckoutResponse
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/orders/checkout [post]
func (c *Controller) Checkout(ctx *gin.Context) {
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "Unauthorized",
			Error:   "user_id not found in context",
		})
		return
	}

	var req CheckoutRequestFull
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid request",
			Error:   err.Error(),
		})
		return
	}

	// Convert checkout items to service format
	var cartItems []CartItemForCheckout
	for _, item := range req.Items {
		cartItems = append(cartItems, CartItemForCheckout{
			ProductID:    item.ProductID,
			ProductName:  item.ProductName,
			ProductImage: item.ProductImage,
			Quantity:     item.Quantity,
			Price:        item.Price,
		})
	}

	// Create checkout request
	checkoutReq := &CheckoutRequest{
		ShippingName:    req.ShippingName,
		ShippingPhone:   req.ShippingPhone,
		ShippingAddress: req.ShippingAddress,
		ShippingCity:    req.ShippingCity,
		PaymentMethod:   req.PaymentMethod,
		Notes:           req.Notes,
	}

	var response *CheckoutResponse
	var err error

	// Process based on payment method
	switch req.PaymentMethod {
	case "cod":
		response, err = c.service.ProcessCODCheckout(userID.(string), checkoutReq, cartItems, req.TotalAmount)
	case "khalti":
		response, err = c.service.ProcessKhaltiCheckout(userID.(string), checkoutReq, cartItems, req.TotalAmount)
	default:
		ctx.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid payment method",
			Error:   "Payment method must be 'cod' or 'khalti'",
		})
		return
	}

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Checkout failed",
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, response)
} // GetOrderDetail godoc
// @Summary Get order details
// @Description Retrieve a specific order with all its items
// @Tags Orders
// @Produce json
// @Security Bearer
// @Param orderId path string true "Order ID"
// @Success 200 {object} GetOrderDetailResponse
// @Failure 401 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/orders/{orderId} [get]
func (c *Controller) GetOrderDetail(ctx *gin.Context) {
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "Unauthorized",
			Error:   "user_id not found in context",
		})
		return
	}

	orderID := ctx.Param("orderId")
	if orderID == "" {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid request",
			Error:   "order_id is required",
		})
		return
	}

	response, err := c.service.GetOrderDetail(userID.(string), orderID)
	if err != nil {
		if err.Error() == "order not found" {
			ctx.JSON(http.StatusNotFound, ErrorResponse{
				Success: false,
				Message: "Order not found",
				Error:   err.Error(),
			})
		} else {
			ctx.JSON(http.StatusInternalServerError, ErrorResponse{
				Success: false,
				Message: "Failed to get order details",
				Error:   err.Error(),
			})
		}
		return
	}

	ctx.JSON(http.StatusOK, response)
}
