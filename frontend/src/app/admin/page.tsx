"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import {
  getOrders,
  updateOrderStatus,
  createBill,
  createWebSocket,
} from "@/lib/api";
import type { Order } from "@/lib/api";
import {
  Clock,
  ChefHat,
  CheckCircle,
  Truck,
  XCircle,
  BarChart3,
  Users,
  Receipt,
  Filter,
} from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  cooking: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  ready: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  delivered: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

const STATUS_ICONS: Record<string, typeof Clock> = {
  pending: Clock,
  cooking: ChefHat,
  ready: CheckCircle,
  delivered: Truck,
  cancelled: XCircle,
};

export default function AdminPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      const data = await getOrders(statusFilter || undefined);
      setOrders(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== "admin" && user.role !== "staff"))) {
      router.push("/login");
      return;
    }
    if (user) fetchOrders();
  }, [user, authLoading, router, fetchOrders]);

  useEffect(() => {
    const ws = createWebSocket("admin", (data) => {
      if (data.type === "new_order" || data.type === "order_status_update") {
        fetchOrders();
      }
    });
    return () => ws.close();
  }, [fetchOrders]);

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      fetchOrders();
    } catch {
      // ignore
    }
  };

  const handleGenerateBill = async (orderId: number) => {
    try {
      await createBill({ order_id: orderId });
      router.push("/admin/bills");
    } catch {
      // ignore
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (dateFilter) {
      const orderDate = o.created_at ? new Date(o.created_at).toISOString().split("T")[0] : "";
      if (orderDate !== dateFilter) return false;
    }
    return true;
  });

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
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-2">
            <Link
              href="/admin/analytics"
              className="px-4 py-2 bg-card border border-card-border rounded-lg text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2"
            >
              <BarChart3 size={16} /> Analytics
            </Link>
            <Link
              href="/admin/bills"
              className="px-4 py-2 bg-card border border-card-border rounded-lg text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2"
            >
              <Receipt size={16} /> Bills
            </Link>
            <Link
              href="/admin/staff"
              className="px-4 py-2 bg-card border border-card-border rounded-lg text-sm font-medium hover:bg-muted transition-colors flex items-center gap-2"
            >
              <Users size={16} /> Staff
            </Link>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "Pending",
              count: orders.filter((o) => o.status === "pending").length,
              color: "text-yellow-500",
              icon: Clock,
            },
            {
              label: "Cooking",
              count: orders.filter((o) => o.status === "cooking").length,
              color: "text-orange-500",
              icon: ChefHat,
            },
            {
              label: "Ready",
              count: orders.filter((o) => o.status === "ready").length,
              color: "text-green-500",
              icon: CheckCircle,
            },
            {
              label: "Delivered",
              count: orders.filter((o) => o.status === "delivered").length,
              color: "text-blue-500",
              icon: Truck,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-card border border-card-border rounded-xl p-4"
            >
              <div className="flex items-center gap-2">
                <stat.icon className={stat.color} size={20} />
                <span className="text-sm text-muted-fg">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold mt-1">{stat.count}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6 items-center">
          <Filter size={18} className="text-muted-fg" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-card border border-card-border rounded-lg text-sm"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="cooking">Cooking</option>
            <option value="ready">Ready</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 bg-card border border-card-border rounded-lg text-sm"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter("")}
              className="text-sm text-primary hover:underline"
            >
              Clear date
            </button>
          )}
        </div>

        {/* Orders Table */}
        <div className="bg-card border border-card-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-fg">Order #</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-fg">Items</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-fg">Table/Room</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-fg">Total</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-fg">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-fg">Time</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-fg">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {filteredOrders.map((order) => {
                  const StatusIcon = STATUS_ICONS[order.status] || Clock;
                  return (
                    <tr key={order.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 font-medium">{order.order_number}</td>
                      <td className="px-4 py-3">
                        <div className="max-w-[200px]">
                          {order.items.map((i) => (
                            <span key={i.id} className="text-xs block">
                              {i.quantity}x {i.item_name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {order.table_number
                          ? `T-${order.table_number}`
                          : order.room_number
                          ? `R-${order.room_number}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        Rs. {order.total_amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            STATUS_COLORS[order.status] || ""
                          }`}
                        >
                          <StatusIcon size={12} />
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-fg">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleString()
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {order.status === "pending" && (
                            <button
                              onClick={() => handleStatusChange(order.id, "cooking")}
                              className="px-2 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600"
                            >
                              Cook
                            </button>
                          )}
                          {order.status === "cooking" && (
                            <button
                              onClick={() => handleStatusChange(order.id, "ready")}
                              className="px-2 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                            >
                              Ready
                            </button>
                          )}
                          {order.status === "ready" && (
                            <button
                              onClick={() => handleStatusChange(order.id, "delivered")}
                              className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                            >
                              Deliver
                            </button>
                          )}
                          {order.status === "delivered" && (
                            <button
                              onClick={() => handleGenerateBill(order.id)}
                              className="px-2 py-1 bg-primary text-white rounded text-xs hover:bg-primary-dark"
                            >
                              Bill
                            </button>
                          )}
                          {order.status !== "cancelled" && order.status !== "delivered" && (
                            <button
                              onClick={() => handleStatusChange(order.id, "cancelled")}
                              className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredOrders.length === 0 && (
            <div className="text-center py-8 text-muted-fg">No orders found</div>
          )}
        </div>
      </main>
    </>
  );
}
