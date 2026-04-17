import { apiCall, getUserAuthToken } from "./api";

export interface AddToCartRequest {
  product_id: string;
  product_name: string;
  quantity: number;
  price_npr: number;
  color?: string;
  image_url: string;
}

export interface UpdateCartRequest {
  cart_item_id: string;
  quantity: number;
}

export interface RemoveFromCartRequest {
  cart_item_id: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  price_npr: number;
  quantity: number;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface GetCartResponse {
  success: boolean;
  message: string;
  items: CartItem[];
  total_items: number;
  total_price: number;
}

export interface CheckoutRequest {
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  payment_method: string;
  notes?: string;
}

export interface CheckoutResponse {
  success: boolean;
  message: string;
  order_id: string;
  total_amount: number;
  payment_status: string;
}

/**
 * User Cart API Service
 * Handles cart operations: view, add, update, remove, checkout
 */
export const cartAPI = {
  /**
   * Get user's cart with all items
   */
  getCart: async (): Promise<GetCartResponse> => {
    const token = getUserAuthToken();
    if (!token) {
      throw new Error("User not authenticated");
    }
    return apiCall("/cart", { method: "GET" }, true);
  },

  /**
   * Add item to cart
   */
  addToCart: async (item: AddToCartRequest): Promise<GetCartResponse> => {
    const token = getUserAuthToken();
    if (!token) {
      throw new Error("User not authenticated");
    }
    return apiCall("/cart/add", {
      method: "POST",
      body: JSON.stringify(item),
    }, true);
  },

  /**
   * Update cart item quantity
   */
  updateCartItem: async (req: UpdateCartRequest): Promise<GetCartResponse> => {
    const token = getUserAuthToken();
    if (!token) {
      throw new Error("User not authenticated");
    }
    return apiCall("/cart/update", {
      method: "PUT",
      body: JSON.stringify(req),
    }, true);
  },

  /**
   * Remove item from cart
   */
  removeFromCart: async (req: RemoveFromCartRequest): Promise<GetCartResponse> => {
    const token = getUserAuthToken();
    if (!token) {
      throw new Error("User not authenticated");
    }
    return apiCall("/cart/remove", {
      method: "POST",
      body: JSON.stringify(req),
    }, true);
  },

  /**
   * Clear entire cart
   */
  clearCart: async (): Promise<{ success: boolean; message: string }> => {
    const token = getUserAuthToken();
    if (!token) {
      throw new Error("User not authenticated");
    }
    return apiCall("/cart/clear", {
      method: "POST",
    }, true);
  },

  /**
   * Checkout and create order
   */
  checkout: async (req: CheckoutRequest): Promise<CheckoutResponse> => {
    const token = getUserAuthToken();
    if (!token) {
      throw new Error("User not authenticated");
    }
    return apiCall("/cart/checkout", {
      method: "POST",
      body: JSON.stringify(req),
    }, true);
  },
};
