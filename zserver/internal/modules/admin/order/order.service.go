package order

import (
	"ecom/go/internal/db"
	"ecom/go/internal/db/models"
	"errors"
	"fmt"
	"strings"
	"time"
)

// Service handles business logic for orders
type Service struct {
	repo *Repository
}

// NewService creates a new order service
func NewService(repo *Repository) *Service {
	return &Service{
		repo: repo,
	}
}

// CreateOrder creates a new order with items
func (s *Service) CreateOrder(req *CreateOrderRequest, userID string) (*models.Order, error) {
	if req == nil {
		return nil, errors.New("request cannot be nil")
	}

	// Validate required fields
	if strings.TrimSpace(req.ShippingName) == "" {
		return nil, errors.New("shipping name is required")
	}
	if strings.TrimSpace(req.ShippingPhone) == "" {
		return nil, errors.New("shipping phone is required")
	}
	if strings.TrimSpace(req.ShippingAddress) == "" {
		return nil, errors.New("shipping address is required")
	}
	if strings.TrimSpace(req.ShippingCity) == "" {
		return nil, errors.New("shipping city is required")
	}
	if len(req.OrderItems) == 0 {
		return nil, errors.New("order must contain at least one item")
	}

	// Validate inventory before creating order
	if err := s.ValidateInventory(req.OrderItems); err != nil {
		return nil, err
	}

	// Calculate total amount
	var totalAmount float64
	for _, item := range req.OrderItems {
		if item.Quantity <= 0 {
			return nil, errors.New("item quantity must be greater than 0")
		}
		if item.Price <= 0 {
			return nil, errors.New("item price must be greater than 0")
		}
		totalAmount += item.Price * float64(item.Quantity)
	}

	// Create order
	order := &models.Order{
		UserID:          userID,
		ShippingName:    req.ShippingName,
		ShippingPhone:   req.ShippingPhone,
		ShippingAddress: req.ShippingAddress,
		ShippingCity:    req.ShippingCity,
		TotalAmount:     totalAmount,
		Status:          "pending",
		PaymentStatus:   "pending",
		PaymentMethod:   req.PaymentMethod,
		Notes:           req.Notes,
	}

	// Create order items
	order.OrderItems = make([]models.OrderItem, len(req.OrderItems))
	for i, item := range req.OrderItems {
		order.OrderItems[i] = models.OrderItem{
			ProductID:    item.ProductID,
			ProductName:  item.ProductName,
			ProductImage: item.ProductImage,
			Quantity:     item.Quantity,
			Price:        item.Price,
		}
	}

	if err := s.repo.CreateOrder(order); err != nil {
		return nil, fmt.Errorf("failed to create order: %w", err)
	}

	// Decrease inventory for each item
	if err := s.DecreaseInventory(req.OrderItems); err != nil {
		// Log error but don't fail as order is already created
		fmt.Printf("Warning: failed to decrease inventory for order %s: %v\n", order.ID, err)
	}

	return order, nil
}

// GetOrderByID retrieves a single order by ID
func (s *Service) GetOrderByID(orderID string) (*models.Order, error) {
	if strings.TrimSpace(orderID) == "" {
		return nil, errors.New("order id is required")
	}

	order, err := s.repo.GetOrderByID(orderID)
	if err != nil {
		return nil, err
	}

	return order, nil
}

// GetAllOrders retrieves all orders with filtering and pagination
func (s *Service) GetAllOrders(filters map[string]interface{}, limit, offset int, sortBy, sortDir string) ([]models.Order, int64, error) {
	// Validate pagination params
	if limit <= 0 || limit > 100 {
		limit = 50
	}
	if offset < 0 {
		offset = 0
	}

	// Validate sort direction
	if sortDir != "asc" && sortDir != "desc" {
		sortDir = "desc"
	}

	// Validate sort by field
	validSortFields := map[string]bool{
		"created_at":    true,
		"updated_at":    true,
		"total_amount":  true,
		"status":        true,
		"shipping_city": true,
	}
	if !validSortFields[sortBy] {
		sortBy = "created_at"
	}

	orders, total, err := s.repo.GetAllOrders(filters, limit, offset, sortBy, sortDir)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to fetch orders: %w", err)
	}

	return orders, total, nil
}

// GetOrdersByUserID retrieves all orders for a specific user
func (s *Service) GetOrdersByUserID(userID string, limit, offset int) ([]models.Order, int64, error) {
	if strings.TrimSpace(userID) == "" {
		return nil, 0, errors.New("user id is required")
	}

	// Validate pagination
	if limit <= 0 || limit > 100 {
		limit = 50
	}
	if offset < 0 {
		offset = 0
	}

	orders, total, err := s.repo.GetOrdersByUserID(userID, limit, offset)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to fetch user orders: %w", err)
	}

	return orders, total, nil
}

// UpdateOrderStatus updates the status of an order
func (s *Service) UpdateOrderStatus(orderID, status string) error {
	if strings.TrimSpace(orderID) == "" {
		return errors.New("order id is required")
	}

	validStatuses := map[string]bool{
		"pending":    true,
		"confirmed":  true,
		"processing": true,
		"shipped":    true,
		"delivered":  true,
		"cancelled":  true,
	}

	if !validStatuses[status] {
		return errors.New("invalid order status")
	}

	// Verify order exists
	if _, err := s.repo.GetOrderByID(orderID); err != nil {
		return err
	}

	if err := s.repo.UpdateOrderStatus(orderID, status); err != nil {
		return fmt.Errorf("failed to update order status: %w", err)
	}

	return nil
}

// UpdatePaymentStatus updates the payment status of an order
func (s *Service) UpdatePaymentStatus(orderID, paymentStatus string) error {
	if strings.TrimSpace(orderID) == "" {
		return errors.New("order id is required")
	}

	validPaymentStatuses := map[string]bool{
		"pending":  true,
		"paid":     true,
		"failed":   true,
		"refunded": true,
	}

	if !validPaymentStatuses[paymentStatus] {
		return errors.New("invalid payment status")
	}

	// Verify order exists
	if _, err := s.repo.GetOrderByID(orderID); err != nil {
		return err
	}

	if err := s.repo.UpdatePaymentStatus(orderID, paymentStatus); err != nil {
		return fmt.Errorf("failed to update payment status: %w", err)
	}

	return nil
}

// UpdateOrder updates order details
func (s *Service) UpdateOrder(orderID string, req *UpdateOrderRequest) (*models.Order, error) {
	if strings.TrimSpace(orderID) == "" {
		return nil, errors.New("order id is required")
	}

	// Get existing order
	order, err := s.repo.GetOrderByID(orderID)
	if err != nil {
		return nil, err
	}

	// Update fields if provided
	if req.ShippingName != nil {
		order.ShippingName = *req.ShippingName
	}
	if req.ShippingPhone != nil {
		order.ShippingPhone = *req.ShippingPhone
	}
	if req.ShippingAddress != nil {
		order.ShippingAddress = *req.ShippingAddress
	}
	if req.ShippingCity != nil {
		order.ShippingCity = *req.ShippingCity
	}
	if req.PaymentMethod != nil {
		order.PaymentMethod = *req.PaymentMethod
	}
	if req.Notes != nil {
		order.Notes = req.Notes
	}
	if req.Status != nil {
		order.Status = *req.Status
	}
	if req.PaymentStatus != nil {
		order.PaymentStatus = *req.PaymentStatus
	}

	if err := s.repo.UpdateOrder(orderID, order); err != nil {
		return nil, fmt.Errorf("failed to update order: %w", err)
	}

	return order, nil
}

// DeleteOrder deletes an order
func (s *Service) DeleteOrder(orderID string) error {
	if strings.TrimSpace(orderID) == "" {
		return errors.New("order id is required")
	}

	// Verify order exists
	if _, err := s.repo.GetOrderByID(orderID); err != nil {
		return err
	}

	if err := s.repo.DeleteOrder(orderID); err != nil {
		return fmt.Errorf("failed to delete order: %w", err)
	}

	return nil
}

// GetOrderStats retrieves order statistics
func (s *Service) GetOrderStats() (map[string]interface{}, error) {
	stats, err := s.repo.GetOrderStats()
	if err != nil {
		return nil, fmt.Errorf("failed to fetch order stats: %w", err)
	}

	return stats, nil
}

// SearchOrders searches for orders by keyword
func (s *Service) SearchOrders(keyword string, limit, offset int) ([]models.Order, error) {
	if strings.TrimSpace(keyword) == "" {
		return nil, errors.New("search keyword is required")
	}

	if limit <= 0 || limit > 100 {
		limit = 50
	}
	if offset < 0 {
		offset = 0
	}

	orders, err := s.repo.SearchOrders(keyword, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to search orders: %w", err)
	}

	return orders, nil
}

// ParseDateFilter parses a date string in format YYYY-MM-DD
func (s *Service) ParseDateFilter(dateStr string) (time.Time, error) {
	if dateStr == "" {
		return time.Time{}, nil
	}

	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return time.Time{}, errors.New("invalid date format, use YYYY-MM-DD")
	}

	return date, nil
}

// ValidateInventory checks if all items have sufficient stock
func (s *Service) ValidateInventory(items []CreateOrderItem) error {
	dbConn := db.GetDB()

	for _, item := range items {
		var product models.Product
		if err := dbConn.Where("id = ?", item.ProductID).First(&product).Error; err != nil {
			return fmt.Errorf("product %s not found", item.ProductID)
		}

		if product.StockQuantity < item.Quantity {
			return fmt.Errorf("insufficient stock for %s", product.Name)
		}

		if !product.InStock {
			return fmt.Errorf("product %s is out of stock", product.Name)
		}
	}

	return nil
}

// DecreaseInventory decreases stock for each item in the order
func (s *Service) DecreaseInventory(items []CreateOrderItem) error {
	dbConn := db.GetDB()

	for _, item := range items {
		var product models.Product
		if err := dbConn.Where("id = ?", item.ProductID).First(&product).Error; err != nil {
			return fmt.Errorf("failed to find product %s: %w", item.ProductID, err)
		}

		newQuantity := product.StockQuantity - item.Quantity
		inStock := newQuantity > 0

		if err := dbConn.Model(&models.Product{}).Where("id = ?", item.ProductID).Updates(map[string]interface{}{
			"stock_quantity": newQuantity,
			"in_stock":       inStock,
		}).Error; err != nil {
			return fmt.Errorf("failed to update stock for product %s: %w", item.ProductID, err)
		}
	}

	return nil
}
