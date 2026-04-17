package order

import (
	"bytes"
	"ecom/go/internal/db"
	"ecom/go/internal/db/models"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
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

// GetUserOrders retrieves all orders for a user with DTOs
func (s *Service) GetUserOrders(userID string) (*GetOrdersResponse, error) {
	if userID == "" {
		return nil, errors.New("user_id is required")
	}

	orders, err := s.repo.GetUserOrders(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get orders: %w", err)
	}

	// Convert to DTOs
	orderDTOs := make([]OrderDTO, len(orders))
	for i, order := range orders {
		orderDTOs[i] = convertOrderToDTO(&order)
	}

	return &GetOrdersResponse{
		Success: true,
		Message: "Orders retrieved successfully",
		Data:    orderDTOs,
	}, nil
}

// GetOrderDetail retrieves a specific order with its items
func (s *Service) GetOrderDetail(userID, orderID string) (*GetOrderDetailResponse, error) {
	if userID == "" || orderID == "" {
		return nil, errors.New("user_id and order_id are required")
	}

	order, err := s.repo.GetOrderByID(userID, orderID)
	if err != nil {
		return nil, fmt.Errorf("failed to get order: %w", err)
	}

	if order == nil {
		return nil, errors.New("order not found")
	}

	// Get order items
	items, err := s.repo.GetOrderItems(orderID)
	if err != nil {
		return nil, fmt.Errorf("failed to get order items: %w", err)
	}

	// Convert to DTOs
	itemDTOs := make([]OrderItemDTO, len(items))
	for i, item := range items {
		itemDTOs[i] = convertOrderItemToDTO(&item)
	}

	return &GetOrderDetailResponse{
		Success: true,
		Message: "Order retrieved successfully",
		Order:   convertOrderToDTO(order),
		Items:   itemDTOs,
	}, nil
}

// Checkout processes checkout and creates an order
// For COD: confirms order immediately
// For Khalti: returns payment URL
func (s *Service) Checkout(userID string, req *CheckoutRequest) (*CheckoutResponse, error) {
	if userID == "" {
		return nil, errors.New("user_id is required")
	}

	if req.PaymentMethod != "cod" && req.PaymentMethod != "khalti" {
		return nil, errors.New("unsupported payment method")
	}

	// Get user's cart from cart module
	// For now, we'll need to pass cart items from the API request
	// This will be handled in the controller

	return nil, nil // Placeholder
}

// ProcessCODCheckout handles Cash on Delivery payment
func (s *Service) ProcessCODCheckout(userID string, req *CheckoutRequest, cartItems []CartItemForCheckout, totalAmount float64) (*CheckoutResponse, error) {
	if userID == "" {
		return nil, errors.New("user_id is required")
	}

	if len(cartItems) == 0 {
		return nil, errors.New("cart is empty")
	}

	// Convert cart items to order items
	var orderItems []models.OrderItem
	for _, item := range cartItems {
		orderItems = append(orderItems, models.OrderItem{
			ProductID:    item.ProductID,
			ProductName:  item.ProductName,
			ProductImage: item.ProductImage,
			Quantity:     item.Quantity,
			Price:        item.Price,
		})
	}

	// Create order with confirmed status for COD
	order := &models.Order{
		UserID:          userID,
		ShippingName:    req.ShippingName,
		ShippingPhone:   req.ShippingPhone,
		ShippingAddress: req.ShippingAddress,
		ShippingCity:    req.ShippingCity,
		TotalAmount:     totalAmount,
		PaymentMethod:   req.PaymentMethod,
		Status:          "confirmed", // Auto-confirmed for COD
		PaymentStatus:   "pending",
		Notes:           req.Notes,
		OrderItems:      orderItems,
	}

	// Create order in database
	dbConn := db.GetDB()
	if err := dbConn.Create(order).Error; err != nil {
		return nil, fmt.Errorf("failed to create order: %w", err)
	}

	// Clear user's cart after successful order
	if err := s.clearUserCart(userID); err != nil {
		// Log error but don't fail the checkout
		fmt.Printf("Warning: failed to clear cart for user %s: %v\n", userID, err)
	}

	return &CheckoutResponse{
		Success:       true,
		Message:       "Order placed successfully",
		OrderID:       order.ID,
		TotalAmount:   order.TotalAmount,
		PaymentStatus: "pending",
	}, nil
}

// ProcessKhaltiCheckout handles Khalti payment
func (s *Service) ProcessKhaltiCheckout(userID string, req *CheckoutRequest, cartItems []CartItemForCheckout, totalAmount float64) (*CheckoutResponse, error) {
	if userID == "" {
		return nil, errors.New("user_id is required")
	}

	if len(cartItems) == 0 {
		return nil, errors.New("cart is empty")
	}

	// Convert cart items to order items
	var orderItems []models.OrderItem
	for _, item := range cartItems {
		orderItems = append(orderItems, models.OrderItem{
			ProductID:    item.ProductID,
			ProductName:  item.ProductName,
			ProductImage: item.ProductImage,
			Quantity:     item.Quantity,
			Price:        item.Price,
		})
	}

	// Create order with pending status
	order := &models.Order{
		UserID:          userID,
		ShippingName:    req.ShippingName,
		ShippingPhone:   req.ShippingPhone,
		ShippingAddress: req.ShippingAddress,
		ShippingCity:    req.ShippingCity,
		TotalAmount:     totalAmount,
		PaymentMethod:   req.PaymentMethod,
		Status:          "pending",
		PaymentStatus:   "pending",
		Notes:           req.Notes,
		OrderItems:      orderItems,
	}

	// Create order in database
	dbConn := db.GetDB()
	if err := dbConn.Create(order).Error; err != nil {
		return nil, fmt.Errorf("failed to create order: %w", err)
	}

	// Generate Khalti payment URL by calling Khalti API
	khaltiURL, err := generateKhaltiPaymentURL(order.ID, totalAmount, req.ShippingName)
	if err != nil {
		return nil, fmt.Errorf("failed to generate khalti payment url: %w", err)
	}

	// Clear user's cart after order creation (before payment)
	if err := s.clearUserCart(userID); err != nil {
		// Log error but don't fail the checkout
		fmt.Printf("Warning: failed to clear cart for user %s: %v\n", userID, err)
	}

	return &CheckoutResponse{
		Success:       true,
		Message:       "Order created. Proceed to payment",
		OrderID:       order.ID,
		TotalAmount:   order.TotalAmount,
		PaymentStatus: "pending",
		PaymentURL:    &khaltiURL,
	}, nil
}

// clearUserCart removes all items from a user's cart
func (s *Service) clearUserCart(userID string) error {
	dbConn := db.GetDB()
	// Delete all cart items for this user
	if err := dbConn.Where("user_id = ?", userID).Delete(&models.CartItem{}).Error; err != nil {
		return fmt.Errorf("failed to clear cart items: %w", err)
	}
	return nil
}

// VerifyKhaltiPayment verifies Khalti payment and updates order status
func (s *Service) VerifyKhaltiPayment(req *VerifyPaymentRequest) (*VerifyPaymentResponse, error) {
	if req.PurchaseOrderID == "" {
		return nil, errors.New("purchase_order_id is required")
	}

	// Get order
	order, err := s.repo.GetOrderByIDOnly(req.PurchaseOrderID)
	if err != nil {
		return nil, fmt.Errorf("failed to get order: %w", err)
	}

	if order == nil {
		return &VerifyPaymentResponse{
			Success: false,
			Message: "Order not found",
			Error:   "Order not found",
		}, nil
	}

	// Check if status is Completed
	if req.Status != "Completed" {
		return &VerifyPaymentResponse{
			Success: false,
			Message: "Payment not completed",
			OrderID: order.ID,
			Status:  req.Status,
			Error:   "Payment status is " + req.Status,
		}, nil
	}

	// Verify amount matches (amount in paisa)
	orderAmountInPaisa := int64(order.TotalAmount * 100)
	if req.Amount != orderAmountInPaisa {
		return &VerifyPaymentResponse{
			Success: false,
			Message: "Amount mismatch",
			OrderID: order.ID,
			Error:   "Payment amount does not match order amount",
		}, nil
	}

	// Update order status to confirmed and payment_status to paid
	if err := s.repo.UpdateOrderPaymentStatus(req.PurchaseOrderID, "paid", "confirmed"); err != nil {
		return nil, fmt.Errorf("failed to update order: %w", err)
	}

	return &VerifyPaymentResponse{
		Success: true,
		Message: "Payment verified successfully",
		OrderID: order.ID,
		Status:  "confirmed",
	}, nil
}

// KhaltiInitiatePaymentRequest represents the request to Khalti API
type KhaltiInitiatePaymentRequest struct {
	ReturnURL         string             `json:"return_url"`
	WebsiteURL        string             `json:"website_url"`
	Amount            int64              `json:"amount"`
	PurchaseOrderID   string             `json:"purchase_order_id"`
	PurchaseOrderName string             `json:"purchase_order_name"`
	CustomerInfo      KhaltiCustomerInfo `json:"customer_info"`
}

// KhaltiCustomerInfo represents customer information for Khalti
type KhaltiCustomerInfo struct {
	Name string `json:"name"`
}

// KhaltiInitiatePaymentResponse represents the response from Khalti API
type KhaltiInitiatePaymentResponse struct {
	PaymentURL string `json:"payment_url"`
	PaymentID  string `json:"pidx"`
	ExpiresAt  string `json:"expires_at"`
}

// generateKhaltiPaymentURL calls Khalti API to generate payment URL
func generateKhaltiPaymentURL(orderID string, totalAmount float64, customerName string) (string, error) {
	khaltiLiveKey := os.Getenv("KHALTI_LIVE_KEY")
	khaltiBaseURL := os.Getenv("KHALTI_BASE_URL")
	returnURL := os.Getenv("RETURN_URL")
	websiteURL := os.Getenv("WEBSITE_URL")

	if khaltiLiveKey == "" {
		return "", errors.New("KHALTI_LIVE_KEY not configured")
	}
	if khaltiBaseURL == "" {
		return "", errors.New("BASE_URL not configured")
	}
	if returnURL == "" {
		return "", errors.New("RETURN_URL not configured")
	}
	if websiteURL == "" {
		return "", errors.New("WEBSITE_URL not configured")
	}

	// Khalti expects amount in paisa (multiply by 100)
	amountInPaisa := int64(totalAmount * 100)

	payload := KhaltiInitiatePaymentRequest{
		ReturnURL:         returnURL,
		WebsiteURL:        websiteURL,
		Amount:            amountInPaisa,
		PurchaseOrderID:   orderID,
		PurchaseOrderName: fmt.Sprintf("Order #%s", orderID[:8]),
		CustomerInfo: KhaltiCustomerInfo{
			Name: customerName,
		},
	}

	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return "", fmt.Errorf("failed to marshal khalti payload: %w", err)
	}

	// Call Khalti API
	endpoint := fmt.Sprintf("%sepayment/initiate/", khaltiBaseURL)
	req, err := http.NewRequest("POST", endpoint, bytes.NewBuffer(payloadBytes))
	if err != nil {
		return "", fmt.Errorf("failed to create khalti request: %w", err)
	}

	req.Header.Set("Authorization", fmt.Sprintf("Key %s", khaltiLiveKey))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to call khalti api: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("khalti api error: status=%d, body=%s", resp.StatusCode, string(body))
	}

	var khaltiResp KhaltiInitiatePaymentResponse
	if err := json.NewDecoder(resp.Body).Decode(&khaltiResp); err != nil {
		return "", fmt.Errorf("failed to decode khalti response: %w", err)
	}

	fmt.Printf("%s\n", khaltiResp)
	return khaltiResp.PaymentURL, nil
}

// CartItemForCheckout represents cart item data for checkout
type CartItemForCheckout struct {
	ProductID    string
	ProductName  string
	ProductImage string
	Quantity     int
	Price        float64
}

// Helper functions to convert models to DTOs
func convertOrderToDTO(order *models.Order) OrderDTO {
	var notes *string
	if order.Notes != nil {
		notes = order.Notes
	}

	return OrderDTO{
		ID:              order.ID,
		UserID:          order.UserID,
		CreatedAt:       order.CreatedAt.Format("2006-01-02T15:04:05Z"),
		UpdatedAt:       order.UpdatedAt.Format("2006-01-02T15:04:05Z"),
		TotalAmount:     order.TotalAmount,
		Status:          order.Status,
		PaymentMethod:   order.PaymentMethod,
		PaymentStatus:   order.PaymentStatus,
		ShippingName:    order.ShippingName,
		ShippingPhone:   order.ShippingPhone,
		ShippingAddress: order.ShippingAddress,
		ShippingCity:    order.ShippingCity,
		Notes:           notes,
	}
}

func convertOrderItemToDTO(item *models.OrderItem) OrderItemDTO {
	return OrderItemDTO{
		ID:           item.ID,
		OrderID:      item.OrderID,
		ProductID:    item.ProductID,
		ProductName:  item.ProductName,
		ProductImage: item.ProductImage,
		Price:        item.Price,
		PriceNPR:     item.Price, // Using same price since PriceNPR doesn't exist in model
		Quantity:     item.Quantity,
		Color:        nil, // Color not in model
		CreatedAt:    item.CreatedAt.Format("2006-01-02T15:04:05Z"),
	}
}
