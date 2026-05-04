'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/stores/cartStore';
import { useAuthStore } from '@/lib/stores/authStore';
import { useNavStore } from '@/lib/stores/navStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ConciergeBell,
  CreditCard,
  Package,
} from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotal } = useCartStore();
  const { user, requireAuth } = useAuthStore();
  const { setPage } = useNavStore();
  const [roomNumber, setRoomNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('pay_at_hotel');
  const [orderToRoom, setOrderToRoom] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const total = getTotal();

  const handlePlaceOrder = async () => {
    if (!user) {
      requireAuth(() => {
        handlePlaceOrder();
      });
      return;
    }
    if (items.length === 0) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          roomNumber: orderToRoom ? roomNumber : undefined,
          paymentMethod,
          items: items.map((i) => ({
            foodItemId: i.foodItem.id,
            quantity: i.quantity,
            price: i.foodItem.price,
          })),
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Order placed successfully! 🎉');
        clearCart();
        setRoomNumber('');
      } else {
        toast.error(data.error || 'Failed to place order');
      }
    } catch {
      toast.error('Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <ShoppingCart className="h-16 w-16 text-neutral-700 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Your cart is empty</h2>
        <p className="text-neutral-500 text-sm mb-6">Add some delicious items from our menu!</p>
        <Button onClick={() => setPage('food')} className="bg-amber-500 text-black hover:bg-amber-400">
          Browse Menu
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Your Cart</h1>
        <p className="text-neutral-500 mt-1">{items.length} item{items.length > 1 ? 's' : ''} in your cart</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => (
            <Card key={item.foodItem.id} className="border-[#2e2e2e] bg-[#1a1a1a] overflow-hidden">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                    <img
                      src={item.foodItem.image || '/logo.svg'}
                      alt={item.foodItem.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '';
                        (e.target as HTMLImageElement).style.background = 'linear-gradient(135deg, #1a1a1a 0%, #2e2e2e 100%)';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-white text-sm">{item.foodItem.name}</h3>
                        <p className="text-xs text-neutral-500">{item.foodItem.category}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.foodItem.id)}
                        className="h-7 w-7 text-neutral-500 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.foodItem.id, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-md bg-[#252525] text-amber-500 hover:bg-amber-500 hover:text-black transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="text-sm font-semibold text-white w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.foodItem.id, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-md bg-[#252525] text-amber-500 hover:bg-amber-500 hover:text-black transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-amber-500 font-semibold">NPR {(item.foodItem.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Button
            variant="ghost"
            onClick={clearCart}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Cart
          </Button>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="border-[#2e2e2e] bg-[#1a1a1a] sticky top-24">
            <CardContent className="p-5 space-y-4">
              <h3 className="font-semibold text-white text-lg">Order Summary</h3>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.foodItem.id} className="flex justify-between text-sm">
                    <span className="text-neutral-400 truncate mr-2">
                      {item.foodItem.name} × {item.quantity}
                    </span>
                    <span className="text-white shrink-0">NPR {(item.foodItem.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-[#2e2e2e] pt-3 flex justify-between text-lg font-bold">
                <span className="text-white">Total</span>
                <span className="text-amber-500">NPR {total.toLocaleString()}</span>
              </div>

              {/* Order to Room */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={() => setOrderToRoom(!orderToRoom)}
                  className={`flex items-center gap-2 w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    orderToRoom
                      ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                      : 'bg-[#252525] text-neutral-400 border border-[#2e2e2e]'
                  }`}
                >
                  <ConciergeBell className="h-4 w-4" />
                  Order to Room
                </button>
                {orderToRoom && (
                  <div className="space-y-1">
                    <Label className="text-neutral-300 text-xs">Room Number</Label>
                    <Input
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      placeholder="e.g., 301"
                      className="bg-[#252525] border-[#2e2e2e] text-white text-sm"
                    />
                  </div>
                )}

                {/* Payment Method */}
                <div className="space-y-1">
                  <Label className="text-neutral-300 text-xs flex items-center gap-1">
                    <CreditCard className="h-3 w-3" />
                    Payment Method
                  </Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="bg-[#252525] border-[#2e2e2e] text-white text-sm">
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

                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <Package className="h-3 w-3" />
                  Estimated delivery: 20-30 min
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  disabled={submitting}
                  className="w-full bg-amber-500 text-black hover:bg-amber-400 font-semibold"
                >
                  {submitting ? 'Placing Order...' : `Place Order · NPR ${total.toLocaleString()}`}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
