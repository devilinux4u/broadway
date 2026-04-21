package shop

import (
	"ecom/go/internal/db"
	"ecom/go/internal/db/models"
	"errors"

	"gorm.io/gorm"
)

// Repository handles database operations for shop
type Repository struct {
	db *gorm.DB
}

// NewRepository creates a new shop repository
func NewRepository() *Repository {
	return &Repository{
		db: db.GetDB(),
	}
}

// GetAllProducts retrieves all products
func (r *Repository) GetAllProducts() ([]models.Product, error) {
	db := r.db
	var products []models.Product

	result := db.Order("created_at DESC").Find(&products)
	if result.Error != nil {
		return nil, result.Error
	}

	return products, nil
}

// GetProductsByCategory retrieves products by category
func (r *Repository) GetProductsByCategory(category string) ([]models.Product, error) {
	db := r.db
	var products []models.Product

	result := db.Where("category = ?", category).Order("created_at DESC").Find(&products)
	if result.Error != nil {
		return nil, result.Error
	}

	return products, nil
}

// SearchProducts searches for products by name or description
func (r *Repository) SearchProducts(query string) ([]models.Product, error) {
	db := r.db
	var products []models.Product

	result := db.Where("LOWER(name) LIKE ? OR LOWER(description) LIKE ?", "%"+query+"%", "%"+query+"%").
		Order("created_at DESC").
		Find(&products)

	if result.Error != nil {
		return nil, result.Error
	}

	return products, nil
}

// GetProductByID retrieves a single product by ID
func (r *Repository) GetProductByID(id string) (*models.Product, error) {
	db := r.db
	var product models.Product

	result := db.Where("id = ?", id).First(&product)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, result.Error
	}

	return &product, nil
}

// GetProductImages retrieves all images for a product
func (r *Repository) GetProductImages(productID string) ([]models.ProductImage, error) {
	db := r.db
	var images []models.ProductImage

	result := db.Where("product_id = ?", productID).Order("sort_order ASC").Find(&images)
	if result.Error != nil {
		return nil, result.Error
	}

	return images, nil
}

// GetProductsImages retrieves images for multiple products
func (r *Repository) GetProductsImages(productIDs []string) (map[string][]models.ProductImage, error) {
	db := r.db
	var images []models.ProductImage

	result := db.Where("product_id IN ?", productIDs).Order("sort_order ASC").Find(&images)
	if result.Error != nil {
		return nil, result.Error
	}

	// Group images by product ID
	imageMap := make(map[string][]models.ProductImage)
	for _, img := range images {
		imageMap[img.ProductID] = append(imageMap[img.ProductID], img)
	}

	return imageMap, nil
}

// GetProductColors retrieves all colors for a product
func (r *Repository) GetProductColors(productID string) ([]models.ProductColor, error) {
	db := r.db
	var colors []models.ProductColor

	result := db.Where("product_id = ?", productID).Order("sort_order ASC").Find(&colors)
	if result.Error != nil {
		return nil, result.Error
	}

	return colors, nil
}

// GetProductsColors retrieves colors for multiple products
func (r *Repository) GetProductsColors(productIDs []string) (map[string][]models.ProductColor, error) {
	db := r.db
	var colors []models.ProductColor

	result := db.Where("product_id IN ?", productIDs).Order("sort_order ASC").Find(&colors)
	if result.Error != nil {
		return nil, result.Error
	}

	// Group colors by product ID
	colorMap := make(map[string][]models.ProductColor)
	for _, color := range colors {
		colorMap[color.ProductID] = append(colorMap[color.ProductID], color)
	}

	return colorMap, nil
}
