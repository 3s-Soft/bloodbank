"use client";

import { Button } from "@/components/ui/button";
import {
    Users,
    Search,
    UserPlus,
    Shield,
    Droplet,
    Heart,
    Phone,
    Mail,
    Trash2,
    CheckCircle,
} from "lucide-react";
import { useState, useEffect, use } from "react";
import { useOrganization } from "@/lib/context/OrganizationContext";
import { toast } from "sonner";

interface DonorProfile {
    bloodGroup: string;
    isVerified: boolean;
    isAvailable: boolean;
}

interface User {
    _id: string;
    name: string;
    phone: string;
    email?: string;
    role: string;
    createdAt: string;
    donorProfile?: DonorProfile;
}

interface UserStats {
    total: number;
    donors: number;
    admins: number;
    patients: number;
    volunteers: number;
}

const roleColors: Record<string, { bg: string; text: string; border: string; icon: any }> = {
    donor: { bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20", icon: Droplet },
    admin: { bg: "bg-purple-500/10", text: "text-purple-400", border: "border-purple-500/20", icon: Shield },
    patient: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20", icon: Heart },
    volunteer: { bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20", icon: Users },
    super_admin: { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/20", icon: Shield },
};

export default function UsersManagementPage({
    params,
}: {
    params: Promise<{ orgSlug: string }>;
}) {
    const { orgSlug } = use(params);
    const org = useOrganization();
    const [users, setUsers] = useState<User[]>([]);
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [showAddModal, setShowAddModal] = useState(false);

    const primaryColor = org?.primaryColor || "#dc2626";

    const fetchUsers = async () => {
        try {
            const params = new URLSearchParams({ orgSlug });
            if (roleFilter !== "all") params.append("role", roleFilter);
            if (searchQuery) params.append("search", searchQuery);

            const res = await fetch(`/api/org/users?${params}`);
            const data = await res.json();
            setUsers(data.users || []);
            setStats(data.stats || null);
        } catch (error) {
            console.error("Failed to fetch users", error);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, [orgSlug, roleFilter, searchQuery]);

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (!confirm(`Are you sure you want to delete "${userName}"? This action cannot be undone.`)) return;
        try {
            const res = await fetch(`/api/org/users/${userId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");
            toast.success("User deleted successfully");
            fetchUsers();
        } catch (error) {
            toast.error("Failed to delete user");
        }
    };

    const handleUpdateRole = async (userId: string, newRole: string) => {
        try {
            const res = await fetch(`/api/org/users/${userId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ role: newRole }),
            });
            if (!res.ok) throw new Error("Failed to update");
            toast.success("User role updated");
            fetchUsers();
        } catch (error) {
            toast.error("Failed to update user");
        }
    };

    if (loading) {
        return (
            <div className="p-6 lg:p-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-10 w-64 bg-slate-800 rounded-xl" />
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-24 bg-slate-800/50 rounded-2xl" />
                        ))}
                    </div>
                    <div className="h-96 bg-slate-800/30 rounded-2xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white mb-1">User Management</h1>
                    <p className="text-sm text-slate-500 font-medium">Manage all users in your organization</p>
                </div>
                <Button onClick={() => setShowAddModal(true)} style={{ backgroundColor: primaryColor }} className="text-white hover:opacity-90">
                    <UserPlus className="w-4 h-4 mr-2" /> Add User
                </Button>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                        { label: "Total Users", value: stats.total, color: "text-blue-400", bg: "bg-blue-500/10", Icon: Users },
                        { label: "Donors", value: stats.donors, color: "text-red-400", bg: "bg-red-500/10", Icon: Droplet },
                        { label: "Admins", value: stats.admins, color: "text-purple-400", bg: "bg-purple-500/10", Icon: Shield },
                        { label: "Patients", value: stats.patients, color: "text-cyan-400", bg: "bg-cyan-500/10", Icon: Heart },
                        { label: "Volunteers", value: stats.volunteers, color: "text-emerald-400", bg: "bg-emerald-500/10", Icon: Users },
                    ].map((s, i) => (
                        <div key={i} className={`p-4 rounded-2xl ${s.bg} border border-slate-800 text-center`}>
                            <s.Icon className={`w-5 h-5 mx-auto mb-2 ${s.color}`} />
                            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{s.label}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-600" />
                    <input
                        type="text"
                        placeholder="Search by name or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-11 pl-12 pr-4 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-red-500/50 outline-none text-sm"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {["all", "donor", "admin", "patient", "volunteer"].map((role) => (
                        <button
                            key={role}
                            onClick={() => setRoleFilter(role)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${roleFilter === role
                                    ? "text-white shadow-lg"
                                    : "bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700"
                                }`}
                            style={roleFilter === role ? { backgroundColor: primaryColor } : {}}
                        >
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Users Table */}
            <div className="rounded-2xl bg-slate-900/50 border border-slate-800 overflow-hidden">
                {users.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Users className="w-8 h-8 text-slate-600" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">No users found</h3>
                        <p className="text-sm text-slate-500">{searchQuery ? "Try a different search term" : "Add your first user to get started."}</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-800/30">
                                    <th className="text-left py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">User</th>
                                    <th className="text-left py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Contact</th>
                                    <th className="text-center py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Role</th>
                                    <th className="text-center py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Blood</th>
                                    <th className="text-center py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                    <th className="text-left py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Joined</th>
                                    <th className="text-right py-3.5 px-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50">
                                {users.map((user) => {
                                    const roleConfig = roleColors[user.role] || roleColors.patient;
                                    const RoleIcon = roleConfig.icon;
                                    return (
                                        <tr key={user._id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="py-3.5 px-5">
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                                                        style={{ backgroundColor: primaryColor }}
                                                    >
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white text-sm">{user.name}</div>
                                                        <div className="text-[10px] text-slate-600">ID: {user._id.slice(-6)}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <div className="space-y-0.5">
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                                        <Phone className="w-3 h-3 opacity-50" /> {user.phone}
                                                    </div>
                                                    {user.email && (
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                            <Mail className="w-3 h-3 opacity-50" /> {user.email}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3.5 px-5 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${roleConfig.bg} ${roleConfig.text} ${roleConfig.border}`}>
                                                    <RoleIcon className="w-3 h-3" />
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="py-3.5 px-5 text-center">
                                                {user.donorProfile ? (
                                                    <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-white font-bold text-xs" style={{ backgroundColor: primaryColor }}>
                                                        {user.donorProfile.bloodGroup}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-600">—</span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-5 text-center">
                                                {user.donorProfile ? (
                                                    user.donorProfile.isVerified ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded-full border border-emerald-500/20">
                                                            <CheckCircle className="w-3 h-3" /> Verified
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] font-bold rounded-full border border-amber-500/20">
                                                            Pending
                                                        </span>
                                                    )
                                                ) : (
                                                    <span className="inline-flex px-2 py-0.5 bg-slate-700/50 text-slate-400 text-[10px] font-bold rounded-full border border-slate-600">
                                                        Active
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3.5 px-5 text-xs text-slate-500">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-3.5 px-5 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <select
                                                        value={user.role}
                                                        onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                                                        className="text-xs px-2 py-1 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 outline-none focus:border-slate-600"
                                                    >
                                                        <option value="donor">Donor</option>
                                                        <option value="patient">Patient</option>
                                                        <option value="volunteer">Volunteer</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="border-slate-700 text-red-400 hover:bg-red-500/10 hover:border-red-500/30"
                                                        onClick={() => handleDeleteUser(user._id, user.name)}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <AddUserModal
                    orgSlug={orgSlug}
                    primaryColor={primaryColor}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => { setShowAddModal(false); fetchUsers(); }}
                />
            )}
        </div>
    );
}

function AddUserModal({
    orgSlug, primaryColor, onClose, onSuccess,
}: {
    orgSlug: string; primaryColor: string; onClose: () => void; onSuccess: () => void;
}) {
    const [formData, setFormData] = useState({ name: "", phone: "", email: "", role: "patient" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch("/api/org/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...formData, orgSlug }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success("User created successfully");
            onSuccess();
        } catch (error: any) {
            toast.error(error.message || "Failed to create user");
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass = "w-full h-11 px-4 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-red-500/50 outline-none text-sm";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md mx-4 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-800">
                    <h2 className="text-xl font-black text-white">Add New User</h2>
                </div>
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Name *</label>
                            <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Phone *</label>
                            <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="017XXXXXXXX" className={inputClass} required />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Email</label>
                            <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Role *</label>
                            <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className={inputClass}>
                                <option value="patient">Patient</option>
                                <option value="donor">Donor</option>
                                <option value="volunteer">Volunteer</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div className="flex gap-3 pt-4">
                            <Button type="button" variant="outline" className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" className="flex-1 text-white hover:opacity-90" style={{ backgroundColor: primaryColor }} disabled={isSubmitting}>
                                {isSubmitting ? "Creating..." : "Create User"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
