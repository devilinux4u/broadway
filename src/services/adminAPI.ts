import { apiCall } from "./api";

// Image URL processor
const getImageUrl = (imagePath: string | null): string | null => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath;
  // Convert relative path to absolute URL
  const serverBase = (import.meta.env.VITE_API_URL || "http://localhost:2000/api/v1").replace("/api/v1", "");
  // Ensure uploads prefix is present
  const normalizedPath = imagePath.startsWith("uploads/") ? imagePath : `uploads/${imagePath}`;
  return `${serverBase}/${normalizedPath}`;
};

// Process content object to convert all image paths to absolute URLs
const processContentImages = (content: any): any => {
  if (!content) return content;
  
  // Parse if it's a string
  let contentObj = typeof content === 'string' ? JSON.parse(content) : content;
  
  // Recursively process any image_url fields in the content
  const processImages = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;
    
    if (Array.isArray(obj)) {
      return obj.map(item => processImages(item));
    }
    
    const processed: any = {};
    for (const key in obj) {
      if (key === 'image_url' || key === 'logo_url' || key === 'video_url') {
        processed[key] = getImageUrl(obj[key]);
      } else if (typeof obj[key] === 'object') {
        processed[key] = processImages(obj[key]);
      } else {
        processed[key] = obj[key];
      }
    }
    return processed;
  };
  
  return processImages(contentObj);
};

// Dashboard API
export const dashboardAPI = {
  getDashboardData: async () => {
    return apiCall("/admin/dashboard");
  },

  getOrderStats: async () => {
    return apiCall("/admin/dashboard/orders");
  },

  getInventoryStats: async () => {
    return apiCall("/admin/dashboard/inventory");
  },

  getRevenueStats: async () => {
    return apiCall("/admin/dashboard/revenue");
  },

  getRecentOrders: async (limit: number = 10) => {
    return apiCall(`/admin/dashboard/orders/recent?limit=${limit}`);
  },

  getLowStockItems: async () => {
    return apiCall("/admin/dashboard/low-stock");
  },
};

// Admin Analytics API
export const analyticsAPI = {
  getFullAnalytics: async (months: number = 12, topProductsLimit: number = 10) => {
    return apiCall(`/admin/analytics?months=${months}&top_products_limit=${topProductsLimit}`);
  },

  getOverview: async () => {
    return apiCall("/admin/analytics/overview");
  },

  getMonthlySales: async (months: number = 12) => {
    return apiCall(`/admin/analytics/monthly-sales?months=${months}`);
  },

  getTopProducts: async (limit: number = 10) => {
    return apiCall(`/admin/analytics/top-products?limit=${limit}`);
  },

  getPaymentIncome: async () => {
    return apiCall("/admin/analytics/payment-income");
  },
};

// Admin Auth API
export const adminAuthAPI = {
  login: async (email: string, password: string) => {
    return apiCall("/admin/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (email: string, password: string, name: string) => {
    return apiCall("/admin/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  },

  logout: async () => {
    return apiCall("/admin/auth/logout", {
      method: "POST",
    });
  },
};

// Admin Content API
export const adminContentAPI = {
  getContent: async (section: string) => {
    return apiCall(`/admin/content/section?section=${section}`);
  },

  getAllContent: async () => {
    const result = await apiCall("/admin/content/sections");
    // Process image URLs in the loaded content
    if (result.sections && Array.isArray(result.sections)) {
      result.sections = result.sections.map((item: any) => ({
        ...item,
        content: processContentImages(item.content),
      }));
      console.log("Content loaded from API:", result.sections);
    }
    return result;
  },

  updateContent: async (section: string, content: any) => {
    return apiCall("/admin/content/section", {
      method: "PUT",
      body: JSON.stringify({ section, content }),
    });
  },

  uploadMedia: async (file: File, path: string = "content") => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("path", path);

    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:2000/api/v1";
    const response = await fetch(`${apiUrl}/admin/content/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Media upload failed");
    }

    const result = await response.json();
    // Backend returns { success, message, url } where url is the relative path like "uploads/content/123.jpg"
    // Return both the relative path (for storage) and the absolute URL (for display)
    return {
      success: result.success,
      data: {
        url: result.url, // Relative path for database storage
        displayUrl: getImageUrl(result.url), // Absolute URL for display
      },
    };
  },

  uploadImage: async (file: File) => {
    return adminContentAPI.uploadMedia(file);
  },

  // Featured Products API
  getProducts: async () => {
    return apiCall("/admin/content/products");
  },

  toggleFeatured: async (productId: string, featured: boolean) => {
    return apiCall("/admin/content/products/featured", {
      method: "PUT",
      body: JSON.stringify({ product_id: productId, featured }),
    });
  },

  toggleNewArrival: async (productId: string, newArrival: boolean) => {
    return apiCall("/admin/content/products/new-arrival", {
      method: "PUT",
      body: JSON.stringify({ product_id: productId, new_arrival: newArrival }),
    });
  },
};

// Admin Inventory API
export const adminInventoryAPI = {
  getAllProducts: async (params?: {
    limit?: number;
    offset?: number;
    category?: string;
    search?: string;
  }) => {
    const queryString = new URLSearchParams();
    if (params?.limit) queryString.append("limit", params.limit.toString());
    if (params?.offset) queryString.append("offset", params.offset.toString());
    if (params?.category) queryString.append("category", params.category);
    if (params?.search) queryString.append("search", params.search);

    return apiCall(
      `/admin/inventory${queryString.toString() ? `?${queryString}` : ""}`
    );
  },

  getProductById: async (id: string) => {
    return apiCall(`/admin/inventory/${id}`);
  },

  createProduct: async (data: any) => {
    return apiCall("/admin/inventory", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateProduct: async (id: string, data: any) => {
    return apiCall(`/admin/inventory/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteProduct: async (id: string) => {
    return apiCall(`/admin/inventory/${id}`, {
      method: "DELETE",
    });
  },

  updateStock: async (id: string, quantity: number) => {
    return apiCall(`/admin/inventory/${id}/stock`, {
      method: "PUT",
      body: JSON.stringify({ stock_quantity: quantity }),
    });
  },

  getLowStockProducts: async () => {
    return apiCall("/admin/inventory/low-stock");
  },
};

// Admin Orders API
export const adminOrdersAPI = {
  getAllOrders: async (params?: {
    limit?: number;
    offset?: number;
    status?: string;
    payment_status?: string;
    city?: string;
  }) => {
    const queryString = new URLSearchParams();
    if (params?.limit) queryString.append("limit", params.limit.toString());
    if (params?.offset) queryString.append("offset", params.offset.toString());
    if (params?.status) queryString.append("status", params.status);
    if (params?.payment_status) queryString.append("payment_status", params.payment_status);
    if (params?.city) queryString.append("city", params.city);

    return apiCall(
      `/admin/orders${queryString.toString() ? `?${queryString}` : ""}`
    );
  },

  getOrderById: async (id: string) => {
    return apiCall(`/admin/orders/${id}`);
  },

  createOrder: async (data: any) => {
    return apiCall("/admin/orders", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateOrder: async (id: string, data: any) => {
    return apiCall(`/admin/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  deleteOrder: async (id: string) => {
    return apiCall(`/admin/orders/${id}`, {
      method: "DELETE",
    });
  },

  updateOrderStatus: async (id: string, status: string) => {
    return apiCall(`/admin/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  },

  updatePaymentStatus: async (id: string, paymentStatus: string) => {
    return apiCall(`/admin/orders/${id}/payment-status`, {
      method: "PUT",
      body: JSON.stringify({ payment_status: paymentStatus }),
    });
  },

  getUserOrders: async (userId: string) => {
    return apiCall(`/admin/orders/user/${userId}`);
  },

  getOrderStats: async () => {
    return apiCall("/admin/orders/stats/overview");
  },

  searchOrders: async (query: string) => {
    return apiCall(`/admin/orders/search?q=${encodeURIComponent(query)}`);
  },
};
