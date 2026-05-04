import { create } from 'zustand';

export type PageName =
  | 'home'
  | 'rooms'
  | 'food'
  | 'cart'
  | 'bookings'
  | 'profile'
  | 'admin-dashboard'
  | 'admin-rooms'
  | 'admin-food'
  | 'admin-bookings'
  | 'admin-orders'
  | 'admin-customers';

interface NavState {
  currentPage: PageName;
  setPage: (page: PageName) => void;
}

export const useNavStore = create<NavState>((set) => ({
  currentPage: 'home',
  setPage: (page: PageName) => set({ currentPage: page }),
}));
