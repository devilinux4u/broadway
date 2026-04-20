package mainpage

import "encoding/json"

// GetPageContentResponse represents the response for getting all page content sections
type GetPageContentResponse struct {
	Success          bool                   `json:"success"`
	Message          string                 `json:"message"`
	Sections         map[string]interface{} `json:"sections"`
	FeaturedProducts []FeaturedProductDTO   `json:"featured_products"`
	NewArrivals      []FeaturedProductDTO   `json:"new_arrivals"`
}

// FeaturedProductDTO represents a product in the featured section
type FeaturedProductDTO struct {
	ID         string  `json:"id"`
	Name       string  `json:"name"`
	Price      float64 `json:"price"`
	ImageURL   string  `json:"image_url,omitempty"`
	Featured   bool    `json:"featured"`
	NewArrival bool    `json:"new_arrival"`
}

// PageContentDTO represents a single page content section
type PageContentDTO struct {
	Section string          `json:"section"`
	Content json.RawMessage `json:"content"`
}

// HeroSectionContent represents hero section content
type HeroSectionContent struct {
	Tagline     string `json:"tagline"`
	Title       string `json:"title"`
	TitleAccent string `json:"title_accent"`
	Description string `json:"description"`
	CTAText     string `json:"cta_text"`
	CTA2Text    string `json:"cta2_text"`
	ImageURL    string `json:"image_url,omitempty"`
	VideoURL    string `json:"video_url,omitempty"`
}

// CategoryItem represents a single category
type CategoryItem struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	ImageURL    string `json:"image_url,omitempty"`
}

// CategoriesSectionContent represents categories section content
type CategoriesSectionContent struct {
	Items []CategoryItem `json:"items"`
}

// ReelItem represents a reel card in the reels/about section
type ReelItem struct {
	Title    string `json:"title"`
	VideoURL string `json:"video_url"`
}

// ClassItem represents a single class
type ClassItem struct {
	Title     string `json:"title"`
	StartDate string `json:"start_date"`
	EndDate   string `json:"end_date"`
	StartTime string `json:"start_time"`
	EndTime   string `json:"end_time"`
	Color     string `json:"color,omitempty"`
}

// ClassesSectionContent represents classes section content
type ClassesSectionContent struct {
	Items []ClassItem `json:"items"`
}

// AboutSectionContent represents reels section content (stored in "about")
type AboutSectionContent struct {
	Reels []ReelItem `json:"reels"`
}

// NewsletterSectionContent represents newsletter section content
type NewsletterSectionContent struct {
	Tagline     string `json:"tagline"`
	Title       string `json:"title"`
	Description string `json:"description"`
	ButtonText  string `json:"button_text"`
}

// SettingsSectionContent represents general settings
type SettingsSectionContent struct {
	LogoURL           string `json:"logo_url,omitempty"`
	NavbarTagline     string `json:"navbar_tagline"`
	StoreName         string `json:"store_name"`
	FooterTagline     string `json:"footer_tagline"`
	FooterDescription string `json:"footer_description"`
	CopyrightText     string `json:"copyright_text"`
	Phone             string `json:"phone"`
	Email             string `json:"email"`
	Location          string `json:"location"`
	WhatsAppNumber    string `json:"whatsapp_number"`
	WhatsAppMessage   string `json:"whatsapp_message"`
	InstagramURL      string `json:"instagram_url,omitempty"`
	FacebookURL       string `json:"facebook_url,omitempty"`
	TikTokURL         string `json:"tiktok_url,omitempty"`
}

// ErrorResponse represents an error response
type ErrorResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Error   string `json:"error,omitempty"`
}
