import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { cartAPI, AddToCartRequest } from "@/services/cartAPI";

export interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  price_npr: number;
  quantity: number;
  color?: string | null;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: { product_id: string; product_name: string; product_image: string; price_npr: number; color?: string }) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadCart();
    } else {
      setItems([]);
    }
  }, [user]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await cartAPI.getCart();
      if (response.success) {
        setItems(response.items as CartItem[]);
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
      // Fall back to localStorage if backend fails
      const savedCart = localStorage.getItem("cart_items");
      if (savedCart) {
        try {
          setItems(JSON.parse(savedCart));
        } catch {
          setItems([]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (item: { product_id: string; product_name: string; product_image: string; price_npr: number; color?: string }) => {
    try {
      setLoading(true);
      const request: AddToCartRequest = {
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: 1,
        price_npr: item.price_npr,
        color: item.color || undefined,
        image_url: item.product_image,
      };

      const response = await cartAPI.addToCart(request);
      if (response.success) {
        setItems(response.items as CartItem[]);
      }
      setIsCartOpen(true);
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      setLoading(true);
      const response = await cartAPI.removeFromCart({ cart_item_id: cartItemId });
      if (response.success) {
        setItems(response.items as CartItem[]);
      }
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    try {
      setLoading(true);
      if (quantity < 1) {
        return removeFromCart(cartItemId);
      }

      const response = await cartAPI.updateCartItem({
        cart_item_id: cartItemId,
        quantity,
      });
      if (response.success) {
        setItems(response.items as CartItem[]);
      }
    } catch (error) {
      console.error("Failed to update cart item:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      await cartAPI.clearCart();
      setItems([]);
    } catch (error) {
      console.error("Failed to clear cart:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price_npr * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice, isCartOpen, setIsCartOpen, loading }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
