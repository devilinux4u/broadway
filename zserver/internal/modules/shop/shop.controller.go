package shop

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Controller handles HTTP requests for shop
type Controller struct {
	service *Service
}

// NewController creates a new shop controller
func NewController(service *Service) *Controller {
	return &Controller{
		service: service,
	}
}

// GetAllProducts godoc
// @Summary Get all products
// @Description Retrieve all products that are in stock
// @Tags Shop
// @Produce json
// @Success 200 {object} GetProductsResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/shop/products [get]
func (c *Controller) GetAllProducts(ctx *gin.Context) {
	response, err := c.service.GetAllProducts()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to get products",
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, response)
}

// GetProductsByCategory godoc
// @Summary Get products by category
// @Description Retrieve products for a specific category
// @Tags Shop
// @Produce json
// @Param category query string true "Category name"
// @Success 200 {object} GetProductsResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/shop/products/category [get]
func (c *Controller) GetProductsByCategory(ctx *gin.Context) {
	category := ctx.Query("category")
	if category == "" {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Category is required",
			Error:   "missing category query parameter",
		})
		return
	}

	response, err := c.service.GetProductsByCategory(category)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to get products",
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, response)
}

// SearchProducts godoc
// @Summary Search products
// @Description Search for products by name or description
// @Tags Shop
// @Produce json
// @Param q query string true "Search query"
// @Success 200 {object} SearchProductsResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/shop/products/search [get]
func (c *Controller) SearchProducts(ctx *gin.Context) {
	query := ctx.Query("q")
	if query == "" {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Search query is required",
			Error:   "missing q query parameter",
		})
		return
	}

	response, err := c.service.SearchProducts(query)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to search products",
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, response)
}

// GetProductByID godoc
// @Summary Get product by ID
// @Description Retrieve a single product with images and colors
// @Tags Shop
// @Produce json
// @Param id path string true "Product ID"
// @Success 200 {object} GetProductByIDResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/shop/products/{id} [get]
func (c *Controller) GetProductByID(ctx *gin.Context) {
	id := ctx.Param("id")
	if id == "" {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Product ID is required",
			Error:   "missing id path parameter",
		})
		return
	}

	response, err := c.service.GetProductByID(id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to get product",
			Error:   err.Error(),
		})
		return
	}

	if response == nil {
		ctx.JSON(http.StatusNotFound, ErrorResponse{
			Success: false,
			Message: "Product not found",
		})
		return
	}

	ctx.JSON(http.StatusOK, response)
}
