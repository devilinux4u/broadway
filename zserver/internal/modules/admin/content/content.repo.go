package content

import (
	"ecom/go/internal/db"
	"ecom/go/internal/db/models"
	"encoding/json"
	"errors"

	"gorm.io/gorm"
)

// Repository handles database operations for site content
type Repository struct {
	db *gorm.DB
}

// NewRepository creates a new content repository
func NewRepository() *Repository {
	return &Repository{
		db: db.GetDB(),
	}
}

// GetSectionByName retrieves a content section by name
func (r *Repository) GetSectionByName(section string) (*models.SiteContent, error) {
	db := r.db
	var content models.SiteContent

	result := db.Where("section = ?", section).First(&content)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, result.Error
	}

	return &content, nil
}

// GetAllSections retrieves all content sections
func (r *Repository) GetAllSections() ([]models.SiteContent, error) {
	db := r.db
	var contents []models.SiteContent

	result := db.Order("created_at DESC").Find(&contents)
	if result.Error != nil {
		return nil, result.Error
	}

	return contents, nil
}

// UpdateSection updates or creates a content section
func (r *Repository) UpdateSection(section string, content json.RawMessage) (*models.SiteContent, error) {
	db := r.db

	// First, try to find existing section
	var siteContent models.SiteContent
	result := db.Where("section = ?", section).First(&siteContent)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			// Create new section
			siteContent = models.SiteContent{
				Section: section,
				Content: content,
			}
			result = db.Create(&siteContent)
		} else {
			return nil, result.Error
		}
	} else {
		// Update existing section
		result = db.Model(&siteContent).Update("content", content)
	}

	if result.Error != nil {
		return nil, result.Error
	}

	return &siteContent, nil
}

// DeleteSection deletes a content section by name
func (r *Repository) DeleteSection(section string) error {
	db := r.db

	result := db.Where("section = ?", section).Delete(&models.SiteContent{})
	if result.Error != nil {
		return result.Error
	}

	if result.RowsAffected == 0 {
		return errors.New("section not found")
	}

	return nil
}

// SectionExists checks if a section exists
func (r *Repository) SectionExists(section string) (bool, error) {
	db := r.db
	var count int64

	result := db.Model(&models.SiteContent{}).Where("section = ?", section).Count(&count)
	if result.Error != nil {
		return false, result.Error
	}

	return count > 0, nil
}

// GetAllProducts retrieves all products for featured section
func (r *Repository) GetAllProducts() ([]models.Product, error) {
	db := r.db
	var products []models.Product

	result := db.Order("name").Find(&products)
	if result.Error != nil {
		return nil, result.Error
	}

	return products, nil
}

// UpdateProductFeatured updates the featured status of a product
func (r *Repository) UpdateProductFeatured(productID string, featured bool) (*models.Product, error) {
	db := r.db
	var product models.Product

	result := db.Model(&product).Where("id = ?", productID).Update("featured", featured)
	if result.Error != nil {
		return nil, result.Error
	}

	if result.RowsAffected == 0 {
		return nil, errors.New("product not found")
	}

	// Fetch the updated product
	if err := db.Where("id = ?", productID).First(&product).Error; err != nil {
		return nil, err
	}

	return &product, nil
}

// UpdateProductNewArrival updates the new arrival status of a product
func (r *Repository) UpdateProductNewArrival(productID string, newArrival bool) (*models.Product, error) {
	db := r.db
	var product models.Product

	result := db.Model(&product).Where("id = ?", productID).Update("new_arrival", newArrival)
	if result.Error != nil {
		return nil, result.Error
	}

	if result.RowsAffected == 0 {
		return nil, errors.New("product not found")
	}

	// Fetch the updated product
	if err := db.Where("id = ?", productID).First(&product).Error; err != nil {
		return nil, err
	}

	return &product, nil
}
