import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ordersAPI } from "@/services/ordersAPI";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { Package, ChevronRight, Clock, Truck, CheckCircle2, XCircle, ArrowLeft } from "lucide-react";

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  payment_method: string;
  payment_status: string;
  shipping_name: string;
  shipping_city: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string;
  price: number;
  quantity: number;
  color?: string | null;
}

const statusConfig: Record<string, { icon: any; color: string; label: string }> = {
  pending: { icon: Clock, color: "text-yellow-500", label: "Pending" },
  confirmed: { icon: CheckCircle2, color: "text-blue-500", label: "Confirmed" },
  processing: { icon: Package, color: "text-orange-500", label: "Processing" },
  shipped: { icon: Truck, color: "text-primary", label: "Shipped" },
  delivered: { icon: CheckCircle2, color: "text-green-500", label: "Delivered" },
  cancelled: { icon: XCircle, color: "text-destructive", label: "Cancelled" },
};

const statusSteps = ["pending", "confirmed", "processing", "shipped", "delivered"];

const MyOrders = () => {
  const { settings } = useSiteSettings();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    try {
      const response = await ordersAPI.getOrders();
      if (response.success && response.data) {
        setOrders(response.data);
      }
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const viewOrder = async (order: Order) => {
    try {
      const response = await ordersAPI.getOrderDetail(order.id);
      if (response.success) {
        setSelectedOrder(order);
        setOrderItems(response.items);
      }
    } catch (error) {
      console.error("Failed to load order details:", error);
    }
  };

  const getStatusStep = (status: string) => {
    const idx = statusSteps.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  if (selectedOrder) {
    const status = statusConfig[selectedOrder.status] || statusConfig.pending;
    const StatusIcon = status.icon;
    const currentStep = getStatusStep(selectedOrder.status);

    return (
      <div className="min-h-screen bg-background">
        <Navbar settings={settings} />
        <main className="pt-20 pb-28 md:pb-20">
          <div className="container mx-auto px-4 max-w-2xl">
            <button onClick={() => setSelectedOrder(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 mt-2">
              <ArrowLeft size={16} /> Back to Orders
            </button>

            <div className="bg-card border border-border rounded-lg p-5 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-lg font-semibold text-foreground">Order #{selectedOrder.id.slice(0, 8)}</h2>
                <span className={`flex items-center gap-1 text-sm font-medium ${status.color}`}>
                  <StatusIcon size={16} /> {status.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(selectedOrder.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>

            {/* Status Timeline */}
            {selectedOrder.status !== "cancelled" && (
              <div className="bg-card border border-border rounded-lg p-5 mb-4">
                <h3 className="text-sm font-semibold text-foreground mb-4">Order Progress</h3>
                <div className="flex items-center justify-between relative">
                  <div className="absolute top-3 left-6 right-6 h-0.5 bg-border" />
                  <div className="absolute top-3 left-6 h-0.5 bg-primary transition-all" style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%`, maxWidth: "calc(100% - 48px)" }} />
                  {statusSteps.map((step, idx) => {
                    const stepConf = statusConfig[step];
                    const StepIcon = stepConf.icon;
                    const isActive = idx <= currentStep;
                    return (
                      <div key={step} className="flex flex-col items-center z-10 relative">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                          <StepIcon size={12} />
                        </div>
                        <span className={`text-[10px] mt-1.5 ${isActive ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                          {stepConf.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Items */}
            <div className="bg-card border border-border rounded-lg p-5 mb-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">Items</h3>
              <div className="space-y-3">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img src={item.product_image} alt={item.product_name} className="w-14 h-14 object-cover rounded-sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.product_name}</p>
                      {item.color && <p className="text-xs text-muted-foreground">Color: {item.color}</p>}
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-foreground">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-card border border-border rounded-lg p-5">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Payment</span>
                <span className="text-foreground capitalize">{selectedOrder.payment_method.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Delivery to</span>
                <span className="text-foreground">{selectedOrder.shipping_city}</span>
              </div>
              <div className="border-t border-border pt-3 mt-3 flex justify-between font-semibold text-foreground">
                <span>Total</span>
                <span>Rs. {selectedOrder.total_amount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </main>
        <Footer settings={settings} />
        <MobileBottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar settings={settings} />
      <main className="pt-20 pb-28 md:pb-20">
        <div className="container mx-auto px-4 max-w-2xl">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mt-4 mb-6">My Orders</h1>

          {loading ? (
            <div className="text-center py-16 text-muted-foreground">Loading...</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No orders yet</p>
              <button onClick={() => navigate("/")} className="px-6 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-sm hover:bg-primary/90">
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const status = statusConfig[order.status] || statusConfig.pending;
                const StatusIcon = status.icon;
                return (
                  <button
                    key={order.id}
                    onClick={() => viewOrder(order)}
                    className="w-full flex items-center gap-4 p-4 bg-card border border-border rounded-lg hover:border-primary/30 transition-all text-left"
                  >
                    <div className={`w-10 h-10 rounded-full bg-secondary flex items-center justify-center ${status.color}`}>
                      <StatusIcon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()} · Rs. {order.total_amount.toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`text-xs font-medium ${status.color}`}>{status.label}</span>
                      <ChevronRight size={16} className="text-muted-foreground" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer settings={settings} />
      <MobileBottomNav />
    </div>
  );
};

export default MyOrders;
