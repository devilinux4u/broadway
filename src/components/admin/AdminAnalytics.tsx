import { useEffect, useMemo, useState } from "react";
import { analyticsAPI } from "@/services/adminAPI";
import { useToast } from "@/hooks/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { IndianRupee, Users, Wallet, Package } from "lucide-react";

interface Overview {
  total_orders: number;
  total_income: number;
  paid_income: number;
  pending_income: number;
  cod_income: number;
  other_income: number;
  total_customers: number;
  average_order_value: number;
  total_items_sold: number;
}

interface MonthlySalesPoint {
  month: string;
  month_label: string;
  total_orders: number;
  total_income: number;
  cod_income: number;
  other_income: number;
}

interface PaymentIncomeBreakdown {
  payment_method: string;
  total_orders: number;
  total_income: number;
}

interface TopProduct {
  product_name: string;
  quantity_sold: number;
  total_income: number;
  orders_count: number;
}

interface FullAnalyticsData {
  overview: Overview;
  monthly_sales: MonthlySalesPoint[];
  payment_income: PaymentIncomeBreakdown[];
  top_products: TopProduct[];
  order_status_breakdown: Record<string, number>;
  payment_status_breakdown: Record<string, number>;
}

const PIE_COLORS = ["#0ea5e9", "#22c55e", "#f59e0b", "#ef4444", "#64748b", "#a855f7"];

const formatCurrency = (value: number) => `Rs. ${Math.round(value).toLocaleString("en-IN")}`;

const normalizePaymentLabel = (value: string) => {
  if (!value) return "Unknown";
  const clean = value.toLowerCase();
  if (clean === "cod") return "Cash on Delivery";
  if (clean === "qr") return "QR";
  if (clean === "esewa") return "eSewa";
  if (clean === "khalti") return "Khalti";
  if (clean === "cash") return "Cash";
  if (clean === "unknown") return "Unknown";
  return clean.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const AdminAnalytics = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [months, setMonths] = useState(1);
  const [data, setData] = useState<FullAnalyticsData | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, [months]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await analyticsAPI.getFullAnalytics(months, 10);
      if (response.success && response.data) {
        setData(response.data);
      }
    } catch (error) {
      console.error("Failed to load analytics:", error);
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const paymentPieData = useMemo(
    () =>
      (data?.payment_income || []).map((item) => ({
        name: normalizePaymentLabel(item.payment_method),
        value: item.total_income,
      })),
    [data]
  );

  const orderStatusData = useMemo(
    () =>
      Object.entries(data?.order_status_breakdown || {}).map(([status, count]) => ({
        status,
        count,
      })),
    [data]
  );

  const paymentStatusData = useMemo(
    () =>
      Object.entries(data?.payment_status_breakdown || {}).map(([status, count]) => ({
        status,
        count,
      })),
    [data]
  );

  const khaltiIncome = useMemo(() => {
    const khalti = (data?.payment_income || []).find((item) => item.payment_method?.toLowerCase() === "khalti");
    return khalti?.total_income || 0;
  }, [data]);

  const collectionRate = useMemo(() => {
    if (!data || data.overview.total_income <= 0) return 0;
    return (data.overview.paid_income / data.overview.total_income) * 100;
  }, [data]);

  if (loading) {
    return <p className="text-muted-foreground text-center py-10">Loading analytics...</p>;
  }

  if (!data) {
    return <p className="text-muted-foreground text-center py-10">Unable to load analytics data.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl font-semibold text-foreground">Analytics</h2>
        <select
          value={months}
          onChange={(e) => setMonths(Number(e.target.value))}
          className="px-3 py-2 border border-input rounded-sm bg-background text-sm text-foreground"
        >
          <option value={1}>This month</option>
          <option value={3}>Last 3 months</option>
          <option value={6}>Last 6 months</option>
        </select>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard icon={<Package size={18} />} label="Items Sold" value={data.overview.total_items_sold.toLocaleString("en-IN")} />
        <MetricCard icon={<IndianRupee size={18} />} label="Total Income" value={formatCurrency(data.overview.total_income)} />
        <MetricCard icon={<IndianRupee size={18} />} label="Khalti Income" value={formatCurrency(khaltiIncome)} />
        <MetricCard icon={<Wallet size={18} />} label="COD Income" value={formatCurrency(data.overview.cod_income)} />
        <MetricCard icon={<Users size={18} />} label="Customers" value={data.overview.total_customers.toLocaleString("en-IN")} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-sm p-5">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Monthly Sales</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthly_sales}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month_label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Line type="monotone" dataKey="total_income" stroke="#0ea5e9" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-sm p-5 xl:col-span-1">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Income by Payment Method</h3>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={paymentPieData} cx="50%" cy="50%" outerRadius={90} dataKey="value" nameKey="name" labelLine={false}>
                  {paymentPieData.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-sm p-5">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Top Products by Income</h3>
          {data.top_products.length === 0 ? (
            <p className="text-sm text-muted-foreground">No product sales data available.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="py-2 pr-2">Product</th>
                    <th className="py-2 px-2">Qty Sold</th>
                    <th className="py-2 px-2">Orders</th>
                    <th className="py-2 pl-2 text-right">Income</th>
                  </tr>
                </thead>
                <tbody>
                  {data.top_products.map((product, idx) => (
                    <tr key={`${product.product_name}-${idx}`} className="border-b border-border/70 last:border-0">
                      <td className="py-2 pr-2 text-foreground">{product.product_name}</td>
                      <td className="py-2 px-2 text-foreground">{product.quantity_sold}</td>
                      <td className="py-2 px-2 text-foreground">{product.orders_count}</td>
                      <td className="py-2 pl-2 text-right text-foreground">{formatCurrency(product.total_income)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-card border border-border rounded-sm p-5">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Order Status Breakdown</h3>
          {orderStatusData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No order status data available.</p>
          ) : (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={orderStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-sm p-5">
          <h3 className="font-display text-lg font-semibold text-foreground mb-4">Payment Status Breakdown</h3>
          {paymentStatusData.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payment status data available.</p>
          ) : (
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentStatusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-card border border-border rounded-sm p-5 space-y-3">
          <h3 className="font-display text-lg font-semibold text-foreground">Income Snapshot</h3>
          <SummaryRow label="Paid Income" value={formatCurrency(data.overview.paid_income)} />
          <SummaryRow label="Pending Income" value={formatCurrency(data.overview.pending_income)} />
          <SummaryRow label="COD Income" value={formatCurrency(data.overview.cod_income)} />
          <SummaryRow label="Khalti Income" value={formatCurrency(khaltiIncome)} />
          <SummaryRow label="Other Income" value={formatCurrency(data.overview.other_income)} />
          <SummaryRow label="Average Order Value" value={formatCurrency(data.overview.average_order_value)} />
          <div className="pt-1">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-muted-foreground">Collection Rate</span>
              <span className="text-foreground font-medium">{collectionRate.toFixed(1)}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
              <div className="h-full bg-primary" style={{ width: `${Math.min(collectionRate, 100)}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="bg-card border border-border rounded-sm p-4">
    <div className="text-primary mb-2">{icon}</div>
    <p className="text-lg font-semibold text-foreground leading-snug">{value}</p>
    <p className="text-xs text-muted-foreground">{label}</p>
  </div>
);

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center justify-between text-sm border-b border-border/70 pb-2 last:border-0 last:pb-0">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-foreground font-medium">{value}</span>
  </div>
);

export default AdminAnalytics;