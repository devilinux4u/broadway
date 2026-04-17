package shop

// Service handles business logic for shop
type Service struct {
	repo *Repository
}

// NewService creates a new shop service
func NewService(repo *Repository) *Service {
	return &Service{
		repo: repo,
	}
}

// GetAllProducts retrieves all products with images and colors
func (s *Service) GetAllProducts() (*GetProductsResponse, error) {
	products, err := s.repo.GetAllProducts()
	if err != nil {
		return nil, err
	}

	// Get product IDs
	var productIDs []string
	for _, p := range products {
		productIDs = append(productIDs, p.ID)
	}

	// Get images and colors for all products
	imageMap := make(map[string][]string)
	colorMap := make(map[string][]ColorDTO)

	if len(productIDs) > 0 {
		images, err := s.repo.GetProductsImages(productIDs)
		if err == nil {
			for productID, imgs := range images {
				for _, img := range imgs {
					imageMap[productID] = append(imageMap[productID], img.ImageURL)
				}
			}
		}

		colors, err := s.repo.GetProductsColors(productIDs)
		if err == nil {
			for productID, cols := range colors {
				for _, col := range cols {
					colorMap[productID] = append(colorMap[productID], ColorDTO{
						Name:  col.Name,
						Value: col.Value,
					})
				}
			}
		}
	}

	// Convert to DTOs
	productDTOs := make([]ProductDTO, len(products))
	for i, p := range products {
		productDTOs[i] = ProductDTO{
			ID:          p.ID,
			Name:        p.Name,
			Description: p.Description,
			Category:    p.Category,
			PriceNPR:    p.PriceNPR,
			ImageURL:    p.ImageURL,
			Badge:       p.Badge,
			InStock:     p.InStock,
			CreatedAt:   p.CreatedAt.String(),
		}
	}

	return &GetProductsResponse{
		Success:  true,
		Message:  "Products retrieved successfully",
		Products: productDTOs,
		Images:   imageMap,
		Colors:   colorMap,
	}, nil
}

// GetProductsByCategory retrieves products for a specific category
func (s *Service) GetProductsByCategory(category string) (*GetProductsResponse, error) {
	products, err := s.repo.GetProductsByCategory(category)
	if err != nil {
		return nil, err
	}

	// Get product IDs
	var productIDs []string
	for _, p := range products {
		productIDs = append(productIDs, p.ID)
	}

	// Get images and colors for all products
	imageMap := make(map[string][]string)
	colorMap := make(map[string][]ColorDTO)

	if len(productIDs) > 0 {
		images, err := s.repo.GetProductsImages(productIDs)
		if err == nil {
			for productID, imgs := range images {
				for _, img := range imgs {
					imageMap[productID] = append(imageMap[productID], img.ImageURL)
				}
			}
		}

		colors, err := s.repo.GetProductsColors(productIDs)
		if err == nil {
			for productID, cols := range colors {
				for _, col := range cols {
					colorMap[productID] = append(colorMap[productID], ColorDTO{
						Name:  col.Name,
						Value: col.Value,
					})
				}
			}
		}
	}

	// Convert to DTOs
	productDTOs := make([]ProductDTO, len(products))
	for i, p := range products {
		productDTOs[i] = ProductDTO{
			ID:          p.ID,
			Name:        p.Name,
			Description: p.Description,
			Category:    p.Category,
			PriceNPR:    p.PriceNPR,
			ImageURL:    p.ImageURL,
			Badge:       p.Badge,
			InStock:     p.InStock,
			CreatedAt:   p.CreatedAt.String(),
		}
	}

	return &GetProductsResponse{
		Success:  true,
		Message:  "Products retrieved successfully",
		Products: productDTOs,
		Images:   imageMap,
		Colors:   colorMap,
	}, nil
}

// SearchProducts searches for products
func (s *Service) SearchProducts(query string) (*SearchProductsResponse, error) {
	products, err := s.repo.SearchProducts(query)
	if err != nil {
		return nil, err
	}

	// Convert to DTOs
	productDTOs := make([]ProductDTO, len(products))
	for i, p := range products {
		productDTOs[i] = ProductDTO{
			ID:          p.ID,
			Name:        p.Name,
			Description: p.Description,
			Category:    p.Category,
			PriceNPR:    p.PriceNPR,
			ImageURL:    p.ImageURL,
			Badge:       p.Badge,
			InStock:     p.InStock,
			CreatedAt:   p.CreatedAt.String(),
		}
	}

	return &SearchProductsResponse{
		Success:  true,
		Message:  "Search completed successfully",
		Products: productDTOs,
		Total:    int64(len(products)),
	}, nil
}

// GetProductByID retrieves a single product with images and colors
func (s *Service) GetProductByID(id string) (*GetProductByIDResponse, error) {
	product, err := s.repo.GetProductByID(id)
	if err != nil {
		return nil, err
	}

	if product == nil {
		return nil, nil
	}

	// Get images
	var images []string
	productImages, err := s.repo.GetProductImages(id)
	if err == nil {
		for _, img := range productImages {
			images = append(images, img.ImageURL)
		}
	}

	// Get colors
	var colors []ColorDTO
	productColors, err := s.repo.GetProductColors(id)
	if err == nil {
		for _, col := range productColors {
			colors = append(colors, ColorDTO{
				Name:  col.Name,
				Value: col.Value,
			})
		}
	}

	productDTO := ProductDTO{
		ID:          product.ID,
		Name:        product.Name,
		Description: product.Description,
		Category:    product.Category,
		PriceNPR:    product.PriceNPR,
		ImageURL:    product.ImageURL,
		Badge:       product.Badge,
		InStock:     product.InStock,
		CreatedAt:   product.CreatedAt.String(),
	}

	return &GetProductByIDResponse{
		Success: true,
		Message: "Product retrieved successfully",
		Product: productDTO,
		Images:  images,
		Colors:  colors,
	}, nil
}
