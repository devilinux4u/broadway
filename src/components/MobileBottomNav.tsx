import { Home, Search, ShoppingBag, Package } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();

  const isActive = (path: string) => location.pathname === path;

  const tabs = [
    { icon: Home, label: "Home", path: "/", action: () => navigate("/") },
    { icon: Search, label: "Shop", path: "/shop", action: () => navigate("/shop") },
    {
      icon: ShoppingBag,
      label: "Cart",
      path: "/cart",
      action: () => { if (user) setIsCartOpen(true); else navigate("/auth"); },
    },
    { icon: Package, label: "Orders", path: "/my-orders", action: () => { if (user) navigate("/my-orders"); else navigate("/auth"); } },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          return (
            <button
              key={tab.label}
              onClick={tab.action}
              className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 relative transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div className="relative">
                <Icon size={20} />
                {tab.badge && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-primary text-primary-foreground text-[9px] rounded-full flex items-center justify-center font-bold">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
