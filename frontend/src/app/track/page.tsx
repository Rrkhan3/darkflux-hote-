"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { getOrderByNumber, createWebSocket } from "@/lib/api";
import type { Order } from "@/lib/api";
import { Search, Clock, ChefHat, CheckCircle, Truck, XCircle } from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Clock; color: string; step: number }> = {
  pending: { label: "Pending", icon: Clock, color: "text-yellow-500", step: 1 },
  cooking: { label: "Cooking", icon: ChefHat, color: "text-orange-500", step: 2 },
  ready: { label: "Ready", icon: CheckCircle, color: "text-green-500", step: 3 },
  delivered: { label: "Delivered", icon: Truck, color: "text-blue-500", step: 4 },
  cancelled: { label: "Cancelled", icon: XCircle, color: "text-red-500", step: 0 },
};

function TrackContent() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get("order") || "");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchOrder = useCallback(async (num: string) => {
    if (!num.trim()) return;
    setLoading(true);
    setError("");
    try {
      const o = await getOrderByNumber(num.trim());
      setOrder(o);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order not found");
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const num = searchParams.get("order");
    if (num) {
      setOrderNumber(num);
      fetchOrder(num);
    }
  }, [searchParams, fetchOrder]);

  useEffect(() => {
    const ws = createWebSocket("customer", (data) => {
      if (
        data.type === "order_status_update" &&
        order &&
        (data.order as Order)?.order_number === order.order_number
      ) {
        setOrder(data.order as Order);
      }
    });
    return () => ws.close();
  }, [order]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrder(orderNumber);
  };

  const status = order ? STATUS_CONFIG[order.status] : null;

  return (
    <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-8 w-full">
      <h1 className="text-3xl font-bold text-center mb-6">Track Your Order</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-fg" size={18} />
          <input
            type="text"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-card border border-card-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter order number (e.g., ORD-...)"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {loading ? "..." : "Track"}
        </button>
      </form>

      {error && (
        <div className="text-center py-8 text-danger">{error}</div>
      )}

      {order && status && (
        <div className="bg-card border border-card-border rounded-2xl p-6 shadow-sm">
          <div className="text-center mb-6">
            <status.icon className={`mx-auto ${status.color} mb-2`} size={48} />
            <h2 className="text-xl font-bold">{status.label}</h2>
            <p className="text-muted-fg text-sm">{order.order_number}</p>
          </div>

          {/* Progress Bar */}
          {order.status !== "cancelled" && (
            <div className="flex items-center justify-between mb-8 px-4">
              {["pending", "cooking", "ready", "delivered"].map((s, i) => {
                const cfg = STATUS_CONFIG[s];
                const isActive = (status?.step ?? 0) >= cfg.step;
                return (
                  <div key={s} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isActive ? "bg-primary text-white" : "bg-muted text-muted-fg"
                        }`}
                      >
                        <cfg.icon size={18} />
                      </div>
                      <span className="text-xs mt-1 text-muted-fg">{cfg.label}</span>
                    </div>
                    {i < 3 && (
                      <div
                        className={`h-1 flex-1 mx-2 rounded ${
                          (status?.step ?? 0) > cfg.step ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Order Details */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-fg">Order Type</span>
              <span className="capitalize">{order.order_type.replace("_", " ")}</span>
            </div>
            {order.table_number && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-fg">Table</span>
                <span>{order.table_number}</span>
              </div>
            )}
            {order.room_number && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-fg">Room</span>
                <span>{order.room_number}</span>
              </div>
            )}
            <hr className="border-card-border" />
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.item_name} x{item.quantity}
                </span>
                <span>Rs. {item.total_price.toFixed(2)}</span>
              </div>
            ))}
            <hr className="border-card-border" />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span className="text-primary">Rs. {order.total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function TrackPage() {
  return (
    <>
      <Navbar />
      <Suspense fallback={<div className="flex-1 flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" /></div>}>
        <TrackContent />
      </Suspense>
    </>
  );
}
