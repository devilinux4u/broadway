package content

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Controller handles HTTP requests for content management
type Controller struct {
	service *Service
}

// NewController creates a new content controller
func NewController(service *Service) *Controller {
	return &Controller{
		service: service,
	}
}

// GetSection godoc
// @Summary Get a specific content section
// @Description Retrieve a specific content section by name (hero, categories, about, newsletter, settings)
// @Tags Content
// @Produce json
// @Param section query string true "Section name (hero|categories|about|newsletter|settings)"
// @Success 200 {object} GetSectionResponse
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Router /admin/content/section [get]
func (c *Controller) GetSection(ctx *gin.Context) {
	section := ctx.Query("section")
	if section == "" {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Section name is required",
			Error:   "missing section query parameter",
		})
		return
	}

	content, err := c.service.GetSection(section)
	if err != nil {
		ctx.JSON(http.StatusNotFound, ErrorResponse{
			Success: false,
			Message: "Failed to get section",
			Error:   err.Error(),
		})
		return
	}

	dto := content.ToDTO()
	ctx.JSON(http.StatusOK, dto)
}

// GetAllSections godoc
// @Summary Get all content sections
// @Description Retrieve all available content sections
// @Tags Content
// @Produce json
// @Success 200 {object} AllSectionsResponse
// @Failure 500 {object} ErrorResponse
// @Router /admin/content/sections [get]
func (c *Controller) GetAllSections(ctx *gin.Context) {
	contents, err := c.service.GetAllSections()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to get sections",
			Error:   err.Error(),
		})
		return
	}

	sections := make([]GetSectionResponse, len(contents))
	for i, content := range contents {
		dto := content.ToDTO()
		sections[i] = GetSectionResponse{
			ID:        dto.ID,
			Section:   dto.Section,
			Content:   dto.Content,
			UpdatedAt: dto.UpdatedAt.String(),
			CreatedAt: dto.CreatedAt.String(),
		}
	}

	ctx.JSON(http.StatusOK, AllSectionsResponse{
		Sections: sections,
	})
}

// UpdateSection godoc
// @Summary Update a content section
// @Description Update or create a content section with JSON content
// @Tags Content
// @Accept json
// @Produce json
// @Param request body UpdateSectionRequest true "Update section request"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /admin/content/section [put]
func (c *Controller) UpdateSection(ctx *gin.Context) {
	var req UpdateSectionRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid request format",
			Error:   err.Error(),
		})
		return
	}

	// Validate content based on section type
	if err := c.service.ValidateContent(req.Section, req.Content); err != nil {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Content validation failed",
			Error:   err.Error(),
		})
		return
	}

	content, err := c.service.UpdateSection(req.Section, req.Content)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to update section",
			Error:   err.Error(),
		})
		return
	}

	dto := content.ToDTO()
	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Section updated successfully",
		"data": gin.H{
			"id":         dto.ID,
			"section":    dto.Section,
			"content":    dto.Content,
			"updated_at": dto.UpdatedAt,
			"created_at": dto.CreatedAt,
		},
	})
}

// DeleteSection godoc
// @Summary Delete a content section
// @Description Delete a content section by name
// @Tags Content
// @Produce json
// @Param section query string true "Section name"
// @Success 200 {object} MessageResponse
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Router /admin/content/section [delete]
func (c *Controller) DeleteSection(ctx *gin.Context) {
	section := ctx.Query("section")
	if section == "" {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Section name is required",
			Error:   "missing section query parameter",
		})
		return
	}

	err := c.service.DeleteSection(section)
	if err != nil {
		ctx.JSON(http.StatusNotFound, ErrorResponse{
			Success: false,
			Message: "Failed to delete section",
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, MessageResponse{
		Success: true,
		Message: "Section deleted successfully",
	})
}

// UploadImage godoc
// @Summary Upload content media
// @Description Upload an image or video file for use in content sections
// @Tags Content
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "Media file (JPG, PNG, WebP, GIF, MP4, WebM, OGG, MOV - max 50MB)"
// @Param path formData string true "Upload path (e.g., 'hero', 'categories')"
// @Success 200 {object} UploadImageResponse
// @Failure 400 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /admin/content/upload [post]
func (c *Controller) UploadImage(ctx *gin.Context) {
	file, err := ctx.FormFile("file")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Failed to get file",
			Error:   err.Error(),
		})
		return
	}

	path := ctx.PostForm("path")
	if path == "" {
		path = "content"
	}

	filePath, err := c.service.HandleImageUpload(file, path)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Failed to upload media",
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, UploadImageResponse{
		Success: true,
		Message: "Media uploaded successfully",
		URL:     filePath,
	})
}

// GetProducts godoc
// @Summary Get all products for featured section
// @Description Retrieve all products with their featured status for the featured section
// @Tags Content
// @Produce json
// @Success 200 {object} GetProductsResponse
// @Failure 500 {object} ErrorResponse
// @Router /admin/content/products [get]
func (c *Controller) GetProducts(ctx *gin.Context) {
	products, err := c.service.GetAllProducts()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to get products",
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, GetProductsResponse{
		Success:  true,
		Message:  "Products retrieved successfully",
		Products: products,
	})
}

// ToggleFeatured godoc
// @Summary Toggle featured status of a product
// @Description Update the featured status of a product
// @Tags Content
// @Accept json
// @Produce json
// @Param request body ToggleFeaturedRequest true "Toggle featured request"
// @Success 200 {object} ToggleFeaturedResponse
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /admin/content/products/featured [put]
func (c *Controller) ToggleFeatured(ctx *gin.Context) {
	var req ToggleFeaturedRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid request format",
			Error:   err.Error(),
		})
		return
	}

	if req.Featured == nil {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid request format",
			Error:   "featured is required",
		})
		return
	}

	product, err := c.service.ToggleFeatured(req.ProductID, *req.Featured)
	if err != nil {
		statusCode := http.StatusInternalServerError
		if err.Error() == "product not found" {
			statusCode = http.StatusNotFound
		}
		ctx.JSON(statusCode, ErrorResponse{
			Success: false,
			Message: "Failed to update featured status",
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, ToggleFeaturedResponse{
		Success: true,
		Message: "Featured status updated successfully",
		Data:    product,
	})
}

// ToggleNewArrival godoc
// @Summary Toggle new arrival status of a product
// @Description Update the new arrival status of a product
// @Tags Content
// @Accept json
// @Produce json
// @Param request body ToggleNewArrivalRequest true "Toggle new arrival request"
// @Success 200 {object} ToggleFeaturedResponse
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /admin/content/products/new-arrival [put]
func (c *Controller) ToggleNewArrival(ctx *gin.Context) {
	var req ToggleNewArrivalRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid request format",
			Error:   err.Error(),
		})
		return
	}

	if req.NewArrival == nil {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Invalid request format",
			Error:   "new_arrival is required",
		})
		return
	}

	product, err := c.service.ToggleNewArrival(req.ProductID, *req.NewArrival)
	if err != nil {
		statusCode := http.StatusInternalServerError
		if err.Error() == "product not found" {
			statusCode = http.StatusNotFound
		}
		ctx.JSON(statusCode, ErrorResponse{
			Success: false,
			Message: "Failed to update new arrival status",
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, ToggleFeaturedResponse{
		Success: true,
		Message: "New arrival status updated successfully",
		Data:    product,
	})
}
