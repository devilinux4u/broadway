import { useState, useRef, useEffect } from "react";
import { ShoppingBag, Menu, X, Search, User, LogOut, ChevronDown } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { getImageUrl } from "@/utils/imageUrl";

interface NavbarProps {
  settings?: Record<string, any>;
}

const Navbar = ({ settings = {} }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);
  const { user, signOut } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const logoImage = getImageUrl(settings.logo_url);
  const storeName = settings.store_name || "";
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (!section) return false;

    const offset = 96;
    const top = section.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
    return true;
  };

  const handleSectionNavigation = (sectionId: string) => {
    setIsOpen(false);
    setIsAccountOpen(false);

    if (location.pathname !== "/") {
      navigate(`/#${sectionId}`);
      return;
    }

    if (!scrollToSection(sectionId)) {
      window.location.hash = sectionId;
    }
  };

  const handleHomeNavigation = () => {
    setIsOpen(false);
    setIsAccountOpen(false);

    if (location.pathname !== "/") {
      navigate("/");
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Close account menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setIsAccountOpen(false);
      }
    };

    if (isAccountOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isAccountOpen]);

  useEffect(() => {
    if (location.pathname !== "/" || !location.hash) return;

    const sectionId = location.hash.replace("#", "");
    const timer = setTimeout(() => {
      scrollToSection(sectionId);
    }, 100);

    return () => clearTimeout(timer);
  }, [location.pathname, location.hash]);

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20 gap-4">
          <div className="flex items-center gap-6 md:gap-8">
            <button onClick={handleHomeNavigation} className="flex items-center" aria-label="Go to home">
              {logoImage ? (
                <img src={logoImage} alt={storeName} className="h-12 md:h-14 w-auto" />
              ) : (
                <span className="font-display text-lg font-semibold text-foreground">{storeName}</span>
              )}
            </button>

            <div className="hidden md:flex items-end self-end gap-6 md:gap-8 pb-1">
              <button onClick={() => navigate("/shop")} className="text-sm font-medium tracking-wide text-foreground hover:text-primary transition-colors">Shop</button>
              <button onClick={() => handleSectionNavigation("categories")} className="text-sm font-medium tracking-wide text-foreground hover:text-primary transition-colors">Categories</button>
              <button onClick={() => handleSectionNavigation("about")} className="text-sm font-medium tracking-wide text-foreground hover:text-primary transition-colors">About</button>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-foreground"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <button onClick={() => navigate("/shop")} className="hidden md:block p-2 text-foreground hover:text-primary transition-colors" aria-label="Search">
              <Search size={18} />
            </button>
            <button
              onClick={() => user ? setIsCartOpen(true) : navigate("/auth")}
              className="relative p-2 text-foreground hover:text-primary transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag size={18} />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[10px] rounded-full flex items-center justify-center font-semibold">
                  {totalItems}
                </span>
              )}
            </button>
            {user ? (
              <div className="relative" ref={accountMenuRef}>
                <button
                  onClick={() => setIsAccountOpen(!isAccountOpen)}
                  className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-sm border border-border bg-secondary text-foreground hover:text-primary transition-colors"
                  aria-label="Account menu"
                >
                  <User size={16} />
                  <span className="text-xs font-medium tracking-wide">Account</span>
                  <ChevronDown size={14} className={`transition-transform ${isAccountOpen ? "rotate-180" : ""}`} />
                </button>
                {isAccountOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-md shadow-lg py-1 animate-fade-in">
                    <button
                      onClick={() => {
                        navigate("/my-orders");
                        setIsAccountOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors flex items-center gap-2"
                    >
                      <ShoppingBag size={14} /> My Orders
                    </button>
                    <div className="border-t border-border my-1" />
                    <button
                      onClick={() => {
                        setIsCartOpen(true);
                        setIsAccountOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors flex items-center gap-2"
                    >
                      <ShoppingBag size={14} /> View Cart
                    </button>
                    <div className="border-t border-border my-1" />
                    <button
                      onClick={() => {
                        signOut();
                        setIsAccountOpen(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors flex items-center gap-2"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate("/auth")}
                className="hidden md:block p-2 text-foreground hover:text-primary transition-colors"
                aria-label="Sign in"
              >
                <User size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in">
          <div className="px-4 py-6 space-y-4">
            <button onClick={() => { setIsOpen(false); navigate("/shop"); }} className="block text-sm font-medium tracking-wide text-foreground hover:text-primary">Shop</button>
            <button onClick={() => handleSectionNavigation("categories")} className="block text-sm font-medium tracking-wide text-foreground hover:text-primary">Categories</button>
            <button onClick={() => handleSectionNavigation("about")} className="block text-sm font-medium tracking-wide text-foreground hover:text-primary">About</button>
            <div className="flex items-center gap-3 pt-2 border-t border-border">
              {user ? (
                <>
                  <button onClick={() => { setIsOpen(false); navigate("/my-orders"); }} className="text-sm text-foreground hover:text-primary flex items-center gap-2">
                    <ShoppingBag size={14} /> My Orders
                  </button>
                  <button onClick={() => { setIsOpen(false); signOut(); }} className="text-sm text-foreground hover:text-primary flex items-center gap-2">
                    <LogOut size={14} /> Logout
                  </button>
                </>
              ) : (
                <button onClick={() => navigate("/auth")} className="text-sm text-foreground hover:text-primary">Sign In</button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
