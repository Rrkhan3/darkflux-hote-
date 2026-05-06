"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { getOrders, updateOrderStatus, createWebSocket } from "@/lib/api";
import type { Order } from "@/lib/api";
import ThemeToggle from "@/components/ui/ThemeToggle";
import {
  ChefHat,
  Clock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  UtensilsCrossed,
  LogOut,
} from "lucide-react";

export default function KitchenPage() {
  const { user, logout, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      const allOrders = await getOrders();
      setOrders(
        allOrders.filter((o) => ["pending", "cooking", "ready"].includes(o.status))
      );
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== "kitchen" && user.role !== "admin"))) {
      router.push("/login");
      return;
    }
    if (user) fetchOrders();
  }, [user, authLoading, router, fetchOrders]);

  useEffect(() => {
    const ws = createWebSocket("kitchen", (data) => {
      if (data.type === "new_order" || data.type === "order_status_update") {
        fetchOrders();
      }
    });
    return () => ws.close();
  }, [fetchOrders]);

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      fetchOrders();
    } catch {
      // ignore
    }
  };

  const getTimeSince = (dateStr: string | null) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
  };

  const isUrgent = (dateStr: string | null) => {
    if (!dateStr) return false;
    return Date.now() - new Date(dateStr).getTime() > 15 * 60000;
  };

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const cookingOrders = orders.filter((o) => o.status === "cooking");
  const readyOrders = orders.filter((o) => o.status === "ready");

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Kitchen Header */}
      <header className="bg-card border-b border-card-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ChefHat className="text-primary" size={28} />
            <h1 className="text-xl font-bold">Kitchen Display System</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-fg">
              {pendingOrders.length} pending &middot; {cookingOrders.length} cooking &middot; {readyOrders.length} ready
            </span>
            <button
              onClick={fetchOrders}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <RefreshCw size={18} />
            </button>
            <ThemeToggle />
            <button
              onClick={() => { logout(); router.push("/login"); }}
              className="p-2 hover:bg-muted rounded-lg transition-colors text-danger"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Kitchen Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
        {/* Pending Column */}
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold mb-3 text-yellow-500">
            <Clock size={20} /> New Orders ({pendingOrders.length})
          </h2>
          <div className="space-y-3">
            {pendingOrders.map((order) => (
              <div
                key={order.id}
                className={`bg-card border-2 rounded-xl p-4 ${
                  isUrgent(order.created_at)
                    ? "border-danger animate-pulse-border"
                    : "border-yellow-400"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-lg">#{order.order_number.split("-").pop()}</span>
                  <span className="text-xs text-muted-fg">
                    {getTimeSince(order.created_at)}
                  </span>
                </div>
                {isUrgent(order.created_at) && (
                  <div className="flex items-center gap-1 text-danger text-xs mb-2">
                    <AlertTriangle size={14} /> URGENT
                  </div>
                )}
                <div className="text-sm text-muted-fg mb-2">
                  {order.table_number && `Table ${order.table_number}`}
                  {order.room_number && `Room ${order.room_number}`}
                  {!order.table_number && !order.room_number && "Takeaway"}
                </div>
                <div className="space-y-1 mb-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="font-medium">
                        {item.quantity}x {item.item_name}
                      </span>
                      {item.notes && (
                        <span className="text-xs text-muted-fg italic">
                          {item.notes}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
                {order.special_instructions && (
                  <p className="text-xs text-muted-fg italic mb-3 bg-muted p-2 rounded">
                    Note: {order.special_instructions}
                  </p>
                )}
                <button
                  onClick={() => handleStatusUpdate(order.id, "cooking")}
                  className="w-full py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                >
                  <UtensilsCrossed size={16} /> Start Cooking
                </button>
              </div>
            ))}
            {pendingOrders.length === 0 && (
              <p className="text-center text-muted-fg py-8">No pending orders</p>
            )}
          </div>
        </div>

        {/* Cooking Column */}
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold mb-3 text-orange-500">
            <ChefHat size={20} /> Cooking ({cookingOrders.length})
          </h2>
          <div className="space-y-3">
            {cookingOrders.map((order) => (
              <div
                key={order.id}
                className="bg-card border-2 border-orange-400 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-lg">#{order.order_number.split("-").pop()}</span>
                  <span className="text-xs text-muted-fg">
                    {getTimeSince(order.created_at)}
                  </span>
                </div>
                <div className="text-sm text-muted-fg mb-2">
                  {order.table_number && `Table ${order.table_number}`}
                  {order.room_number && `Room ${order.room_number}`}
                  {!order.table_number && !order.room_number && "Takeaway"}
                </div>
                <div className="space-y-1 mb-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="text-sm font-medium">
                      {item.quantity}x {item.item_name}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleStatusUpdate(order.id, "ready")}
                  className="w-full py-2.5 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle size={16} /> Mark Ready
                </button>
              </div>
            ))}
            {cookingOrders.length === 0 && (
              <p className="text-center text-muted-fg py-8">Nothing cooking</p>
            )}
          </div>
        </div>

        {/* Ready Column */}
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold mb-3 text-green-500">
            <CheckCircle size={20} /> Ready ({readyOrders.length})
          </h2>
          <div className="space-y-3">
            {readyOrders.map((order) => (
              <div
                key={order.id}
                className="bg-card border-2 border-green-400 rounded-xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-lg">#{order.order_number.split("-").pop()}</span>
                  <span className="text-xs text-muted-fg">
                    {getTimeSince(order.created_at)}
                  </span>
                </div>
                <div className="text-sm text-muted-fg mb-2">
                  {order.table_number && `Table ${order.table_number}`}
                  {order.room_number && `Room ${order.room_number}`}
                  {!order.table_number && !order.room_number && "Takeaway"}
                </div>
                <div className="space-y-1 mb-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="text-sm font-medium">
                      {item.quantity}x {item.item_name}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleStatusUpdate(order.id, "delivered")}
                  className="w-full py-2.5 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                  Mark Delivered
                </button>
              </div>
            ))}
            {readyOrders.length === 0 && (
              <p className="text-center text-muted-fg py-8">No orders ready</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
