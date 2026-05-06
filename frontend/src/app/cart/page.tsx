"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { createOrder, createOrderAuthenticated } from "@/lib/api";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  Receipt,
} from "lucide-react";
import Link from "next/link";

const TAX_RATE = 13;

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
  } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const [tableNumber, setTableNumber] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [orderType, setOrderType] = useState("dine_in");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState<{ order_number: string; total_amount: number } | null>(null);
  const [error, setError] = useState("");

  const tax = subtotal * TAX_RATE / 100;
  const total = subtotal + tax;

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const orderData = {
        table_number: tableNumber || undefined,
        room_number: roomNumber || undefined,
        order_type: orderType,
        customer_name: customerName || undefined,
        special_instructions: specialInstructions || undefined,
        items: items.map((i) => ({
          menu_item_id: i.menuItem.id,
          quantity: i.quantity,
          notes: i.notes,
        })),
      };
      const order = user
        ? await createOrderAuthenticated(orderData)
        : await createOrder(orderData);
      setOrderResult({
        order_number: order.order_number,
        total_amount: order.total_amount,
      });
      clearCart();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (orderResult) {
    return (
      <>
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="bg-card border border-card-border rounded-2xl p-8 max-w-md w-full text-center shadow-lg">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="text-green-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold mb-2">Order Placed!</h2>
            <p className="text-muted-fg mb-4">
              Your order has been successfully placed.
            </p>
            <div className="bg-muted rounded-lg p-4 mb-6">
              <p className="text-sm text-muted-fg">Order Number</p>
              <p className="text-2xl font-bold text-primary">
                {orderResult.order_number}
              </p>
              <p className="text-sm text-muted-fg mt-2">Total Amount</p>
              <p className="text-xl font-semibold">
                Rs. {orderResult.total_amount.toFixed(2)}
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/menu"
                className="flex-1 py-2.5 bg-muted rounded-lg font-medium hover:bg-card-border transition-colors text-center"
              >
                Order More
              </Link>
              <Link
                href={`/track?order=${orderResult.order_number}`}
                className="flex-1 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors text-center"
              >
                Track Order
              </Link>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/menu" className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-bold">Your Cart</h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="mx-auto text-muted-fg mb-4" size={64} />
            <h2 className="text-xl font-semibold mb-2">Cart is empty</h2>
            <p className="text-muted-fg mb-4">Add some delicious items from our menu!</p>
            <Link
              href="/menu"
              className="inline-block px-6 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3">
              {items.map((item) => (
                <div
                  key={item.menuItem.id}
                  className="bg-card border border-card-border rounded-xl p-4 flex gap-4"
                >
                  {item.menuItem.image_url && (
                    <img
                      src={item.menuItem.image_url}
                      alt={item.menuItem.name}
                      className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold">{item.menuItem.name}</h3>
                      <button
                        onClick={() => removeItem(item.menuItem.id)}
                        className="text-danger hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="text-sm text-muted-fg">
                      Rs. {item.menuItem.price} each
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.menuItem.id, item.quantity - 1)
                          }
                          className="w-7 h-7 flex items-center justify-center bg-muted rounded-full hover:bg-card-border"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-6 text-center font-medium text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.menuItem.id, item.quantity + 1)
                          }
                          className="w-7 h-7 flex items-center justify-center bg-primary text-white rounded-full hover:bg-primary-dark"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <span className="font-semibold">
                        Rs. {(item.menuItem.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="space-y-4">
              <div className="bg-card border border-card-border rounded-xl p-5">
                <h3 className="font-semibold mb-4">Order Details</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Order Type</label>
                    <select
                      value={orderType}
                      onChange={(e) => setOrderType(e.target.value)}
                      className="w-full px-3 py-2 bg-muted border border-card-border rounded-lg text-sm"
                    >
                      <option value="dine_in">Dine In</option>
                      <option value="room_service">Room Service</option>
                      <option value="takeaway">Takeaway</option>
                    </select>
                  </div>
                  {orderType === "dine_in" && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Table Number</label>
                      <input
                        type="text"
                        value={tableNumber}
                        onChange={(e) => setTableNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-muted border border-card-border rounded-lg text-sm"
                        placeholder="e.g., T1, T2"
                      />
                    </div>
                  )}
                  {orderType === "room_service" && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Room Number</label>
                      <input
                        type="text"
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-muted border border-card-border rounded-lg text-sm"
                        placeholder="e.g., 101, 202"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium mb-1">Your Name (optional)</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3 py-2 bg-muted border border-card-border rounded-lg text-sm"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Special Instructions</label>
                    <textarea
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      className="w-full px-3 py-2 bg-muted border border-card-border rounded-lg text-sm resize-none"
                      rows={2}
                      placeholder="Any special requests..."
                    />
                  </div>
                </div>
              </div>

              <div className="bg-card border border-card-border rounded-xl p-5">
                <h3 className="font-semibold mb-4">Order Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-fg">Subtotal</span>
                    <span>Rs. {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-fg">Tax ({TAX_RATE}%)</span>
                    <span>Rs. {tax.toFixed(2)}</span>
                  </div>
                  <hr className="border-card-border" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">Rs. {total.toFixed(2)}</span>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-danger mt-3">{error}</p>
                )}

                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full mt-4 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
                >
                  {loading ? "Placing Order..." : "Place Order"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
