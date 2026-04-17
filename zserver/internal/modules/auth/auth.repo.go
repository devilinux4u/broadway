package auth

import (
	"ecom/go/internal/db"
	"ecom/go/internal/db/models"
	"time"

	"gorm.io/gorm"
)

// AuthRepository handles database operations for user auth
type AuthRepository struct {
	db *gorm.DB
}

// NewAuthRepository creates a new auth repository
func NewAuthRepository() *AuthRepository {
	return &AuthRepository{
		db: db.GetDB(),
	}
}

// FindUserByEmail finds a user by email
func (r *AuthRepository) FindUserByEmail(email string) (*models.User, error) {
	var user models.User
	if err := r.db.Where("email = ? AND role = ?", email, "customer").First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}

// CreateUser creates a new user
func (r *AuthRepository) CreateUser(user *models.User) error {
	return r.db.Create(user).Error
}

// UpdateUserLastLogin updates the user's last login timestamp
func (r *AuthRepository) UpdateUserLastLogin(userID string) error {
	return r.db.Model(&models.User{}).Where("id = ?", userID).Update("updated_at", time.Now()).Error
}

// CheckUserExists checks if a user exists by email
func (r *AuthRepository) CheckUserExists(email string) (bool, error) {
	var count int64
	if err := r.db.Model(&models.User{}).Where("email = ?", email).Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}

// UpdateUserPassword updates a user's password
func (r *AuthRepository) UpdateUserPassword(userID, hashedPassword string) error {
	return r.db.Model(&models.User{}).Where("id = ?", userID).Update("password", hashedPassword).Update("updated_at", time.Now()).Error
}

// GetUserByID gets a user by ID
func (r *AuthRepository) GetUserByID(userID string) (*models.User, error) {
	var user models.User
	if err := r.db.Where("id = ?", userID).First(&user).Error; err != nil {
		return nil, err
	}
	return &user, nil
}
