"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { useCart } from "@/context/CartContext";
import { getCategories, getMenuItems } from "@/lib/api";
import type { Category, MenuItem } from "@/lib/api";
import {
  Plus,
  Minus,
  ShoppingCart,
  Leaf,
  Clock,
  Search,
} from "lucide-react";
import Link from "next/link";

export default function MenuPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { items: cartItems, addItem, removeItem, updateQuantity, totalItems } = useCart();

  useEffect(() => {
    const load = async () => {
      try {
        const [cats, menuItems] = await Promise.all([
          getCategories(),
          getMenuItems(),
        ]);
        setCategories(cats);
        setItems(menuItems);
      } catch (err) {
        console.error("Failed to load menu:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesCategory = !selectedCategory || item.category_id === selectedCategory;
    const matchesSearch = !search || item.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCartQuantity = (itemId: number) => {
    const cartItem = cartItems.find((ci) => ci.menuItem.id === itemId);
    return cartItem?.quantity || 0;
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary" />
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold">Our Menu</h1>
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-fg" size={18} />
            <input
              type="text"
              placeholder="Search dishes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-muted border border-card-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              !selectedCategory
                ? "bg-primary text-white"
                : "bg-muted text-muted-fg hover:bg-card-border"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id
                  ? "bg-primary text-white"
                  : "bg-muted text-muted-fg hover:bg-card-border"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const qty = getCartQuantity(item.id);
            return (
              <div
                key={item.id}
                className="bg-card border border-card-border rounded-xl overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-40 bg-muted relative overflow-hidden">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-fg">
                      No Image
                    </div>
                  )}
                  {item.is_vegetarian && (
                    <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Leaf size={12} /> Veg
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-sm text-muted-fg mt-1 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-fg">
                    <Clock size={12} />
                    <span>{item.preparation_time} min</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xl font-bold text-primary">
                      Rs. {item.price}
                    </span>
                    {qty > 0 ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, qty - 1)}
                          className="w-8 h-8 flex items-center justify-center bg-muted rounded-full hover:bg-card-border"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-6 text-center font-medium">{qty}</span>
                        <button
                          onClick={() => updateQuantity(item.id, qty + 1)}
                          className="w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full hover:bg-primary-dark"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addItem(item)}
                        className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors flex items-center gap-1"
                      >
                        <Plus size={14} /> Add
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-muted-fg">
            No items found matching your search.
          </div>
        )}
      </main>

      {/* Floating Cart Button */}
      {totalItems > 0 && (
        <Link
          href="/cart"
          className="fixed bottom-6 right-6 bg-primary text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 hover:bg-primary-dark transition-colors z-40"
        >
          <ShoppingCart size={20} />
          <span className="font-medium">{totalItems} items</span>
        </Link>
      )}
    </>
  );
}
