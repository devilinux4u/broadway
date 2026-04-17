import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { UserPlus, Users, Mail, Shield, Trash2 } from "lucide-react";

interface UserRole {
  id: string;
  user_id: string;
  role: string;
  email?: string;
}

const roleLabels: Record<string, string> = {
  admin: "Admin",
  moderator: "Moderator",
  user: "User",
  order_taker: "Order Taker",
  dispatcher: "Dispatcher",
  content_manager: "Content Manager",
};

const roleDescriptions: Record<string, string> = {
  admin: "Full access to all features, can manage users",
  order_taker: "Can create manual orders (social media, phone, walk-in)",
  dispatcher: "Can view orders, manage inventory, and dispatch",
  content_manager: "Can edit site content, images, and featured products",
  moderator: "Moderate content and manage limited features",
  user: "Regular user access",
};

const assignableRoles = ["order_taker", "dispatcher", "content_manager", "admin"];

const AdminUsers = () => {
  const [users, setUsers] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [form, setForm] = useState({ email: "", role: "order_taker" });

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    // User management endpoints are not wired yet in the Go backend.
    setUsers([]);
    setLoading(false);
  };

  const handleInvite = async () => {
    if (!form.email) { toast({ title: "Email is required" }); return; }
    setInviting(true);

    try {
      toast({
        title: "Not available yet",
        description: "User invite will be enabled after the Go backend user-management module is added.",
      });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }

    setInviting(false);
  };

  const handleRemoveRole = async (roleId: string) => {
    toast({
      title: "Not available yet",
      description: "Role removal will be enabled after the Go backend user-management module is added.",
    });
  };

  if (loading) return <p className="text-muted-foreground text-center py-10">Loading users...</p>;

  return (
    <div className="space-y-6">
      {/* Role Descriptions */}
      <div className="bg-secondary/50 border border-border rounded-sm p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Role Workflow</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {assignableRoles.map(role => (
            <div key={role} className="bg-background rounded-sm p-3 border border-border">
              <div className="flex items-center gap-2 mb-1">
                <Shield size={14} className="text-primary" />
                <span className="text-sm font-medium text-foreground">{roleLabels[role]}</span>
              </div>
              <p className="text-xs text-muted-foreground">{roleDescriptions[role]}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
          <Users size={20} /> Team Members ({users.length})
        </h2>
        <button onClick={() => setShowInvite(!showInvite)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-sm hover:bg-primary/90 transition-colors">
          <UserPlus size={16} /> Invite User
        </button>
      </div>

      {showInvite && (
        <div className="bg-secondary p-5 rounded-sm space-y-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Invite New User</h3>
          <p className="text-xs text-muted-foreground">The user will receive an email invitation to set up their account.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Email Address *</label>
              <input
                placeholder="user@example.com"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 border border-input rounded-sm bg-background text-foreground text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Role *</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full px-4 py-3 border border-input rounded-sm bg-background text-foreground text-sm"
              >
                {assignableRoles.map(r => (
                  <option key={r} value={r}>{roleLabels[r]}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleInvite} disabled={inviting} className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-sm hover:bg-primary/90 disabled:opacity-50">
              <Mail size={14} /> {inviting ? "Sending..." : "Send Invite"}
            </button>
            <button onClick={() => setShowInvite(false)} className="px-6 py-2 border border-input text-foreground text-sm rounded-sm hover:bg-secondary">Cancel</button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-card rounded-sm border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr>
                <th className="text-left p-4 font-medium text-foreground">User ID</th>
                <th className="text-left p-4 font-medium text-foreground">Role</th>
                <th className="text-right p-4 font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((ur) => (
                <tr key={ur.id} className="border-t border-border">
                  <td className="p-4 text-foreground font-mono text-xs">{ur.user_id.slice(0, 8)}...</td>
                  <td className="p-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-sm ${
                      ur.role === 'admin' ? 'bg-primary/10 text-primary' :
                      ur.role === 'order_taker' ? 'bg-accent/10 text-accent-foreground' :
                      ur.role === 'dispatcher' ? 'bg-chart-4/10 text-chart-4' :
                      'bg-secondary text-foreground'
                    }`}>
                      {roleLabels[ur.role] || ur.role}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button onClick={() => handleRemoveRole(ur.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">No users with roles yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
