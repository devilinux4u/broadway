import { apiCall } from "./api";

const INVENTORY_BASE = "/admin/inventory";
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:2000/api/v1";
// Extract the server base URL (without /api/v1) for static file serving
const SERVER_BASE = API_BASE.replace("/api/v1", "");

// Utility function to convert relative image paths to absolute URLs
const getImageUrl = (imagePath: string | null): string | null => {
  if (!imagePath) return null;
  if (imagePath.startsWith("http")) return imagePath; // Already absolute
  // Ensure uploads prefix is present
  const normalizedPath = imagePath.startsWith("uploads/") ? imagePath : `uploads/${imagePath}`;
  return `${SERVER_BASE}/${normalizedPath}`; // Convert relative to absolute using server base
};

// Process product DTO to fix image URLs
const processProductDTO = (product: ProductDTO): ProductDTO => {
  return {
    ...product,
    image_url: getImageUrl(product.image_url),
  };
};

// Process product images to fix their URLs
const processProductImages = (images: any[]): any[] => {
  return images.map(img => ({
    ...img,
    image_url: getImageUrl(img.image_url),
  }));
};

// ==================== PRODUCTS ====================

export interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price_npr: number;
  image_url: string | null;
  badge: string | null;
  in_stock: boolean;
  stock_quantity: number;
  low_stock_threshold: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProductDTO {
  id: string;
  name: string;
  description?: string;
  category: string;
  price_npr: number;
  image_url?: string;
  badge?: string;
  in_stock: boolean;
  stock_quantity: number;
  low_stock_threshold: number;
  created_at?: string;
  updated_at?: string;
  images?: { id: string; image_url: string }[];
  colors?: { name: string; value: string }[];
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  category: string;
  price_npr: number;
  badge?: string;
  in_stock: boolean;
  stock_quantity: number;
  low_stock_threshold: number;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  category?: string;
  price_npr?: number;
  image_url?: string;
  badge?: string;
  in_stock?: boolean;
  stock_quantity?: number;
  low_stock_threshold?: number;
}

// Create product
export const createProduct = async (
  productData: CreateProductRequest,
  imageFile?: File
): Promise<ProductDTO> => {
  console.log("createProduct called with:", { productData, imageFile, hasFile: !!imageFile });
  const formData = new FormData();
  formData.append("name", productData.name);
  formData.append("category", productData.category);
  formData.append("price_npr", productData.price_npr.toString());
  formData.append("in_stock", productData.in_stock.toString());
  formData.append("stock_quantity", productData.stock_quantity.toString());
  formData.append(
    "low_stock_threshold",
    productData.low_stock_threshold.toString()
  );

  if (productData.description) {
    formData.append("description", productData.description);
  }
  if (productData.badge) {
    formData.append("badge", productData.badge);
  }
  if (imageFile) {
    console.log("Appending image file to FormData:", imageFile.name, imageFile.type, imageFile.size);
    formData.append("image", imageFile);
  }

  const token = localStorage.getItem("adminToken");
  const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:2000/api/v1"}${INVENTORY_BASE}/products`, {
    method: "POST",
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: response.statusText,
    }));
    throw new Error(error.error || `Failed to create product`);
  }

  const result = await response.json();
  console.log("createProduct response:", result);
  return result.data;
};

// Get all products
export const getAllProducts = async (
  filters?: {
    category?: string;
    in_stock?: boolean;
    limit?: number;
    offset?: number;
  }
): Promise<{ data: ProductDTO[]; total: number; limit: number; offset: number }> => {
  const params = new URLSearchParams();

  if (filters?.category) params.append("category", filters.category);
  if (filters?.in_stock !== undefined)
    params.append("in_stock", filters.in_stock.toString());
  if (filters?.limit) params.append("limit", filters.limit.toString());
  if (filters?.offset) params.append("offset", filters.offset.toString());

  const queryString = params.toString();
  const endpoint = `${INVENTORY_BASE}/products${queryString ? `?${queryString}` : ""}`;

  const result = await apiCall(endpoint);
  // Process image URLs in returned products
  if (result.data && Array.isArray(result.data)) {
    result.data = result.data.map(processProductDTO);
  }
  return result;
};

// Get product by ID
export const getProductByID = async (productID: string): Promise<ProductDTO> => {
  const result = await apiCall(`${INVENTORY_BASE}/products/${productID}`);
  const product = result.data;
  
  // Process images if they exist
  if (product.images && Array.isArray(product.images)) {
    product.images = processProductImages(product.images);
  }
  
  // Process main image URL
  return processProductDTO(product);
};

// Update product
export const updateProduct = async (
  productID: string,
  updateData: UpdateProductRequest,
  imageFile?: File
): Promise<ProductDTO> => {
  console.log("updateProduct called with:", { productID, updateData, imageFile, hasFile: !!imageFile });
  
  // If there's a new image file, upload it first
  if (imageFile) {
    try {
      console.log("Uploading new image for product:", productID);
      const files = new DataTransfer();
      files.items.add(imageFile);
      const imagePaths = await uploadProductImages(productID, files.files);
      
      if (imagePaths && imagePaths.length > 0) {
        // Update the product with the new image URL as the main image
        console.log("Setting product image_url to:", imagePaths[0]);
        updateData.image_url = imagePaths[0];
      }
    } catch (err) {
      console.error('Failed to upload product image:', err);
      // Continue with the update even if image upload failed
    }
  }
  
  // Update the product data with the (possibly updated) image_url
  const result = await apiCall(`${INVENTORY_BASE}/products/${productID}`, {
    method: "PUT",
    body: JSON.stringify(updateData),
  });
  
  return result.data;
};

// Delete product
export const deleteProduct = async (productID: string): Promise<void> => {
  await apiCall(`${INVENTORY_BASE}/products/${productID}`, {
    method: "DELETE",
  });
};

// ==================== STOCK MOVEMENTS ====================

export interface StockMovement {
  id: string;
  product_id: string;
  type: "in" | "out";
  quantity: number;
  reason?: string;
  created_by?: string;
  created_at: string;
}

export interface StockMovementRequest {
  product_id: string;
  type: "in" | "out";
  quantity: number;
  reason?: string;
}

// Add stock movement
export const addStockMovement = async (
  movementData: StockMovementRequest
): Promise<void> => {
  await apiCall(`${INVENTORY_BASE}/stock-movements`, {
    method: "POST",
    body: JSON.stringify(movementData),
  });
};

// Get stock movements
export const getStockMovements = async (
  productID: string,
  limit: number = 50
): Promise<{ success: boolean; data: StockMovement[] }> => {
  // Return empty if no product_id provided (backend requires product_id)
  if (!productID || productID.trim() === "") {
    return { success: true, data: [] };
  }

  const params = new URLSearchParams();
  params.append("product_id", productID);
  params.append("limit", limit.toString());

  const result = await apiCall(
    `${INVENTORY_BASE}/stock-movements?${params.toString()}`
  );
  return result;
};

// ==================== IMAGES ====================

export interface UploadImagesResponse {
  success: boolean;
  message: string;
  data?: {
    paths: string[];
  };
}

// Upload product images
export const uploadProductImages = async (
  productID: string,
  files: FileList
): Promise<string[]> => {
  const formData = new FormData();

  for (let i = 0; i < files.length; i++) {
    formData.append("images", files[i]);
  }

  const token = localStorage.getItem("adminToken");
  const response = await fetch(
    `${import.meta.env.VITE_API_URL || "http://localhost:2000/api/v1"}${INVENTORY_BASE}/products/${productID}/images`,
    {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      error: response.statusText,
    }));
    throw new Error(error.error || `Failed to upload images`);
  }

  const result: UploadImagesResponse = await response.json();
  return result.data?.paths || [];
};

// Delete product image
export const deleteProductImage = async (imageID: string): Promise<void> => {
  console.log("deleteProductImage called with ID:", imageID);
  if (!imageID || imageID.trim() === "") {
    throw new Error("Image ID is required and cannot be empty");
  }
  await apiCall(`${INVENTORY_BASE}/images/${imageID}`, {
    method: "DELETE",
  });
};

// ==================== COLORS ====================

export interface ColorData {
  name: string;
  value: string;
}

export interface ProductColorRequest {
  colors: ColorData[];
}

// Add product colors
export const addProductColors = async (
  productID: string,
  colors: ColorData[]
): Promise<void> => {
  await apiCall(`${INVENTORY_BASE}/products/${productID}/colors`, {
    method: "POST",
    body: JSON.stringify({ colors }),
  });
};

// ==================== LOW STOCK ====================

// Get low stock products
export const getLowStockProducts = async (): Promise<{
  success: boolean;
  data: ProductDTO[];
}> => {
  const result = await apiCall(`${INVENTORY_BASE}/low-stock`);
  return result;
};
