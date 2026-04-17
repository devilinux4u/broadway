package order

// GetOrdersResponse represents the response for getting user's orders
type GetOrdersResponse struct {
	Success bool       `json:"success"`
	Message string     `json:"message"`
	Data    []OrderDTO `json:"data"`
}

// GetOrderDetailResponse represents the response for getting a specific order
type GetOrderDetailResponse struct {
	Success bool           `json:"success"`
	Message string         `json:"message"`
	Order   OrderDTO       `json:"order"`
	Items   []OrderItemDTO `json:"items"`
}

// OrderDTO is the data transfer object for order responses
type OrderDTO struct {
	ID              string  `json:"id"`
	UserID          string  `json:"user_id"`
	CreatedAt       string  `json:"created_at"`
	UpdatedAt       string  `json:"updated_at"`
	TotalAmount     float64 `json:"total_amount"`
	Status          string  `json:"status"`
	PaymentMethod   string  `json:"payment_method"`
	PaymentStatus   string  `json:"payment_status"`
	ShippingName    string  `json:"shipping_name"`
	ShippingPhone   string  `json:"shipping_phone"`
	ShippingAddress string  `json:"shipping_address"`
	ShippingCity    string  `json:"shipping_city"`
	Notes           *string `json:"notes,omitempty"`
}

// OrderItemDTO is the data transfer object for order item responses
type OrderItemDTO struct {
	ID           string  `json:"id"`
	OrderID      string  `json:"order_id"`
	ProductID    string  `json:"product_id"`
	ProductName  string  `json:"product_name"`
	ProductImage string  `json:"product_image"`
	Price        float64 `json:"price"`
	PriceNPR     float64 `json:"price_npr"`
	Quantity     int     `json:"quantity"`
	Color        *string `json:"color,omitempty"`
	CreatedAt    string  `json:"created_at"`
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Error   string `json:"error,omitempty"`
}

// CheckoutRequest represents the request to checkout and create an order
type CheckoutRequest struct {
	ShippingName    string  `json:"shipping_name" binding:"required"`
	ShippingPhone   string  `json:"shipping_phone" binding:"required"`
	ShippingAddress string  `json:"shipping_address" binding:"required"`
	ShippingCity    string  `json:"shipping_city" binding:"required"`
	PaymentMethod   string  `json:"payment_method" binding:"required"`
	Notes           *string `json:"notes"`
}

// CheckoutResponse represents the response for checkout
type CheckoutResponse struct {
	Success       bool    `json:"success"`
	Message       string  `json:"message"`
	OrderID       string  `json:"order_id"`
	TotalAmount   float64 `json:"total_amount"`
	PaymentStatus string  `json:"payment_status"`
	PaymentURL    *string `json:"payment_url,omitempty"` // For Khalti payment
}

// VerifyPaymentRequest represents the Khalti payment verification data
type VerifyPaymentRequest struct {
	Pidx            string `form:"pidx" binding:"required"`
	TransactionID   string `form:"transaction_id" binding:"required"`
	Status          string `form:"status" binding:"required"`
	PurchaseOrderID string `form:"purchase_order_id" binding:"required"`
	Amount          int64  `form:"amount" binding:"required"`
}

// VerifyPaymentResponse represents the response for payment verification
type VerifyPaymentResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	OrderID string `json:"order_id"`
	Status  string `json:"status"`
	Error   string `json:"error,omitempty"`
}
