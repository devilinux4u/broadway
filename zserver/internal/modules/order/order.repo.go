package order

import (
	"ecom/go/internal/db"
	"ecom/go/internal/db/models"
	"fmt"

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

// GetUserOrders retrieves all orders for a user
func (r *Repository) GetUserOrders(userID string) ([]models.Order, error) {
	var orders []models.Order
	if err := r.db.Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&orders).Error; err != nil {
		return nil, fmt.Errorf("failed to get user orders: %w", err)
	}
	return orders, nil
}

// GetOrderByID retrieves a specific order by ID for a user
func (r *Repository) GetOrderByID(userID, orderID string) (*models.Order, error) {
	var order models.Order
	if err := r.db.Where("id = ? AND user_id = ?", orderID, userID).
		Preload("OrderItems").
		First(&order).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get order: %w", err)
	}
	return &order, nil
}

// GetOrderItems retrieves all items for a specific order
func (r *Repository) GetOrderItems(orderID string) ([]models.OrderItem, error) {
	var items []models.OrderItem
	if err := r.db.Where("order_id = ?", orderID).
		Order("created_at ASC").
		Find(&items).Error; err != nil {
		return nil, fmt.Errorf("failed to get order items: %w", err)
	}
	return items, nil
}

// GetOrderByIDOnly retrieves an order by ID (used for payment verification)
func (r *Repository) GetOrderByIDOnly(orderID string) (*models.Order, error) {
	var order models.Order
	if err := r.db.Where("id = ?", orderID).
		First(&order).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to get order: %w", err)
	}
	return &order, nil
}

// UpdateOrderPaymentStatus updates the payment status of an order
func (r *Repository) UpdateOrderPaymentStatus(orderID string, paymentStatus string, status string) error {
	if err := r.db.Model(&models.Order{}).
		Where("id = ?", orderID).
		Updates(map[string]interface{}{
			"payment_status": paymentStatus,
			"status":         status,
		}).Error; err != nil {
		return fmt.Errorf("failed to update order payment status: %w", err)
	}
	return nil
}
