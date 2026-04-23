import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getAuthToken } from "@/services/api";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminInventory from "@/components/admin/AdminInventory";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import {
  LayoutDashboard,
  ShoppingBag,
  Warehouse,
  Users,
  BarChart3,
  Lock,
  FileEdit,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
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
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
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
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("");
  const [products, setProducts] = useState([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
        <main className="pb-20 md:pb-0">
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
      <main className="pb-20 md:pb-0">
        <div className="relative">
          <div className="flex gap-3 sm:gap-4 md:gap-6 items-start">
            <aside
              className={`fixed top-0 left-0 z-30 hidden md:flex h-screen bg-card border-r border-border flex-col transition-all duration-300 ${
                sidebarCollapsed ? "w-20" : "w-64"
              }`}
            >
              <div className="flex items-center justify-between px-3 py-3 border-b border-border">
                <div className={`${sidebarCollapsed ? "hidden" : "block"}`}>
                  <h2 className="font-display text-base font-semibold text-foreground">Admin Panel</h2>
                  <p className="text-[11px] text-muted-foreground">{roleLabel}</p>
                </div>
                <button
                  onClick={() => setSidebarCollapsed((prev) => !prev)}
                  className="inline-flex items-center justify-center w-8 h-8 rounded-sm border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                  aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                  {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
                </button>
              </div>

              <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
                {visibleTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center ${sidebarCollapsed ? "justify-center" : "justify-start"} gap-2.5 px-3 py-2.5 text-sm font-medium rounded-sm transition-colors ${
                      activeTab === tab.id
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                    }`}
                    title={sidebarCollapsed ? tab.label : undefined}
                  >
                    <tab.icon size={16} />
                    {!sidebarCollapsed && <span>{tab.label}</span>}
                  </button>
                ))}
              </nav>

              <div className="p-2 border-t border-border">
                <button
                  onClick={handleLogout}
                  className={`w-full flex items-center ${sidebarCollapsed ? "justify-center" : "justify-start"} gap-2.5 px-3 py-2.5 text-sm font-medium rounded-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors`}
                  title={sidebarCollapsed ? "Logout" : undefined}
                >
                  <LogOut size={16} />
                  {!sidebarCollapsed && <span>Logout</span>}
                </button>
              </div>
            </aside>

            <section className={`flex-1 min-w-0 px-2 sm:px-4 md:px-6 pt-4 sm:pt-6 md:pt-8 ${sidebarCollapsed ? "md:ml-20" : "md:ml-64"}`}>
              <div className="flex md:hidden gap-1 mb-4 sm:mb-5 bg-secondary p-1 rounded-sm overflow-x-auto">
                {visibleTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-sm whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <tab.icon size={14} />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {activeTab === "dashboard" && <AdminDashboard />}
              {activeTab === "analytics" && <AdminAnalytics />}
              {activeTab === "orders" && <AdminOrders />}
              {activeTab === "inventory" && <AdminInventory products={products} onRefresh={() => setProducts([])} />}
              {activeTab === "content" && <AdminContent />}
              {activeTab === "users" && <AdminUsers />}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Admin;
