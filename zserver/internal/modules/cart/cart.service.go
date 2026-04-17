package cart

import (
	"ecom/go/internal/db/models"
	"errors"
)

// Service handles business logic for cart
type Service struct {
	repo *Repository
}

// NewService creates a new cart service
func NewService(repo *Repository) *Service {
	return &Service{
		repo: repo,
	}
}

// GetUserCart retrieves all items in user's cart with totals
func (s *Service) GetUserCart(userID string) (*GetCartResponse, error) {
	items, err := s.repo.GetUserCart(userID)
	if err != nil {
		return nil, err
	}

	// Convert to DTOs
	itemDTOs := make([]CartItemDTO, len(items))
	var totalPrice float64
	var totalItems int

	for i, item := range items {
		itemDTOs[i] = CartItemDTO{
			ID:           item.ID,
			ProductID:    item.ProductID,
			ProductName:  item.ProductName,
			ProductImage: item.ProductImage,
			PriceNPR:     item.PriceNPR,
			Quantity:     item.Quantity,
			Color:        item.Color,
		}
		totalPrice += item.PriceNPR * float64(item.Quantity)
		totalItems += item.Quantity
	}

	return &GetCartResponse{
		Success:    true,
		Message:    "Cart retrieved successfully",
		Items:      itemDTOs,
		TotalItems: totalItems,
		TotalPrice: totalPrice,
	}, nil
}

// AddToCart adds a new item to user's cart
func (s *Service) AddToCart(userID string, req *AddToCartRequest) (*GetCartResponse, error) {
	if req.Quantity < 1 {
		return nil, errors.New("quantity must be at least 1")
	}

	if req.PriceNPR <= 0 {
		return nil, errors.New("price must be greater than 0")
	}

	item := &models.CartItem{
		UserID:       userID,
		ProductID:    req.ProductID,
		ProductName:  req.ProductName,
		ProductImage: req.ImageURL,
		PriceNPR:     req.PriceNPR,
		Quantity:     req.Quantity,
		Color:        req.Color,
	}

	if err := s.repo.AddToCart(item); err != nil {
		return nil, err
	}

	// Return updated cart
	return s.GetUserCart(userID)
}

// UpdateCartItem updates the quantity of a cart item
func (s *Service) UpdateCartItem(userID string, req *UpdateCartRequest) (*GetCartResponse, error) {
	if req.Quantity < 1 {
		return nil, errors.New("quantity must be at least 1")
	}

	// Verify the item belongs to the user
	item, err := s.repo.GetCartItemByID(req.CartItemID, userID)
	if err != nil {
		return nil, err
	}

	if item == nil {
		return nil, errors.New("cart item not found")
	}

	if err := s.repo.UpdateCartItem(req.CartItemID, userID, req.Quantity); err != nil {
		return nil, err
	}

	// Return updated cart
	return s.GetUserCart(userID)
}

// RemoveFromCart removes an item from user's cart
func (s *Service) RemoveFromCart(userID string, req *RemoveFromCartRequest) (*GetCartResponse, error) {
	// Verify the item belongs to the user
	item, err := s.repo.GetCartItemByID(req.CartItemID, userID)
	if err != nil {
		return nil, err
	}

	if item == nil {
		return nil, errors.New("cart item not found")
	}

	if err := s.repo.DeleteCartItem(req.CartItemID, userID); err != nil {
		return nil, err
	}

	// Return updated cart
	return s.GetUserCart(userID)
}

// ClearCart clears all items from user's cart
func (s *Service) ClearCart(userID string) error {
	return s.repo.ClearUserCart(userID)
}
