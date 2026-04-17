package cart

import (
	"ecom/go/internal/db"
	"ecom/go/internal/db/models"
	"errors"

	"gorm.io/gorm"
)

// Repository handles database operations for cart
type Repository struct {
	db *gorm.DB
}

// NewRepository creates a new cart repository
func NewRepository() *Repository {
	return &Repository{
		db: db.GetDB(),
	}
}

// GetOrCreateUserCart gets the user's cart or creates one if it doesn't exist
func (r *Repository) GetOrCreateUserCart(userID string) (*models.Cart, error) {
	var cart models.Cart
	result := r.db.Where("user_id = ?", userID).First(&cart)

	if result.Error == nil {
		// Cart exists
		return &cart, nil
	}

	if !errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return nil, result.Error
	}

	// Cart doesn't exist, create it
	newCart := &models.Cart{
		UserID: userID,
	}
	if err := r.db.Create(newCart).Error; err != nil {
		return nil, err
	}

	return newCart, nil
}

// GetUserCart retrieves all items in user's cart
func (r *Repository) GetUserCart(userID string) ([]models.CartItem, error) {
	var items []models.CartItem
	result := r.db.Where("user_id = ?", userID).Order("created_at DESC").Find(&items)
	if result.Error != nil {
		return nil, result.Error
	}
	return items, nil
}

// GetCartItemByID retrieves a specific cart item by ID
func (r *Repository) GetCartItemByID(itemID string, userID string) (*models.CartItem, error) {
	var item models.CartItem
	result := r.db.Where("id = ? AND user_id = ?", itemID, userID).First(&item)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, result.Error
	}
	return &item, nil
}

// AddToCart adds a new item to user's cart
func (r *Repository) AddToCart(item *models.CartItem) error {
	// Get or create user's cart
	cart, err := r.GetOrCreateUserCart(item.UserID)
	if err != nil {
		return err
	}

	// Set the CartID for the item
	item.CartID = cart.ID

	// Check if item already exists
	var existing models.CartItem
	result := r.db.Where("user_id = ? AND product_id = ? AND color IS NOT DISTINCT FROM ?",
		item.UserID, item.ProductID, item.Color).First(&existing)

	if result.Error == nil {
		// Item exists, update quantity
		return r.db.Model(&existing).Update("quantity", gorm.Expr("quantity + ?", item.Quantity)).Error
	}

	if !errors.Is(result.Error, gorm.ErrRecordNotFound) {
		return result.Error
	}

	// Item doesn't exist, create new
	return r.db.Create(item).Error
}

// UpdateCartItem updates quantity and details of a cart item
func (r *Repository) UpdateCartItem(itemID string, userID string, quantity int) error {
	if quantity < 1 {
		return r.DeleteCartItem(itemID, userID)
	}

	result := r.db.Model(&models.CartItem{}).
		Where("id = ? AND user_id = ?", itemID, userID).
		Update("quantity", quantity)

	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return errors.New("cart item not found")
	}

	return nil
}

// DeleteCartItem removes an item from cart
func (r *Repository) DeleteCartItem(itemID string, userID string) error {
	result := r.db.Where("id = ? AND user_id = ?", itemID, userID).Delete(&models.CartItem{})
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return errors.New("cart item not found")
	}

	return nil
}

// ClearUserCart removes all items from user's cart
func (r *Repository) ClearUserCart(userID string) error {
	return r.db.Where("user_id = ?", userID).Delete(&models.CartItem{}).Error
}

// GetCartTotal calculates total price and items count
func (r *Repository) GetCartTotal(userID string) (totalPrice float64, totalItems int, err error) {
	var result []struct {
		TotalPrice float64
		TotalItems int
	}

	query := r.db.Raw(`
		SELECT 
			SUM(price_npr * quantity) as total_price,
			SUM(quantity) as total_items
		FROM cart_items
		WHERE user_id = ?
	`, userID).Scan(&result)

	if query.Error != nil {
		return 0, 0, query.Error
	}

	if len(result) > 0 {
		totalPrice = result[0].TotalPrice
		totalItems = result[0].TotalItems
	}

	return totalPrice, totalItems, nil
}

// GetCartItemCount gets total number of items in cart
func (r *Repository) GetCartItemCount(userID string) (int64, error) {
	var count int64
	result := r.db.Where("user_id = ?", userID).Model(&models.CartItem{}).Count(&count)
	if result.Error != nil {
		return 0, result.Error
	}
	return count, nil
}
