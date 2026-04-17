package utils

import (
	"os"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

// AdminClaims is the JWT claims for admin users
type AdminClaims struct {
	UserID string `json:"user_id"`
	Email  string `json:"email"`
	Role   string `json:"role"`
	Admin  bool   `json:"admin"`
	jwt.RegisteredClaims
}

// GenerateToken generates a JWT token with the provided claims
func GenerateToken(userID, email, role string) (string, time.Time, error) {
	expirationTime := time.Now().Add(24 * time.Hour)
	claims := &AdminClaims{
		UserID: userID,
		Email:  email,
		Role:   role,
		Admin:  true,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
	if err != nil {
		return "", time.Time{}, err
	}

	return tokenString, expirationTime, nil
}

// VerifyToken verifies and parses a JWT token
func VerifyToken(tokenString string) (*AdminClaims, error) {
	claims := &AdminClaims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
		return []byte(os.Getenv("JWT_SECRET")), nil
	})

	if err != nil || !token.Valid {
		return nil, err
	}

	return claims, nil
}
