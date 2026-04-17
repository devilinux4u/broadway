package auth

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

// AuthController handles HTTP requests for authentication
type AuthController struct {
	service *AuthService
}

// NewAuthController creates a new auth controller
func NewAuthController(service *AuthService) *AuthController {
	return &AuthController{
		service: service,
	}
}

// Login handles admin login request
func (c *AuthController) Login(ctx *gin.Context) {
	var req LoginRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	token, user, expiresAt, err := c.service.Login(req.Email, req.Password)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	ctx.JSON(http.StatusOK, LoginResponse{
		Token:     token,
		User:      *user,
		ExpiresAt: expiresAt,
	})
}

// Register handles admin registration
func (c *AuthController) Register(ctx *gin.Context) {
	var req struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=6"`
		Role     string `json:"role" binding:"required"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	user, err := c.service.Register(req.Email, req.Password, req.Role)
	if err != nil {
		if err == ErrEmailExists {
			ctx.JSON(http.StatusConflict, gin.H{"error": "Email already exists"})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to register user"})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"message": "Admin user created successfully",
		"user":    user,
	})
}

// Logout handles admin logout
func (c *AuthController) Logout(ctx *gin.Context) {
	// Get user from context (set by middleware)
	userID, exists := ctx.Get("user_id")
	if !exists {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "Not authenticated"})
		return
	}

	_ = userID // Use the userID if needed for logging/tracking

	ctx.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}
