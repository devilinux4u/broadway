package content

import "encoding/json"

// UpdateSectionRequest represents the request for updating a content section
type UpdateSectionRequest struct {
	Section string          `json:"section" binding:"required,oneof=hero categories about newsletter settings"`
	Content json.RawMessage `json:"content" binding:"required"`
}

// GetSectionResponse represents the response for getting a content section
type GetSectionResponse struct {
	ID        string          `json:"id"`
	Section   string          `json:"section"`
	Content   json.RawMessage `json:"content"`
	UpdatedAt string          `json:"updated_at"`
	CreatedAt string          `json:"created_at"`
}

// AllSectionsResponse represents all content sections
type AllSectionsResponse struct {
	Sections []GetSectionResponse `json:"sections"`
}

// MessageResponse represents a simple message response
type MessageResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

// UploadImageRequest represents the request for uploading media
type UploadImageRequest struct {
	Path string `json:"path" binding:"required"`
}

// UploadImageResponse represents the response from media upload
type UploadImageResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	URL     string `json:"url"`
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Error   string `json:"error,omitempty"`
}

// GetProductsResponse represents products list for featured section
type GetProductsResponse struct {
	Success  bool              `json:"success"`
	Message  string            `json:"message"`
	Products []ProductResponse `json:"products"`
}

// ProductResponse represents a single product in responses
type ProductResponse struct {
	ID         string  `json:"id"`
	Name       string  `json:"name"`
	Featured   bool    `json:"featured"`
	NewArrival bool    `json:"new_arrival"`
	ImageURL   *string `json:"image_url"`
	PriceNPR   float64 `json:"price_npr"`
}

// ToggleFeaturedRequest represents request to toggle featured status
type ToggleFeaturedRequest struct {
	ProductID string `json:"product_id" binding:"required,uuid"`
	Featured  *bool  `json:"featured" binding:"required"`
}

// ToggleNewArrivalRequest represents request to toggle new arrival status
type ToggleNewArrivalRequest struct {
	ProductID  string `json:"product_id" binding:"required,uuid"`
	NewArrival *bool  `json:"new_arrival" binding:"required"`
}

// ToggleFeaturedResponse represents response after toggling featured
type ToggleFeaturedResponse struct {
	Success bool             `json:"success"`
	Message string           `json:"message"`
	Data    *ProductResponse `json:"data,omitempty"`
}
