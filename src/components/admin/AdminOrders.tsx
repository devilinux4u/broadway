import { useState, useEffect } from "react";
import { adminOrdersAPI } from "@/services/adminAPI";
import { useToast } from "@/hooks/use-toast";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Order {
  id: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  total_amount: number;
  status: string;
  payment_status: string;
  payment_method: string;
  notes: string | null;
  created_at: string;
  user_id: string;
}

interface OrderItem {
  id: string;
  product_name: string;
  product_image: string;
  quantity: number;
  price: number;
}

const statusOptions = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];
const paymentStatusOptions = ["pending", "paid", "failed", "refunded"];

const AdminOrders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await adminOrdersAPI.getAllOrders({
        limit: 50,
        offset: 0,
      });
      if (response.success && response.data) {
        setOrders(response.data.data || response.data);
      }
    } catch (error) {
      console.error("Failed to load orders:", error);
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadOrderItems = async (orderId: string) => {
    if (orderItems[orderId]) return;
    try {
      const response = await adminOrdersAPI.getOrderById(orderId);
      if (response.success && response.data && response.data.order_items) {
        setOrderItems((prev) => ({
          ...prev,
          [orderId]: response.data.order_items,
        }));
      }
    } catch (error) {
      console.error("Failed to load order items:", error);
      toast({
        title: "Error",
        description: "Failed to load order items",
        variant: "destructive",
      });
    }
  };

  const toggleExpand = (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
      return;
    }
    setExpandedOrder(orderId);
    loadOrderItems(orderId);
  };

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await adminOrdersAPI.updateOrderStatus(orderId, status);
      toast({
        title: `Order status updated to ${status}`,
      });
      loadOrders();
    } catch (error) {
      console.error("Failed to update order status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const updatePaymentStatus = async (
    orderId: string,
    payment_status: string
  ) => {
    try {
      await adminOrdersAPI.updatePaymentStatus(orderId, payment_status);
      toast({
        title: `Payment status updated to ${payment_status}`,
      });
      loadOrders();
    } catch (error) {
      console.error("Failed to update payment status:", error);
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive",
      });
    }
  };

  if (loading)
    return (
      <p className="text-muted-foreground text-center py-10">Loading orders...</p>
    );

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-foreground mb-6">
        Orders ({orders.length})
      </h2>
      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-card border border-border rounded-sm overflow-hidden">
              <div
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-secondary/50 transition-colors"
                onClick={() => toggleExpand(order.id)}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">
                      {order.shipping_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()} ·{" "}
                      {order.shipping_city}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground">
                    Rs. {order.total_amount.toLocaleString('en-IN')}
                  </span>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                      order.status === "delivered"
                        ? "bg-primary/10 text-primary"
                        : order.status === "cancelled"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-accent/10 text-accent"
                    }`}
                  >
                    {order.status}
                  </span>
                  {expandedOrder === order.id ? (
                    <ChevronUp size={16} className="text-muted-foreground" />
                  ) : (
                    <ChevronDown size={16} className="text-muted-foreground" />
                  )}
                </div>
              </div>
              {expandedOrder === order.id && (
                <div className="border-t border-border p-4 bg-secondary/30 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs mb-1">
                        Shipping
                      </p>
                      <p className="text-foreground">{order.shipping_name}</p>
                      <p className="text-muted-foreground">
                        {order.shipping_phone}
                      </p>
                      <p className="text-muted-foreground">
                        {order.shipping_address}, {order.shipping_city}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">
                          Order Status
                        </label>
                        <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value)} className="w-full px-3 py-2 border border-input rounded-sm bg-background text-foreground text-sm">
                          {statusOptions.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Payment Status</label>
                        <select value={order.payment_status} onChange={(e) => updatePaymentStatus(order.id, e.target.value)} className="w-full px-3 py-2 border border-input rounded-sm bg-background text-foreground text-sm">
                          {paymentStatusOptions.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  {order.notes && <p className="text-xs text-muted-foreground">Notes: {order.notes}</p>}
                  <div>
                    <p className="text-xs font-medium text-foreground mb-2">Items</p>
                    {orderItems[order.id] ? (
                      <div className="space-y-2">
                        {orderItems[order.id].map(item => (
                          <div key={item.id} className="flex items-center gap-3 text-sm">
                            <img src={item.product_image} alt={item.product_name} className="w-8 h-8 object-cover rounded-sm" />
                            <span className="text-foreground flex-1">{item.product_name}</span>
                            <span className="text-muted-foreground">×{item.quantity}</span>
                            <span className="text-foreground">Rs. {item.price.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-xs text-muted-foreground">Loading items...</p>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
