/**
 * Utility functions for handling image URLs
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:2000/api/v1";

/**
 * Convert a relative image path to a full URL
 * @param imagePath - Image path from database (e.g., "content/1774619760304058707.png" or "/uploads/content/...")
 * @returns Full URL to the image
 */
export const getImageUrl = (imagePath: string | undefined | null): string | undefined => {
  if (!imagePath) return undefined;

  // If it's already a full URL (http/https), return as is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // If it's a relative path, construct the full URL
  // Remove leading slashes
  const cleanPath = imagePath.replace(/^\/+/, "");

  // If path doesn't start with 'uploads', prepend it
  const finalPath = cleanPath.startsWith("uploads") ? cleanPath : `uploads/${cleanPath}`;

  // Get the base URL from API_BASE_URL
  const baseUrl = API_BASE_URL.replace("/api/v1", "");

  return `${baseUrl}/${finalPath}`;
};

/**
 * Validate if image URL is valid and can be loaded
 * @param imagePath - Image path to validate
 * @returns true if valid, false otherwise
 */
export const isValidImageUrl = (imagePath: string | undefined | null): boolean => {
  if (!imagePath) return false;
  const url = getImageUrl(imagePath);
  return !!url && (url.startsWith("http://") || url.startsWith("https://"));
};
