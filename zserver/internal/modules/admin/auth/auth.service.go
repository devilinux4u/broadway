package auth

import (
	"ecom/go/internal/db/models"
	"ecom/go/internal/utils"
)

// AuthService handles business logic for authentication
type AuthService struct {
	repo *AuthRepository
}

// NewAuthService creates a new auth service
func NewAuthService(repo *AuthRepository) *AuthService {
	return &AuthService{
		repo: repo,
	}
}

// Login authenticates a user and returns a token
func (s *AuthService) Login(email, password string) (string, *models.UserDTO, int64, error) {
	// Find admin user by email
	user, err := s.repo.FindAdminUserByEmail(email)
	if err != nil {
		return "", nil, 0, err
	}

	// Verify password
	if err := utils.VerifyPassword(user.Password, password); err != nil {
		return "", nil, 0, err
	}

	// Check if user is active
	if !user.IsActive {
		return "", nil, 0, ErrUserInactive
	}

	// Update last login
	s.repo.UpdateUserLastLogin(user.ID)

	// Generate JWT token
	token, expiresAt, err := utils.GenerateToken(user.ID, user.Email, user.Role)
	if err != nil {
		return "", nil, 0, err
	}

	userDTO := user.ToDTO()
	return token, &userDTO, expiresAt.Unix(), nil
}

// Register creates a new admin user
func (s *AuthService) Register(email, password, role string) (*models.UserDTO, error) {
	// Check if user already exists
	exists, err := s.repo.CheckUserExists(email)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, ErrEmailExists
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		return nil, err
	}

	// Create user
	user := &models.User{
		Email:    email,
		Password: hashedPassword,
		Role:     role,
		IsActive: true,
	}

	if err := s.repo.CreateUser(user); err != nil {
		return nil, err
	}

	userDTO := user.ToDTO()
	return &userDTO, nil
}

// VerifyToken verifies and parses a JWT token
func (s *AuthService) VerifyToken(tokenString string) (*utils.AdminClaims, error) {
	return utils.VerifyToken(tokenString)
}
