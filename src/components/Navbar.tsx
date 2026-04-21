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
    <nav className="sticky top-0 z-50 bg-sky-200 border-b border-border">
      <div className="container mx-auto px-2 sm:px-4">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-20 gap-2 sm:gap-4">
          <div className="flex items-center gap-3 sm:gap-6 md:gap-8">
            <button onClick={handleHomeNavigation} className="flex items-center flex-shrink-0" aria-label="Go to home">
              {logoImage ? (
                <img src={logoImage} alt={storeName} className="h-10 sm:h-12 md:h-14 w-auto" />
              ) : (
                <span className="font-display text-sm sm:text-base md:text-lg font-semibold text-foreground">{storeName}</span>
              )}
            </button>

            <div className="hidden md:flex items-end self-end gap-4 md:gap-8 pb-0.5 md:pb-1">
              <button onClick={() => navigate("/shop")} className="text-xs md:text-sm font-medium tracking-wide text-foreground hover:text-primary transition-colors">Shop</button>
              <button onClick={() => navigate("/classes")} className="text-xs md:text-sm font-medium tracking-wide text-foreground hover:text-primary transition-colors">Classes</button>
              <button onClick={() => handleSectionNavigation("about")} className="text-xs md:text-sm font-medium tracking-wide text-foreground hover:text-primary transition-colors">About</button>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-1.5 sm:p-2 text-foreground"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={18} className="sm:w-5 sm:h-5" /> : <Menu size={18} className="sm:w-5 sm:h-5" />}
            </button>
            <button onClick={() => navigate("/shop")} className="hidden md:block p-1.5 md:p-2 text-foreground hover:text-primary transition-colors" aria-label="Search">
              <Search size={16} className="md:w-[18px] md:h-[18px]" />
            </button>
            <button
              onClick={() => user ? setIsCartOpen(true) : navigate("/auth")}
              className="relative p-1.5 sm:p-2 text-foreground hover:text-primary transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag size={16} className="sm:w-[18px] sm:h-[18px]" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary text-primary-foreground text-[9px] sm:text-[10px] rounded-full flex items-center justify-center font-semibold">
                  {totalItems}
                </span>
              )}
            </button>
            {user ? (
              <div className="relative" ref={accountMenuRef}>
                <button
                  onClick={() => setIsAccountOpen(!isAccountOpen)}
                  className="hidden md:flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-sm border border-border bg-secondary text-foreground hover:text-primary transition-colors"
                  aria-label="Account menu"
                >
                  <User size={14} />
                  <span className="text-xs font-medium tracking-wide">Account</span>
                  <ChevronDown size={12} className={`transition-transform ${isAccountOpen ? "rotate-180" : ""}`} />
                </button>
                {isAccountOpen && (
                  <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-card border border-border rounded-md shadow-lg py-1 animate-fade-in z-50">
                    <button
                      onClick={() => {
                        navigate("/my-orders");
                        setIsAccountOpen(false);
                      }}
                      className="w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-foreground hover:bg-secondary transition-colors flex items-center gap-2"
                    >
                      <ShoppingBag size={12} className="sm:w-3.5 sm:h-3.5" /> My Orders
                    </button>
                    <div className="border-t border-border my-1" />
                    <button
                      onClick={() => {
                        setIsCartOpen(true);
                        setIsAccountOpen(false);
                      }}
                      className="w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-foreground hover:bg-secondary transition-colors flex items-center gap-2"
                    >
                      <ShoppingBag size={12} className="sm:w-3.5 sm:h-3.5" /> View Cart
                    </button>
                    <div className="border-t border-border my-1" />
                    <button
                      onClick={() => {
                        signOut();
                        setIsAccountOpen(false);
                      }}
                      className="w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm text-foreground hover:bg-secondary transition-colors flex items-center gap-2"
                    >
                      <LogOut size={12} className="sm:w-3.5 sm:h-3.5" /> Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate("/auth")}
                className="hidden md:block p-1.5 md:p-2 text-foreground hover:text-primary transition-colors"
                aria-label="Sign in"
              >
                <User size={16} className="md:w-[18px] md:h-[18px]" />
              </button>
            )}
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-border bg-background animate-fade-in">
          <div className="px-2 sm:px-4 py-4 sm:py-6 space-y-3 sm:space-y-4">
            <button onClick={() => { setIsOpen(false); navigate("/shop"); }} className="block text-xs sm:text-sm font-medium tracking-wide text-foreground hover:text-primary">Shop</button>
            <button onClick={() => { setIsOpen(false); navigate("/classes"); }} className="block text-xs sm:text-sm font-medium tracking-wide text-foreground hover:text-primary">Classes</button>
            <button onClick={() => handleSectionNavigation("about")} className="block text-xs sm:text-sm font-medium tracking-wide text-foreground hover:text-primary">About</button>
            <div className="flex items-center gap-2 sm:gap-3 pt-2 sm:pt-3 border-t border-border">
              {user ? (
                <>
                  <button onClick={() => { setIsOpen(false); navigate("/my-orders"); }} className="text-xs sm:text-sm text-foreground hover:text-primary flex items-center gap-1.5 sm:gap-2">
                    <ShoppingBag size={12} className="sm:w-3.5 sm:h-3.5" /> My Orders
                  </button>
                  <button onClick={() => { setIsOpen(false); signOut(); }} className="text-xs sm:text-sm text-foreground hover:text-primary flex items-center gap-1.5 sm:gap-2">
                    <LogOut size={12} className="sm:w-3.5 sm:h-3.5" /> Logout
                  </button>
                </>
              ) : (
                <button onClick={() => navigate("/auth")} className="text-xs sm:text-sm text-foreground hover:text-primary">Sign In</button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
