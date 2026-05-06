"use client";

import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import {
  UtensilsCrossed,
  ShoppingCart,
  ChefHat,
  BarChart3,
  Users,
  Bell,
  QrCode,
  Smartphone,
} from "lucide-react";

const features = [
  {
    icon: UtensilsCrossed,
    title: "Digital Menu",
    description: "Browse our full menu with categories, images, and real-time availability",
    href: "/menu",
    color: "text-orange-500",
  },
  {
    icon: ShoppingCart,
    title: "Easy Ordering",
    description: "Add items to cart and place orders with table or room number",
    href: "/menu",
    color: "text-blue-500",
  },
  {
    icon: QrCode,
    title: "QR Code Ordering",
    description: "Scan QR code at your table for instant ordering access",
    href: "/menu",
    color: "text-purple-500",
  },
  {
    icon: ChefHat,
    title: "Kitchen Display",
    description: "Real-time kitchen order management with status tracking",
    href: "/kitchen",
    color: "text-green-500",
  },
  {
    icon: BarChart3,
    title: "Sales Analytics",
    description: "Track sales, top items, and staff performance with visual charts",
    href: "/admin/analytics",
    color: "text-cyan-500",
  },
  {
    icon: Users,
    title: "Staff Management",
    description: "Manage staff accounts, roles, and track performance",
    href: "/admin/staff",
    color: "text-pink-500",
  },
  {
    icon: Bell,
    title: "Real-Time Updates",
    description: "WebSocket-powered live order tracking across all devices",
    href: "/track",
    color: "text-yellow-500",
  },
  {
    icon: Smartphone,
    title: "Mobile Friendly",
    description: "Fully responsive design optimized for phones, tablets, and desktops",
    href: "/menu",
    color: "text-indigo-500",
  },
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 to-red-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
            <div className="text-center">
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
                DarkFlux Hotel &amp; Restaurant
              </h1>
              <p className="mt-4 text-lg sm:text-xl text-orange-100 max-w-2xl mx-auto">
                Complete management system with real-time ordering, kitchen display,
                staff management, and analytics — all in one platform.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/menu"
                  className="px-8 py-3 bg-white text-orange-600 rounded-xl font-bold text-lg hover:bg-orange-50 transition-colors shadow-lg"
                >
                  View Menu &amp; Order
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-3 border-2 border-white text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-colors"
                >
                  Staff Login
                </Link>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-1 left-0 right-0">
            <svg viewBox="0 0 1440 80" fill="none" className="w-full">
              <path
                d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z"
                className="fill-background"
              />
            </svg>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Link
                key={feature.title}
                href={feature.href}
                className="group p-6 bg-card border border-card-border rounded-2xl hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <feature.icon className={`${feature.color} mb-4`} size={32} />
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-fg">{feature.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-card-border py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-fg">
          <p>&copy; 2025 DarkFlux Hotel &amp; Restaurant Management System. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}
