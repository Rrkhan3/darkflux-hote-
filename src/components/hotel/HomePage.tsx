'use client';

import { useEffect, useState } from 'react';
import { useNavStore } from '@/lib/stores/navStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Star,
  Wifi,
  Waves,
  Sparkles,
  UtensilsCrossed,
  Wine,
  Dumbbell,
  Bell,
  Car,
  ArrowRight,
  Users,
  Quote,
} from 'lucide-react';

interface Room {
  id: string;
  name: string;
  type: string;
  price: number;
  capacity: number;
  images: string[];
  avgRating: number;
  amenities: string[];
}

interface FoodItem {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  isVeg: boolean;
  rating: number;
  orderCount: number;
}

const facilities = [
  { icon: <Wifi className="h-6 w-6" />, name: 'Free WiFi', desc: 'High-speed internet' },
  { icon: <Waves className="h-6 w-6" />, name: 'Swimming Pool', desc: 'Infinity pool & jacuzzi' },
  { icon: <Sparkles className="h-6 w-6" />, name: 'Spa & Wellness', desc: 'Rejuvenating treatments' },
  { icon: <UtensilsCrossed className="h-6 w-6" />, name: 'Restaurant', desc: 'Multi-cuisine dining' },
  { icon: <Wine className="h-6 w-6" />, name: 'Bar & Lounge', desc: 'Premium beverages' },
  { icon: <Dumbbell className="h-6 w-6" />, name: 'Fitness Center', desc: 'Modern gym equipment' },
  { icon: <Bell className="h-6 w-6" />, name: 'Room Service', desc: '24/7 in-room dining' },
  { icon: <Car className="h-6 w-6" />, name: 'Parking', desc: 'Secure valet parking' },
];

const testimonials = [
  { name: 'Sarah Mitchell', text: 'An absolutely stunning experience. The Royal Suite exceeded all expectations. Will definitely return!', rating: 5, avatar: 'S' },
  { name: 'Rajesh Sharma', text: 'The food was incredible - best MoMo in Kathmandu! The staff was incredibly warm and attentive.', rating: 5, avatar: 'R' },
  { name: 'Emily Chen', text: 'Perfect blend of luxury and Nepali hospitality. The mountain view from the Deluxe room was breathtaking.', rating: 4, avatar: 'E' },
];

export default function HomePage() {
  const { setPage } = useNavStore();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [food, setFood] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsRes, foodRes] = await Promise.all([
          fetch('/api/rooms'),
          fetch('/api/food?sortBy=popular'),
        ]);
        const roomsData = await roomsRes.json();
        const foodData = await foodRes.json();
        setRooms(roomsData.slice(0, 3));
        setFood(foodData.slice(0, 4));
      } catch {
        // use empty arrays
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl min-h-[480px] sm:min-h-[560px]">
        <img
          src="/caption.jpg"
          alt="DARKFLUX HOTEL"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        <div className="relative px-6 py-20 sm:px-12 sm:py-28 text-center flex flex-col items-center justify-center min-h-[480px] sm:min-h-[560px]">
          <Badge className="mb-4 bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30">
            ✨ Luxury Redefined
          </Badge>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-4">
            Welcome to <span className="gold-shimmer">DARKFLUX</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-neutral-400 mb-8">
            Where elegance meets comfort. Experience the finest hospitality in the heart of Kathmandu with breathtaking views and world-class service.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => setPage('rooms')}
              className="bg-amber-500 text-black hover:bg-amber-400 font-semibold px-8 py-6 text-base rounded-xl"
            >
              Book Your Stay
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              onClick={() => setPage('food')}
              variant="outline"
              className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10 px-8 py-6 text-base rounded-xl"
            >
              Explore Menu
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Rooms */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Featured Rooms</h2>
            <p className="text-sm text-neutral-500">Handpicked for your comfort</p>
          </div>
          <Button variant="ghost" onClick={() => setPage('rooms')} className="text-amber-500 hover:text-amber-400">
            View All <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="border-[#2e2e2e] bg-[#1a1a1a]">
                  <Skeleton className="h-48 rounded-t-xl" />
                  <CardContent className="p-4 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </CardContent>
                </Card>
              ))
            : rooms.map((room) => (
                <Card
                  key={room.id}
                  className="luxury-card group cursor-pointer border-[#2e2e2e] bg-[#1a1a1a] overflow-hidden"
                  onClick={() => setPage('rooms')}
                >
                  <div className="image-overlay relative h-48 overflow-hidden">
                    <img
                      src={room.images?.[0] || '/logo.svg'}
                      alt={room.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '';
                        (e.target as HTMLImageElement).style.background = 'linear-gradient(135deg, #1a1a1a 0%, #2e2e2e 100%)';
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-amber-500 text-black font-semibold">{room.type}</Badge>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <p className="text-lg font-bold text-white">
                        NPR {room.price.toLocaleString()}<span className="text-sm font-normal text-neutral-300">/night</span>
                      </p>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-white mb-1">{room.name}</h3>
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
                  </CardContent>
                </Card>
              ))}
        </div>
      </section>

      {/* Popular Dishes */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Popular Dishes</h2>
            <p className="text-sm text-neutral-500">Our guests&apos; favorites</p>
          </div>
          <Button variant="ghost" onClick={() => setPage('food')} className="text-amber-500 hover:text-amber-400">
            Full Menu <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="border-[#2e2e2e] bg-[#1a1a1a]">
                  <Skeleton className="h-36 rounded-t-xl" />
                  <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </CardContent>
                </Card>
              ))
            : food.map((item) => (
                <Card
                  key={item.id}
                  className="luxury-card group cursor-pointer border-[#2e2e2e] bg-[#1a1a1a] overflow-hidden"
                  onClick={() => setPage('food')}
                >
                  <div className="relative h-36 overflow-hidden">
                    <img
                      src={item.image || '/logo.svg'}
                      alt={item.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '';
                        (e.target as HTMLImageElement).style.background = 'linear-gradient(135deg, #1a1a1a 0%, #2e2e2e 100%)';
                      }}
                    />
                    <div className="absolute top-2 left-2">
                      <Badge className={`text-[10px] ${item.isVeg ? 'bg-emerald-500/80 text-white' : 'bg-red-500/80 text-white'}`}>
                        {item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-white text-sm">{item.name}</h3>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-amber-500 font-semibold text-sm">NPR {item.price}</span>
                      <span className="flex items-center gap-0.5 text-xs text-neutral-500">
                        <Star className="h-3 w-3 text-amber-500" />
                        {item.rating}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
        </div>
      </section>

      {/* Facilities */}
      <section>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white">Hotel Facilities</h2>
          <p className="text-sm text-neutral-500 mt-1">Everything you need for a perfect stay</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {facilities.map((f) => (
            <Card key={f.name} className="luxury-card border-[#2e2e2e] bg-[#1a1a1a] text-center p-4 cursor-default">
              <div className="flex justify-center text-amber-500 mb-3">{f.icon}</div>
              <h3 className="text-sm font-semibold text-white">{f.name}</h3>
              <p className="text-xs text-neutral-500 mt-1">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white">What Our Guests Say</h2>
          <p className="text-sm text-neutral-500 mt-1">Real experiences, real memories</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name} className="border-[#2e2e2e] bg-[#1a1a1a] p-6">
              <Quote className="h-8 w-8 text-amber-500/30 mb-3" />
              <p className="text-sm text-neutral-300 mb-4 italic">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20 text-amber-500 font-bold text-sm">
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 text-amber-500 fill-amber-500" />
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
