import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthToken } from "@/services/api";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminInventory from "@/components/admin/AdminInventory";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminUsers from "@/components/admin/AdminUsers";
import {
  LayoutDashboard,
  ShoppingBag,
  Warehouse,
  Users,
  Lock,
  FileEdit,
  Gift,
  LogOut,
} from "lucide-react";
import AdminContent from "@/components/admin/AdminContent";
import { removeAuthToken } from "@/services/api";

type UserRole =
  | "admin"
  | "order_taker"
  | "dispatcher"
  | "content_manager"
  | null;

const allTabs = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    roles: ["admin"],
  },
  {
    id: "orders",
    label: "Orders",
    icon: ShoppingBag,
    roles: ["admin", "order_taker", "dispatcher"],
  },
  {
    id: "inventory",
    label: "Inventory",
    icon: Warehouse,
    roles: ["admin", "dispatcher"],
  },
  {
    id: "content",
    label: "Content",
    icon: FileEdit,
    roles: ["admin", "content_manager"],
  },
  { id: "users", label: "Users", icon: Users, roles: ["admin"] },
];

const Admin = () => {
  const { settings } = useSiteSettings();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("");
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Check if user is authenticated
    const token = getAuthToken();
    if (!token) {
      navigate("/admin/login");
      return;
    }

    // For now, set as admin role (in real implementation, decode JWT to get role)
    checkRole();
  }, [navigate]);

  const checkRole = () => {
    // In production, extract role from JWT token
    // For now, assume admin role if token exists
    const token = getAuthToken();
    if (token) {
      setUserRole("admin");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (userRole) {
      const availableTabs = allTabs.filter((t) =>
        t.roles.includes(userRole)
      );
      if (availableTabs.length > 0 && !activeTab) {
        setActiveTab(availableTabs[0].id);
      }
    }
  }, [userRole, activeTab]);

  const handleLogout = () => {
    removeAuthToken();
    navigate("/admin/login");
  };

  if (loading)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-2 sm:px-4">
        <p className="text-xs sm:text-sm text-muted-foreground">Loading...</p>
      </div>
    );

  if (!userRole) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar settings={settings} />
        <main className="pt-16 sm:pt-20 md:pt-24 pb-20 md:pb-0">
          <div className="container mx-auto px-2 sm:px-4 max-w-lg text-center py-12 sm:py-16 md:py-20">
            <Lock className="w-12 sm:w-14 md:w-16 h-12 sm:h-14 md:h-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
            <h1 className="font-display text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-2 sm:mb-2.5 md:mb-3">
              Access Required
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-muted-foreground">
              You need a role assignment to access this page. Contact your
              admin.
            </p>
          </div>
        </main>
        <Footer settings={settings} />
      </div>
    );
  }

  const visibleTabs = allTabs.filter((t) => t.roles.includes(userRole));
  const roleLabel =
    userRole === "admin"
      ? "Admin"
      : userRole === "order_taker"
        ? "Order Taker"
        : "Dispatcher";

  return (
    <div className="min-h-screen bg-background">
      <Navbar settings={settings} />
      <main className="pt-16 sm:pt-20 md:pt-24 pb-20 md:pb-0">
        <div className="container mx-auto px-2 sm:px-4 max-w-6xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-5 md:mb-6 gap-2 sm:gap-3 md:gap-4">
            <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
              Admin Panel
            </h1>
            <div className="flex items-center gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto">
              <span className="text-[9px] sm:text-xs font-medium px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 md:py-1.5 rounded-sm bg-primary/10 text-primary">
                {roleLabel}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <LogOut size={12} className="sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-0.5 sm:gap-1 mb-6 sm:mb-8 bg-secondary p-0.5 sm:p-1 rounded-sm overflow-x-auto">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 sm:gap-1.5 md:gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 text-xs sm:text-sm font-medium rounded-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.icon size={12} className="sm:w-4 sm:h-4 md:w-4 md:h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === "dashboard" && <AdminDashboard />}
          {activeTab === "orders" && <AdminOrders />}
          {activeTab === "inventory" && <AdminInventory products={products} onRefresh={() => setProducts([])} />}
          {activeTab === "content" && <AdminContent />}
          {activeTab === "users" && <AdminUsers />}
        </div>
      </main>
      <Footer settings={settings} />
    </div>
  );
};

export default Admin;
