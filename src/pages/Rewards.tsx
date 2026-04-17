import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Gift, Star, ArrowUpRight, ArrowDownRight } from "lucide-react";
import MembershipCard from "@/components/MembershipCard";

interface RewardPoints {
  points: number;
  total_earned: number;
  total_redeemed: number;
}

interface RewardHistoryItem {
  id: string;
  points: number;
  type: string;
  description: string;
  created_at: string;
}

const Rewards = () => {
  const { settings } = useSiteSettings();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rewards, setRewards] = useState<RewardPoints | null>(null);
  const [history, setHistory] = useState<RewardHistoryItem[]>([]);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    setRewards({ points: 0, total_earned: 0, total_redeemed: 0 });
    setHistory([]);
  }, [user]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-2xl">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-8 flex items-center gap-3">
            <Gift className="text-primary" /> My Rewards
          </h1>

          <div className="bg-secondary rounded-sm p-4 mb-6 text-sm text-muted-foreground">
            Rewards are being migrated to the Go backend. Data will appear here once the backend rewards module is enabled.
          </div>

          {/* Membership Card */}
          <MembershipCard
            email={user.email || "Member"}
            points={rewards?.points ?? 0}
            totalEarned={rewards?.total_earned ?? 0}
            memberId={user.id}
          />

          {/* Points Summary */}
          <div className="grid grid-cols-3 gap-4 mb-10">
            <div className="bg-secondary rounded-sm p-5 text-center">
              <Star className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{rewards?.points ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Available Points</p>
            </div>
            <div className="bg-secondary rounded-sm p-5 text-center">
              <ArrowUpRight className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{rewards?.total_earned ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Total Earned</p>
            </div>
            <div className="bg-secondary rounded-sm p-5 text-center">
              <ArrowDownRight className="w-6 h-6 text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold text-foreground">{rewards?.total_redeemed ?? 0}</p>
              <p className="text-xs text-muted-foreground mt-1">Redeemed</p>
            </div>
          </div>

          {/* How it works */}
          <div className="bg-secondary rounded-sm p-6 mb-10">
            <h2 className="font-display text-lg font-semibold text-foreground mb-3">How Rewards Work</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Earn <strong className="text-foreground">1 point</strong> for every Rs. 100 spent</li>
              <li>• <strong className="text-foreground">100 points</strong> = Rs. 50 discount</li>
              <li>• Points never expire as long as your account is active</li>
              <li>• Redeem points at checkout on your next order</li>
            </ul>
          </div>

          {/* History */}
          <h2 className="font-display text-xl font-semibold text-foreground mb-4">Points History</h2>
          {history.length === 0 ? (
            <p className="text-center text-muted-foreground py-10">No reward history yet. Place your first order to start earning!</p>
          ) : (
            <div className="space-y-3">
              {history.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-secondary rounded-sm">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.description}</p>
                    <p className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-sm font-semibold ${item.type === "earned" ? "text-green-600" : "text-destructive"}`}>
                    {item.type === "earned" ? "+" : "-"}{item.points} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer settings={settings} />
    </div>
  );
};

export default Rewards;
