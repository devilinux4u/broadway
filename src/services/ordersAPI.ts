import { apiCall, getUserAuthToken } from "./api";

export interface Order {
  id: string;
  user_id: string;
  created_at: string;
  total_amount: number;
  status: string;
  payment_method: string;
  payment_status: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  notes?: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  price: number;
  price_npr: number;
  quantity: number;
  color?: string | null;
  created_at: string;
}

export interface GetOrdersResponse {
  success: boolean;
  message: string;
  data: Order[];
}

export interface GetOrderDetailResponse {
  success: boolean;
  message: string;
  order: Order;
  items: OrderItem[];
}

export interface CheckoutItem {
  product_id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  price: number;
}

export interface CheckoutRequest {
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  payment_method: string;
  total_amount: number;
  items: CheckoutItem[];
  notes?: string;
}

export interface CheckoutResponse {
  success: boolean;
  message: string;
  order_id: string;
  total_amount: number;
  payment_status: string;
  payment_url?: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  message: string;
  order_id: string;
  status: string;
  error?: string;
}

/**
 * User Orders API Service
 * Handles order operations: view orders, get order details, checkout
 */
export const ordersAPI = {
  /**
   * Get all user's orders
   */
  getOrders: async (): Promise<GetOrdersResponse> => {
    const token = getUserAuthToken();
    if (!token) {
      throw new Error("User not authenticated");
    }
    return apiCall("/orders", { method: "GET" }, true);
  },

  /**
   * Get order details with items
   */
  getOrderDetail: async (orderId: string): Promise<GetOrderDetailResponse> => {
    const token = getUserAuthToken();
    if (!token) {
      throw new Error("User not authenticated");
    }
    return apiCall(`/orders/${orderId}`, { method: "GET" }, true);
  },

  /**
   * Checkout and create order
   * For COD: order is confirmed immediately
   * For Khalti: returns payment URL for payment
   */
  checkout: async (req: CheckoutRequest): Promise<CheckoutResponse> => {
    const token = getUserAuthToken();
    if (!token) {
      throw new Error("User not authenticated");
    }
    return apiCall("/orders/checkout", {
      method: "POST",
      body: JSON.stringify(req),
    }, true);
  },

  /**
   * Verify Khalti payment (public endpoint, no auth needed)
   */
  verifyPayment: async (
    pidx: string,
    transactionId: string,
    status: string,
    purchaseOrderId: string,
    amount: number
  ): Promise<VerifyPaymentResponse> => {
    const queryParams = new URLSearchParams({
      pidx,
      transaction_id: transactionId,
      status,
      purchase_order_id: purchaseOrderId,
      amount: amount.toString(),
    });

    return apiCall(`/orders/verify-payment?${queryParams}`, {
      method: "GET",
    }, false);
  },
};
