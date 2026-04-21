import { X, Plus, Minus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { shopAPI } from "@/services/shopAPI";

const CartDrawer = () => {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, totalPrice, loading } = useCart();
  const navigate = useNavigate();
  const [updating, setUpdating] = useState<string | null>(null);
  const [checkingStock, setCheckingStock] = useState(false);

  const handleQuantityChange = async (itemId: string, newQuantity: number) => {
    setUpdating(itemId);
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (error) {
      console.error("Failed to update quantity:", error);
    } finally {
      setUpdating(null);
    }
  };

  const handleRemove = async (itemId: string) => {
    setUpdating(itemId);
    try {
      await removeFromCart(itemId);
    } catch (error) {
      console.error("Failed to remove item:", error);
    } finally {
      setUpdating(null);
    }
  };

  const getOutOfStockItems = async () => {
    const checks = await Promise.all(
      items.map(async (item) => {
        const response = await shopAPI.getProductByID(item.product_id);
        const product = response?.product;
        if (!response?.success || !product) {
          return item.product_name;
        }

        const inStock = product.in_stock !== false;
        if (!inStock || product.stock_quantity < item.quantity) {
          return item.product_name;
        }

        return null;
      }),
    );

    return checks.filter((name): name is string => Boolean(name));
  };

  const handleCheckout = async () => {
    setCheckingStock(true);
    try {
      const outOfStockItems = await getOutOfStockItems();
      if (outOfStockItems.length > 0) {
        toast({
          title: "Some items are out of stock",
          description: `${outOfStockItems.join(", ")} is currently unavailable. Update your cart before checkout.`,
          variant: "destructive",
        });
        return;
      }

      setIsCartOpen(false);
      navigate("/checkout");
    } catch (error) {
      console.error("Failed to validate stock before checkout:", error);
      toast({
        title: "Unable to verify stock",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setCheckingStock(false);
    }
  };

  if (!isCartOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-foreground/40 z-40 cursor-pointer" onClick={() => setIsCartOpen(false)} />
      <div className="fixed right-0 top-0 bottom-0 max-w-md w-[min(100%,28rem)] bg-background z-50 shadow-2xl flex flex-col animate-slide-in-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-3 sm:p-4 md:p-5 border-b border-border">
          <h2 className="font-display text-base sm:text-lg md:text-xl font-semibold text-foreground">Your Cart</h2>
          <button onClick={() => setIsCartOpen(false)} className="p-1 text-foreground hover:text-primary">
            <X size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-5 space-y-3 sm:space-y-4">
          {loading ? (
            <p className="text-center text-muted-foreground text-sm sm:text-base py-10">Loading cart...</p>
          ) : items.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm sm:text-base py-10">Your cart is empty</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-2 sm:gap-3 md:gap-4 p-2 sm:p-2.5 md:p-3 bg-secondary rounded-sm">
                <img src={item.product_image} alt={item.product_name} className="w-14 sm:w-16 h-14 sm:h-16 object-cover rounded-sm flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-medium text-foreground truncate">{item.product_name}</h4>
                  {item.color && (
                    <p className="text-[10px] sm:text-xs text-muted-foreground">Color: {item.color}</p>
                  )}
                  <p className="text-xs sm:text-sm text-primary font-semibold">Rs. {item.price_npr.toLocaleString()}</p>
                  <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
                    <button 
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      disabled={updating === item.id}
                      className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-50"
                    >
                      <Minus size={12} className="sm:w-3.5 sm:h-3.5" />
                    </button>
                    <span className="text-xs sm:text-sm text-foreground w-5 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      disabled={updating === item.id}
                      className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-50"
                    >
                      <Plus size={12} className="sm:w-3.5 sm:h-3.5" />
                    </button>
                    <button 
                      onClick={() => handleRemove(item.id)}
                      disabled={updating === item.id}
                      className="ml-auto p-0.5 text-muted-foreground hover:text-destructive disabled:opacity-50"
                    >
                      <Trash2 size={12} className="sm:w-3.5 sm:h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-3 sm:p-4 md:p-5 border-t border-border">
            <div className="flex justify-between mb-3 sm:mb-4">
              <span className="font-medium text-foreground text-sm sm:text-base">Total</span>
              <span className="font-semibold text-foreground text-base sm:text-lg md:text-xl">Rs. {totalPrice.toLocaleString()}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={loading || checkingStock}
              className="w-full py-2 sm:py-2.5 md:py-3 bg-primary text-primary-foreground font-medium text-xs sm:text-sm tracking-wide rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {checkingStock ? "Checking stock..." : "Checkout"}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
