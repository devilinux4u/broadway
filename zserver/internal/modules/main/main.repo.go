package mainpage

import (
	"ecom/go/internal/db"
	"ecom/go/internal/db/models"
	"errors"

	"gorm.io/gorm"
)

// Repository handles database operations for main page content
type Repository struct {
	db *gorm.DB
}

// NewRepository creates a new main repository
func NewRepository() *Repository {
	return &Repository{
		db: db.GetDB(),
	}
}

// GetAllPageContent retrieves all content sections needed for the main/index page
func (r *Repository) GetAllPageContent() ([]models.SiteContent, error) {
	db := r.db
	var contents []models.SiteContent

	// Get specific sections: hero, categories, about, newsletter, classes, settings
	sections := []string{"hero", "categories", "about", "newsletter", "classes", "settings"}
	result := db.Where("section IN ?", sections).Find(&contents)

	if result.Error != nil {
		return nil, result.Error
	}

	return contents, nil
}

// GetSectionByName retrieves a specific content section by name
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

// GetClassesContent retrieves classes section - this method is called instead of fetching via GetSectionByName
func (r *Repository) GetClassesContent() (*models.SiteContent, error) {
	db := r.db
	var content models.SiteContent

	result := db.Where("section = ?", "classes").First(&content)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, result.Error
	}

	return &content, nil
}

// GetFeaturedProducts retrieves all products marked as featured
func (r *Repository) GetFeaturedProducts() ([]models.Product, error) {
	db := r.db
	var products []models.Product

	result := db.Where("featured = ?", true).Order("created_at DESC").Find(&products)
	if result.Error != nil {
		return nil, result.Error
	}

	return products, nil
}

// GetNewArrivalProducts retrieves all products marked as new arrival
func (r *Repository) GetNewArrivalProducts() ([]models.Product, error) {
	db := r.db
	var products []models.Product

	result := db.Where("new_arrival = ?", true).Order("created_at DESC").Find(&products)
	if result.Error != nil {
		return nil, result.Error
	}

	return products, nil
}
