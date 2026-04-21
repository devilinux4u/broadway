import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { getImageUrl } from "@/utils/imageUrl";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { adminAuthAPI } from "@/services/adminAPI";
import { setAuthToken } from "@/services/api";

const AdminAuth = () => {
  const { settings } = useSiteSettings();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const logoUrl = getImageUrl(settings.logo_url);
  const storeName = settings.store_name || "Beauty Shop";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await adminAuthAPI.login(email, password);
      
      if (response && response.token) {
        setAuthToken(response.token);
        toast({ title: "Success", description: "Admin login successful!", variant: "default" });
        setTimeout(() => {
          navigate("/admin");
        }, 500);
      } else {
        toast({ title: "Login failed", description: response?.message || "Invalid credentials", variant: "destructive" });
      }
    } catch (err: any) {
      console.error("Login error:", err);
      toast({ title: "Error", description: err.message || "Failed to connect to backend", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar settings={settings} />
      <div className="bg-background flex flex-col items-center justify-start px-2 sm:px-4 py-4 sm:py-6 md:py-8 min-h-screen">
        <div className="w-full max-w-md">
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          {logoUrl && <img src={logoUrl} alt={storeName} className="h-14 sm:h-16 md:h-20 w-auto mx-auto mb-1.5 sm:mb-2" />}
        </div>

        <div className="bg-card rounded-lg p-4 sm:p-6 md:p-8 shadow-lg border border-border">
          <h2 className="font-display text-lg sm:text-xl md:text-2xl font-semibold text-foreground text-center mb-4 sm:mb-5 md:mb-6">
            Admin Login
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5 md:space-y-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-1 sm:mb-1.5">Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required
                className="w-full px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 rounded-sm border border-input bg-background text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-ring" 
                placeholder="admin@email.com" 
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-foreground mb-1 sm:mb-1.5">Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                minLength={6}
                className="w-full px-2.5 sm:px-3 md:px-4 py-1.5 sm:py-2 md:py-2.5 rounded-sm border border-input bg-background text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-ring" 
                placeholder="••••••••" 
              />
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-2 sm:py-2.5 md:py-3 bg-primary text-primary-foreground font-medium text-xs sm:text-sm tracking-wide rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Please wait..." : "Sign In"}
            </button>
          </form>

          <div className="mt-4 sm:mt-5 md:mt-6 pt-4 sm:pt-5 md:pt-6 border-t border-border text-center">
            <p className="text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">Looking for customer login?</p>
            <a href="/auth" className="text-primary hover:underline text-xs sm:text-sm font-medium">
              Go to Customer Login
            </a>
          </div>
        </div>
        </div>
      </div>
    </>
  );
};

export default AdminAuth;
