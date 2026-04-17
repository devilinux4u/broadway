import { X, Plus, Minus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

const CartDrawer = () => {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, totalPrice, loading } = useCart();
  const navigate = useNavigate();
  const [updating, setUpdating] = useState<string | null>(null);

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

  if (!isCartOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-foreground/40 z-40" onClick={() => setIsCartOpen(false)} />
      <div className="fixed right-0 top-0 bottom-0 max-w-md w-[min(100%,28rem)] bg-background z-50 shadow-2xl flex flex-col animate-slide-in-right">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-display text-xl font-semibold text-foreground">Your Cart</h2>
          <button onClick={() => setIsCartOpen(false)} className="p-1 text-foreground hover:text-primary">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading ? (
            <p className="text-center text-muted-foreground py-10">Loading cart...</p>
          ) : items.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">Your cart is empty</p>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-4 p-3 bg-secondary rounded-sm">
                <img src={item.product_image} alt={item.product_name} className="w-16 h-16 object-cover rounded-sm" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground truncate">{item.product_name}</h4>
                  {item.color && (
                    <p className="text-xs text-muted-foreground">Color: {item.color}</p>
                  )}
                  <p className="text-sm text-primary font-semibold">Rs. {item.price_npr.toLocaleString()}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button 
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      disabled={updating === item.id}
                      className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-50"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm text-foreground w-6 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      disabled={updating === item.id}
                      className="p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-50"
                    >
                      <Plus size={14} />
                    </button>
                    <button 
                      onClick={() => handleRemove(item.id)}
                      disabled={updating === item.id}
                      className="ml-auto p-0.5 text-muted-foreground hover:text-destructive disabled:opacity-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-5 border-t border-border">
            <div className="flex justify-between mb-4">
              <span className="font-medium text-foreground">Total</span>
              <span className="font-semibold text-foreground text-lg">Rs. {totalPrice.toLocaleString()}</span>
            </div>
            <button
              onClick={() => { setIsCartOpen(false); navigate("/checkout"); }}
              disabled={loading}
              className="w-full py-3 bg-primary text-primary-foreground font-medium text-sm tracking-wide rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
