package shop

// Product represents a product with its details
type Product struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Category    string  `json:"category"`
	PriceNPR    float64 `json:"price_npr"`
	ImageURL    *string `json:"image_url,omitempty"`
	Badge       *string `json:"badge,omitempty"`
	InStock     bool    `json:"in_stock"`
	CreatedAt   string  `json:"created_at"`
}

// ProductImage represents additional product images
type ProductImage struct {
	ID        string `json:"id"`
	ProductID string `json:"product_id"`
	ImageURL  string `json:"image_url"`
	SortOrder int    `json:"sort_order"`
}

// ProductColor represents available colors for a product
type ProductColor struct {
	ID        string `json:"id"`
	ProductID string `json:"product_id"`
	Name      string `json:"name"`
	Value     string `json:"value"`
	SortOrder int    `json:"sort_order"`
}

// GetProductsResponse represents the response for getting products
type GetProductsResponse struct {
	Success  bool                  `json:"success"`
	Message  string                `json:"message"`
	Products []ProductDTO          `json:"products"`
	Images   map[string][]string   `json:"images"`
	Colors   map[string][]ColorDTO `json:"colors"`
}

// ProductDTO represents a product in responses
type ProductDTO struct {
	ID          string  `json:"id"`
	Name        string  `json:"name"`
	Description *string `json:"description,omitempty"`
	Category    string  `json:"category"`
	PriceNPR    float64 `json:"price_npr"`
	ImageURL    *string `json:"image_url,omitempty"`
	Badge       *string `json:"badge,omitempty"`
	InStock     bool    `json:"in_stock"`
	CreatedAt   string  `json:"created_at"`
}

// ColorDTO represents a product color in responses
type ColorDTO struct {
	Name  string `json:"name"`
	Value string `json:"value"`
}

// GetProductByIDResponse represents the response for getting a single product
type GetProductByIDResponse struct {
	Success bool       `json:"success"`
	Message string     `json:"message"`
	Product ProductDTO `json:"product"`
	Images  []string   `json:"images"`
	Colors  []ColorDTO `json:"colors"`
}

// SearchProductsResponse represents the response for searching products
type SearchProductsResponse struct {
	Success  bool         `json:"success"`
	Message  string       `json:"message"`
	Products []ProductDTO `json:"products"`
	Total    int64        `json:"total"`
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Error   string `json:"error,omitempty"`
}
