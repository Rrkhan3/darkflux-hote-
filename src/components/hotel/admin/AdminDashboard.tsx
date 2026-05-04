'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DollarSign,
  CalendarCheck,
  ShoppingCart,
  Users,
  TrendingUp,
  Star,
  UtensilsCrossed,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format } from 'date-fns';

interface DashboardData {
  stats: {
    totalBookings: number;
    totalFoodOrders: number;
    totalUsers: number;
    totalRooms: number;
    totalFoodItems: number;
    roomRevenue: number;
    foodRevenue: number;
    totalRevenue: number;
    activeBookings: number;
    activeOrders: number;
  };
  recentBookings: Array<{
    id: string;
    checkIn: string;
    checkOut: string;
    status: string;
    totalPrice: number;
    createdAt: string;
    user: { name: string };
    room: { name: string; type: string };
  }>;
  recentOrders: Array<{
    id: string;
    status: string;
    totalAmount: number;
    createdAt: string;
    roomNumber: string | null;
    user: { name: string };
    items: Array<{ quantity: number; foodItem: { name: string } }>;
  }>;
  popularFood: Array<{
    id: string;
    name: string;
    orderCount: number;
    rating: number;
    price: number;
  }>;
  monthlyBookings: Array<{ totalPrice: number; createdAt: string }>;
  monthlyFoodOrders: Array<{ totalAmount: number; createdAt: string }>;
}

const PIE_COLORS = ['#f59e0b', '#10b981', '#8b5cf6', '#f43f5e', '#06b6d4'];

const statusColors: Record<string, string> = {
  confirmed: 'bg-emerald-500/20 text-emerald-400',
  checked_in: 'bg-blue-500/20 text-blue-400',
  checked_out: 'bg-neutral-500/20 text-neutral-400',
  cancelled: 'bg-red-500/20 text-red-400',
  preparing: 'bg-amber-500/20 text-amber-400',
  on_the_way: 'bg-blue-500/20 text-blue-400',
  delivered: 'bg-emerald-500/20 text-emerald-400',
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/dashboard');
        const dashboardData = await res.json();
        setData(dashboardData);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  // Process monthly revenue data for chart
  const revenueChartData = (() => {
    if (!data) return [];
    const months: Record<string, { room: number; food: number }> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    data.monthlyBookings.forEach((b) => {
      const d = new Date(b.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!months[key]) months[key] = { room: 0, food: 0 };
      months[key].room += b.totalPrice;
    });

    data.monthlyFoodOrders.forEach((o) => {
      const d = new Date(o.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (!months[key]) months[key] = { room: 0, food: 0 };
      months[key].food += o.totalAmount;
    });

    return Object.entries(months)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([key, val]) => {
        const [y, m] = key.split('-').map(Number);
        return {
          name: `${monthNames[m]} ${y.toString().slice(2)}`,
          Rooms: Math.round(val.room),
          Food: Math.round(val.food),
        };
      });
  })();

  // Process popular food for pie chart
  const pieData = data?.popularFood.map((f) => ({
    name: f.name,
    value: f.orderCount,
  })) || [];

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const stats = data?.stats || {
    totalRevenue: 0, totalBookings: 0, totalFoodOrders: 0, totalUsers: 0,
    activeBookings: 0, activeOrders: 0, roomRevenue: 0, foodRevenue: 0,
  };

  const statCards = [
    { label: 'Total Revenue', value: `NPR ${stats.totalRevenue.toLocaleString()}`, icon: <DollarSign className="h-5 w-5" />, color: 'text-amber-500' },
    { label: 'Total Bookings', value: stats.totalBookings, icon: <CalendarCheck className="h-5 w-5" />, color: 'text-emerald-500', sub: `${stats.activeBookings} active` },
    { label: 'Total Orders', value: stats.totalFoodOrders, icon: <ShoppingCart className="h-5 w-5" />, color: 'text-blue-500', sub: `${stats.activeOrders} active` },
    { label: 'Active Users', value: stats.totalUsers, icon: <Users className="h-5 w-5" />, color: 'text-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-neutral-500 mt-1">Overview of your hotel operations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="border-[#2e2e2e] bg-[#1a1a1a]">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-neutral-500">{stat.label}</span>
                <div className={`${stat.color} bg-opacity-10`}>{stat.icon}</div>
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              {stat.sub && <p className="text-xs text-neutral-500 mt-1">{stat.sub}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Chart & Popular Food */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-[#2e2e2e] bg-[#1a1a1a]">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <TrendingUp className="h-4 w-4 text-amber-500" />
              Revenue Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {revenueChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2e2e2e" />
                  <XAxis dataKey="name" stroke="#737373" fontSize={11} />
                  <YAxis stroke="#737373" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #2e2e2e',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="Rooms" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Food" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[250px] text-neutral-500">
                No revenue data yet
              </div>
            )}
            <div className="flex justify-center gap-6 mt-2">
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <div className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Rooms
              </div>
              <div className="flex items-center gap-2 text-xs text-neutral-400">
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Food
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-[#2e2e2e] bg-[#1a1a1a]">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2 text-base">
              <UtensilsCrossed className="h-4 w-4 text-amber-500" />
              Popular Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a1a',
                      border: '1px solid #2e2e2e',
                      borderRadius: '8px',
                      color: '#fff',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[180px] text-neutral-500 text-sm">
                No data yet
              </div>
            )}
            <div className="space-y-2 mt-2">
              {data?.popularFood.map((f, i) => (
                <div key={f.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-neutral-300 truncate">{f.name}</span>
                  </div>
                  <span className="text-neutral-500 text-xs">{f.orderCount} orders</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Bookings */}
        <Card className="border-[#2e2e2e] bg-[#1a1a1a]">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base">Recent Bookings</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-[#2e2e2e] hover:bg-transparent">
                  <TableHead className="text-neutral-500 text-xs">Guest</TableHead>
                  <TableHead className="text-neutral-500 text-xs">Room</TableHead>
                  <TableHead className="text-neutral-500 text-xs">Status</TableHead>
                  <TableHead className="text-neutral-500 text-xs text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.recentBookings.map((b) => (
                  <TableRow key={b.id} className="border-[#2e2e2e] hover:bg-[#252525]">
                    <TableCell className="text-neutral-300 text-sm">{b.user?.name}</TableCell>
                    <TableCell className="text-neutral-400 text-sm">{b.room?.name}</TableCell>
                    <TableCell>
                      <Badge className={`text-[9px] ${statusColors[b.status] || 'bg-neutral-500/20 text-neutral-400'}`}>
                        {b.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-amber-500 text-sm text-right font-medium">NPR {b.totalPrice.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                {(!data?.recentBookings || data.recentBookings.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-neutral-500 text-sm py-8">No bookings yet</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card className="border-[#2e2e2e] bg-[#1a1a1a]">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-base">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-[#2e2e2e] hover:bg-transparent">
                  <TableHead className="text-neutral-500 text-xs">Customer</TableHead>
                  <TableHead className="text-neutral-500 text-xs">Items</TableHead>
                  <TableHead className="text-neutral-500 text-xs">Status</TableHead>
                  <TableHead className="text-neutral-500 text-xs text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.recentOrders.map((o) => (
                  <TableRow key={o.id} className="border-[#2e2e2e] hover:bg-[#252525]">
                    <TableCell className="text-neutral-300 text-sm">{o.user?.name}</TableCell>
                    <TableCell className="text-neutral-400 text-sm">
                      {o.items?.map((i) => `${i.foodItem?.name}×${i.quantity}`).join(', ') || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-[9px] ${statusColors[o.status] || 'bg-neutral-500/20 text-neutral-400'}`}>
                        {o.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-amber-500 text-sm text-right font-medium">NPR {o.totalAmount.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                {(!data?.recentOrders || data.recentOrders.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-neutral-500 text-sm py-8">No orders yet</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
