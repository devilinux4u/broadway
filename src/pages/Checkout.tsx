import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { ordersAPI } from "@/services/ordersAPI";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ArrowLeft, Smartphone, QrCode, Truck, CheckCircle2 } from "lucide-react";

const paymentMethods = [
  { id: "khalti", name: "Khalti", icon: Smartphone, description: "Pay via Khalti digital wallet", color: "bg-purple-500" },
  { id: "cod", name: "Cash on Delivery", icon: Truck, description: "Pay when you receive", color: "bg-accent" },
  { id: "qr", name: "Merchant QR", icon: QrCode, description: "Scan & pay via bank app", color: "bg-primary" },
];

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { settings } = useSiteSettings();
  const navigate = useNavigate();
  const [selectedPayment, setSelectedPayment] = useState("");
  const [shipping, setShipping] = useState({ name: "", phone: "", address: "", city: "", notes: "" });
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderId, setOrderId] = useState("");

  if (!user) {
    navigate("/auth");
    return null;
  }

  const vatRate = 0.13;
  const vatAmount = Math.round(totalPrice * vatRate);
  const grandTotal = totalPrice + vatAmount;

  const handlePlaceOrder = async () => {
    if (!selectedPayment) { 
      toast({ title: "Select payment method" }); 
      return; 
    }
    if (!shipping.name || !shipping.phone || !shipping.address || !shipping.city) {
      toast({ title: "Fill all shipping details" }); 
      return;
    }

    setLoading(true);
    try {
      // Convert cart items to checkout items
      const checkoutItems = items.map(item => ({
        product_id: item.id,
        product_name: item.product_name,
        product_image: item.product_image,
        quantity: item.quantity,
        price: item.price_npr,
      }));

      const response = await ordersAPI.checkout({
        shipping_name: shipping.name,
        shipping_phone: shipping.phone,
        shipping_address: shipping.address,
        shipping_city: shipping.city,
        payment_method: selectedPayment,
        total_amount: grandTotal,
        items: checkoutItems,
        notes: shipping.notes || undefined,
      });

      if (response.success) {
        setOrderId(response.order_id);
        
        // Clear cart after successful order
        try {
          await clearCart();
        } catch (err) {
          console.error("Failed to clear cart:", err);
        }
        
        // If Khalti, redirect to payment URL
        if (selectedPayment === "khalti" && response.payment_url) {
          toast({ title: "Redirecting to payment..." });
          window.location.href = response.payment_url;
        } else {
          setOrderPlaced(true);
          toast({ title: "Order placed!", description: "Thank you for your purchase!" });
        }
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar settings={settings} />
        <main className="pt-24 pb-20">
          <div className="container mx-auto px-4 max-w-lg text-center py-20">
            <CheckCircle2 className="w-20 h-20 text-primary mx-auto mb-6" />
            <h1 className="font-display text-3xl font-bold text-foreground mb-3">Order Placed!</h1>
            <p className="text-muted-foreground mb-2">Thank you for your purchase.</p>
            <p className="text-sm text-muted-foreground mb-8">Order ID: <span className="font-semibold text-foreground">{orderId}</span></p>
            <button onClick={() => navigate("/")} className="px-8 py-3 bg-primary text-primary-foreground rounded-sm font-medium text-sm tracking-wide hover:bg-primary/90 transition-colors">
              Continue Shopping
            </button>
          </div>
        </main>
        <Footer settings={settings} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar settings={settings} />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft size={16} /> Back
          </button>

          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8">Checkout</h1>

          <div className="grid md:grid-cols-5 gap-8">
            <div className="md:col-span-3 space-y-8">
              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">Shipping Details</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input placeholder="Full Name *" value={shipping.name} onChange={(e) => setShipping({ ...shipping, name: e.target.value })} className="w-full px-4 py-3 border border-input rounded-sm bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  <input placeholder="Phone Number *" value={shipping.phone} onChange={(e) => setShipping({ ...shipping, phone: e.target.value })} className="w-full px-4 py-3 border border-input rounded-sm bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  <input placeholder="Address *" value={shipping.address} onChange={(e) => setShipping({ ...shipping, address: e.target.value })} className="col-span-full w-full px-4 py-3 border border-input rounded-sm bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  <input placeholder="City *" value={shipping.city} onChange={(e) => setShipping({ ...shipping, city: e.target.value })} className="w-full px-4 py-3 border border-input rounded-sm bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  <input placeholder="Notes (optional)" value={shipping.notes} onChange={(e) => setShipping({ ...shipping, notes: e.target.value })} className="w-full px-4 py-3 border border-input rounded-sm bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>

              <div>
                <h2 className="font-display text-xl font-semibold text-foreground mb-4">Payment Method</h2>
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setSelectedPayment(method.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-sm border transition-all ${
                        selectedPayment === method.id
                          ? "border-primary bg-secondary ring-2 ring-primary/20"
                          : "border-input hover:border-primary/50"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full ${method.color} flex items-center justify-center`}>
                        <method.icon size={18} className="text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium text-foreground">{method.name}</p>
                        <p className="text-xs text-muted-foreground">{method.description}</p>
                      </div>
                      {selectedPayment === method.id && (
                        <CheckCircle2 size={20} className="ml-auto text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="bg-secondary rounded-sm p-6 sticky top-24">
                <h2 className="font-display text-lg font-semibold text-foreground mb-4">Order Summary</h2>
                <div className="space-y-3 mb-4">
                  {items.map((item, idx) => (
                    <div key={`${item.product_name}-${item.color || ""}-${idx}`} className="flex justify-between text-sm">
                      <span className="text-foreground truncate mr-2">
                        {item.product_name}{item.color ? ` (${item.color})` : ""} ×{item.quantity}
                      </span>
                      <span className="text-foreground font-medium whitespace-nowrap">
                        Rs. {(item.price_npr * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border pt-4 mb-2">
                  <div className="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>Subtotal</span>
                    <span>Rs. {totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>VAT (13%)</span>
                    <span>Rs. {vatAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground mb-1">
                    <span>Shipping</span>
                    <span className="text-primary">Free</span>
                  </div>
                </div>
                <div className="border-t border-border pt-4 flex justify-between font-semibold text-foreground text-lg mb-6">
                  <span>Total (incl. VAT)</span>
                  <span>Rs. {grandTotal.toLocaleString()}</span>
                </div>
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading || items.length === 0}
                  className="w-full py-3.5 bg-primary text-primary-foreground font-medium text-sm tracking-wide rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {loading ? "Placing Order..." : "Place Order"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer settings={settings} />
    </div>
  );
};

export default Checkout;
