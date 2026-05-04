import { create } from 'zustand';

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

interface CartItem {
  foodItem: FoodItem;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (foodItem: FoodItem) => void;
  removeItem: (foodItemId: string) => void;
  updateQuantity: (foodItemId: string, qty: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addItem: (foodItem: FoodItem) => {
    const { items } = get();
    const existing = items.find((i) => i.foodItem.id === foodItem.id);
    if (existing) {
      set({
        items: items.map((i) =>
          i.foodItem.id === foodItem.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
      });
    } else {
      set({ items: [...items, { foodItem, quantity: 1 }] });
    }
  },

  removeItem: (foodItemId: string) => {
    set({ items: get().items.filter((i) => i.foodItem.id !== foodItemId) });
  },

  updateQuantity: (foodItemId: string, qty: number) => {
    if (qty <= 0) {
      set({ items: get().items.filter((i) => i.foodItem.id !== foodItemId) });
    } else {
      set({
        items: get().items.map((i) =>
          i.foodItem.id === foodItemId ? { ...i, quantity: qty } : i
        ),
      });
    }
  },

  clearCart: () => set({ items: [] }),

  getTotal: () => {
    return get().items.reduce((total, item) => total + item.foodItem.price * item.quantity, 0);
  },

  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  },
}));
