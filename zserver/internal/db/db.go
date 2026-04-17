package db

import (
	"ecom/go/internal/db/models"
	"fmt"
	"log"
	"os"
	"regexp"
	"strings"
	"time"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

const (
	maxDBInitRetries = 20
	dbRetryDelay     = 3 * time.Second
)

// InitDB initializes the database connection and runs migrations
func InitDB() error {
	host := getEnv("DB_HOST", "localhost")
	user := getEnv("DB_USER", "postgres")
	password := getEnv("DB_PASSWORD", "postgres")
	dbName := getEnv("DB_NAME", "ecom_db")
	port := getEnv("DB_PORT", "5432")

	var (
		db      *gorm.DB
		err     error
		lastErr error
	)

	for attempt := 1; attempt <= maxDBInitRetries; attempt++ {
		db, err = gorm.Open(postgres.Open(buildDSN(host, user, password, dbName, port)), &gorm.Config{})
		if err == nil {
			DB = db
			log.Println("Database connected successfully")
			break
		}

		lastErr = err
		errMsg := err.Error()
		if strings.Contains(errMsg, "does not exist") && strings.Contains(errMsg, "database") {
			log.Printf("Database %q not found. Attempting to create it...", dbName)
			if createErr := ensureDatabaseExists(host, user, password, port, dbName); createErr != nil {
				lastErr = fmt.Errorf("database missing and auto-create failed: %w", createErr)
				log.Printf("Failed to auto-create database: %v", createErr)
			} else {
				log.Printf("Database %q ensured. Retrying connection...", dbName)
			}
		}

		log.Printf("Database connection attempt %d/%d failed: %v", attempt, maxDBInitRetries, err)
		time.Sleep(dbRetryDelay)
	}

	if DB == nil {
		return fmt.Errorf("failed to connect to database after %d attempts: %w", maxDBInitRetries, lastErr)
	}

	// Run migrations
	if err := Migrate(); err != nil {
		log.Printf("Migration failed: %v", err)
		return err
	}

	return nil
}

// Migrate runs all database migrations
func Migrate() error {
	log.Println("Running database migrations...")

	// Create extensions if not exists
	if err := DB.Exec("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"").Error; err != nil {
		log.Printf("Warning: Could not create uuid extension: %v", err)
	}
	if err := DB.Exec("CREATE EXTENSION IF NOT EXISTS \"pgcrypto\"").Error; err != nil {
		log.Printf("Warning: Could not create pgcrypto extension: %v", err)
	}

	// Auto migrate all models
	if err := DB.AutoMigrate(
		&models.User{},
		&models.Product{},
		&models.ProductImage{},
		&models.ProductColor{},
		&models.StockMovement{},
		&models.Order{},
		&models.OrderItem{},
		&models.SiteContent{},
		&models.Cart{},
		&models.CartItem{},
	); err != nil {
		return err
	}

	// Seed default site content
	if err := seedDefaultContent(); err != nil {
		log.Printf("Warning: Could not seed default content: %v", err)
	}

	log.Println("Migrations completed successfully")
	return nil
}

// seedDefaultContent seeds default site content if it doesn't exist
func seedDefaultContent() error {
	defaultSections := []struct {
		Section string
		Content string
	}{
		{
			Section: "hero",
			Content: `{"tagline":"Your Beauty Destination in Nepal","title":"Unleash Your","title_accent":"Inner Glow","description":"Shop authentic colour cosmetics, skincare & beauty essentials. Delivered across Nepal.","cta_text":"Shop Now","cta2_text":"Explore Categories","image_url":"","video_url":""}`,
		},
		{
			Section: "categories",
			Content: `{"items":[{"name":"Face","description":"Foundations, Blush & Highlight","image_url":""},{"name":"Eyes","description":"Palettes, Mascaras & Liners","image_url":""},{"name":"Lips","description":"Lipsticks, Glosses & Liners","image_url":""},{"name":"Nails","description":"Nail Polish, Gel & Art","image_url":""},{"name":"Tools & Accessories","description":"Brushes, Sponges & More","image_url":""}]}`,
		},
		{
			Section: "about",
			Content: `{"reels":[]}`,
		},
		{
			Section: "newsletter",
			Content: `{"tagline":"Stay Updated","title":"Join Our Beauty Circle","description":"Subscribe to get exclusive deals, new arrivals, and beauty tips delivered straight to your inbox.","button_text":"Subscribe"}`,
		},
		{
			Section: "settings",
			Content: `{"store_name":"W7 Nepal","navbar_tagline":"for the beautiful you","footer_tagline":"for the beautiful you","footer_description":"Your trusted authorized W7 Cosmetics reseller in Nepal","copyright_text":"© 2026 W7 Nepal. All rights reserved.","phone":"+977-9800000000","email":"hello@w7nepal.com","location":"Kathmandu, Nepal","whatsapp_number":"9779800000000","whatsapp_message":"Hi! I have a question about your products.","instagram_url":"https://instagram.com/w7nepal","facebook_url":"https://facebook.com/w7nepal","tiktok_url":"https://tiktok.com/@w7nepal","logo_url":""}`,
		},
	}

	for _, section := range defaultSections {
		var existing models.SiteContent
		if err := DB.Where("section = ?", section.Section).First(&existing).Error; err == nil {
			// Section already exists, skip
			continue
		}

		content := models.SiteContent{
			Section: section.Section,
			Content: []byte(section.Content),
		}
		if err := DB.Create(&content).Error; err != nil {
			log.Printf("Warning: Could not seed section %s: %v", section.Section, err)
		}
	}

	return nil
}

// GetDB returns the database instance
func GetDB() *gorm.DB {
	return DB
}

// getEnv gets an environment variable or returns a default value
func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func buildDSN(host, user, password, dbName, port string) string {
	return fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable",
		host,
		user,
		password,
		dbName,
		port,
	)
}

func ensureDatabaseExists(host, user, password, port, dbName string) error {
	if ok, _ := regexp.MatchString(`^[a-zA-Z0-9_]+$`, dbName); !ok {
		return fmt.Errorf("invalid database name %q", dbName)
	}

	adminDB, err := gorm.Open(postgres.Open(buildDSN(host, user, password, "postgres", port)), &gorm.Config{})
	if err != nil {
		return err
	}

	var exists bool
	if err := adminDB.Raw("SELECT EXISTS (SELECT 1 FROM pg_database WHERE datname = ?)", dbName).Scan(&exists).Error; err != nil {
		return err
	}

	if exists {
		return nil
	}

	return adminDB.Exec(fmt.Sprintf("CREATE DATABASE \"%s\"", dbName)).Error
}
