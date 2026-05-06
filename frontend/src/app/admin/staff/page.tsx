"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "@/lib/api";
import type { User } from "@/lib/api";
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  Shield,
  ChefHat,
  User as UserIcon,
  X,
} from "lucide-react";
import Link from "next/link";

const ROLE_ICONS: Record<string, typeof Shield> = {
  admin: Shield,
  staff: UserIcon,
  kitchen: ChefHat,
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  staff: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  kitchen: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
};

export default function StaffPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState({
    username: "",
    full_name: "",
    email: "",
    password: "",
    role: "staff" as "admin" | "staff" | "kitchen",
  });

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/login");
      return;
    }
    if (user) {
      getUsers()
        .then(setUsers)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await updateUser(editingUser.id, {
          full_name: form.full_name,
          email: form.email || null,
          role: form.role,
        });
      } else {
        await createUser({
          username: form.username,
          full_name: form.full_name,
          email: form.email || null,
          password: form.password,
          role: form.role,
        });
      }
      const updated = await getUsers();
      setUsers(updated);
      setShowForm(false);
      setEditingUser(null);
      setForm({ username: "", full_name: "", email: "", password: "", role: "staff" });
    } catch {
      // ignore
    }
  };

  const handleEdit = (u: User) => {
    setEditingUser(u);
    setForm({
      username: u.username,
      full_name: u.full_name,
      email: u.email || "",
      password: "",
      role: u.role,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(id);
      setUsers(users.filter((u) => u.id !== id));
    } catch {
      // ignore
    }
  };

  const handleToggleActive = async (u: User) => {
    try {
      await updateUser(u.id, { is_active: !u.is_active });
      const updated = await getUsers();
      setUsers(updated);
    } catch {
      // ignore
    }
  };

  if (authLoading || loading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" />
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-muted rounded-lg transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-3xl font-bold">Staff Management</h1>
          </div>
          <button
            onClick={() => {
              setEditingUser(null);
              setForm({ username: "", full_name: "", email: "", password: "", role: "staff" });
              setShowForm(true);
            }}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
            <Plus size={16} /> Add Staff
          </button>
        </div>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-card-border rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">
                  {editingUser ? "Edit Staff" : "Add New Staff"}
                </h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="p-1 hover:bg-muted rounded"
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Username</label>
                    <input
                      type="text"
                      value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      className="w-full px-3 py-2 bg-muted border border-card-border rounded-lg text-sm"
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1">Full Name</label>
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    className="w-full px-3 py-2 bg-muted border border-card-border rounded-lg text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-3 py-2 bg-muted border border-card-border rounded-lg text-sm"
                  />
                </div>
                {!editingUser && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full px-3 py-2 bg-muted border border-card-border rounded-lg text-sm"
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value as "admin" | "staff" | "kitchen" })}
                    className="w-full px-3 py-2 bg-muted border border-card-border rounded-lg text-sm"
                  >
                    <option value="staff">Staff (Waiter)</option>
                    <option value="kitchen">Kitchen</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 py-2.5 bg-muted rounded-lg font-medium hover:bg-card-border transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
                  >
                    {editingUser ? "Update" : "Create"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Staff Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((u) => {
            const RoleIcon = ROLE_ICONS[u.role] || UserIcon;
            return (
              <div
                key={u.id}
                className={`bg-card border border-card-border rounded-xl p-5 ${
                  !u.is_active ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                      <RoleIcon size={20} className="text-muted-fg" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{u.full_name}</h3>
                      <p className="text-xs text-muted-fg">@{u.username}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[u.role] || ""}`}>
                    {u.role}
                  </span>
                </div>

                {u.email && (
                  <p className="text-sm text-muted-fg mb-2">{u.email}</p>
                )}

                <div className="flex items-center gap-1 mb-3">
                  {u.is_active ? (
                    <span className="text-xs text-green-600 flex items-center gap-1">
                      <UserCheck size={14} /> Active
                    </span>
                  ) : (
                    <span className="text-xs text-red-500 flex items-center gap-1">
                      <UserX size={14} /> Inactive
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(u)}
                    className="flex-1 py-2 bg-muted rounded-lg text-xs font-medium hover:bg-card-border transition-colors flex items-center justify-center gap-1"
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                  <button
                    onClick={() => handleToggleActive(u)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                      u.is_active
                        ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400"
                        : "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400"
                    }`}
                  >
                    {u.is_active ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    onClick={() => handleDelete(u.id)}
                    className="py-2 px-3 bg-red-100 text-red-600 rounded-lg text-xs hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {users.length === 0 && (
          <div className="text-center py-12 text-muted-fg">No staff members found</div>
        )}
      </main>
    </>
  );
}
