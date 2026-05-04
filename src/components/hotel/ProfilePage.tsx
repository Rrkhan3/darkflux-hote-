'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';
import { useNavStore } from '@/lib/stores/navStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Phone,
  Shield,
  CalendarCheck,
  ShoppingCart,
  Save,
  LogOut,
  Lock,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, isAdmin, setUser, logout, openLoginModal } = useAuthStore();
  const { setPage } = useNavStore();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState({ bookings: 0, orders: 0 });

  useEffect(() => {
    if (user) {
      const fetchStats = async () => {
        try {
          const [bookingsRes, ordersRes] = await Promise.all([
            fetch(`/api/bookings?userId=${user.id}`),
            fetch(`/api/orders?userId=${user.id}`),
          ]);
          const bookingsData = await bookingsRes.json();
          const ordersData = await ordersRes.json();
          setStats({ bookings: bookingsData.length, orders: ordersData.length });
        } catch {
          // ignore
        }
      };
      fetchStats();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          name,
          phone,
          role: user.role,
        }),
      });
      const updatedUser = await res.json();
      setUser(updatedUser);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    setPage('home');
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <User className="h-16 w-16 text-neutral-700 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Sign in to view your profile</h2>
        <p className="text-neutral-500 text-sm mb-6">You need an account to manage your profile.</p>
        <Button onClick={() => openLoginModal()} className="bg-amber-500 text-black hover:bg-amber-400 font-semibold">
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white">My Profile</h1>
        <p className="text-neutral-500 mt-1">Manage your account</p>
      </div>

      {/* User Card */}
      <Card className="border-[#2e2e2e] bg-[#1a1a1a] overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-amber-500/20 via-amber-600/10 to-transparent" />
        <CardContent className="p-6 -mt-10">
          <div className="flex items-end gap-4 mb-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-500 text-black text-2xl font-bold border-4 border-[#1a1a1a]">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="pb-1">
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <p className="text-sm text-neutral-400">{user.email}</p>
              <Badge className={`mt-1 text-[10px] ${isAdmin ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'} border`}>
                <Shield className="h-2.5 w-2.5 mr-1" />
                {isAdmin ? 'Admin' : 'Customer'}
              </Badge>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="border-[#2e2e2e] bg-[#252525] p-4 text-center">
              <CalendarCheck className="h-6 w-6 text-amber-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-white">{stats.bookings}</p>
              <p className="text-xs text-neutral-500">Total Bookings</p>
            </Card>
            <Card className="border-[#2e2e2e] bg-[#252525] p-4 text-center">
              <ShoppingCart className="h-6 w-6 text-amber-500 mx-auto mb-1" />
              <p className="text-2xl font-bold text-white">{stats.orders}</p>
              <p className="text-xs text-neutral-500">Total Orders</p>
            </Card>
          </div>

          {/* Edit Form */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Edit Profile</h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label className="text-neutral-300 flex items-center gap-1.5 text-sm">
                  <User className="h-3.5 w-3.5" />
                  Name
                </Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-[#252525] border-[#2e2e2e] text-white"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-neutral-300 flex items-center gap-1.5 text-sm">
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </Label>
                <Input
                  value={user.email}
                  disabled
                  className="bg-[#1e1e1e] border-[#2e2e2e] text-neutral-500"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-neutral-300 flex items-center gap-1.5 text-sm">
                  <Lock className="h-3.5 w-3.5" />
                  Password
                </Label>
                <Input
                  value="••••••••"
                  disabled
                  className="bg-[#1e1e1e] border-[#2e2e2e] text-neutral-500"
                />
                <p className="text-[11px] text-neutral-600">Password is securely encrypted and cannot be displayed</p>
              </div>
              <div className="space-y-1">
                <Label className="text-neutral-300 flex items-center gap-1.5 text-sm">
                  <Phone className="h-3.5 w-3.5" />
                  Phone
                </Label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+977-9800000000"
                  className="bg-[#252525] border-[#2e2e2e] text-white"
                />
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-amber-500 text-black hover:bg-amber-400 font-semibold"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>

          {/* Logout */}
          <div className="mt-8 pt-6 border-t border-[#2e2e2e]">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
