package utils

import (
	"fmt"
	"math/rand"
	"path/filepath"
	"time"
)

// GenerateFilename generates a unique filename with timestamp and random string
func GenerateFilename(originalFilename string) string {
	ext := filepath.Ext(originalFilename)
	timestamp := time.Now().UnixNano() / 1e6 // milliseconds
	randomString := generateRandomString(8)
	return fmt.Sprintf("%d_%s%s", timestamp, randomString, ext)
}

// generateRandomString generates a random alphanumeric string
func generateRandomString(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	seededRand := rand.New(rand.NewSource(time.Now().UnixNano()))
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[seededRand.Intn(len(charset))]
	}
	return string(b)
}
