package dashboard

// DashboardStats represents the overall dashboard statistics
type DashboardStats struct {
	TotalProducts     int64   `json:"total_products"`
	TotalOrders       int64   `json:"total_orders"`
	PendingOrders     int64   `json:"pending_orders"`
	DeliveredOrders   int64   `json:"delivered_orders"`
	CancelledOrders   int64   `json:"cancelled_orders"`
	TotalRevenue      float64 `json:"total_revenue"`
	PaidRevenue       float64 `json:"paid_revenue"`
	TotalStock        int64   `json:"total_stock"`
	LowStockItems     int64   `json:"low_stock_items"`
	TotalCatalogValue float64 `json:"total_catalog_value"`
	TotalUsers        int64   `json:"total_users"`
	ActiveUsers       int64   `json:"active_users"`
}

// RecentOrder represents a recent order summary
type RecentOrder struct {
	ID            string  `json:"id"`
	ShippingName  string  `json:"shipping_name"`
	TotalAmount   float64 `json:"total_amount"`
	Status        string  `json:"status"`
	PaymentStatus string  `json:"payment_status"`
	CreatedAt     string  `json:"created_at"`
	ItemCount     int     `json:"item_count"`
}

// LowStockProduct represents a product with low stock
type LowStockProduct struct {
	ID                string  `json:"id"`
	Name              string  `json:"name"`
	StockQuantity     int     `json:"stock_quantity"`
	LowStockThreshold int     `json:"low_stock_threshold"`
	Price             float64 `json:"price_npr"`
	InventoryValue    float64 `json:"inventory_value"`
}

// DashboardResponse represents the complete dashboard data
type DashboardResponse struct {
	Stats         DashboardStats    `json:"stats"`
	RecentOrders  []RecentOrder     `json:"recent_orders"`
	LowStockItems []LowStockProduct `json:"low_stock_items"`
}

// OrderBreakdown represents order statistics by status
type OrderBreakdown struct {
	Pending    int64 `json:"pending"`
	Confirmed  int64 `json:"confirmed"`
	Processing int64 `json:"processing"`
	Shipped    int64 `json:"shipped"`
	Delivered  int64 `json:"delivered"`
	Cancelled  int64 `json:"cancelled"`
}

// InventorySummary represents inventory statistics
type InventorySummary struct {
	TotalUnits    int64   `json:"total_units"`
	CatalogValue  float64 `json:"catalog_value"`
	TotalProducts int64   `json:"total_products"`
	LowStockCount int64   `json:"low_stock_count"`
}

// RevenueStats represents revenue statistics
type RevenueStats struct {
	TotalRevenue   float64 `json:"total_revenue"`
	PaidRevenue    float64 `json:"paid_revenue"`
	PendingRevenue float64 `json:"pending_revenue"`
	FailedRevenue  float64 `json:"failed_revenue"`
}
