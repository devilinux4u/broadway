package auth

import (
	"crypto/rand"
	"ecom/go/internal/db/models"
	"ecom/go/internal/utils"
	"encoding/hex"
)

// AuthService handles business logic for user authentication
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
func (s *AuthService) Login(email, password string) (string, *UserAuthDTO, int64, error) {
	// Find user by email
	user, err := s.repo.FindUserByEmail(email)
	if err != nil {
		return "", nil, 0, ErrInvalidCredentials
	}

	// Verify password
	if err := utils.VerifyPassword(user.Password, password); err != nil {
		return "", nil, 0, ErrInvalidCredentials
	}

	// Check if user is active
	if !user.IsActive {
		return "", nil, 0, ErrUserInactive
	}

	// Update last login
	s.repo.UpdateUserLastLogin(user.ID)

	// Generate JWT token
	token, expiresAt, err := utils.GenerateToken(user.ID, user.Email, "customer")
	if err != nil {
		return "", nil, 0, err
	}

	userDTO := &UserAuthDTO{
		ID:       user.ID,
		Email:    user.Email,
		IsActive: user.IsActive,
	}

	return token, userDTO, expiresAt.Unix(), nil
}

// Signup creates a new user account
func (s *AuthService) Signup(email, password string) (string, *UserAuthDTO, int64, error) {
	// Check if user already exists
	exists, err := s.repo.CheckUserExists(email)
	if err != nil {
		return "", nil, 0, err
	}
	if exists {
		return "", nil, 0, ErrEmailExists
	}

	// Hash password
	hashedPassword, err := utils.HashPassword(password)
	if err != nil {
		return "", nil, 0, err
	}

	// Create user
	user := &models.User{
		Email:    email,
		Password: hashedPassword,
		Role:     "customer",
		IsActive: true,
	}

	if err := s.repo.CreateUser(user); err != nil {
		return "", nil, 0, err
	}

	// Generate JWT token
	token, expiresAt, err := utils.GenerateToken(user.ID, user.Email, "customer")
	if err != nil {
		return "", nil, 0, err
	}

	userDTO := &UserAuthDTO{
		ID:       user.ID,
		Email:    user.Email,
		IsActive: user.IsActive,
	}

	return token, userDTO, expiresAt.Unix(), nil
}

// ForgotPassword generates a password reset token (in production, this would be sent via email)
func (s *AuthService) ForgotPassword(email string) (string, error) {
	// Check if user exists
	user, err := s.repo.FindUserByEmail(email)
	if err != nil {
		// Don't reveal if email exists or not
		return "", nil
	}

	// Generate reset token
	resetToken := generateResetToken()

	// In production, you would:
	// 1. Store this token in a reset_tokens table with expiration
	// 2. Send the token via email to the user
	// For now, we'll return the token (frontend will handle sending email)

	_ = user // Use user if needed for logging or tracking

	return resetToken, nil
}

// VerifyResetToken verifies if a reset token is valid
func (s *AuthService) VerifyResetToken(token string) (string, error) {
	// In production, this would:
	// 1. Query the reset_tokens table
	// 2. Check if token exists and hasn't expired
	// 3. Return the user ID associated with the token

	// For now, we'll do a basic validation
	if token == "" {
		return "", ErrInvalidToken
	}

	return "", nil
}

// ResetPassword resets a user's password with a valid reset token
func (s *AuthService) ResetPassword(email, newPassword string) error {
	// Find user by email
	user, err := s.repo.FindUserByEmail(email)
	if err != nil {
		return ErrUserNotFound
	}

	// Hash new password
	hashedPassword, err := utils.HashPassword(newPassword)
	if err != nil {
		return err
	}

	// Update password
	if err := s.repo.UpdateUserPassword(user.ID, hashedPassword); err != nil {
		return err
	}

	return nil
}

// VerifyToken verifies and parses a JWT token
func (s *AuthService) VerifyToken(tokenString string) (*utils.AdminClaims, error) {
	return utils.VerifyToken(tokenString)
}

// generateResetToken generates a random reset token
func generateResetToken() string {
	b := make([]byte, 32)
	rand.Read(b)
	return hex.EncodeToString(b)
}
