package order

// CreateOrderRequest represents the request for creating an order
type CreateOrderRequest struct {
	ShippingName    string            `json:"shipping_name" binding:"required,min=1,max=255"`
	ShippingPhone   string            `json:"shipping_phone" binding:"required"`
	ShippingAddress string            `json:"shipping_address" binding:"required"`
	ShippingCity    string            `json:"shipping_city" binding:"required"`
	PaymentMethod   string            `json:"payment_method" binding:"required"`
	Notes           *string           `json:"notes"`
	OrderItems      []CreateOrderItem `json:"order_items" binding:"required,min=1"`
}

// CreateOrderItem represents a single item in a create order request
type CreateOrderItem struct {
	ProductID    string  `json:"product_id" binding:"required,uuid"`
	ProductName  string  `json:"product_name" binding:"required"`
	ProductImage string  `json:"product_image" binding:"required"`
	Quantity     int     `json:"quantity" binding:"required,gt=0"`
	Price        float64 `json:"price" binding:"required,gt=0"`
}

// UpdateOrderStatusRequest represents the request for updating order status
type UpdateOrderStatusRequest struct {
	Status string `json:"status" binding:"required,oneof=pending confirmed processing shipped delivered cancelled"`
}

// UpdatePaymentStatusRequest represents the request for updating payment status
type UpdatePaymentStatusRequest struct {
	PaymentStatus string `json:"payment_status" binding:"required,oneof=pending paid failed refunded"`
}

// UpdateOrderRequest represents the request for updating an order
type UpdateOrderRequest struct {
	ShippingName    *string `json:"shipping_name" binding:"min=1,max=255"`
	ShippingPhone   *string `json:"shipping_phone"`
	ShippingAddress *string `json:"shipping_address"`
	ShippingCity    *string `json:"shipping_city"`
	PaymentMethod   *string `json:"payment_method"`
	Notes           *string `json:"notes"`
	Status          *string `json:"status" binding:"oneof=pending confirmed processing shipped delivered cancelled"`
	PaymentStatus   *string `json:"payment_status" binding:"oneof=pending paid failed refunded"`
}

// OrderListQueryParams represents query parameters for listing orders
type OrderListQueryParams struct {
	Status        *string `form:"status"`
	PaymentStatus *string `form:"payment_status"`
	City          *string `form:"city"`
	UserID        *string `form:"user_id"`
	Limit         int     `form:"limit,default=50"`
	Offset        int     `form:"offset,default=0"`
	SortBy        string  `form:"sort_by,default=created_at"`
	SortDirection string  `form:"sort_direction,default=desc"`
	StartDate     *string `form:"start_date"` // Format: 2006-01-02
	EndDate       *string `form:"end_date"`   // Format: 2006-01-02
}

// OrderStats represents statistics for orders
type OrderStats struct {
	TotalOrders      int64   `json:"total_orders"`
	TotalRevenue     float64 `json:"total_revenue"`
	PendingOrders    int64   `json:"pending_orders"`
	ProcessingOrders int64   `json:"processing_orders"`
	DeliveredOrders  int64   `json:"delivered_orders"`
	CancelledOrders  int64   `json:"cancelled_orders"`
	AvgOrderValue    float64 `json:"avg_order_value"`
}
