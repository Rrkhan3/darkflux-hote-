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
import { CalendarCheck, RefreshCw } from 'lucide-react';

interface Booking {
  id: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: string;
  totalPrice: number;
  paymentMethod: string;
  createdAt: string;
  user: { name: string; email: string };
  room: { name: string; type: string };
}

const statusColors: Record<string, string> = {
  confirmed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  checked_in: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  checked_out: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const bookingStatuses = ['confirmed', 'checked_in', 'checked_out', 'cancelled'];

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      setBookings(data);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      toast.success('Status updated');
      fetchBookings();
    } catch {
      toast.error('Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Booking Management</h1>
          <p className="text-neutral-500 mt-1">{bookings.length} bookings total</p>
        </div>
        <Button variant="outline" onClick={fetchBookings} className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10">
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
                  <TableHead className="text-neutral-500">Guest</TableHead>
                  <TableHead className="text-neutral-500">Room</TableHead>
                  <TableHead className="text-neutral-500">Check-in</TableHead>
                  <TableHead className="text-neutral-500">Check-out</TableHead>
                  <TableHead className="text-neutral-500">Status</TableHead>
                  <TableHead className="text-neutral-500 text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings.map((b) => (
                  <TableRow key={b.id} className="border-[#2e2e2e] hover:bg-[#252525]">
                    <TableCell>
                      <div>
                        <p className="text-white font-medium text-sm">{b.user?.name}</p>
                        <p className="text-neutral-500 text-xs">{b.user?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-neutral-300 text-sm">{b.room?.name}</p>
                        <Badge className="text-[9px] bg-amber-500/20 text-amber-400 border-amber-500/30">{b.room?.type}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-neutral-400 text-sm">{format(new Date(b.checkIn), 'MMM dd, yyyy')}</TableCell>
                    <TableCell className="text-neutral-400 text-sm">{format(new Date(b.checkOut), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>
                      <Select value={b.status} onValueChange={(v) => updateStatus(b.id, v)}>
                        <SelectTrigger className={`h-7 w-32 text-[10px] border-0 ${statusColors[b.status] || 'bg-neutral-500/20 text-neutral-400'}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a1a] border-[#2e2e2e]">
                          {bookingStatuses.map((s) => (
                            <SelectItem key={s} value={s} className="text-sm">
                              {s.replace('_', ' ').toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-amber-500 text-sm text-right font-medium">NPR {b.totalPrice.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
                {bookings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-neutral-500 py-8">
                      <CalendarCheck className="h-8 w-8 mx-auto mb-2 text-neutral-700" />
                      No bookings yet
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
