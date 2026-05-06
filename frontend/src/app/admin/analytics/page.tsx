"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { getAnalytics } from "@/lib/api";
import type { Analytics } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Clock,
  Receipt,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

export default function AnalyticsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/login");
      return;
    }
    if (user) {
      getAnalytics()
        .then(setAnalytics)
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user, authLoading, router]);

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

  if (!analytics) return null;

  const recentDailySales = analytics.daily_sales.slice(-14);

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/admin" className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-bold">Sales Analytics</h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            {
              label: "Today's Sales",
              value: `Rs. ${analytics.today_sales.toFixed(0)}`,
              icon: DollarSign,
              color: "text-green-500",
            },
            {
              label: "Today's Orders",
              value: analytics.today_orders.toString(),
              icon: ShoppingBag,
              color: "text-blue-500",
            },
            {
              label: "This Week",
              value: `Rs. ${analytics.week_sales.toFixed(0)}`,
              icon: TrendingUp,
              color: "text-purple-500",
            },
            {
              label: "This Month",
              value: `Rs. ${analytics.month_sales.toFixed(0)}`,
              icon: TrendingUp,
              color: "text-cyan-500",
            },
            {
              label: "Pending / Unpaid",
              value: `${analytics.pending_orders} / ${analytics.unpaid_bills}`,
              icon: Clock,
              color: "text-yellow-500",
            },
          ].map((card) => (
            <div
              key={card.label}
              className="bg-card border border-card-border rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <card.icon className={card.color} size={18} />
                <span className="text-xs text-muted-fg">{card.label}</span>
              </div>
              <p className="text-xl font-bold">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Daily Sales Chart */}
          <div className="bg-card border border-card-border rounded-xl p-5">
            <h3 className="text-lg font-semibold mb-4">Daily Sales (Last 14 Days)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={recentDailySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(d: string) => d.slice(5)}
                  fontSize={12}
                />
                <YAxis fontSize={12} />
                <Tooltip
                  formatter={(value) => [`Rs. ${Number(value).toFixed(0)}`, "Sales"]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="total_sales"
                  stroke="#f97316"
                  strokeWidth={2}
                  dot={{ fill: "#f97316" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Top Items Chart */}
          <div className="bg-card border border-card-border rounded-xl p-5">
            <h3 className="text-lg font-semibold mb-4">Top Selling Items</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.top_items.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="item_name"
                  width={120}
                  fontSize={11}
                />
                <Tooltip
                  formatter={(value) => [Number(value), "Qty Sold"]}
                />
                <Bar dataKey="quantity_sold" fill="#f97316" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Staff Performance */}
        <div className="bg-card border border-card-border rounded-xl p-5 mb-8">
          <h3 className="text-lg font-semibold mb-4">Staff Performance</h3>
          {analytics.staff_performance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted-fg">Rank</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-fg">Staff</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-fg">Orders</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-fg">Total Sales</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border">
                  {analytics.staff_performance.map((sp, i) => (
                    <tr key={sp.staff_id} className="hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <span className={`${i < 3 ? "text-primary font-bold" : ""}`}>
                          #{i + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium">{sp.staff_name}</td>
                      <td className="px-4 py-3">{sp.order_count}</td>
                      <td className="px-4 py-3 font-medium">
                        Rs. {sp.total_sales.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-muted-fg py-4">No staff data yet</p>
          )}
        </div>
      </main>
    </>
  );
}
