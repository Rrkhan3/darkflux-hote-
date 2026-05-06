"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import ThemeToggle from "@/components/ui/ThemeToggle";
import {
  ChefHat,
  ShoppingCart,
  LogOut,
  LayoutDashboard,
  Users,
  UtensilsCrossed,
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();

  return (
    <nav className="sticky top-0 z-50 bg-card border-b border-card-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <UtensilsCrossed size={28} />
            <span className="hidden sm:inline">DarkFlux Hotel</span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/menu"
              className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
            >
              Menu
            </Link>

            <Link
              href="/track"
              className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
            >
              Track Order
            </Link>

            {user && (user.role === "admin" || user.role === "staff") && (
              <Link
                href="/admin"
                className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors flex items-center gap-1"
              >
                <LayoutDashboard size={16} />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            )}

            {user && user.role === "admin" && (
              <Link
                href="/admin/staff"
                className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors flex items-center gap-1"
              >
                <Users size={16} />
                <span className="hidden sm:inline">Staff</span>
              </Link>
            )}

            {user && (user.role === "kitchen" || user.role === "admin") && (
              <Link
                href="/kitchen"
                className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors flex items-center gap-1"
              >
                <ChefHat size={16} />
                <span className="hidden sm:inline">Kitchen</span>
              </Link>
            )}

            <Link
              href="/cart"
              className="relative px-3 py-2 rounded-lg text-sm font-medium hover:bg-muted transition-colors"
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>

            <ThemeToggle />

            {user ? (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-sm text-muted-fg">
                  {user.full_name}
                </span>
                <button
                  onClick={logout}
                  className="p-2 rounded-lg hover:bg-muted transition-colors text-danger"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
