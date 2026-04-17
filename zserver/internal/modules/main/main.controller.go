package mainpage

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// Controller handles HTTP requests for main page content
type Controller struct {
	service *Service
}

// NewController creates a new main controller
func NewController(service *Service) *Controller {
	return &Controller{
		service: service,
	}
}

// GetPageContent godoc
// @Summary Get all main page content sections
// @Description Retrieve all content sections (hero, categories, about, newsletter, settings) for the main/index page
// @Tags Main
// @Produce json
// @Success 200 {object} GetPageContentResponse
// @Failure 500 {object} ErrorResponse
// @Router /api/main [get]
func (c *Controller) GetPageContent(ctx *gin.Context) {
	sections, err := c.service.GetPageContent()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, ErrorResponse{
			Success: false,
			Message: "Failed to get page content",
			Error:   err.Error(),
		})
		return
	}

	// Get featured products
	featuredProducts, err := c.service.GetFeaturedProducts()
	if err != nil {
		// Log error but don't fail the entire request
		featuredProducts = []FeaturedProductDTO{}
	}

	// Get new arrivals
	newArrivals, err := c.service.GetNewArrivalProducts()
	if err != nil {
		newArrivals = []FeaturedProductDTO{}
	}

	ctx.JSON(http.StatusOK, GetPageContentResponse{
		Success:          true,
		Message:          "Page content retrieved successfully",
		Sections:         sections,
		FeaturedProducts: featuredProducts,
		NewArrivals:      newArrivals,
	})
}

// GetSectionContent godoc
// @Summary Get a specific page content section
// @Description Retrieve a specific content section by name (hero, categories, about, newsletter, settings)
// @Tags Main
// @Produce json
// @Param section query string true "Section name (hero|categories|about|newsletter|settings)"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Router /api/main/section [get]
func (c *Controller) GetSectionContent(ctx *gin.Context) {
	section := ctx.Query("section")
	if section == "" {
		ctx.JSON(http.StatusBadRequest, ErrorResponse{
			Success: false,
			Message: "Section name is required",
			Error:   "missing section query parameter",
		})
		return
	}

	content, err := c.service.GetSectionContent(section)
	if err != nil {
		ctx.JSON(http.StatusNotFound, ErrorResponse{
			Success: false,
			Message: "Failed to get section content",
			Error:   err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"success": true,
		"section": section,
		"content": content,
	})
}
