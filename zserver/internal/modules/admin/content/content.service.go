package content

import (
	"ecom/go/internal/db/models"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"
)

// Service handles business logic for site content
type Service struct {
	repo *Repository
}

// NewService creates a new content service
func NewService(repo *Repository) *Service {
	return &Service{
		repo: repo,
	}
}

// GetSection retrieves a content section by name
func (s *Service) GetSection(section string) (*models.SiteContent, error) {
	if section == "" {
		return nil, errors.New("section name is required")
	}

	content, err := s.repo.GetSectionByName(section)
	if err != nil {
		return nil, err
	}

	if content == nil {
		return nil, errors.New("section not found")
	}

	return content, nil
}

// GetAllSections retrieves all content sections
func (s *Service) GetAllSections() ([]models.SiteContent, error) {
	return s.repo.GetAllSections()
}

// UpdateSection updates a content section
func (s *Service) UpdateSection(section string, content json.RawMessage) (*models.SiteContent, error) {
	if section == "" {
		return nil, errors.New("section name is required")
	}

	validSections := map[string]bool{
		"hero":       true,
		"categories": true,
		"about":      true,
		"newsletter": true,
		"classes":    true,
		"settings":   true,
	}

	if !validSections[section] {
		return nil, fmt.Errorf("invalid section: %s", section)
	}

	if len(content) == 0 {
		return nil, errors.New("content cannot be empty")
	}

	// Validate JSON
	var raw json.RawMessage
	if err := json.Unmarshal(content, &raw); err != nil {
		return nil, fmt.Errorf("invalid JSON content: %w", err)
	}

	result, err := s.repo.UpdateSection(section, content)
	if err != nil {
		return nil, fmt.Errorf("failed to update section: %w", err)
	}

	return result, nil
}

// DeleteSection deletes a content section
func (s *Service) DeleteSection(section string) error {
	if section == "" {
		return errors.New("section name is required")
	}

	return s.repo.DeleteSection(section)
}

// HandleImageUpload handles file upload for content media
func (s *Service) HandleImageUpload(file *multipart.FileHeader, path string) (string, error) {
	if file == nil {
		return "", errors.New("file is required")
	}

	// Validate file size (max 50MB)
	if file.Size > 50*1024*1024 {
		return "", errors.New("file size exceeds 50MB limit")
	}

	// Open file
	src, err := file.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open file: %w", err)
	}
	defer src.Close()

	// Validate file type
	allowedTypes := map[string]bool{
		"image/jpeg":               true,
		"image/png":                true,
		"image/webp":               true,
		"image/gif":                true,
		"video/mp4":                true,
		"video/webm":               true,
		"video/ogg":                true,
		"video/quicktime":          true,
		"application/mp4":          true,
		"application/octet-stream": true,
	}

	if !allowedTypes[file.Header.Get("Content-Type")] {
		return "", errors.New("invalid file type. Allowed types: JPEG, PNG, WebP, GIF, MP4, WebM, OGG, MOV")
	}

	// Create uploads directory if it doesn't exist
	uploadsDir := filepath.Join("uploads", path)
	if err := os.MkdirAll(uploadsDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create upload directory: %w", err)
	}

	// Generate unique filename
	ext := filepath.Ext(file.Filename)
	filename := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
	filePath := filepath.Join(uploadsDir, filename)

	// Create file
	dst, err := os.Create(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to create file: %w", err)
	}
	defer dst.Close()

	// Copy file content
	if _, err := io.Copy(dst, src); err != nil {
		return "", fmt.Errorf("failed to copy file: %w", err)
	}

	// Return relative path for database storage (includes uploads prefix)
	return filepath.ToSlash(filePath), nil
}

// ValidateHeroContent validates hero section content
func (s *Service) ValidateHeroContent(data json.RawMessage) error {
	var hero models.HeroContent
	if err := json.Unmarshal(data, &hero); err != nil {
		return fmt.Errorf("invalid hero content format: %w", err)
	}

	if strings.TrimSpace(hero.Tagline) == "" {
		return errors.New("tagline is required")
	}
	if strings.TrimSpace(hero.Title) == "" {
		return errors.New("title is required")
	}

	return nil
}

// ValidateCategoriesContent validates categories section content
func (s *Service) ValidateCategoriesContent(data json.RawMessage) error {
	var categories models.CategoriesContent
	if err := json.Unmarshal(data, &categories); err != nil {
		return fmt.Errorf("invalid categories content format: %w", err)
	}

	if len(categories.Items) == 0 {
		return errors.New("at least one category is required")
	}

	for _, cat := range categories.Items {
		if strings.TrimSpace(cat.Name) == "" {
			return errors.New("category name cannot be empty")
		}
	}

	return nil
}

// ValidateClassesContent validates classes section content
func (s *Service) ValidateClassesContent(data json.RawMessage) error {
	var classes models.ClassesContent
	if err := json.Unmarshal(data, &classes); err != nil {
		return fmt.Errorf("invalid classes content format: %w", err)
	}

	for i, cls := range classes.Items {
		if strings.TrimSpace(cls.Title) == "" {
			return fmt.Errorf("class #%d title is required", i+1)
		}
		if strings.TrimSpace(cls.StartDate) == "" {
			return fmt.Errorf("class #%d start_date is required", i+1)
		}
		if strings.TrimSpace(cls.EndDate) == "" {
			return fmt.Errorf("class #%d end_date is required", i+1)
		}
	}

	return nil
}

// ValidateAboutContent validates about section content
func (s *Service) ValidateAboutContent(data json.RawMessage) error {
	var about models.AboutContent
	if err := json.Unmarshal(data, &about); err != nil {
		return fmt.Errorf("invalid about content format: %w", err)
	}

	for i, reel := range about.Reels {
		if strings.TrimSpace(reel.Title) == "" {
			return fmt.Errorf("reel #%d title is required", i+1)
		}
		if strings.TrimSpace(reel.VideoURL) == "" {
			return fmt.Errorf("reel #%d video_url is required", i+1)
		}
	}

	return nil
}

// ValidateNewsletterContent validates newsletter section content
func (s *Service) ValidateNewsletterContent(data json.RawMessage) error {
	var newsletter models.NewsletterContent
	if err := json.Unmarshal(data, &newsletter); err != nil {
		return fmt.Errorf("invalid newsletter content format: %w", err)
	}

	if strings.TrimSpace(newsletter.Title) == "" {
		return errors.New("title is required")
	}

	return nil
}

// ValidateSettingsContent validates settings content
func (s *Service) ValidateSettingsContent(data json.RawMessage) error {
	var settings models.SettingsContent
	if err := json.Unmarshal(data, &settings); err != nil {
		return fmt.Errorf("invalid settings content format: %w", err)
	}

	if strings.TrimSpace(settings.StoreName) == "" {
		return errors.New("store name is required")
	}

	return nil
}

// ValidateContent validates content based on section type
func (s *Service) ValidateContent(section string, content json.RawMessage) error {
	switch section {
	case "hero":
		return s.ValidateHeroContent(content)
	case "categories":
		return s.ValidateCategoriesContent(content)
	case "about":
		return s.ValidateAboutContent(content)
	case "newsletter":
		return s.ValidateNewsletterContent(content)
	case "classes":
		return s.ValidateClassesContent(content)
	case "settings":
		return s.ValidateSettingsContent(content)
	default:
		return fmt.Errorf("unknown section: %s", section)
	}
}

// GetAllProducts retrieves all products for featured section
func (s *Service) GetAllProducts() ([]ProductResponse, error) {
	products, err := s.repo.GetAllProducts()
	if err != nil {
		return nil, err
	}

	var responses []ProductResponse
	for _, p := range products {
		responses = append(responses, ProductResponse{
			ID:         p.ID,
			Name:       p.Name,
			Featured:   p.Featured,
			NewArrival: p.NewArrival,
			ImageURL:   p.ImageURL,
			PriceNPR:   p.PriceNPR,
		})
	}

	return responses, nil
}

// ToggleFeatured toggles the featured status of a product
func (s *Service) ToggleFeatured(productID string, featured bool) (*ProductResponse, error) {
	if productID == "" {
		return nil, errors.New("product ID is required")
	}

	product, err := s.repo.UpdateProductFeatured(productID, featured)
	if err != nil {
		return nil, err
	}

	return &ProductResponse{
		ID:         product.ID,
		Name:       product.Name,
		Featured:   product.Featured,
		NewArrival: product.NewArrival,
		ImageURL:   product.ImageURL,
		PriceNPR:   product.PriceNPR,
	}, nil
}

// ToggleNewArrival toggles the new arrival status of a product
func (s *Service) ToggleNewArrival(productID string, newArrival bool) (*ProductResponse, error) {
	if productID == "" {
		return nil, errors.New("product ID is required")
	}

	product, err := s.repo.UpdateProductNewArrival(productID, newArrival)
	if err != nil {
		return nil, err
	}

	return &ProductResponse{
		ID:         product.ID,
		Name:       product.Name,
		Featured:   product.Featured,
		NewArrival: product.NewArrival,
		ImageURL:   product.ImageURL,
		PriceNPR:   product.PriceNPR,
	}, nil
}
