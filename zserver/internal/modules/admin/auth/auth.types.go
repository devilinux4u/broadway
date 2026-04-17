package auth

import (
	"ecom/go/internal/db/models"
	"errors"
)

// LoginRequest is the request body for admin login
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

// LoginResponse is the response for successful login
type LoginResponse struct {
	Token     string         `json:"token"`
	User      models.UserDTO `json:"user"`
	ExpiresAt int64          `json:"expires_at"`
}

// Custom errors
var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrUserInactive       = errors.New("user account is inactive")
	ErrEmailExists        = errors.New("email already exists")
	ErrUserNotFound       = errors.New("user not found")
)
