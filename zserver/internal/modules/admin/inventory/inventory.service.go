package inventory

import (
	"ecom/go/internal/db/models"
	"ecom/go/internal/utils"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
)

// Service handles business logic for inventory
type Service struct {
	repo *Repository
}

// NewService creates a new inventory service
func NewService(repo *Repository) *Service {
	return &Service{
		repo: repo,
	}
}

// CreateProduct creates a new product with validation
func (s *Service) CreateProduct(req *CreateProductRequest) (*models.Product, error) {
	if req == nil {
		return nil, errors.New("request cannot be nil")
	}

	if strings.TrimSpace(req.Name) == "" {
		return nil, errors.New("product name is required")
	}

	if req.PriceNPR <= 0 {
		return nil, errors.New("price must be greater than 0")
	}

	product := &models.Product{
		Name:              req.Name,
		Description:       &req.Description,
		Category:          req.Category,
		PriceNPR:          req.PriceNPR,
		Badge:             &req.Badge,
		InStock:           req.InStock,
		StockQuantity:     req.StockQuantity,
		LowStockThreshold: req.LowStockThreshold,
	}

	if err := s.repo.CreateProduct(product); err != nil {
		return nil, fmt.Errorf("failed to create product: %w", err)
	}

	return product, nil
}

// CreateProductWithImage creates a new product with an optional main image
func (s *Service) CreateProductWithImage(req *CreateProductRequest, imagePath string) (*models.Product, error) {
	if req == nil {
		return nil, errors.New("request cannot be nil")
	}

	if strings.TrimSpace(req.Name) == "" {
		return nil, errors.New("product name is required")
	}

	if req.PriceNPR <= 0 {
		return nil, errors.New("price must be greater than 0")
	}

	var imageURL *string
	if imagePath != "" {
		imageURL = &imagePath
	}

	product := &models.Product{
		Name:              req.Name,
		Description:       &req.Description,
		Category:          req.Category,
		PriceNPR:          req.PriceNPR,
		Badge:             &req.Badge,
		InStock:           req.InStock,
		StockQuantity:     req.StockQuantity,
		LowStockThreshold: req.LowStockThreshold,
		ImageURL:          imageURL,
	}

	if err := s.repo.CreateProduct(product); err != nil {
		return nil, fmt.Errorf("failed to create product: %w", err)
	}

	return product, nil
}

// GetProductByID retrieves a product with all details
func (s *Service) GetProductByID(productID string) (*ProductDetailResponse, error) {
	if strings.TrimSpace(productID) == "" {
		return nil, errors.New("product ID is required")
	}

	product, err := s.repo.GetProductByID(productID)
	if err != nil {
		return nil, err
	}

	images, _ := s.repo.GetProductImages(productID)
	colors, _ := s.repo.GetProductColors(productID)

	return &ProductDetailResponse{
		Product: product.ToDTO(),
		Images:  images,
		Colors:  colors,
	}, nil
}

// GetAllProducts retrieves all products with filtering
func (s *Service) GetAllProducts(filters map[string]interface{}, limit, offset int) ([]models.Product, int64, error) {
	if limit <= 0 {
		limit = 50
	}
	if limit > 500 {
		limit = 500
	}
	if offset < 0 {
		offset = 0
	}

	return s.repo.GetAllProducts(filters, limit, offset)
}

// UpdateProduct updates a product
func (s *Service) UpdateProduct(productID string, req *UpdateProductRequest) (*models.Product, error) {
	if strings.TrimSpace(productID) == "" {
		return nil, errors.New("product ID is required")
	}

	// Verify product exists
	_, err := s.repo.GetProductByID(productID)
	if err != nil {
		return nil, err
	}

	updates := make(map[string]interface{})

	if req.Name != nil && strings.TrimSpace(*req.Name) != "" {
		updates["name"] = *req.Name
	}
	if req.Description != nil {
		updates["description"] = *req.Description
	}
	if req.Category != nil && strings.TrimSpace(*req.Category) != "" {
		updates["category"] = *req.Category
	}
	if req.PriceNPR != nil && *req.PriceNPR > 0 {
		updates["price_npr"] = *req.PriceNPR
	}
	if req.ImageURL != nil && strings.TrimSpace(*req.ImageURL) != "" {
		updates["image_url"] = *req.ImageURL
	}
	if req.Badge != nil {
		updates["badge"] = *req.Badge
	}
	if req.InStock != nil {
		updates["in_stock"] = *req.InStock
	}
	if req.StockQuantity != nil {
		updates["stock_quantity"] = *req.StockQuantity
	}
	if req.LowStockThreshold != nil {
		updates["low_stock_threshold"] = *req.LowStockThreshold
	}

	if len(updates) == 0 {
		return s.repo.GetProductByID(productID)
	}

	return s.repo.UpdateProduct(productID, updates)
}

// DeleteProduct deletes a product
func (s *Service) DeleteProduct(productID string) error {
	if strings.TrimSpace(productID) == "" {
		return errors.New("product ID is required")
	}

	return s.repo.DeleteProduct(productID)
}

// AddStockMovement adds stock in/out
func (s *Service) AddStockMovement(req *StockMovementRequest, userID string) error {
	if req == nil {
		return errors.New("request cannot be nil")
	}

	if req.Quantity <= 0 {
		return errors.New("quantity must be greater than 0")
	}

	if req.Type != "in" && req.Type != "out" {
		return errors.New("type must be 'in' or 'out'")
	}

	// Verify product exists
	product, err := s.repo.GetProductByID(req.ProductID)
	if err != nil {
		return err
	}

	// Check if we have enough stock for 'out' movements
	if req.Type == "out" && req.Quantity > product.StockQuantity {
		return fmt.Errorf("insufficient stock: %d available, %d requested", product.StockQuantity, req.Quantity)
	}

	// Create stock movement record
	movement := &models.StockMovement{
		ProductID: req.ProductID,
		Type:      req.Type,
		Quantity:  req.Quantity,
		Reason:    &req.Reason,
		CreatedBy: userID,
	}

	if err := s.repo.AddStockMovement(movement); err != nil {
		return fmt.Errorf("failed to record stock movement: %w", err)
	}

	// Update product stock quantity
	newQuantity := product.StockQuantity
	if req.Type == "in" {
		newQuantity += req.Quantity
	} else {
		newQuantity -= req.Quantity
	}

	_, err = s.repo.UpdateStockQuantity(req.ProductID, newQuantity)
	if err != nil {
		return fmt.Errorf("failed to update stock quantity: %w", err)
	}

	return nil
}

// GetStockMovements retrieves stock movement history
func (s *Service) GetStockMovements(productID string, limit int) ([]models.StockMovement, error) {
	if limit <= 0 {
		limit = 50
	}
	if limit > 500 {
		limit = 500
	}

	return s.repo.GetStockMovements(productID, limit)
}

// HandleImageUpload handles a single image file upload and returns the path
func (s *Service) HandleImageUpload(file *multipart.FileHeader, purpose string) (string, error) {
	if file == nil {
		return "", errors.New("file is required")
	}

	// Validate file size (10MB limit)
	if file.Size > 10*1024*1024 {
		return "", errors.New("file size exceeds 10MB limit")
	}

	// Validate file type
	validExtensions := map[string]bool{
		".jpg": true, ".jpeg": true, ".png": true, ".webp": true, ".gif": true,
	}
	ext := strings.ToLower(filepath.Ext(file.Filename))
	if !validExtensions[ext] {
		return "", fmt.Errorf("invalid file type: %s (allowed: jpg, jpeg, png, webp, gif)", ext)
	}

	// Create uploads directory if it doesn't exist
	uploadsDir := "uploads"
	if err := os.MkdirAll(uploadsDir, 0755); err != nil {
		return "", fmt.Errorf("failed to create uploads directory: %w", err)
	}

	// Generate unique filename
	filename := utils.GenerateFilename(file.Filename)
	filePath := filepath.Join(uploadsDir, filename)

	// Open source file
	src, err := file.Open()
	if err != nil {
		return "", fmt.Errorf("failed to open file: %w", err)
	}
	defer src.Close()

	// Create destination file
	dst, err := os.Create(filePath)
	if err != nil {
		return "", fmt.Errorf("failed to create file: %w", err)
	}
	defer dst.Close()

	// Copy file content
	if _, err := io.Copy(dst, src); err != nil {
		return "", fmt.Errorf("failed to save file: %w", err)
	}

	return filePath, nil
}

// UploadImages handles file uploads and saves paths in the database
func (s *Service) UploadImages(productID string, files []*multipart.FileHeader) ([]string, error) {
	if strings.TrimSpace(productID) == "" {
		return nil, errors.New("product ID is required")
	}

	if len(files) == 0 {
		return nil, errors.New("no files provided")
	}

	// Create uploads directory if it doesn't exist
	uploadsDir := "uploads"
	if err := os.MkdirAll(uploadsDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create uploads directory: %w", err)
	}

	var savedPaths []string
	var savedImages []*models.ProductImage

	for _, file := range files {
		// Validate file
		if file.Size > 10*1024*1024 { // 10MB limit
			return nil, errors.New("file size exceeds 10MB limit")
		}

		// Validate file type
		validExtensions := map[string]bool{
			".jpg": true, ".jpeg": true, ".png": true, ".webp": true, ".gif": true,
		}
		ext := strings.ToLower(filepath.Ext(file.Filename))
		if !validExtensions[ext] {
			return nil, fmt.Errorf("invalid file type: %s", ext)
		}

		// Generate unique filename
		filename := utils.GenerateFilename(file.Filename)
		filePath := filepath.Join(uploadsDir, filename)

		// Open source file
		src, err := file.Open()
		if err != nil {
			return nil, fmt.Errorf("failed to open file: %w", err)
		}
		defer src.Close()

		// Create destination file
		dst, err := os.Create(filePath)
		if err != nil {
			return nil, fmt.Errorf("failed to create file: %w", err)
		}
		defer dst.Close()

		// Copy file content
		if _, err := io.Copy(dst, src); err != nil {
			return nil, fmt.Errorf("failed to save file: %w", err)
		}

		savedPaths = append(savedPaths, filePath)

		// Create product image record
		productImage := &models.ProductImage{
			ProductID: productID,
			ImageURL:  filePath,
			SortOrder: len(savedImages),
		}
		savedImages = append(savedImages, productImage)
	}

	// Save image records to database
	for _, img := range savedImages {
		if err := s.repo.AddProductImage(img); err != nil {
			// Log error but continue
			fmt.Printf("failed to save image record: %v\n", err)
		}
	}

	return savedPaths, nil
}

// AddProductColors adds color variants to a product
func (s *Service) AddProductColors(productID string, colors []ColorData) error {
	if strings.TrimSpace(productID) == "" {
		return errors.New("product ID is required")
	}

	if len(colors) == 0 {
		return errors.New("no colors provided")
	}

	// Delete existing colors
	if err := s.repo.DeleteProductColors(productID); err != nil {
		return fmt.Errorf("failed to delete existing colors: %w", err)
	}

	// Add new colors
	for i, colorData := range colors {
		color := &models.ProductColor{
			ProductID: productID,
			Name:      colorData.Name,
			Value:     colorData.Value,
			SortOrder: i,
		}
		if err := s.repo.AddProductColor(color); err != nil {
			return fmt.Errorf("failed to add color: %w", err)
		}
	}

	return nil
}

// GetLowStockProducts retrieves products with low stock
func (s *Service) GetLowStockProducts() ([]models.Product, error) {
	return s.repo.GetLowStockProducts(100)
}

// DeleteProductImage deletes a product image by ID
func (s *Service) DeleteProductImage(imageID string) error {
	if strings.TrimSpace(imageID) == "" {
		return errors.New("image ID is required")
	}

	// Get the image to find the file path
	image, err := s.repo.GetProductImageByID(imageID)
	if err != nil {
		return fmt.Errorf("image not found: %w", err)
	}

	// Delete file from disk
	if image != nil && image.ImageURL != "" {
		if err := os.Remove(image.ImageURL); err != nil && !os.IsNotExist(err) {
			// Log error but continue with database deletion
			fmt.Printf("warning: failed to delete image file %s: %v\n", image.ImageURL, err)
		}
	}

	// Delete from database
	return s.repo.DeleteProductImage(imageID)
}

// DeleteProductImageByID deletes a product image and its file from disk
func (s *Service) DeleteProductImageByPath(imagePath string) error {
	if strings.TrimSpace(imagePath) == "" {
		return errors.New("image path is required")
	}

	// Delete file from disk
	if err := os.Remove(imagePath); err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("failed to delete image file: %w", err)
	}

	// Delete from database (if we have a way to query by path)
	// For now, this is a helper function
	return nil
}

// ProductDetailResponse represents the detailed product response
type ProductDetailResponse struct {
	Product models.ProductDTO     `json:"product"`
	Images  []models.ProductImage `json:"images"`
	Colors  []models.ProductColor `json:"colors"`
}
