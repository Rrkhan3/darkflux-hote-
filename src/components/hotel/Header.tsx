'use client';

import { useState } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { useCartStore } from '@/lib/stores/cartStore';
import { useNavStore, type PageName } from '@/lib/stores/navStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Hotel,
  ShoppingCart,
  User,
  Menu,
  LogOut,
  LogIn,
  LayoutDashboard,
  Home,
  DoorOpen,
  UtensilsCrossed,
  CalendarCheck,
  ClipboardList,
  Users,
  Settings,
  ChevronDown,
} from 'lucide-react';

const customerNav: { label: string; page: PageName; icon: React.ReactNode }[] = [
  { label: 'Home', page: 'home', icon: <Home className="h-4 w-4" /> },
  { label: 'Rooms', page: 'rooms', icon: <DoorOpen className="h-4 w-4" /> },
  { label: 'Food Menu', page: 'food', icon: <UtensilsCrossed className="h-4 w-4" /> },
  { label: 'My Bookings', page: 'bookings', icon: <CalendarCheck className="h-4 w-4" /> },
];

const adminNav: { label: string; page: PageName; icon: React.ReactNode }[] = [
  { label: 'Dashboard', page: 'admin-dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { label: 'Rooms', page: 'admin-rooms', icon: <DoorOpen className="h-4 w-4" /> },
  { label: 'Food Menu', page: 'admin-food', icon: <UtensilsCrossed className="h-4 w-4" /> },
  { label: 'Bookings', page: 'admin-bookings', icon: <ClipboardList className="h-4 w-4" /> },
  { label: 'Orders', page: 'admin-orders', icon: <ShoppingCart className="h-4 w-4" /> },
  { label: 'Customers', page: 'admin-customers', icon: <Users className="h-4 w-4" /> },
];

export default function Header() {
  const { user, isAdmin, openLoginModal, logout } = useAuthStore();
  const { getItemCount } = useCartStore();
  const { currentPage, setPage } = useNavStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);

  const navItems = isAdmin ? adminNav : customerNav;
  const itemCount = getItemCount();

  const handleNav = (page: PageName) => {
    setPage(page);
    setMobileOpen(false);
    setAdminDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    setPage('home');
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#2e2e2e] bg-[#0a0a0a]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <button
          onClick={() => handleNav(isAdmin ? 'admin-dashboard' : 'home')}
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <Hotel className="h-7 w-7 text-amber-500" />
          <span className="gold-shimmer text-xl font-bold tracking-tight">
            DARKFLUX
          </span>
        </button>

        {/* Desktop Nav - always show customer nav for non-logged-in users */}
        <nav className="hidden items-center gap-1 md:flex">
          {(user ? navItems : customerNav).map((item) => (
            <button
              key={item.page}
              onClick={() => handleNav(item.page)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                currentPage === item.page
                  ? 'bg-amber-500/10 text-amber-500'
                  : 'text-neutral-400 hover:bg-[#1e1e1e] hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}

          {isAdmin && (
            <DropdownMenu open={adminDropdownOpen} onOpenChange={setAdminDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-neutral-400 hover:bg-[#1e1e1e] hover:text-white">
                  <Settings className="h-4 w-4" />
                  More
                  <ChevronDown className="h-3 w-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-[#1a1a1a] border-[#2e2e2e]">
                <DropdownMenuItem onClick={() => handleNav('admin-customers')} className="text-neutral-300 focus:text-white focus:bg-[#252525]">
                  <Users className="mr-2 h-4 w-4" />
                  Customers
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Cart (always visible for non-admin) */}
          {(!user || !isAdmin) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleNav('cart')}
              className="relative text-neutral-400 hover:text-amber-500 hover:bg-[#1e1e1e]"
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <Badge className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-black p-0">
                  {itemCount}
                </Badge>
              )}
            </Button>
          )}

          {user ? (
            /* User Menu */
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="hidden items-center gap-2 text-neutral-400 hover:text-amber-500 hover:bg-[#1e1e1e] sm:flex">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/20 text-amber-500">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#1a1a1a] border-[#2e2e2e]">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-xs text-neutral-500">{user.email}</p>
                  <p className="text-xs text-amber-500/70 mt-0.5">
                    {isAdmin ? 'Admin Access' : 'Customer'}
                  </p>
                </div>
                <DropdownMenuSeparator className="bg-[#2e2e2e]" />
                {!isAdmin && (
                  <DropdownMenuItem onClick={() => handleNav('profile')} className="text-neutral-300 focus:text-white focus:bg-[#252525]">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-[#2e2e2e]" />
                <DropdownMenuItem onClick={handleLogout} className="text-red-400 focus:text-red-300 focus:bg-[#252525]">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            /* Sign In Button */
            <Button
              onClick={() => openLoginModal()}
              className="hidden bg-amber-500 text-black hover:bg-amber-400 font-semibold sm:flex"
              size="sm"
            >
              <LogIn className="mr-1.5 h-4 w-4" />
              Sign In
            </Button>
          )}

          {/* Mobile Menu */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-amber-500 md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-[#0a0a0a] border-[#2e2e2e]">
              <SheetTitle className="text-white">
                <div className="flex items-center gap-2 mb-6">
                  <Hotel className="h-6 w-6 text-amber-500" />
                  <span className="gold-shimmer text-lg font-bold">DARKFLUX</span>
                </div>
              </SheetTitle>
              <nav className="flex flex-col gap-1">
                {(user ? navItems : customerNav).map((item) => (
                  <button
                    key={item.page}
                    onClick={() => handleNav(item.page)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      currentPage === item.page
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'text-neutral-400 hover:bg-[#1e1e1e] hover:text-white'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
                {(!user || !isAdmin) && (
                  <button
                    onClick={() => { handleNav('cart'); setMobileOpen(false); }}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      currentPage === 'cart'
                        ? 'bg-amber-500/10 text-amber-500'
                        : 'text-neutral-400 hover:bg-[#1e1e1e] hover:text-white'
                    }`}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Cart
                    {itemCount > 0 && (
                      <Badge className="ml-auto bg-amber-500 text-black text-[10px]">{itemCount}</Badge>
                    )}
                  </button>
                )}
                {user ? (
                  <>
                    <button
                      onClick={() => handleNav('profile')}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        currentPage === 'profile'
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'text-neutral-400 hover:bg-[#1e1e1e] hover:text-white'
                      }`}
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </button>
                    <div className="my-2 border-t border-[#2e2e2e]" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <div className="my-2 border-t border-[#2e2e2e]" />
                    <button
                      onClick={() => { openLoginModal(); setMobileOpen(false); }}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-amber-500 hover:bg-amber-500/10"
                    >
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </button>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
