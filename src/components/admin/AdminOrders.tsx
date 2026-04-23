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
  "shipped",
  "delivered",
  "cancelled",
];
const paymentStatusOptions = ["pending", "paid", "failed", "refunded"];
const quickStatusFilters = ["all", "pending", "confirmed", "shipped", "delivered"] as const;
type QuickStatusFilter = (typeof quickStatusFilters)[number];

const statusMeta: Record<string, { badge: string; border: string }> = {
  pending: {
    badge: "bg-amber-100 text-amber-800 border border-amber-200",
    border: "border-l-amber-500",
  },
  confirmed: {
    badge: "bg-sky-100 text-sky-800 border border-sky-200",
    border: "border-l-sky-500",
  },
  shipped: {
    badge: "bg-violet-100 text-violet-800 border border-violet-200",
    border: "border-l-violet-500",
  },
  delivered: {
    badge: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    border: "border-l-emerald-500",
  },
  cancelled: {
    badge: "bg-rose-100 text-rose-800 border border-rose-200",
    border: "border-l-rose-500",
  },
};

const AdminOrders = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<QuickStatusFilter>("all");
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

  const statusCounts = {
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((order) => order.status === statusFilter);

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-foreground mb-6">
        Orders ({filteredOrders.length}/{orders.length})
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <button
          onClick={() => setStatusFilter("pending")}
          className="text-left p-3 rounded-sm border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-700">Pending</p>
          <p className="text-xl font-bold text-amber-900">{statusCounts.pending}</p>
        </button>
        <button
          onClick={() => setStatusFilter("confirmed")}
          className="text-left p-3 rounded-sm border border-sky-200 bg-sky-50 hover:bg-sky-100 transition-colors"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-700">Confirmed</p>
          <p className="text-xl font-bold text-sky-900">{statusCounts.confirmed}</p>
        </button>
        <button
          onClick={() => setStatusFilter("shipped")}
          className="text-left p-3 rounded-sm border border-violet-200 bg-violet-50 hover:bg-violet-100 transition-colors"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-violet-700">Shipped</p>
          <p className="text-xl font-bold text-violet-900">{statusCounts.shipped}</p>
        </button>
        <button
          onClick={() => setStatusFilter("delivered")}
          className="text-left p-3 rounded-sm border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">Delivered</p>
          <p className="text-xl font-bold text-emerald-900">{statusCounts.delivered}</p>
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {quickStatusFilters.map((filter) => (
          <button
            key={filter}
            onClick={() => setStatusFilter(filter)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-sm border transition-colors ${
              statusFilter === filter
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-foreground border-border hover:bg-secondary"
            }`}
          >
            {filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No orders found for this status.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => (
            <div key={order.id} className={`bg-card border border-border border-l-4 ${statusMeta[order.status]?.border || "border-l-border"} rounded-sm overflow-hidden`}>
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
                    className={`text-[10px] font-semibold px-2.5 py-1 rounded uppercase tracking-wide ${statusMeta[order.status]?.badge || "bg-muted text-foreground border border-border"}`}
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
