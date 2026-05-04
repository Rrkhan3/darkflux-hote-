'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { useNavStore } from '@/lib/stores/navStore';
import Header from '@/components/hotel/Header';
import Footer from '@/components/hotel/Footer';
import AIChat from '@/components/hotel/AIChat';
import LoginModal from '@/components/hotel/LoginModal';
import HomePage from '@/components/hotel/HomePage';
import RoomsPage from '@/components/hotel/RoomsPage';
import FoodPage from '@/components/hotel/FoodPage';
import CartPage from '@/components/hotel/CartPage';
import BookingsPage from '@/components/hotel/BookingsPage';
import ProfilePage from '@/components/hotel/ProfilePage';
import AdminDashboard from '@/components/hotel/admin/AdminDashboard';
import AdminRooms from '@/components/hotel/admin/AdminRooms';
import AdminFood from '@/components/hotel/admin/AdminFood';
import AdminBookings from '@/components/hotel/admin/AdminBookings';
import AdminOrders from '@/components/hotel/admin/AdminOrders';
import AdminCustomers from '@/components/hotel/admin/AdminCustomers';

function PageRenderer() {
  const { currentPage } = useNavStore();

  switch (currentPage) {
    case 'home':
      return <HomePage />;
    case 'rooms':
      return <RoomsPage />;
    case 'food':
      return <FoodPage />;
    case 'cart':
      return <CartPage />;
    case 'bookings':
      return <BookingsPage />;
    case 'profile':
      return <ProfilePage />;
    case 'admin-dashboard':
      return <AdminDashboard />;
    case 'admin-rooms':
      return <AdminRooms />;
    case 'admin-food':
      return <AdminFood />;
    case 'admin-bookings':
      return <AdminBookings />;
    case 'admin-orders':
      return <AdminOrders />;
    case 'admin-customers':
      return <AdminCustomers />;
    default:
      return <HomePage />;
  }
}

export default function Home() {
  const { user, isAdmin } = useAuthStore();
  const { currentPage, setPage } = useNavStore();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        await fetch('/api/seed', { method: 'POST' });
      } catch {
        // ignore
      } finally {
        setInitializing(false);
      }
    };
    init();
  }, []);

  // Enforce role-based page access (only when user is logged in)
  useEffect(() => {
    if (initializing || !user) return;

    const customerPages = ['home', 'rooms', 'food', 'cart', 'bookings', 'profile'];
    const adminPages = ['admin-dashboard', 'admin-rooms', 'admin-food', 'admin-bookings', 'admin-orders', 'admin-customers'];

    if (isAdmin && customerPages.includes(currentPage)) {
      setPage('admin-dashboard');
    } else if (!isAdmin && adminPages.includes(currentPage)) {
      setPage('home');
    }
  }, [user, isAdmin, currentPage, setPage, initializing]);

  if (initializing) {
    return (
      <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <div className="h-8 w-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-amber-500 text-lg font-semibold">DARKFLUX HOTEL</p>
            <p className="text-neutral-500 text-sm">Loading your luxury experience...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a]">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
        <PageRenderer />
      </main>
      <Footer />
      <AIChat />
      <LoginModal />
    </div>
  );
}
