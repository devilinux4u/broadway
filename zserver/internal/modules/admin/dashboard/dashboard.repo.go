package dashboard

import (
	"ecom/go/internal/db"
	"ecom/go/internal/db/models"
	"fmt"
	"time"

	"gorm.io/gorm"
)

// Repository handles database operations for dashboard
type Repository struct {
	db *gorm.DB
}

// NewRepository creates a new dashboard repository
func NewRepository() *Repository {
	return &Repository{
		db: db.GetDB(),
	}
}

// GetDashboardStats retrieves all dashboard statistics
func (r *Repository) GetDashboardStats() (*DashboardStats, error) {
	stats := &DashboardStats{}

	// Get total products
	if err := r.db.Model(&models.Product{}).
		Count(&stats.TotalProducts).Error; err != nil {
		return nil, fmt.Errorf("failed to get total products: %w", err)
	}

	// Get total stock
	if err := r.db.Model(&models.Product{}).
		Select("COALESCE(SUM(stock_quantity), 0)").
		Row().
		Scan(&stats.TotalStock); err != nil {
		return nil, fmt.Errorf("failed to get total stock: %w", err)
	}

	// Get low stock items
	if err := r.db.Model(&models.Product{}).
		Where("stock_quantity <= low_stock_threshold").
		Count(&stats.LowStockItems).Error; err != nil {
		return nil, fmt.Errorf("failed to get low stock items: %w", err)
	}

	// Get total catalog value
	if err := r.db.Model(&models.Product{}).
		Select("COALESCE(SUM(price_npr * stock_quantity), 0)").
		Row().
		Scan(&stats.TotalCatalogValue); err != nil {
		return nil, fmt.Errorf("failed to get catalog value: %w", err)
	}

	// Get order statistics
	if err := r.db.Model(&models.Order{}).
		Select(
			"COUNT(*) as total_orders",
			"COALESCE(SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END), 0) as pending_orders",
			"COALESCE(SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END), 0) as delivered_orders",
			"COALESCE(SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END), 0) as cancelled_orders",
		).
		Row().
		Scan(&stats.TotalOrders, &stats.PendingOrders, &stats.DeliveredOrders, &stats.CancelledOrders); err != nil {
		return nil, fmt.Errorf("failed to get order statistics: %w", err)
	}

	// Get revenue statistics
	if err := r.db.Model(&models.Order{}).
		Select(
			"COALESCE(SUM(total_amount), 0) as total_revenue",
			"COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total_amount ELSE 0 END), 0) as paid_revenue",
		).
		Row().
		Scan(&stats.TotalRevenue, &stats.PaidRevenue); err != nil {
		return nil, fmt.Errorf("failed to get revenue statistics: %w", err)
	}

	// Get active users (users with orders in last 30 days)
	if err := r.db.Model(&models.Order{}).
		Where("created_at >= ?", time.Now().AddDate(0, 0, -30)).
		Distinct("user_id").
		Count(&stats.ActiveUsers).Error; err != nil {
		// This is optional, so we don't fail if it doesn't work
		stats.ActiveUsers = 0
	}

	return stats, nil
}

// GetRecentOrders retrieves recent orders
func (r *Repository) GetRecentOrders(limit int) ([]RecentOrder, error) {
	var orders []models.Order
	if err := r.db.
		Order("created_at DESC").
		Limit(limit).
		Preload("OrderItems").
		Find(&orders).Error; err != nil {
		return nil, fmt.Errorf("failed to get recent orders: %w", err)
	}

	var result []RecentOrder
	for _, order := range orders {
		result = append(result, RecentOrder{
			ID:            order.ID,
			ShippingName:  order.ShippingName,
			TotalAmount:   order.TotalAmount,
			Status:        order.Status,
			PaymentStatus: order.PaymentStatus,
			CreatedAt:     order.CreatedAt.Format(time.RFC3339),
			ItemCount:     len(order.OrderItems),
		})
	}

	return result, nil
}

// GetLowStockProducts retrieves products with low stock
func (r *Repository) GetLowStockProducts() ([]LowStockProduct, error) {
	var products []models.Product
	if err := r.db.
		Where("stock_quantity <= low_stock_threshold").
		Order("stock_quantity ASC").
		Find(&products).Error; err != nil {
		return nil, fmt.Errorf("failed to get low stock products: %w", err)
	}

	var result []LowStockProduct
	for _, product := range products {
		result = append(result, LowStockProduct{
			ID:                product.ID,
			Name:              product.Name,
			StockQuantity:     product.StockQuantity,
			LowStockThreshold: product.LowStockThreshold,
			Price:             product.PriceNPR,
			InventoryValue:    float64(product.StockQuantity) * product.PriceNPR,
		})
	}

	return result, nil
}

// GetOrderBreakdown retrieves orders grouped by status
func (r *Repository) GetOrderBreakdown() (*OrderBreakdown, error) {
	breakdown := &OrderBreakdown{}

	statusCounts := map[string]int64{}
	var orders []models.Order

	if err := r.db.
		Find(&orders).Error; err != nil {
		return nil, fmt.Errorf("failed to get orders: %w", err)
	}

	for _, order := range orders {
		statusCounts[order.Status]++
	}

	breakdown.Pending = statusCounts["pending"]
	breakdown.Confirmed = statusCounts["confirmed"]
	breakdown.Processing = statusCounts["processing"]
	breakdown.Shipped = statusCounts["shipped"]
	breakdown.Delivered = statusCounts["delivered"]
	breakdown.Cancelled = statusCounts["cancelled"]

	return breakdown, nil
}

// GetInventorySummary retrieves inventory statistics
func (r *Repository) GetInventorySummary() (*InventorySummary, error) {
	summary := &InventorySummary{}

	if err := r.db.Model(&models.Product{}).
		Count(&summary.TotalProducts).Error; err != nil {
		return nil, fmt.Errorf("failed to count products: %w", err)
	}

	if err := r.db.Model(&models.Product{}).
		Select("COALESCE(SUM(stock_quantity), 0)").
		Row().
		Scan(&summary.TotalUnits); err != nil {
		return nil, fmt.Errorf("failed to get total units: %w", err)
	}

	if err := r.db.Model(&models.Product{}).
		Select("COALESCE(SUM(price_npr * stock_quantity), 0)").
		Row().
		Scan(&summary.CatalogValue); err != nil {
		return nil, fmt.Errorf("failed to get catalog value: %w", err)
	}

	if err := r.db.Model(&models.Product{}).
		Where("stock_quantity <= low_stock_threshold").
		Count(&summary.LowStockCount).Error; err != nil {
		return nil, fmt.Errorf("failed to count low stock items: %w", err)
	}

	return summary, nil
}

// GetRevenueStats retrieves revenue statistics
func (r *Repository) GetRevenueStats() (*RevenueStats, error) {
	stats := &RevenueStats{}

	var orders []models.Order
	if err := r.db.
		Find(&orders).Error; err != nil {
		return nil, fmt.Errorf("failed to get orders: %w", err)
	}

	for _, order := range orders {
		stats.TotalRevenue += order.TotalAmount
		switch order.PaymentStatus {
		case "paid":
			stats.PaidRevenue += order.TotalAmount
		case "pending":
			stats.PendingRevenue += order.TotalAmount
		case "failed":
			stats.FailedRevenue += order.TotalAmount
		}
	}

	return stats, nil
}
