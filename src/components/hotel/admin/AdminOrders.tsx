'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ShoppingCart, RefreshCw } from 'lucide-react';

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  roomNumber: string | null;
  deliveryTime: string | null;
  paymentMethod: string;
  createdAt: string;
  user: { name: string; email: string };
  items: Array<{ quantity: number; price: number; foodItem: { name: string } }>;
}

const statusColors: Record<string, string> = {
  preparing: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  on_the_way: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  delivered: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const orderStatuses = ['preparing', 'on_the_way', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      toast.success('Status updated');
      fetchOrders();
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Order Management</h1>
          <p className="text-neutral-500 mt-1">{orders.length} orders total</p>
        </div>
        <Button variant="outline" onClick={fetchOrders} className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card className="border-[#2e2e2e] bg-[#1a1a1a] overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#2e2e2e] hover:bg-transparent">
                  <TableHead className="text-neutral-500">Customer</TableHead>
                  <TableHead className="text-neutral-500">Items</TableHead>
                  <TableHead className="text-neutral-500">Room</TableHead>
                  <TableHead className="text-neutral-500">Status</TableHead>
                  <TableHead className="text-neutral-500">Time</TableHead>
                  <TableHead className="text-neutral-500 text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => (
                  <TableRow key={o.id} className="border-[#2e2e2e] hover:bg-[#252525]">
                    <TableCell>
                      <div>
                        <p className="text-white font-medium text-sm">{o.user?.name}</p>
                        <p className="text-neutral-500 text-xs">{o.user?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-neutral-300 text-sm max-w-[200px]">
                      <div className="truncate">
                        {o.items?.map((i) => `${i.foodItem?.name} ×${i.quantity}`).join(', ') || '-'}
                      </div>
                    </TableCell>
                    <TableCell className="text-neutral-400 text-sm">
                      {o.roomNumber ? `Room ${o.roomNumber}` : '-'}
                    </TableCell>
                    <TableCell>
                      <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v)}>
                        <SelectTrigger className={`h-7 w-28 text-[10px] border-0 ${statusColors[o.status] || 'bg-neutral-500/20 text-neutral-400'}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a1a] border-[#2e2e2e]">
                          {orderStatuses.map((s) => (
                            <SelectItem key={s} value={s} className="text-sm">
                              {s.replace('_', ' ').toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-neutral-500 text-xs">
                      {format(new Date(o.createdAt), 'MMM dd, HH:mm')}
                    </TableCell>
                    <TableCell className="text-amber-500 text-sm text-right font-medium">
                      NPR {o.totalAmount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
                {orders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-neutral-500 py-8">
                      <ShoppingCart className="h-8 w-8 mx-auto mb-2 text-neutral-700" />
                      No orders yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
