package cart

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Controller handles HTTP requests for cart
type Controller struct {
	service *Service
}

// NewController creates a new cart controller
func NewController(service *Service) *Controller {
	return &Controller{
		service: service,
	}
}

// GetCart godoc
// @Summary Get user's cart
// @Description Retrieve all items in user's cart
// @Tags Cart
// @Produce json
// @Security Bearer
// @Success 200 {object} GetCartResponse
// @Failure 401 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/cart [get]
func (c *Controller) GetCart(ctx *gin.Context) {
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "Unauthorized",
			Error:   "user_id not found in context",
		})
		return
	}

	response, err := c.service.GetUserCart(userID.(string))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to get cart",
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, response)
}

// AddToCart godoc
// @Summary Add item to cart
// @Description Add a product to user's cart
// @Tags Cart
// @Accept json
// @Produce json
// @Security Bearer
// @Param body body AddToCartRequest true "Add to cart request"
// @Success 200 {object} GetCartResponse
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/cart/add [post]
func (c *Controller) AddToCart(ctx *gin.Context) {
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "Unauthorized",
			Error:   "user_id not found in context",
		})
		return
	}

	var req AddToCartRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid request",
			Error:   err.Error(),
		})
		return
	}

	response, err := c.service.AddToCart(userID.(string), &req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to add item to cart",
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, response)
}

// UpdateCartItem godoc
// @Summary Update cart item quantity
// @Description Update the quantity of an item in cart
// @Tags Cart
// @Accept json
// @Produce json
// @Security Bearer
// @Param body body UpdateCartRequest true "Update cart request"
// @Success 200 {object} GetCartResponse
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/cart/update [put]
func (c *Controller) UpdateCartItem(ctx *gin.Context) {
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "Unauthorized",
			Error:   "user_id not found in context",
		})
		return
	}

	var req UpdateCartRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid request",
			Error:   err.Error(),
		})
		return
	}

	response, err := c.service.UpdateCartItem(userID.(string), &req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to update cart item",
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, response)
}

// RemoveFromCart godoc
// @Summary Remove item from cart
// @Description Remove a product from user's cart
// @Tags Cart
// @Accept json
// @Produce json
// @Security Bearer
// @Param body body RemoveFromCartRequest true "Remove from cart request"
// @Success 200 {object} GetCartResponse
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/cart/remove [post]
func (c *Controller) RemoveFromCart(ctx *gin.Context) {
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "Unauthorized",
			Error:   "user_id not found in context",
		})
		return
	}

	var req RemoveFromCartRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid request",
			Error:   err.Error(),
		})
		return
	}

	response, err := c.service.RemoveFromCart(userID.(string), &req)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to remove item from cart",
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, response)
}

// ClearCart godoc
// @Summary Clear entire cart
// @Description Remove all items from user's cart
// @Tags Cart
// @Produce json
// @Security Bearer
// @Success 200 {object} SuccessResponse
// @Failure 401 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/v1/cart/clear [post]
func (c *Controller) ClearCart(ctx *gin.Context) {
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, ErrorResponse{
			Success: false,
			Message: "Unauthorized",
			Error:   "user_id not found in context",
		})
		return
	}

	if err := c.service.ClearCart(userID.(string)); err != nil {
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to clear cart",
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, SuccessResponse{
		Success: true,
		Message: "Cart cleared successfully",
	})
}
