package auth

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// AuthController handles HTTP requests for user authentication
type AuthController struct {
	service *AuthService
}

// NewAuthController creates a new auth controller
func NewAuthController(service *AuthService) *AuthController {
	return &AuthController{
		service: service,
	}
}

// Login handles user login request
func (c *AuthController) Login(ctx *gin.Context) {
	var req LoginRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	token, user, expiresAt, err := c.service.Login(req.Email, req.Password)
	if err != nil {
		if err == ErrUserInactive {
			ctx.JSON(http.StatusForbidden, gin.H{"error": "User account is inactive"})
			return
		}
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	ctx.JSON(http.StatusOK, LoginResponse{
		Token:     token,
		User:      *user,
		ExpiresAt: expiresAt,
	})
}

// Signup handles user signup request
func (c *AuthController) Signup(ctx *gin.Context) {
	var req SignupRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	token, user, expiresAt, err := c.service.Signup(req.Email, req.Password)
	if err != nil {
		if err == ErrEmailExists {
			ctx.JSON(http.StatusConflict, gin.H{"error": "Email already exists"})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create account"})
		return
	}

	ctx.JSON(http.StatusCreated, SignupResponse{
		Token:     token,
		User:      *user,
		ExpiresAt: expiresAt,
		Message:   "Account created successfully",
	})
}

// ForgotPassword handles forgot password request
func (c *AuthController) ForgotPassword(ctx *gin.Context) {
	var req ForgotPasswordRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	resetToken, err := c.service.ForgotPassword(req.Email)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process request"})
		return
	}

	// In production, send email with reset token
	// For now, return the token to be used in password reset
	ctx.JSON(http.StatusOK, gin.H{
		"message": "If an account exists, a password reset link has been sent to your email",
		"token":   resetToken, // In production, don't return this in response, send via email instead
	})
}

// ResetPassword handles password reset request
func (c *AuthController) ResetPassword(ctx *gin.Context) {
	var req ResetPasswordRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Verify reset token (in production, extract email from token)
	_, err := c.service.VerifyResetToken(req.Token)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired reset token"})
		return
	}

	// For now, we'll extract email from token (in production, this would be encoded in JWT)
	// Get email from context set by middleware or from token claims
	email, exists := ctx.Get("email")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid reset token"})
		return
	}

	err = c.service.ResetPassword(email.(string), req.Password)
	if err != nil {
		if err == ErrUserNotFound {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to reset password"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "Password reset successfully. You can now sign in with your new password.",
	})
}

// GetProfile returns the current user's profile
func (c *AuthController) GetProfile(ctx *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}

	// This would typically be implemented if you have user profile data
	// For now, return basic user info
	ctx.JSON(http.StatusOK, gin.H{
		"message": "Get profile endpoint",
		"user_id": userID,
	})
}

// Logout handles user logout
func (c *AuthController) Logout(ctx *gin.Context) {
	// Get user from context (set by middleware)
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}

	_ = userID // Use the userID if needed for logging/tracking

	ctx.JSON(http.StatusOK, gin.H{
		"message": "Logged out successfully",
	})
}
