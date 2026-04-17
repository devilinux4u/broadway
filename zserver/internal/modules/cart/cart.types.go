package cart

// GetCartResponse represents the response for getting user's cart
type GetCartResponse struct {
	Success    bool          `json:"success"`
	Message    string        `json:"message"`
	Items      []CartItemDTO `json:"items"`
	TotalItems int           `json:"total_items"`
	TotalPrice float64       `json:"total_price"`
}

// CartItemDTO is the data transfer object for cart item responses
type CartItemDTO struct {
	ID           string  `json:"id"`
	ProductID    string  `json:"product_id"`
	ProductName  string  `json:"product_name"`
	ProductImage string  `json:"product_image"`
	PriceNPR     float64 `json:"price_npr"`
	Quantity     int     `json:"quantity"`
	Color        *string `json:"color,omitempty"`
}

// AddToCartRequest represents the request to add an item to cart
type AddToCartRequest struct {
	ProductID   string  `json:"product_id" binding:"required"`
	ProductName string  `json:"product_name" binding:"required"`
	Quantity    int     `json:"quantity" binding:"required,min=1"`
	PriceNPR    float64 `json:"price_npr" binding:"required,gt=0"`
	Color       *string `json:"color"`
	ImageURL    string  `json:"image_url" binding:"required"`
}

// UpdateCartRequest represents the request to update a cart item
type UpdateCartRequest struct {
	CartItemID string `json:"cart_item_id" binding:"required"`
	Quantity   int    `json:"quantity" binding:"required,min=1"`
}

// RemoveFromCartRequest represents the request to remove an item from cart
type RemoveFromCartRequest struct {
	CartItemID string `json:"cart_item_id" binding:"required"`
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Error   string `json:"error,omitempty"`
}

// SuccessResponse represents a general success response
type SuccessResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}
