'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Users, RefreshCw, Mail, Phone, Shield, Eye, EyeOff, Lock, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  hasPassword: boolean;
  createdAt: string;
  _count: {
    bookings: number;
    foodOrders: number;
    reviews: number;
  };
}

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setCustomers(data);
    } catch {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const filteredCustomers = customers.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Customer Management</h1>
          <p className="text-neutral-500 mt-1">{customers.length} users total</p>
        </div>
        <Button variant="outline" onClick={fetchCustomers} className="border-amber-500/30 text-amber-500 hover:bg-amber-500/10">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
        <Input
          placeholder="Search users by name, email, or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-[#1a1a1a] border-[#2e2e2e] text-white pl-9 focus:border-amber-500/50"
        />
      </div>

      <Card className="border-[#2e2e2e] bg-[#1a1a1a] overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-[#2e2e2e] hover:bg-transparent">
                  <TableHead className="text-neutral-500">Name</TableHead>
                  <TableHead className="text-neutral-500">Email</TableHead>
                  <TableHead className="text-neutral-500">Password</TableHead>
                  <TableHead className="text-neutral-500">Phone</TableHead>
                  <TableHead className="text-neutral-500">Role</TableHead>
                  <TableHead className="text-neutral-500 text-center">Bookings</TableHead>
                  <TableHead className="text-neutral-500 text-center">Orders</TableHead>
                  <TableHead className="text-neutral-500">Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((c) => (
                  <TableRow key={c.id} className="border-[#2e2e2e] hover:bg-[#252525]">
                    <TableCell className="text-white font-medium text-sm">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/20 text-amber-500 text-xs font-bold">
                          {c.name.charAt(0)}
                        </div>
                        {c.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-neutral-400 text-sm">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 shrink-0" />
                        <span className="truncate max-w-[180px]">{c.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div className="flex items-center gap-1.5">
                        <Lock className="h-3 w-3 text-neutral-500 shrink-0" />
                        {visiblePasswords.has(c.id) ? (
                          <span className="text-amber-400 font-mono text-xs">••••••••</span>
                        ) : (
                          <span className="text-neutral-500 font-mono text-xs">••••••••</span>
                        )}
                        <button
                          onClick={() => togglePasswordVisibility(c.id)}
                          className="text-neutral-500 hover:text-neutral-300 transition-colors ml-1"
                          title="Passwords are always hidden for security"
                        >
                          {visiblePasswords.has(c.id) ? (
                            <EyeOff className="h-3.5 w-3.5" />
                          ) : (
                            <Eye className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                      <p className="text-[10px] text-neutral-600 mt-0.5">
                        {c.hasPassword ? 'Secured' : 'No password set'}
                      </p>
                    </TableCell>
                    <TableCell className="text-neutral-400 text-sm">
                      {c.phone ? (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {c.phone}
                        </div>
                      ) : (
                        <span className="text-neutral-600">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={`text-[10px] ${c.role === 'admin' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'} border`}>
                        <Shield className="h-2.5 w-2.5 mr-0.5" />
                        {c.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-neutral-300 text-sm text-center">{c._count?.bookings || 0}</TableCell>
                    <TableCell className="text-neutral-300 text-sm text-center">{c._count?.foodOrders || 0}</TableCell>
                    <TableCell className="text-neutral-500 text-xs">
                      {format(new Date(c.createdAt), 'MMM dd, yyyy')}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCustomers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-neutral-500 py-8">
                      <Users className="h-8 w-8 mx-auto mb-2 text-neutral-700" />
                      {searchQuery ? 'No users match your search' : 'No users yet'}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Security Notice */}
      <div className="p-4 rounded-lg bg-[#1a1a1a] border border-[#2e2e2e]">
        <div className="flex items-start gap-3">
          <Lock className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-white">Security Notice</h3>
            <p className="text-xs text-neutral-500 mt-1">
              All passwords are securely hashed using scrypt encryption and are never stored in plain text.
              The admin panel only shows masked passwords (••••••••) to protect user privacy.
              Even administrators cannot view actual passwords — users must reset their password if forgotten.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
