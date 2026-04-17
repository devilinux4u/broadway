import { apiCall } from "./api";

export const shopAPI = {
  // Get all products
  getAllProducts: async () => {
    return apiCall("/shop/products");
  },

  // Get products by category
  getProductsByCategory: async (category: string) => {
    return apiCall(`/shop/products/category?category=${encodeURIComponent(category)}`);
  },

  // Search products
  searchProducts: async (query: string) => {
    return apiCall(`/shop/products/search?q=${encodeURIComponent(query)}`);
  },

  // Get product by ID
  getProductByID: async (id: string) => {
    return apiCall(`/shop/products/${id}`);
  },
};
