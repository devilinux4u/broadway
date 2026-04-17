package models

import (
	"encoding/json"
	"time"
)

// SiteContent represents a site content section
type SiteContent struct {
	ID        string          `gorm:"primaryKey;type:uuid;default:gen_random_uuid()" json:"id"`
	Section   string          `gorm:"type:varchar(100);uniqueIndex;not null" json:"section"`
	Content   json.RawMessage `gorm:"type:jsonb" json:"content"`
	UpdatedAt time.Time       `gorm:"type:timestamptz;autoUpdateTime:milli" json:"updated_at"`
	CreatedAt time.Time       `gorm:"type:timestamptz;autoCreateTime:milli" json:"created_at"`
}

// TableName specifies the table name for the SiteContent model
func (SiteContent) TableName() string {
	return "site_content"
}

// HeroContent represents hero section content
type HeroContent struct {
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

// CategoriesContent represents categories section content
type CategoriesContent struct {
	Items []CategoryItem `json:"items"`
}

// ReelItem represents a reel in the reels/about section
type ReelItem struct {
	Title    string `json:"title"`
	VideoURL string `json:"video_url"`
}

// AboutContent represents reels section content (stored in "about" section)
type AboutContent struct {
	Reels []ReelItem `json:"reels"`
}

// NewsletterContent represents newsletter section content
type NewsletterContent struct {
	Tagline     string `json:"tagline"`
	Title       string `json:"title"`
	Description string `json:"description"`
	ButtonText  string `json:"button_text"`
}

// SettingsContent represents general settings
type SettingsContent struct {
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

// SiteContentDTO is the data transfer object for content responses
type SiteContentDTO struct {
	ID        string          `json:"id"`
	Section   string          `json:"section"`
	Content   json.RawMessage `json:"content"`
	UpdatedAt time.Time       `json:"updated_at"`
	CreatedAt time.Time       `json:"created_at"`
}

// ToDTO converts a SiteContent model to SiteContentDTO
func (sc *SiteContent) ToDTO() SiteContentDTO {
	return SiteContentDTO{
		ID:        sc.ID,
		Section:   sc.Section,
		Content:   sc.Content,
		UpdatedAt: sc.UpdatedAt,
		CreatedAt: sc.CreatedAt,
	}
}
