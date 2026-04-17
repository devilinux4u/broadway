import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import userAuthAPI from "@/services/authAPI";
import logoImage from "@/assets/logo-new.png";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token") || "";

    if (token) {
      setResetToken(token);
      setReady(true);
    } else {
      toast({ title: "Invalid reset link", description: "Reset token is missing.", variant: "destructive" });
      navigate("/auth");
    }
  }, [navigate]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { toast({ title: "Password must be at least 6 characters" }); return; }
    if (!resetToken) { toast({ title: "Invalid reset link", variant: "destructive" }); return; }
    setLoading(true);

    try {
      await userAuthAPI.resetPassword(resetToken, password);
      toast({ title: "Password updated!", description: "You can now sign in with your new password." });
      navigate("/auth");
    } catch (error: any) {
      toast({ title: "Error", description: error?.message || "Failed to reset password", variant: "destructive" });
    }

    setLoading(false);
  };

  if (!ready) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <img src={logoImage} alt="Logo" className="h-20 w-auto mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logoImage} alt="Logo" className="h-20 w-auto mx-auto mb-2" />
          <p className="font-script text-xl text-muted-foreground">for the beautiful you</p>
        </div>
        <div className="bg-card rounded-lg p-8 shadow-lg border border-border">
          <h2 className="font-display text-2xl font-semibold text-foreground text-center mb-6">Set New Password</h2>
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">New Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6}
                className="w-full px-4 py-2.5 rounded-sm border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring" placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-primary-foreground font-medium text-sm tracking-wide rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
