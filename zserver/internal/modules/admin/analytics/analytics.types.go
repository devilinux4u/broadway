package analytics

// Overview represents top-level analytics KPIs.
type Overview struct {
	TotalOrders       int64   `json:"total_orders"`
	TotalIncome       float64 `json:"total_income"`
	PaidIncome        float64 `json:"paid_income"`
	PendingIncome     float64 `json:"pending_income"`
	CODIncome         float64 `json:"cod_income"`
	OtherIncome       float64 `json:"other_income"`
	TotalCustomers    int64   `json:"total_customers"`
	AverageOrderValue float64 `json:"average_order_value"`
	TotalItemsSold    int64   `json:"total_items_sold"`
}

// MonthlySalesPoint represents one month of sales/income data.
type MonthlySalesPoint struct {
	Month       string  `json:"month"`
	MonthLabel  string  `json:"month_label"`
	TotalOrders int64   `json:"total_orders"`
	TotalIncome float64 `json:"total_income"`
	CODIncome   float64 `json:"cod_income"`
	OtherIncome float64 `json:"other_income"`
}

// PaymentIncomeBreakdown represents income grouped by payment method.
type PaymentIncomeBreakdown struct {
	PaymentMethod string  `json:"payment_method"`
	TotalOrders   int64   `json:"total_orders"`
	TotalIncome   float64 `json:"total_income"`
}

// TopProduct represents top-selling products by quantity and income.
type TopProduct struct {
	ProductName  string  `json:"product_name"`
	QuantitySold int64   `json:"quantity_sold"`
	TotalIncome  float64 `json:"total_income"`
	OrdersCount  int64   `json:"orders_count"`
}

// FullAnalyticsResponse represents the complete analytics payload.
type FullAnalyticsResponse struct {
	Overview               Overview                 `json:"overview"`
	MonthlySales           []MonthlySalesPoint      `json:"monthly_sales"`
	PaymentIncome          []PaymentIncomeBreakdown `json:"payment_income"`
	TopProducts            []TopProduct             `json:"top_products"`
	OrderStatusBreakdown   map[string]int64         `json:"order_status_breakdown"`
	PaymentStatusBreakdown map[string]int64         `json:"payment_status_breakdown"`
}
