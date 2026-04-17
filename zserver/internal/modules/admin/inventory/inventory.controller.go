package inventory

import (
	"ecom/go/internal/db/models"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

// Controller handles HTTP requests for inventory
type Controller struct {
	service *Service
}

// NewController creates a new inventory controller
func NewController(service *Service) *Controller {
	return &Controller{
		service: service,
	}
}

// CreateProduct godoc
// @Summary Create a new product
// @Description Create a new product with details and optional main image
// @Tags Products
// @Accept multipart/form-data
// @Produce json
// @Param name formData string true "Product name"
// @Param category formData string true "Product category"
// @Param price_npr formData number true "Price in NPR"
// @Param in_stock formData boolean true "In stock status"
// @Param stock_quantity formData integer true "Stock quantity"
// @Param low_stock_threshold formData integer true "Low stock threshold"
// @Param description formData string false "Product description"
// @Param badge formData string false "Product badge (new/sale/trending)"
// @Param image formData file false "Main product image (JPG, PNG, WebP, GIF - max 10MB)"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Router /admin/inventory/products [post]
func (c *Controller) CreateProduct(ctx *gin.Context) {
	var req CreateProductRequest
	if err := ctx.ShouldBind(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
		return
	}

	// Handle optional image upload
	var imagePath string
	file, err := ctx.FormFile("image")
	if err == nil && file != nil {
		// Image file was provided
		imagePath, err = c.service.HandleImageUpload(file, "product")
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Failed to upload image: " + err.Error()})
			return
		}
	}

	product, err := c.service.CreateProductWithImage(&req, imagePath)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"success": true,
		"message": "Product created successfully",
		"data":    product.ToDTO(),
	})
}

// GetAllProducts godoc
// @Summary Get all products
// @Description Retrieve all products with optional filtering and pagination
// @Tags Products
// @Produce json
// @Param category query string false "Filter by category"
// @Param in_stock query bool false "Filter by stock status"
// @Param limit query int false "Number of products to return (default 50)"
// @Param offset query int false "Number of products to skip (default 0)"
// @Success 200 {object} map[string]interface{}
// @Router /admin/inventory/products [get]
func (c *Controller) GetAllProducts(ctx *gin.Context) {
	limit := 50
	offset := 0

	if l := ctx.Query("limit"); l != "" {
		if parsedLimit, err := strconv.Atoi(l); err == nil && parsedLimit > 0 {
			limit = parsedLimit
		}
	}

	if o := ctx.Query("offset"); o != "" {
		if parsedOffset, err := strconv.Atoi(o); err == nil && parsedOffset >= 0 {
			offset = parsedOffset
		}
	}

	filters := make(map[string]interface{})

	if category := ctx.Query("category"); category != "" {
		filters["category"] = category
	}

	if inStock := ctx.Query("in_stock"); inStock != "" {
		filters["in_stock"] = strings.ToLower(inStock) == "true"
	}

	if sortBy := ctx.Query("sort_by"); sortBy != "" {
		filters["sort_by"] = sortBy
	}

	if sortDir := ctx.Query("sort_direction"); sortDir != "" {
		filters["sort_direction"] = strings.ToUpper(sortDir)
	}

	products, total, err := c.service.GetAllProducts(filters, limit, offset)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve products: " + err.Error()})
		return
	}

	// Convert to DTOs
	dtos := make([]models.ProductDTO, len(products))
	for i, p := range products {
		dtos[i] = p.ToDTO()
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    dtos,
		"total":   total,
		"limit":   limit,
		"offset":  offset,
	})
}

// GetProductByID godoc
// @Summary Get product details
// @Description Retrieve a product with images and colors
// @Tags Products
// @Produce json
// @Param id path string true "Product ID"
// @Success 200 {object} map[string]interface{}
// @Failure 404 {object} map[string]string
// @Router /admin/inventory/products/{id} [get]
func (c *Controller) GetProductByID(ctx *gin.Context) {
	productID := ctx.Param("id")

	product, err := c.service.GetProductByID(productID)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    product,
	})
}

// UpdateProduct godoc
// @Summary Update a product
// @Description Update product details
// @Tags Products
// @Accept json
// @Produce json
// @Param id path string true "Product ID"
// @Param request body UpdateProductRequest true "Updated product details"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Router /admin/inventory/products/{id} [put]
func (c *Controller) UpdateProduct(ctx *gin.Context) {
	productID := ctx.Param("id")

	var req UpdateProductRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
		return
	}

	product, err := c.service.UpdateProduct(productID, &req)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Product updated successfully",
		"data":    product.ToDTO(),
	})
}

// DeleteProduct godoc
// @Summary Delete a product
// @Description Delete a product and all related data
// @Tags Products
// @Produce json
// @Param id path string true "Product ID"
// @Success 200 {object} map[string]interface{}
// @Failure 404 {object} map[string]string
// @Router /admin/inventory/products/{id} [delete]
func (c *Controller) DeleteProduct(ctx *gin.Context) {
	productID := ctx.Param("id")

	if err := c.service.DeleteProduct(productID); err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Product deleted successfully",
	})
}

// AddStockMovement godoc
// @Summary Record stock movement
// @Description Add stock in or out for a product
// @Tags Stock
// @Accept json
// @Produce json
// @Param request body StockMovementRequest true "Stock movement details"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Router /admin/inventory/stock-movements [post]
func (c *Controller) AddStockMovement(ctx *gin.Context) {
	var req StockMovementRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
		return
	}

	// Get user ID from context (set by auth middleware)
	userID, exists := ctx.Get("user_id")
	if !exists {
		userID = "system"
	}

	if err := c.service.AddStockMovement(&req, userID.(string)); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Stock movement recorded successfully",
	})
}

// GetStockMovements godoc
// @Summary Get stock movement history
// @Description Retrieve stock movement history for a product
// @Tags Stock
// @Produce json
// @Param product_id query string true "Product ID"
// @Param limit query int false "Number of records to return (default 50)"
// @Success 200 {object} map[string]interface{}
// @Router /admin/inventory/stock-movements [get]
func (c *Controller) GetStockMovements(ctx *gin.Context) {
	productID := ctx.Query("product_id")
	if productID == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "product_id is required"})
		return
	}

	limit := 50
	if l := ctx.Query("limit"); l != "" {
		if parsedLimit, err := strconv.Atoi(l); err == nil && parsedLimit > 0 {
			limit = parsedLimit
		}
	}

	movements, err := c.service.GetStockMovements(productID, limit)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve movements: " + err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    movements,
	})
}

// UploadImages godoc
// @Summary Upload product images
// @Description Upload images for a product and store paths
// @Tags Images
// @Accept multipart/form-data
// @Produce json
// @Param product_id path string true "Product ID"
// @Param images formData file true "Image files" collectionFormat(multi)
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Router /admin/inventory/products/{product_id}/images [post]
func (c *Controller) UploadImages(ctx *gin.Context) {
	productID := ctx.Param("product_id")

	form, err := ctx.MultipartForm()
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Failed to parse form: " + err.Error()})
		return
	}

	files := form.File["images"]
	if len(files) == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "No images provided"})
		return
	}

	paths, err := c.service.UploadImages(productID, files)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Images uploaded successfully",
		"data": gin.H{
			"paths": paths,
		},
	})
}

// AddProductColors godoc
// @Summary Add product color variants
// @Description Add color options for a product
// @Tags Colors
// @Accept json
// @Produce json
// @Param product_id path string true "Product ID"
// @Param request body ProductColorRequest true "Color variants"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]string
// @Router /admin/inventory/products/{product_id}/colors [post]
func (c *Controller) AddProductColors(ctx *gin.Context) {
	productID := ctx.Param("product_id")

	var req ProductColorRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request: " + err.Error()})
		return
	}

	if err := c.service.AddProductColors(productID, req.Colors); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Colors added successfully",
	})
}

// GetLowStockProducts godoc
// @Summary Get low stock products
// @Description Retrieve products with stock below threshold
// @Tags Products
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /admin/inventory/low-stock [get]
func (c *Controller) GetLowStockProducts(ctx *gin.Context) {
	products, err := c.service.GetLowStockProducts()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve low stock products: " + err.Error()})
		return
	}

	// Convert to DTOs
	dtos := make([]models.ProductDTO, len(products))
	for i, p := range products {
		dtos[i] = p.ToDTO()
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    dtos,
	})
}

// DeleteProductImage godoc
// @Summary Delete a product image
// @Description Delete a product image by ID
// @Tags Images
// @Accept json
// @Produce json
// @Param image_id path string true "Image ID"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /admin/inventory/images/{image_id} [delete]
func (c *Controller) DeleteProductImage(ctx *gin.Context) {
	imageID := ctx.Param("image_id")
	if strings.TrimSpace(imageID) == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Image ID is required"})
		return
	}

	if err := c.service.DeleteProductImage(imageID); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete image: " + err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Image deleted successfully",
	})
}
