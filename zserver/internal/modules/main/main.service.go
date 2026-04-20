package mainpage

import (
	"encoding/json"
	"errors"
	"sort"
	"time"
)

// Service handles business logic for main page content
type Service struct {
	repo *Repository
}

// NewService creates a new main service
func NewService(repo *Repository) *Service {
	return &Service{
		repo: repo,
	}
}

// filterAndSortClasses returns only ongoing and upcoming classes (no ended)
// Priority: ongoing first, then upcoming
// Max 2 classes total
func filterAndSortClasses(classes ClassesSectionContent) ClassesSectionContent {
	now := time.Now().Truncate(24 * time.Hour)

	type classWithStatus struct {
		item      ClassItem
		isOngoing bool
		startTime time.Time
	}

	var validClasses []classWithStatus

	for _, class := range classes.Items {
		// Parse dates
		startDate, errStart := time.Parse("2006-01-02", class.StartDate)
		endDate, errEnd := time.Parse("2006-01-02", class.EndDate)

		if errStart != nil || errEnd != nil {
			continue // Skip if dates can't be parsed
		}

		// Only include: startDate >= now OR (startDate <= now AND endDate >= now)
		if startDate.After(now) {
			// Upcoming
			validClasses = append(validClasses, classWithStatus{item: class, isOngoing: false, startTime: startDate})
		} else if endDate.After(now) || endDate.Equal(now) {
			// Ongoing (start date is today or past, and end date is today or future)
			validClasses = append(validClasses, classWithStatus{item: class, isOngoing: true, startTime: startDate})
		}
		// Else: ended (startDate is in past AND endDate is in past), skip completely
	}

	// Sort: ongoing first, then upcoming by start date
	sort.Slice(validClasses, func(i, j int) bool {
		if validClasses[i].isOngoing != validClasses[j].isOngoing {
			return validClasses[i].isOngoing // Ongoing (true) comes first
		}
		return validClasses[i].startTime.Before(validClasses[j].startTime)
	})

	// Keep max 2
	result := ClassesSectionContent{Items: []ClassItem{}}
	for i := 0; i < len(validClasses) && i < 2; i++ {
		result.Items = append(result.Items, validClasses[i].item)
	}

	return result
}

// GetPageContent retrieves all content sections for the main/index page
func (s *Service) GetPageContent() (map[string]interface{}, error) {
	contents, err := s.repo.GetAllPageContent()
	if err != nil {
		return nil, err
	}

	if len(contents) == 0 {
		return nil, errors.New("no content sections found")
	}

	// Build response map with all sections
	result := make(map[string]interface{})
	for _, content := range contents {
		var data interface{}

		// Parse JSON based on section type
		switch content.Section {
		case "hero":
			var heroContent HeroSectionContent
			if err := json.Unmarshal(content.Content, &heroContent); err != nil {
				// Return raw content if parsing fails
				result[content.Section] = json.RawMessage(content.Content)
				continue
			}
			result[content.Section] = heroContent
		case "categories":
			var categoriesContent CategoriesSectionContent
			if err := json.Unmarshal(content.Content, &categoriesContent); err != nil {
				result[content.Section] = json.RawMessage(content.Content)
				continue
			}
			result[content.Section] = categoriesContent
		case "about":
			var aboutContent AboutSectionContent
			if err := json.Unmarshal(content.Content, &aboutContent); err != nil {
				result[content.Section] = json.RawMessage(content.Content)
				continue
			}
			result[content.Section] = aboutContent
		case "newsletter":
			var newsletterContent NewsletterSectionContent
			if err := json.Unmarshal(content.Content, &newsletterContent); err != nil {
				result[content.Section] = json.RawMessage(content.Content)
				continue
			}
			result[content.Section] = newsletterContent
		case "classes":
			var classesContent ClassesSectionContent
			if err := json.Unmarshal(content.Content, &classesContent); err != nil {
				result[content.Section] = json.RawMessage(content.Content)
				continue
			}
			// Filter and sort classes: only ongoing and upcoming, max 2, ongoing first
			filteredClasses := filterAndSortClasses(classesContent)
			result[content.Section] = filteredClasses
		case "settings":
			var settingsContent SettingsSectionContent
			if err := json.Unmarshal(content.Content, &settingsContent); err != nil {
				result[content.Section] = json.RawMessage(content.Content)
				continue
			}
			result[content.Section] = settingsContent
		default:
			// Return raw content for unknown sections
			result[content.Section] = data
		}
	}

	return result, nil
}

// GetSectionContent retrieves a specific section's content
func (s *Service) GetSectionContent(section string) (interface{}, error) {
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

	// Parse JSON based on section type
	switch section {
	case "hero":
		var heroContent HeroSectionContent
		if err := json.Unmarshal(content.Content, &heroContent); err != nil {
			return json.RawMessage(content.Content), nil
		}
		return heroContent, nil
	case "categories":
		var categoriesContent CategoriesSectionContent
		if err := json.Unmarshal(content.Content, &categoriesContent); err != nil {
			return json.RawMessage(content.Content), nil
		}
		return categoriesContent, nil
	case "about":
		var aboutContent AboutSectionContent
		if err := json.Unmarshal(content.Content, &aboutContent); err != nil {
			return json.RawMessage(content.Content), nil
		}
		return aboutContent, nil
	case "newsletter":
		var newsletterContent NewsletterSectionContent
		if err := json.Unmarshal(content.Content, &newsletterContent); err != nil {
			return json.RawMessage(content.Content), nil
		}
		return newsletterContent, nil
	case "classes":
		var classesContent ClassesSectionContent
		if err := json.Unmarshal(content.Content, &classesContent); err != nil {
			return json.RawMessage(content.Content), nil
		}
		// Filter and sort classes: only ongoing and upcoming, max 2, ongoing first
		filteredClasses := filterAndSortClasses(classesContent)
		return filteredClasses, nil
	case "settings":
		var settingsContent SettingsSectionContent
		if err := json.Unmarshal(content.Content, &settingsContent); err != nil {
			return json.RawMessage(content.Content), nil
		}
		return settingsContent, nil
	default:
		return json.RawMessage(content.Content), nil
	}
}

// GetFeaturedProducts retrieves all featured products
func (s *Service) GetFeaturedProducts() ([]FeaturedProductDTO, error) {
	products, err := s.repo.GetFeaturedProducts()
	if err != nil {
		return nil, err
	}

	// Convert to DTOs
	result := make([]FeaturedProductDTO, len(products))
	for i, product := range products {
		imageURL := ""
		if product.ImageURL != nil {
			imageURL = *product.ImageURL
		}
		result[i] = FeaturedProductDTO{
			ID:         product.ID,
			Name:       product.Name,
			Price:      product.PriceNPR,
			ImageURL:   imageURL,
			Featured:   product.Featured,
			NewArrival: product.NewArrival,
		}
	}

	return result, nil
}

// GetNewArrivalProducts retrieves all new arrival products
func (s *Service) GetNewArrivalProducts() ([]FeaturedProductDTO, error) {
	products, err := s.repo.GetNewArrivalProducts()
	if err != nil {
		return nil, err
	}

	result := make([]FeaturedProductDTO, len(products))
	for i, product := range products {
		imageURL := ""
		if product.ImageURL != nil {
			imageURL = *product.ImageURL
		}
		result[i] = FeaturedProductDTO{
			ID:         product.ID,
			Name:       product.Name,
			Price:      product.PriceNPR,
			ImageURL:   imageURL,
			Featured:   product.Featured,
			NewArrival: product.NewArrival,
		}
	}

	return result, nil
}

// GetAllClasses retrieves all classes with their schedule information
func (s *Service) GetAllClasses() ([]ClassItem, error) {
	content, err := s.repo.GetSectionByName("classes")
	if err != nil {
		return nil, err
	}

	if content == nil {
		return []ClassItem{}, nil
	}

	var classesContent ClassesSectionContent
	if err := json.Unmarshal(content.Content, &classesContent); err != nil {
		return nil, err
	}

	return classesContent.Items, nil
}
