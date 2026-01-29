"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Users,
    Search,
    UserPlus,
    Shield,
    Droplet,
    Heart,
    User as UserIcon,
    Phone,
    Mail,
    MoreVertical,
    Trash2,
    Edit,
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

const roleColors: Record<string, { bg: string; text: string; icon: any }> = {
    donor: { bg: "bg-red-100", text: "text-red-700", icon: Droplet },
    admin: { bg: "bg-purple-100", text: "text-purple-700", icon: Shield },
    patient: { bg: "bg-blue-100", text: "text-blue-700", icon: Heart },
    volunteer: { bg: "bg-green-100", text: "text-green-700", icon: Users },
    super_admin: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Shield },
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
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const primaryColor = org?.primaryColor || "#D32F2F";

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

    useEffect(() => {
        fetchUsers();
    }, [orgSlug, roleFilter, searchQuery]);

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (!confirm(`Are you sure you want to delete "${userName}"? This action cannot be undone.`)) {
            return;
        }

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

    const filteredUsers = users;

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="animate-pulse space-y-8">
                    <div className="h-10 w-64 bg-neutral-200 rounded"></div>
                    <div className="grid grid-cols-5 gap-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="h-24 bg-neutral-200 rounded-2xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-4xl font-black text-neutral-900 mb-2">User Management</h1>
                    <p className="text-neutral-500 font-medium">
                        Manage all users in your organization.
                    </p>
                </div>
                <Button
                    onClick={() => setShowAddModal(true)}
                    style={{ backgroundColor: primaryColor }}
                    className="text-white"
                >
                    <UserPlus className="w-5 h-5 mr-2" />
                    Add User
                </Button>
            </div>

            {/* Stats */}
            {stats && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <Card className="border-none shadow-sm">
                        <CardContent className="p-4 text-center">
                            <Users className="w-6 h-6 mx-auto mb-2 text-neutral-600" />
                            <div className="text-2xl font-black text-neutral-900">{stats.total}</div>
                            <div className="text-xs text-neutral-500 font-medium">Total Users</div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm">
                        <CardContent className="p-4 text-center">
                            <Droplet className="w-6 h-6 mx-auto mb-2 text-red-600" />
                            <div className="text-2xl font-black text-red-600">{stats.donors}</div>
                            <div className="text-xs text-neutral-500 font-medium">Donors</div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm">
                        <CardContent className="p-4 text-center">
                            <Shield className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                            <div className="text-2xl font-black text-purple-600">{stats.admins}</div>
                            <div className="text-xs text-neutral-500 font-medium">Admins</div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm">
                        <CardContent className="p-4 text-center">
                            <Heart className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                            <div className="text-2xl font-black text-blue-600">{stats.patients}</div>
                            <div className="text-xs text-neutral-500 font-medium">Patients</div>
                        </CardContent>
                    </Card>
                    <Card className="border-none shadow-sm">
                        <CardContent className="p-4 text-center">
                            <Users className="w-6 h-6 mx-auto mb-2 text-green-600" />
                            <div className="text-2xl font-black text-green-600">{stats.volunteers}</div>
                            <div className="text-xs text-neutral-500 font-medium">Volunteers</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                        type="text"
                        placeholder="Search by name or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-12 pl-12 pr-4 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-red-500 outline-none"
                    />
                </div>
                <div className="flex gap-2">
                    {["all", "donor", "admin", "patient", "volunteer"].map((role) => (
                        <button
                            key={role}
                            onClick={() => setRoleFilter(role)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${roleFilter === role
                                    ? "text-white"
                                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                                }`}
                            style={roleFilter === role ? { backgroundColor: primaryColor } : {}}
                        >
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Users Table */}
            <Card className="border-none shadow-sm">
                <CardContent className="p-0">
                    {filteredUsers.length === 0 ? (
                        <div className="text-center py-16 text-neutral-500">
                            <Users className="w-16 h-16 mx-auto mb-4 text-neutral-300" />
                            <h3 className="text-lg font-bold text-neutral-900 mb-2">No users found</h3>
                            <p className="text-sm">
                                {searchQuery ? "Try a different search term" : "Add your first user to get started."}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-neutral-100 bg-neutral-50">
                                        <th className="text-left py-4 px-6 text-xs font-bold text-neutral-500 uppercase">User</th>
                                        <th className="text-left py-4 px-6 text-xs font-bold text-neutral-500 uppercase">Contact</th>
                                        <th className="text-center py-4 px-6 text-xs font-bold text-neutral-500 uppercase">Role</th>
                                        <th className="text-center py-4 px-6 text-xs font-bold text-neutral-500 uppercase">Blood Group</th>
                                        <th className="text-center py-4 px-6 text-xs font-bold text-neutral-500 uppercase">Status</th>
                                        <th className="text-left py-4 px-6 text-xs font-bold text-neutral-500 uppercase">Joined</th>
                                        <th className="text-right py-4 px-6 text-xs font-bold text-neutral-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-50">
                                    {filteredUsers.map((user) => {
                                        const roleConfig = roleColors[user.role] || roleColors.patient;
                                        const RoleIcon = roleConfig.icon;

                                        return (
                                            <tr key={user._id} className="hover:bg-neutral-50">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                                                            style={{ backgroundColor: primaryColor }}
                                                        >
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-neutral-900">{user.name}</div>
                                                            <div className="text-xs text-neutral-500">ID: {user._id.slice(-6)}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-sm text-neutral-700">
                                                            <Phone className="w-3.5 h-3.5" />
                                                            {user.phone}
                                                        </div>
                                                        {user.email && (
                                                            <div className="flex items-center gap-2 text-sm text-neutral-500">
                                                                <Mail className="w-3.5 h-3.5" />
                                                                {user.email}
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${roleConfig.bg} ${roleConfig.text}`}>
                                                        <RoleIcon className="w-3.5 h-3.5" />
                                                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    {user.donorProfile ? (
                                                        <span
                                                            className="inline-flex items-center justify-center w-10 h-10 rounded-full text-white font-bold text-sm"
                                                            style={{ backgroundColor: primaryColor }}
                                                        >
                                                            {user.donorProfile.bloodGroup}
                                                        </span>
                                                    ) : (
                                                        <span className="text-neutral-400">—</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6 text-center">
                                                    {user.donorProfile ? (
                                                        user.donorProfile.isVerified ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                                                <CheckCircle className="w-3.5 h-3.5" />
                                                                Verified
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                                                                Pending
                                                            </span>
                                                        )
                                                    ) : (
                                                        <span className="inline-flex px-2 py-1 bg-neutral-100 text-neutral-600 text-xs font-bold rounded-full">
                                                            Active
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6 text-sm text-neutral-600">
                                                    {new Date(user.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <select
                                                            value={user.role}
                                                            onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                                                            className="text-xs px-2 py-1 rounded border border-neutral-200 bg-white"
                                                        >
                                                            <option value="donor">Donor</option>
                                                            <option value="patient">Patient</option>
                                                            <option value="volunteer">Volunteer</option>
                                                            <option value="admin">Admin</option>
                                                        </select>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-red-600 hover:bg-red-50"
                                                            onClick={() => handleDeleteUser(user._id, user.name)}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
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
                </CardContent>
            </Card>

            {/* Add User Modal */}
            {showAddModal && (
                <AddUserModal
                    orgSlug={orgSlug}
                    primaryColor={primaryColor}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                        fetchUsers();
                    }}
                />
            )}
        </div>
    );
}

// Add User Modal Component
function AddUserModal({
    orgSlug,
    primaryColor,
    onClose,
    onSuccess,
}: {
    orgSlug: string;
    primaryColor: string;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        email: "",
        role: "patient",
    });
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

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="w-full max-w-md mx-4 border-none shadow-2xl">
                <CardHeader>
                    <CardTitle className="text-xl font-bold">Add New User</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Name *</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full h-11 px-4 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-red-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Phone *</label>
                            <input
                                type="text"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="017XXXXXXXX"
                                className="w-full h-11 px-4 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-red-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full h-11 px-4 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-red-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Role *</label>
                            <select
                                value={formData.role}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                className="w-full h-11 px-4 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-red-500 outline-none"
                            >
                                <option value="patient">Patient</option>
                                <option value="donor">Donor</option>
                                <option value="volunteer">Volunteer</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div className="flex gap-3 pt-4">
                            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 text-white"
                                style={{ backgroundColor: primaryColor }}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Creating..." : "Create User"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
