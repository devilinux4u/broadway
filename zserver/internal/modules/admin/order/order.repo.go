package order

import (
	"ecom/go/internal/db"
	"ecom/go/internal/db/models"
	"errors"
	"time"

	"gorm.io/gorm"
)

// Repository handles database operations for orders
type Repository struct {
	db *gorm.DB
}

// NewRepository creates a new order repository
func NewRepository() *Repository {
	return &Repository{
		db: db.GetDB(),
	}
}

// CreateOrder creates a new order with items
func (r *Repository) CreateOrder(order *models.Order) error {
	if err := r.db.Create(order).Error; err != nil {
		return err
	}
	return nil
}

// GetOrderByID retrieves an order by ID with all items
func (r *Repository) GetOrderByID(orderID string) (*models.Order, error) {
	var order models.Order
	if err := r.db.Preload("OrderItems").Where("id = ?", orderID).First(&order).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("order not found")
		}
		return nil, err
	}
	return &order, nil
}

// GetAllOrders retrieves all orders with filtering and pagination
func (r *Repository) GetAllOrders(filters map[string]interface{}, limit, offset int, sortBy, sortDir string) ([]models.Order, int64, error) {
	var orders []models.Order
	var total int64

	query := r.db

	// Apply filters
	if status, ok := filters["status"].(string); ok && status != "" {
		query = query.Where("status = ?", status)
	}
	if paymentStatus, ok := filters["payment_status"].(string); ok && paymentStatus != "" {
		query = query.Where("payment_status = ?", paymentStatus)
	}
	if city, ok := filters["city"].(string); ok && city != "" {
		query = query.Where("shipping_city = ?", city)
	}
	if userID, ok := filters["user_id"].(string); ok && userID != "" {
		query = query.Where("user_id = ?", userID)
	}

	// Date range filtering
	if startDate, ok := filters["start_date"].(time.Time); ok && !startDate.IsZero() {
		query = query.Where("created_at >= ?", startDate)
	}
	if endDate, ok := filters["end_date"].(time.Time); ok && !endDate.IsZero() {
		query = query.Where("created_at <= ?", endDate)
	}

	// Get total count
	if err := query.Model(&models.Order{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply sorting
	if sortDir == "asc" {
		query = query.Order(sortBy + " ASC")
	} else {
		query = query.Order(sortBy + " DESC")
	}

	// Apply pagination
	if err := query.Preload("OrderItems").Limit(limit).Offset(offset).Find(&orders).Error; err != nil {
		return nil, 0, err
	}

	return orders, total, nil
}

// GetOrdersByUserID retrieves all orders for a specific user
func (r *Repository) GetOrdersByUserID(userID string, limit, offset int) ([]models.Order, int64, error) {
	var orders []models.Order
	var total int64

	if err := r.db.Model(&models.Order{}).Where("user_id = ?", userID).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	if err := r.db.Where("user_id = ?", userID).Preload("OrderItems").Order("created_at DESC").Limit(limit).Offset(offset).Find(&orders).Error; err != nil {
		return nil, 0, err
	}

	return orders, total, nil
}

// UpdateOrderStatus updates the status of an order
func (r *Repository) UpdateOrderStatus(orderID, status string) error {
	if err := r.db.Model(&models.Order{}).Where("id = ?", orderID).Update("status", status).Error; err != nil {
		return err
	}
	return nil
}

// UpdatePaymentStatus updates the payment status of an order
func (r *Repository) UpdatePaymentStatus(orderID, paymentStatus string) error {
	if err := r.db.Model(&models.Order{}).Where("id = ?", orderID).Update("payment_status", paymentStatus).Error; err != nil {
		return err
	}
	return nil
}

// UpdateOrder updates order details
func (r *Repository) UpdateOrder(orderID string, updates *models.Order) error {
	if err := r.db.Model(&models.Order{}).Where("id = ?", orderID).Updates(updates).Error; err != nil {
		return err
	}
	return nil
}

// DeleteOrder deletes an order and its items
func (r *Repository) DeleteOrder(orderID string) error {
	if err := r.db.Where("id = ?", orderID).Delete(&models.Order{}).Error; err != nil {
		return err
	}
	return nil
}

// GetOrderStats retrieves order statistics
func (r *Repository) GetOrderStats() (map[string]interface{}, error) {
	var totalOrders int64
	var totalRevenue float64
	var pendingOrders int64
	var processingOrders int64
	var deliveredOrders int64
	var cancelledOrders int64
	var avgOrderValue float64

	if err := r.db.Model(&models.Order{}).Count(&totalOrders).Error; err != nil {
		return nil, err
	}

	if err := r.db.Model(&models.Order{}).Select("COALESCE(SUM(total_amount), 0)").Row().Scan(&totalRevenue); err != nil {
		return nil, err
	}

	if err := r.db.Model(&models.Order{}).Where("status = ?", "pending").Count(&pendingOrders).Error; err != nil {
		return nil, err
	}

	if err := r.db.Model(&models.Order{}).Where("status = ?", "processing").Count(&processingOrders).Error; err != nil {
		return nil, err
	}

	if err := r.db.Model(&models.Order{}).Where("status = ?", "delivered").Count(&deliveredOrders).Error; err != nil {
		return nil, err
	}

	if err := r.db.Model(&models.Order{}).Where("status = ?", "cancelled").Count(&cancelledOrders).Error; err != nil {
		return nil, err
	}

	if totalOrders > 0 {
		avgOrderValue = totalRevenue / float64(totalOrders)
	}

	return map[string]interface{}{
		"total_orders":      totalOrders,
		"total_revenue":     totalRevenue,
		"pending_orders":    pendingOrders,
		"processing_orders": processingOrders,
		"delivered_orders":  deliveredOrders,
		"cancelled_orders":  cancelledOrders,
		"avg_order_value":   avgOrderValue,
	}, nil
}

// SearchOrders searches for orders by various criteria
func (r *Repository) SearchOrders(keyword string, limit, offset int) ([]models.Order, error) {
	var orders []models.Order
	if err := r.db.Where("shipping_name ILIKE ? OR shipping_phone ILIKE ? OR id ILIKE ?", "%"+keyword+"%", "%"+keyword+"%", "%"+keyword+"%").
		Preload("OrderItems").
		Limit(limit).
		Offset(offset).
		Order("created_at DESC").
		Find(&orders).Error; err != nil {
		return nil, err
	}
	return orders, nil
}

// AddOrderItem adds an item to an order
func (r *Repository) AddOrderItem(orderItem *models.OrderItem) error {
	if err := r.db.Create(orderItem).Error; err != nil {
		return err
	}
	return nil
}

// DeleteOrderItem deletes an order item
func (r *Repository) DeleteOrderItem(itemID string) error {
	if err := r.db.Where("id = ?", itemID).Delete(&models.OrderItem{}).Error; err != nil {
		return err
	}
	return nil
}
