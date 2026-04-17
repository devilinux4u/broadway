import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { Gift, Search, Plus, Minus, Bell } from "lucide-react";

interface RewardUser {
  user_id: string;
  points: number;
  total_earned: number;
  total_redeemed: number;
  updated_at: string;
  email?: string;
}

interface HistoryItem {
  id: string;
  user_id: string;
  points: number;
  type: string;
  description: string;
  created_at: string;
}

const AdminRewards = () => {
  const [users, setUsers] = useState<RewardUser[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [adjustPoints, setAdjustPoints] = useState(0);
  const [adjustReason, setAdjustReason] = useState("");
  const [adjusting, setAdjusting] = useState(false);
  const [activeView, setActiveView] = useState<"users" | "history">("users");
  const [notifying, setNotifying] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setUsers([]);
    setHistory([]);
    setLoading(false);
  };

  const handleAdjust = async (type: "add" | "deduct") => {
    if (!selectedUser || adjustPoints <= 0 || !adjustReason.trim()) {
      toast({ title: "Enter points amount and reason", variant: "destructive" });
      return;
    }
    setAdjusting(true);

    toast({
      title: "Not available yet",
      description: "Rewards management will be enabled after the Go backend rewards module is added.",
    });
    setAdjustPoints(0);
    setAdjustReason("");
    setSelectedUser(null);
    setAdjusting(false);
    loadData();
  };

  const sendReminders = async () => {
    setNotifying(true);
    try {
      toast({
        title: "Not available yet",
        description: "Reminder notifications will be enabled after the Go backend rewards module is added.",
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to send reminders", variant: "destructive" });
    }
    setNotifying(false);
  };

  const filteredUsers = users.filter(u =>
    u.user_id.toLowerCase().includes(search.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(search.toLowerCase())
  );

  const inputClass = "w-full px-4 py-3 border border-input rounded-sm bg-background text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-primary";

  if (loading) return <p className="text-muted-foreground text-center py-10">Loading rewards data...</p>;

  return (
    <div className="space-y-6">
      <div className="bg-secondary rounded-sm p-4 text-sm text-muted-foreground">
        Rewards admin is currently disabled while migrating fully to the Go backend.
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-sm p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{users.length}</p>
          <p className="text-xs text-muted-foreground">Users with Points</p>
        </div>
        <div className="bg-card border border-border rounded-sm p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{users.reduce((s, u) => s + u.points, 0).toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Total Active Points</p>
        </div>
        <div className="bg-card border border-border rounded-sm p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{users.reduce((s, u) => s + u.total_earned, 0).toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Total Earned (All Time)</p>
        </div>
        <div className="bg-card border border-border rounded-sm p-4 text-center">
          <p className="text-2xl font-bold text-foreground">{users.reduce((s, u) => s + u.total_redeemed, 0).toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Total Redeemed</p>
        </div>
      </div>

      {/* Actions bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-secondary p-1 rounded-sm">
          <button onClick={() => setActiveView("users")} className={`px-4 py-2 text-sm font-medium rounded-sm ${activeView === "users" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>
            Users
          </button>
          <button onClick={() => setActiveView("history")} className={`px-4 py-2 text-sm font-medium rounded-sm ${activeView === "history" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"}`}>
            History
          </button>
        </div>
        <button
          onClick={sendReminders}
          disabled={notifying}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground text-sm font-medium rounded-sm hover:bg-accent/80 disabled:opacity-50 ml-auto"
        >
          <Bell size={14} /> {notifying ? "Sending..." : "Notify Unused Points"}
        </button>
      </div>

      {/* Users View */}
      {activeView === "users" && (
        <div className="space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className={inputClass + " pl-10"}
            />
          </div>

          {/* Manual Adjust */}
          {selectedUser && (
            <div className="bg-secondary border border-border rounded-sm p-4 space-y-3">
              <h4 className="text-sm font-medium text-foreground">Adjust Points for {selectedUser.slice(0, 8)}...</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input type="number" min={1} value={adjustPoints || ""} onChange={e => setAdjustPoints(parseInt(e.target.value) || 0)} placeholder="Points" className={inputClass} />
                <input value={adjustReason} onChange={e => setAdjustReason(e.target.value)} placeholder="Reason" className={inputClass} />
                <div className="flex gap-2">
                  <button onClick={() => handleAdjust("add")} disabled={adjusting} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-primary text-primary-foreground text-sm rounded-sm hover:bg-primary/90 disabled:opacity-50">
                    <Plus size={14} /> Add
                  </button>
                  <button onClick={() => handleAdjust("deduct")} disabled={adjusting} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-destructive text-destructive-foreground text-sm rounded-sm hover:bg-destructive/90 disabled:opacity-50">
                    <Minus size={14} /> Deduct
                  </button>
                  <button onClick={() => setSelectedUser(null)} className="px-3 py-2 border border-input text-sm rounded-sm hover:bg-secondary">Cancel</button>
                </div>
              </div>
            </div>
          )}

          <div className="bg-card border border-border rounded-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="text-left p-3 font-medium text-foreground">User</th>
                  <th className="text-right p-3 font-medium text-foreground">Points</th>
                  <th className="text-right p-3 font-medium text-foreground hidden sm:table-cell">Earned</th>
                  <th className="text-right p-3 font-medium text-foreground hidden sm:table-cell">Redeemed</th>
                  <th className="text-right p-3 font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No reward users found</td></tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.user_id} className="border-b border-border hover:bg-secondary/30">
                      <td className="p-3">
                        <p className="text-foreground text-sm">{u.email || "Unknown"}</p>
                        <p className="text-muted-foreground font-mono text-[10px]">{u.user_id.slice(0, 8)}</p>
                      </td>
                      <td className="p-3 text-right font-semibold text-foreground">{u.points.toLocaleString()}</td>
                      <td className="p-3 text-right text-muted-foreground hidden sm:table-cell">{u.total_earned.toLocaleString()}</td>
                      <td className="p-3 text-right text-muted-foreground hidden sm:table-cell">{u.total_redeemed.toLocaleString()}</td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedUser(u.user_id)}
                          className="text-xs px-3 py-1 border border-input rounded-sm hover:bg-secondary text-foreground"
                        >
                          Adjust
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* History View */}
      {activeView === "history" && (
        <div className="bg-card border border-border rounded-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/50">
                <th className="text-left p-3 font-medium text-foreground">Date</th>
                <th className="text-left p-3 font-medium text-foreground">User</th>
                <th className="text-left p-3 font-medium text-foreground">Description</th>
                <th className="text-right p-3 font-medium text-foreground">Points</th>
              </tr>
            </thead>
            <tbody>
              {history.length === 0 ? (
                <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">No history yet</td></tr>
              ) : (
                history.map(h => (
                  <tr key={h.id} className="border-b border-border hover:bg-secondary/30">
                    <td className="p-3 text-muted-foreground text-xs">{new Date(h.created_at).toLocaleDateString()}</td>
                    <td className="p-3 text-foreground font-mono text-xs">{h.user_id.slice(0, 8)}...</td>
                    <td className="p-3 text-foreground">{h.description}</td>
                    <td className={`p-3 text-right font-semibold ${h.type === "earned" ? "text-green-600" : "text-destructive"}`}>
                      {h.type === "earned" ? "+" : "-"}{h.points}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminRewards;
