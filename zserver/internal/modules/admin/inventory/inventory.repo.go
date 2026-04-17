package inventory

import (
	"ecom/go/internal/db"
	"ecom/go/internal/db/models"
	"errors"

	"gorm.io/gorm"
)

// Repository handles database operations for inventory
type Repository struct {
	db *gorm.DB
}

// NewRepository creates a new inventory repository
func NewRepository() *Repository {
	return &Repository{
		db: db.GetDB(),
	}
}

// CreateProduct creates a new product
func (r *Repository) CreateProduct(product *models.Product) error {
	if err := r.db.Create(product).Error; err != nil {
		return err
	}
	return nil
}

// GetProductByID retrieves a product by ID
func (r *Repository) GetProductByID(productID string) (*models.Product, error) {
	var product models.Product
	if err := r.db.Where("id = ?", productID).First(&product).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("product not found")
		}
		return nil, err
	}
	return &product, nil
}

// GetAllProducts retrieves all products with filtering and pagination
func (r *Repository) GetAllProducts(filters map[string]interface{}, limit, offset int) ([]models.Product, int64, error) {
	var products []models.Product
	var total int64

	query := r.db

	// Apply filters
	if category, ok := filters["category"].(string); ok && category != "" {
		query = query.Where("category = ?", category)
	}
	if inStock, ok := filters["in_stock"].(bool); ok {
		query = query.Where("in_stock = ?", inStock)
	}

	// Get total count
	if err := query.Model(&models.Product{}).Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// Apply sorting
	sortBy := "created_at"
	if sort, ok := filters["sort_by"].(string); ok && sort != "" {
		sortBy = sort
	}
	sortDir := "DESC"
	if dir, ok := filters["sort_direction"].(string); ok && dir != "" {
		sortDir = dir
	}

	// Get paginated results
	if err := query.Order(sortBy + " " + sortDir).Limit(limit).Offset(offset).Find(&products).Error; err != nil {
		return nil, 0, err
	}

	return products, total, nil
}

// UpdateProduct updates a product
func (r *Repository) UpdateProduct(productID string, updates map[string]interface{}) (*models.Product, error) {
	product := &models.Product{}
	if err := r.db.Model(product).Where("id = ?", productID).Updates(updates).Error; err != nil {
		return nil, err
	}

	// Fetch updated product
	updatedProduct, err := r.GetProductByID(productID)
	if err != nil {
		return nil, err
	}

	return updatedProduct, nil
}

// DeleteProduct deletes a product
func (r *Repository) DeleteProduct(productID string) error {
	// Delete related records first
	if err := r.db.Where("product_id = ?", productID).Delete(&models.ProductImage{}).Error; err != nil {
		return err
	}
	if err := r.db.Where("product_id = ?", productID).Delete(&models.ProductColor{}).Error; err != nil {
		return err
	}
	if err := r.db.Where("product_id = ?", productID).Delete(&models.StockMovement{}).Error; err != nil {
		return err
	}

	// Delete product
	if err := r.db.Where("id = ?", productID).Delete(&models.Product{}).Error; err != nil {
		return err
	}

	return nil
}

// AddStockMovement adds a stock movement record
func (r *Repository) AddStockMovement(movement *models.StockMovement) error {
	if err := r.db.Create(movement).Error; err != nil {
		return err
	}
	return nil
}

// GetStockMovements retrieves stock movements for a product
func (r *Repository) GetStockMovements(productID string, limit int) ([]models.StockMovement, error) {
	var movements []models.StockMovement
	if err := r.db.Where("product_id = ?", productID).Order("created_at DESC").Limit(limit).Find(&movements).Error; err != nil {
		return nil, err
	}
	return movements, nil
}

// UpdateStockQuantity updates the stock quantity of a product
func (r *Repository) UpdateStockQuantity(productID string, newQuantity int) (*models.Product, error) {
	inStock := newQuantity > 0
	if err := r.db.Model(&models.Product{}).Where("id = ?", productID).Updates(map[string]interface{}{
		"stock_quantity": newQuantity,
		"in_stock":       inStock,
	}).Error; err != nil {
		return nil, err
	}

	return r.GetProductByID(productID)
}

// AddProductImage adds an additional product image
func (r *Repository) AddProductImage(image *models.ProductImage) error {
	if err := r.db.Create(image).Error; err != nil {
		return err
	}
	return nil
}

// GetProductImages retrieves all images for a product
func (r *Repository) GetProductImages(productID string) ([]models.ProductImage, error) {
	var images []models.ProductImage
	if err := r.db.Where("product_id = ?", productID).Order("sort_order ASC").Find(&images).Error; err != nil {
		return nil, err
	}
	return images, nil
}

// DeleteProductImage deletes a product image
func (r *Repository) DeleteProductImage(imageID string) error {
	if err := r.db.Where("id = ?", imageID).Delete(&models.ProductImage{}).Error; err != nil {
		return err
	}
	return nil
}

// GetProductImageByID retrieves a single product image by ID
func (r *Repository) GetProductImageByID(imageID string) (*models.ProductImage, error) {
	var image models.ProductImage
	if err := r.db.Where("id = ?", imageID).First(&image).Error; err != nil {
		return nil, err
	}
	return &image, nil
}

// AddProductColor adds a product color
func (r *Repository) AddProductColor(color *models.ProductColor) error {
	if err := r.db.Create(color).Error; err != nil {
		return err
	}
	return nil
}

// GetProductColors retrieves all colors for a product
func (r *Repository) GetProductColors(productID string) ([]models.ProductColor, error) {
	var colors []models.ProductColor
	if err := r.db.Where("product_id = ?", productID).Order("sort_order ASC").Find(&colors).Error; err != nil {
		return nil, err
	}
	return colors, nil
}

// DeleteProductColors deletes all colors for a product
func (r *Repository) DeleteProductColors(productID string) error {
	if err := r.db.Where("product_id = ?", productID).Delete(&models.ProductColor{}).Error; err != nil {
		return err
	}
	return nil
}

// GetLowStockProducts retrieves products with low stock
func (r *Repository) GetLowStockProducts(limit int) ([]models.Product, error) {
	var products []models.Product
	if err := r.db.Where("stock_quantity <= low_stock_threshold").
		Order("stock_quantity ASC").
		Limit(limit).
		Find(&products).Error; err != nil {
		return nil, err
	}
	return products, nil
}
