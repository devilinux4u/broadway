package auth

import (
	"errors"
)

// LoginRequest is the request body for user login
type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

// SignupRequest is the request body for user signup
type SignupRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
}

// LoginResponse is the response for successful login
type LoginResponse struct {
	Token     string      `json:"token"`
	User      UserAuthDTO `json:"user"`
	ExpiresAt int64       `json:"expires_at"`
}

// SignupResponse is the response for successful signup
type SignupResponse struct {
	Token     string      `json:"token"`
	User      UserAuthDTO `json:"user"`
	ExpiresAt int64       `json:"expires_at"`
	Message   string      `json:"message"`
}

// ForgotPasswordRequest is the request body for forgot password
type ForgotPasswordRequest struct {
	Email string `json:"email" binding:"required,email"`
}

// ResetPasswordRequest is the request body for password reset
type ResetPasswordRequest struct {
	Token    string `json:"token" binding:"required"`
	Password string `json:"password" binding:"required,min=6"`
}

// UserAuthDTO is the data transfer object for user auth responses
type UserAuthDTO struct {
	ID       string `json:"id"`
	Email    string `json:"email"`
	IsActive bool   `json:"is_active"`
}

// Custom errors
var (
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrUserInactive       = errors.New("user account is inactive")
	ErrEmailExists        = errors.New("email already exists")
	ErrUserNotFound       = errors.New("user not found")
	ErrInvalidToken       = errors.New("invalid or expired reset token")
)
