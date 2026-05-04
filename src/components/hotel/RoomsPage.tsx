'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { useNavStore } from '@/lib/stores/navStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Star,
  Users,
  Calendar,
  CreditCard,
  Filter,
  Check,
} from 'lucide-react';

interface Room {
  id: string;
  name: string;
  type: string;
  price: number;
  capacity: number;
  description: string;
  amenities: string[];
  images: string[];
  isAvailable: boolean;
  avgRating: number;
}

const roomTypes = ['All', 'Single', 'Deluxe', 'Suite', 'Presidential'];

export default function RoomsPage() {
  const { user, requireAuth } = useAuthStore();
  const { setPage } = useNavStore();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('All');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [bookingRoom, setBookingRoom] = useState<Room | null>(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('1');
  const [paymentMethod, setPaymentMethod] = useState('pay_at_hotel');
  const [submitting, setSubmitting] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'All') params.set('type', typeFilter);
      if (availableOnly) params.set('available', 'true');
      const res = await fetch(`/api/rooms?${params}`);
      const data = await res.json();
      setRooms(data);
    } catch {
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [typeFilter, availableOnly]);

  const calculateTotal = () => {
    if (!bookingRoom || !checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    return bookingRoom.price * nights;
  };

  const handleBooking = async () => {
    if (!bookingRoom || !user) return;
    if (!checkIn || !checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }
    if (new Date(checkIn) >= new Date(checkOut)) {
      toast.error('Check-out date must be after check-in date');
      return;
    }
    if (new Date(checkIn) < new Date(new Date().toDateString())) {
      toast.error('Check-in date cannot be in the past');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          roomId: bookingRoom.id,
          checkIn,
          checkOut,
          guests: parseInt(guests),
          totalPrice: calculateTotal(),
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Room booked successfully! 🎉');
        setBookingOpen(false);
        setBookingRoom(null);
        setCheckIn('');
        setCheckOut('');
      } else {
        toast.error(data.error || 'Failed to book room');
      }
    } catch {
      toast.error('Failed to book room');
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Rooms & Suites</h1>
        <p className="text-neutral-500 mt-1">Find your perfect stay</p>
      </div>

      {/* Filters */}
      <Card className="border-[#2e2e2e] bg-[#1a1a1a] p-4">
        <div className="flex flex-wrap items-center gap-4">
          <Filter className="h-4 w-4 text-amber-500" />
          <div className="flex flex-wrap gap-2">
            {roomTypes.map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  typeFilter === type
                    ? 'bg-amber-500 text-black'
                    : 'bg-[#252525] text-neutral-400 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Label className="text-sm text-neutral-400">Available Only</Label>
            <Switch
              checked={availableOnly}
              onCheckedChange={setAvailableOnly}
              className="data-[state=checked]:bg-amber-500"
            />
          </div>
        </div>
      </Card>

      {/* Rooms Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="border-[#2e2e2e] bg-[#1a1a1a]">
                <Skeleton className="h-52 rounded-t-xl" />
                <CardContent className="p-4 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-1/3" />
                </CardContent>
              </Card>
            ))
          : rooms.map((room) => (
              <Card key={room.id} className="luxury-card group border-[#2e2e2e] bg-[#1a1a1a] overflow-hidden">
                <div className="image-overlay relative h-52 overflow-hidden">
                  <img
                    src={room.images?.[0] || '/logo.svg'}
                    alt={room.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '';
                      (e.target as HTMLImageElement).style.background = 'linear-gradient(135deg, #1a1a1a 0%, #2e2e2e 100%)';
                    }}
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <Badge className="bg-amber-500 text-black font-semibold">{room.type}</Badge>
                    {!room.isAvailable && (
                      <Badge className="bg-red-500 text-white">Unavailable</Badge>
                    )}
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <p className="text-xl font-bold text-white">
                      NPR {room.price.toLocaleString()}<span className="text-sm font-normal text-neutral-300">/night</span>
                    </p>
                  </div>
                </div>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{room.name}</h3>
                    <p className="text-xs text-neutral-500 line-clamp-2 mt-1">{room.description}</p>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-neutral-400">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {room.capacity} guests
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-amber-500" />
                      {room.avgRating > 0 ? room.avgRating.toFixed(1) : 'New'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {room.amenities?.slice(0, 4).map((a) => (
                      <Badge key={a} variant="secondary" className="text-[10px] bg-[#252525] text-neutral-400 border-[#2e2e2e]">
                        {a}
                      </Badge>
                    ))}
                    {room.amenities?.length > 4 && (
                      <Badge variant="secondary" className="text-[10px] bg-[#252525] text-amber-500 border-[#2e2e2e]">
                        +{room.amenities.length - 4} more
                      </Badge>
                    )}
                  </div>
                  {room.isAvailable ? (
                    <Dialog open={bookingOpen && bookingRoom?.id === room.id} onOpenChange={(open) => {
                      if (open && !user) {
                        requireAuth(() => {
                          setBookingRoom(room);
                          setBookingOpen(true);
                        });
                        return;
                      }
                      setBookingOpen(open);
                      if (open) setBookingRoom(room);
                      if (!open) { setBookingRoom(null); setCheckIn(''); setCheckOut(''); }
                    }}>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-amber-500 text-black hover:bg-amber-400 font-semibold">
                          Book Now
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-[#1a1a1a] border-[#2e2e2e] max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-white">Book {room.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-2">
                          <div className="space-y-2">
                            <Label className="text-neutral-300">Check-in Date</Label>
                            <Input
                              type="date"
                              min={today}
                              value={checkIn}
                              onChange={(e) => setCheckIn(e.target.value)}
                              className="bg-[#252525] border-[#2e2e2e] text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-neutral-300">Check-out Date</Label>
                            <Input
                              type="date"
                              min={checkIn || today}
                              value={checkOut}
                              onChange={(e) => setCheckOut(e.target.value)}
                              className="bg-[#252525] border-[#2e2e2e] text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-neutral-300">Number of Guests</Label>
                            <Select value={guests} onValueChange={setGuests}>
                              <SelectTrigger className="bg-[#252525] border-[#2e2e2e] text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-[#1a1a1a] border-[#2e2e2e]">
                                {Array.from({ length: room.capacity }, (_, i) => i + 1).map((n) => (
                                  <SelectItem key={n} value={String(n)}>{n} Guest{n > 1 ? 's' : ''}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-neutral-300">Payment Method</Label>
                            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                              <SelectTrigger className="bg-[#252525] border-[#2e2e2e] text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-[#1a1a1a] border-[#2e2e2e]">
                                <SelectItem value="pay_at_hotel">Pay at Hotel</SelectItem>
                                <SelectItem value="esewa">eSewa</SelectItem>
                                <SelectItem value="khalti">Khalti</SelectItem>
                                <SelectItem value="card">Credit/Debit Card</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="rounded-xl bg-[#252525] p-4 space-y-2">
                            <div className="flex justify-between text-sm text-neutral-400">
                              <span>Room Rate</span>
                              <span>NPR {room.price.toLocaleString()}/night</span>
                            </div>
                            <div className="flex justify-between text-sm text-neutral-400">
                              <span>Nights</span>
                              <span>{checkIn && checkOut ? Math.max(1, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))) : '-'}</span>
                            </div>
                            <div className="border-t border-[#2e2e2e] pt-2 flex justify-between text-lg font-bold">
                              <span className="text-white">Total</span>
                              <span className="text-amber-500">NPR {calculateTotal().toLocaleString()}</span>
                            </div>
                          </div>
                          <Button
                            onClick={handleBooking}
                            disabled={submitting || !checkIn || !checkOut}
                            className="w-full bg-amber-500 text-black hover:bg-amber-400 font-semibold"
                          >
                            {submitting ? 'Booking...' : (
                              <>
                                <Calendar className="mr-2 h-4 w-4" />
                                Confirm Booking
                              </>
                            )}
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Button disabled className="w-full font-semibold opacity-60">
                      Currently Unavailable
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
      </div>

      {rooms.length === 0 && !loading && (
        <div className="text-center py-16">
          <p className="text-neutral-500 text-lg">No rooms found matching your filters.</p>
          <Button variant="ghost" onClick={() => { setTypeFilter('All'); setAvailableOnly(false); }} className="mt-4 text-amber-500">
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
