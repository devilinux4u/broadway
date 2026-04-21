import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { getImageUrl } from "@/utils/imageUrl";
import { toast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import userAuthAPI from "@/services/authAPI";

const Auth = () => {
  const { settings } = useSiteSettings();
  const [isLogin, setIsLogin] = useState(true);
  const [isForgot, setIsForgot] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const logoUrl = getImageUrl(settings.logo_url);
  const storeName = settings.store_name || "Beauty Shop";

  useEffect(() => {
    if (user) navigate("/");
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isForgot) {
        // Handle forgot password
        await userAuthAPI.forgotPassword(email);
        toast({ title: "Check your email", description: "We've sent you a password reset link." });
        setIsForgot(false);
        setEmail("");
      } else if (isLogin) {
        // Handle login
        const response = await userAuthAPI.login(email, password);
        // Store token and user in localStorage
        localStorage.setItem("authToken", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        // Update auth context
        setUser(response.user);
        toast({ title: "Success", description: "Logged in successfully!" });
        // Navigate happens automatically due to useEffect
      } else {
        // Handle signup
        const response = await userAuthAPI.signup(email, password);
        // Store token and user in localStorage
        localStorage.setItem("authToken", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        // Update auth context
        setUser(response.user);
        toast({ title: "Success", description: response.message });
        // Navigate happens automatically due to useEffect
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      const errorMessage = error?.message || "An error occurred";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar settings={settings} />
      <div className="bg-background flex flex-col items-center justify-center px-2 sm:px-4 py-4 sm:py-6 md:py-8 min-h-[calc(100vh-80px)] sm:min-h-[calc(100vh-80px)] md:min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md">
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          {logoUrl && <img src={logoUrl} alt={storeName} className="h-14 sm:h-16 md:h-20 w-auto mx-auto mb-1.5 sm:mb-2" />}
        </div>

        <div className="bg-card rounded-lg p-4 sm:p-6 md:p-8 shadow-lg border border-border">
          <h2 className="font-display text-lg sm:text-xl md:text-2xl font-semibold text-foreground text-center mb-4 sm:mb-5 md:mb-6">
            {isForgot ? "Reset Password" : isLogin ? "Welcome Back" : "Create Account"}
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
                placeholder="your@email.com"
              />
            </div>
            {!isForgot && (
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
            )}
            {isLogin && !isForgot && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setIsForgot(true)}
                  className="text-[10px] sm:text-xs text-primary hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 sm:py-2.5 md:py-3 bg-primary text-primary-foreground font-medium text-xs sm:text-sm tracking-wide rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? "Please wait..." : isForgot ? "Send Reset Link" : isLogin ? "Sign In" : "Sign Up"}
            </button>
          </form>

          <p className="text-center text-xs sm:text-sm text-muted-foreground mt-4 sm:mt-5 md:mt-6">
            {isForgot ? (
              <button onClick={() => setIsForgot(false)} className="text-primary font-medium hover:underline">
                Back to Sign In
              </button>
            ) : (
              <>
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary font-medium hover:underline"
                >
                  {isLogin ? "Sign Up" : "Sign In"}
                </button>
              </>
            )}
          </p>
        </div>
        </div>
      </div>
    </>
  );
};

export default Auth;
