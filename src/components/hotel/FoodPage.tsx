'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/lib/stores/cartStore';
import { useAuthStore } from '@/lib/stores/authStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { Star, Plus, Minus, ShoppingCart, Leaf, Drumstick, SlidersHorizontal } from 'lucide-react';

interface FoodItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  isVeg: boolean;
  isAvailable: boolean;
  rating: number;
  orderCount: number;
}

const categories = ['All', 'MoMo', 'Noodles', 'Rice', 'Curry', 'Drinks', 'Desserts', 'Snacks'];
const sortOptions = [
  { label: 'Popular', value: 'popular' },
  { label: 'Rating', value: 'rating' },
  { label: 'Price: Low-High', value: 'price_asc' },
  { label: 'Price: High-Low', value: 'price_desc' },
];

export default function FoodPage() {
  const [food, setFood] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [vegOnly, setVegOnly] = useState(false);
  const [sortBy, setSortBy] = useState('popular');
  const { items, addItem, updateQuantity } = useCartStore();
  const { user, requireAuth } = useAuthStore();

  const fetchFood = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'All') params.set('category', category);
      if (vegOnly) params.set('isVeg', 'true');
      params.set('sortBy', sortBy);
      const res = await fetch(`/api/food?${params}`);
      const data = await res.json();
      setFood(data);
    } catch {
      toast.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFood();
  }, [category, vegOnly, sortBy]);

  const getItemQuantity = (foodId: string) => {
    const item = items.find((i) => i.foodItem.id === foodId);
    return item?.quantity || 0;
  };

  const handleAdd = (item: FoodItem) => {
    if (!user) {
      requireAuth(() => {
        addItem(item);
        toast.success(`${item.name} added to cart`);
      });
      return;
    }
    addItem(item);
    toast.success(`${item.name} added to cart`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Food Menu</h1>
        <p className="text-neutral-500 mt-1">Delicious dishes delivered to your room</p>
      </div>

      {/* Filters */}
      <Card className="border-[#2e2e2e] bg-[#1a1a1a] p-4">
        <div className="space-y-4">
          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  category === cat
                    ? 'bg-amber-500 text-black'
                    : 'bg-[#252525] text-neutral-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {/* Veg Toggle */}
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                vegOnly
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-[#252525] text-neutral-400 hover:text-white'
              }`}
            >
              <Leaf className="h-3.5 w-3.5" />
              Veg Only
            </button>
            {/* Sort */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-3.5 w-3.5 text-neutral-500" />
              <div className="flex gap-1">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                      sortBy === opt.value
                        ? 'bg-amber-500/20 text-amber-500'
                        : 'text-neutral-500 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Food Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="border-[#2e2e2e] bg-[#1a1a1a]">
                <Skeleton className="h-40 rounded-t-xl" />
                <CardContent className="p-3 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-8 w-full" />
                </CardContent>
              </Card>
            ))
          : food.map((item) => {
              const qty = getItemQuantity(item.id);
              return (
                <Card key={item.id} className="luxury-card group border-[#2e2e2e] bg-[#1a1a1a] overflow-hidden">
                  <div className="relative h-40 overflow-hidden">
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
                        {item.isVeg ? <Leaf className="h-2.5 w-2.5 mr-0.5" /> : <Drumstick className="h-2.5 w-2.5 mr-0.5" />}
                        {item.isVeg ? 'Veg' : 'Non-Veg'}
                      </Badge>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge className="text-[10px] bg-black/60 text-white backdrop-blur-sm">
                        {item.category}
                      </Badge>
                    </div>
                    {!item.isAvailable && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                        <Badge className="bg-red-500 text-white">Unavailable</Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-white text-sm leading-tight">{item.name}</h3>
                      <span className="text-amber-500 font-bold text-sm shrink-0 ml-2">NPR {item.price}</span>
                    </div>
                    <p className="text-[11px] text-neutral-500 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-0.5 text-xs text-neutral-400">
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                        {item.rating} · {item.orderCount} orders
                      </span>
                    </div>
                    {item.isAvailable && (
                      <div className="pt-1">
                        {qty === 0 ? (
                          <Button
                            onClick={() => handleAdd(item)}
                            className="w-full bg-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-black text-sm font-semibold h-8"
                            size="sm"
                          >
                            <Plus className="h-3.5 w-3.5 mr-1" />
                            Add to Cart
                          </Button>
                        ) : (
                          <div className="flex items-center justify-center gap-3 rounded-lg bg-[#252525] h-8">
                            <button
                              onClick={() => updateQuantity(item.id, qty - 1)}
                              className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-black transition-colors"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="text-sm font-semibold text-white w-6 text-center">{qty}</span>
                            <button
                              onClick={() => updateQuantity(item.id, qty + 1)}
                              className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/20 text-amber-500 hover:bg-amber-500 hover:text-black transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
      </div>

      {food.length === 0 && !loading && (
        <div className="text-center py-16">
          <ShoppingCart className="h-12 w-12 text-neutral-600 mx-auto mb-4" />
          <p className="text-neutral-500 text-lg">No items found matching your filters.</p>
          <Button variant="ghost" onClick={() => { setCategory('All'); setVegOnly(false); }} className="mt-4 text-amber-500">
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
}
