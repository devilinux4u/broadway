package inventory

// CreateProductRequest represents the request for creating a product
type CreateProductRequest struct {
	Name              string  `form:"name" binding:"required,min=1,max=255"`
	Description       string  `form:"description"`
	Category          string  `form:"category" binding:"required"`
	PriceNPR          float64 `form:"price_npr" binding:"required,gt=0"`
	Badge             string  `form:"badge"`
	InStock           bool    `form:"in_stock" binding:"required"`
	StockQuantity     int     `form:"stock_quantity" binding:"required,gte=0"`
	LowStockThreshold int     `form:"low_stock_threshold" binding:"required,gte=0"`
}

// UpdateProductRequest represents the request for updating a product
type UpdateProductRequest struct {
	Name              *string  `json:"name" binding:"min=1,max=255"`
	Description       *string  `json:"description"`
	Category          *string  `json:"category"`
	PriceNPR          *float64 `json:"price_npr" binding:"gt=0"`
	ImageURL          *string  `json:"image_url"`
	Badge             *string  `json:"badge"`
	InStock           *bool    `json:"in_stock"`
	StockQuantity     *int     `json:"stock_quantity" binding:"gte=0"`
	LowStockThreshold *int     `json:"low_stock_threshold" binding:"gte=0"`
}

// StockMovementRequest represents the request for stock in/out
type StockMovementRequest struct {
	ProductID string `json:"product_id" binding:"required,uuid"`
	Type      string `json:"type" binding:"required,oneof=in out"`
	Quantity  int    `json:"quantity" binding:"required,gt=0"`
	Reason    string `json:"reason"`
}

// ProductImageRequest represents the request for adding product images
type ProductImageRequest struct {
	Images []string `json:"images" binding:"required,min=1"`
}

// ProductColorRequest represents the request for product colors
type ProductColorRequest struct {
	Colors []ColorData `json:"colors" binding:"required,min=1"`
}

// ColorData represents a color variant
type ColorData struct {
	Name  string `json:"name" binding:"required"`
	Value string `json:"value" binding:"required"`
}

// UploadResponse represents the response from image upload
type UploadResponse struct {
	Success bool                     `json:"success"`
	Message string                   `json:"message"`
	Data    *UploadResponseData      `json:"data,omitempty"`
	Errors  []map[string]interface{} `json:"errors,omitempty"`
}

// UploadResponseData contains the uploaded file paths
type UploadResponseData struct {
	Paths []string `json:"paths"`
}

// ProductListQueryParams represents query parameters for listing products
type ProductListQueryParams struct {
	Category      *string `form:"category"`
	InStock       *bool   `form:"in_stock"`
	Limit         int     `form:"limit,default=50"`
	Offset        int     `form:"offset,default=0"`
	SortBy        string  `form:"sort_by,default=created_at"`
	SortDirection string  `form:"sort_direction,default=desc"`
}
