import { useState, useEffect } from "react";
import { dashboardAPI } from "@/services/adminAPI";
import { Package, ShoppingBag, AlertTriangle, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DashboardStats {
  total_products: number;
  total_orders: number;
  pending_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  total_revenue: number;
  paid_revenue: number;
  total_stock: number;
  low_stock_items: number;
  total_catalog_value: number;
  total_users: number;
  active_users: number;
}

interface RecentOrder {
  id: string;
  shipping_name: string;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  item_count: number;
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getDashboardData();
      if (response.success && response.data) {
        setStats(response.data.stats);
        setRecentOrders(response.data.recent_orders || []);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-muted-foreground text-center py-10">Loading dashboard...</p>;

  if (!stats) {
    return <p className="text-muted-foreground text-center py-10">Unable to load dashboard data.</p>;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<Package size={20} />} 
          label="Total Products" 
          value={stats.total_products.toString()} 
          color="text-primary" 
        />
        <StatCard 
          icon={<ShoppingBag size={20} />} 
          label="Total Orders" 
          value={stats.total_orders.toString()} 
          color="text-accent" 
        />
        <StatCard 
          icon={<TrendingUp size={20} />} 
          label="Revenue (Paid)" 
          value={`Rs. ${stats.paid_revenue.toLocaleString('en-IN')}`} 
          color="text-primary" 
        />
        <StatCard 
          icon={<AlertTriangle size={20} />} 
          label="Low Stock Items" 
          value={stats.low_stock_items.toString()} 
          color={stats.low_stock_items > 0 ? "text-destructive" : "text-primary"} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Summary */}
        <div className="bg-card border border-border rounded-sm p-5">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Inventory Summary</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total Units in Stock</span>
              <span className="text-foreground font-medium">{stats.total_stock.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Catalog Value</span>
              <span className="text-foreground font-medium">Rs. {stats.total_catalog_value.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Products</span>
              <span className="text-foreground font-medium">{stats.total_products}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Low Stock</span>
              <span className={`font-medium ${stats.low_stock_items > 0 ? 'text-destructive' : 'text-primary'}`}>
                {stats.low_stock_items}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-card border border-border rounded-sm p-5">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Recent Orders</h3>
          {recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-sm">No orders yet.</p>
          ) : (
            <div className="space-y-3 text-sm">
              {recentOrders.map((o) => (
                <div key={o.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-foreground font-medium">{o.shipping_name}</p>
                    <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-foreground">Rs. {o.total_amount.toLocaleString('en-IN')}</p>
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                        o.status === "delivered"
                          ? "bg-primary/10 text-primary"
                          : o.status === "cancelled"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-accent/10 text-accent"
                      }`}
                    >
                      {o.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Order Stats */}
      <div className="bg-card border border-border rounded-sm p-5">
        <h3 className="font-display text-lg font-semibold text-foreground mb-4">Order Breakdown</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-accent">{stats.pending_orders}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">{stats.delivered_orders}</p>
            <p className="text-xs text-muted-foreground">Delivered</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{stats.cancelled_orders}</p>
            <p className="text-xs text-muted-foreground">Cancelled</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  color: string;
}) => (
  <div className="bg-card border border-border rounded-sm p-4">
    <div className={`${color} mb-2`}>{icon}</div>
    <p className="text-xl font-bold text-foreground">{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);

export default AdminDashboard;
