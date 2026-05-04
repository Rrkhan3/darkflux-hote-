'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { useNavStore } from '@/lib/stores/navStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  CalendarCheck,
  Calendar,
  Users,
  CreditCard,
  X,
  DoorOpen,
  Clock,
} from 'lucide-react';

interface Booking {
  id: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  status: string;
  totalPrice: number;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  room: {
    id: string;
    name: string;
    type: string;
    images: string[];
    price: number;
  };
}

const statusColors: Record<string, string> = {
  confirmed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  checked_in: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  checked_out: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function BookingsPage() {
  const { user, requireAuth } = useAuthStore();
  const { setPage } = useNavStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/bookings?userId=${user.id}`);
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
  }, [user]);

  const handleCancel = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Booking cancelled');
        fetchBookings();
      } else {
        toast.error('Failed to cancel booking');
      }
    } catch {
      toast.error('Failed to cancel booking');
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <CalendarCheck className="h-16 w-16 text-neutral-700 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Sign in to view your bookings</h2>
        <p className="text-neutral-500 text-sm mb-6">You need an account to track your reservations.</p>
        <Button onClick={() => requireAuth(() => fetchBookings())} className="bg-amber-500 text-black hover:bg-amber-400 font-semibold">
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">My Bookings</h1>
        <p className="text-neutral-500 mt-1">Your reservation history</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="border-[#2e2e2e] bg-[#1a1a1a]">
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24">
          <CalendarCheck className="h-16 w-16 text-neutral-700 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No bookings yet</h2>
          <p className="text-neutral-500 text-sm mb-6">Book a room to start your luxury experience!</p>
          <Button onClick={() => setPage('rooms')} className="bg-amber-500 text-black hover:bg-amber-400">
            <DoorOpen className="mr-2 h-4 w-4" />
            Browse Rooms
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className="border-[#2e2e2e] bg-[#1a1a1a] overflow-hidden">
              <CardContent className="p-0">
                <div className="flex flex-col sm:flex-row">
                  {/* Room Image */}
                  <div className="h-32 sm:h-auto sm:w-48 shrink-0">
                    <img
                      src={booking.room?.images?.[0] || '/logo.svg'}
                      alt={booking.room?.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '';
                        (e.target as HTMLImageElement).style.background = 'linear-gradient(135deg, #1a1a1a 0%, #2e2e2e 100%)';
                      }}
                    />
                  </div>
                  {/* Details */}
                  <div className="flex-1 p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-white">{booking.room?.name}</h3>
                        <Badge variant="outline" className="mt-1 text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/30">
                          {booking.room?.type}
                        </Badge>
                      </div>
                      <Badge className={`${statusColors[booking.status] || 'bg-neutral-500/20 text-neutral-400'} border text-[10px]`}>
                        {booking.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div className="flex items-center gap-1.5 text-neutral-400">
                        <Calendar className="h-3.5 w-3.5 text-amber-500" />
                        <span>Check-in: {format(new Date(booking.checkIn), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-neutral-400">
                        <Calendar className="h-3.5 w-3.5 text-amber-500" />
                        <span>Check-out: {format(new Date(booking.checkOut), 'MMM dd, yyyy')}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-neutral-400">
                        <Users className="h-3.5 w-3.5 text-amber-500" />
                        <span>{booking.guests} Guest{booking.guests > 1 ? 's' : ''}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-neutral-400">
                        <CreditCard className="h-3.5 w-3.5 text-amber-500" />
                        <span>{booking.paymentMethod.replace('_', ' ')}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-[#2e2e2e]">
                      <div>
                        <span className="text-amber-500 font-bold text-lg">NPR {booking.totalPrice.toLocaleString()}</span>
                        <span className="text-xs text-neutral-500 ml-2">
                          <Clock className="inline h-3 w-3 mr-0.5" />
                          {format(new Date(booking.createdAt), 'MMM dd')}
                        </span>
                      </div>
                      {(booking.status === 'confirmed') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancel(booking.id)}
                          className="text-red-400 border-red-500/30 hover:bg-red-500/10 hover:text-red-300"
                        >
                          <X className="h-3.5 w-3.5 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
