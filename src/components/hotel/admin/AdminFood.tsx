'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, UtensilsCrossed, Leaf, Drumstick } from 'lucide-react';

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

const categories = ['MoMo', 'Noodles', 'Rice', 'Curry', 'Drinks', 'Desserts', 'Snacks'];

const emptyFood = {
  name: '',
  category: 'MoMo',
  price: 0,
  description: '',
  image: '',
  isVeg: false,
  isAvailable: true,
  rating: 0,
  orderCount: 0,
};

export default function AdminFood() {
  const [food, setFood] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyFood);
  const [submitting, setSubmitting] = useState(false);

  const fetchFood = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/food');
      const data = await res.json();
      setFood(data);
    } catch {
      toast.error('Failed to load food items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFood();
  }, []);

  const openAdd = () => {
    setEditId(null);
    setForm(emptyFood);
    setDialogOpen(true);
  };

  const openEdit = (item: FoodItem) => {
    setEditId(item.id);
    setForm({
      name: item.name,
      category: item.category,
      price: item.price,
      description: item.description,
      image: item.image,
      isVeg: item.isVeg,
      isAvailable: item.isAvailable,
      rating: item.rating,
      orderCount: item.orderCount,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.price) {
      toast.error('Please fill in required fields');
      return;
    }
    setSubmitting(true);
    try {
      if (editId) {
        const res = await fetch(`/api/food/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) toast.success('Food item updated');
        else toast.error('Failed to update');
      } else {
        const res = await fetch('/api/food', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (res.ok) toast.success('Food item created');
        else toast.error('Failed to create');
      }
      setDialogOpen(false);
      fetchFood();
    } catch {
      toast.error('Failed to save');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await fetch(`/api/food/${id}`, { method: 'DELETE' });
      toast.success('Item deleted');
      fetchFood();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const toggleAvailability = async (item: FoodItem) => {
    try {
      await fetch(`/api/food/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !item.isAvailable }),
      });
      fetchFood();
    } catch {
      toast.error('Failed to update');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Food Management</h1>
          <p className="text-neutral-500 mt-1">{food.length} items total</p>
        </div>
        <Button onClick={openAdd} className="bg-amber-500 text-black hover:bg-amber-400 font-semibold">
          <Plus className="h-4 w-4 mr-2" />
          Add Food Item
        </Button>
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
                  <TableHead className="text-neutral-500">Category</TableHead>
                  <TableHead className="text-neutral-500">Price</TableHead>
                  <TableHead className="text-neutral-500">Veg</TableHead>
                  <TableHead className="text-neutral-500">Available</TableHead>
                  <TableHead className="text-neutral-500">Orders</TableHead>
                  <TableHead className="text-neutral-500 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {food.map((item) => (
                  <TableRow key={item.id} className="border-[#2e2e2e] hover:bg-[#252525]">
                    <TableCell className="text-white font-medium">{item.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px] bg-[#252525] text-neutral-400">
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-amber-500">NPR {item.price}</TableCell>
                    <TableCell>
                      {item.isVeg ? (
                        <Leaf className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Drumstick className="h-4 w-4 text-red-400" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={item.isAvailable}
                        onCheckedChange={() => toggleAvailability(item)}
                        className="data-[state=checked]:bg-emerald-500"
                      />
                    </TableCell>
                    <TableCell className="text-neutral-400">{item.orderCount}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(item)} className="h-8 w-8 text-neutral-400 hover:text-amber-500">
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="h-8 w-8 text-neutral-400 hover:text-red-500">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {food.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-neutral-500 py-8">
                      <UtensilsCrossed className="h-8 w-8 mx-auto mb-2 text-neutral-700" />
                      No food items yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#1a1a1a] border-[#2e2e2e] max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">{editId ? 'Edit Food Item' : 'Add Food Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label className="text-neutral-300 text-sm">Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-[#252525] border-[#2e2e2e] text-white" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-neutral-300 text-sm">Category *</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger className="bg-[#252525] border-[#2e2e2e] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#2e2e2e]">
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-neutral-300 text-sm">Price (NPR) *</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="bg-[#252525] border-[#2e2e2e] text-white" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-neutral-300 text-sm">Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-[#252525] border-[#2e2e2e] text-white" />
            </div>
            <div className="space-y-1">
              <Label className="text-neutral-300 text-sm">Image URL</Label>
              <Input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="bg-[#252525] border-[#2e2e2e] text-white" placeholder="https://..." />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.isVeg} onCheckedChange={(v) => setForm({ ...form, isVeg: v })} className="data-[state=checked]:bg-emerald-500" />
                <Label className="text-neutral-300 text-sm">Vegetarian</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.isAvailable} onCheckedChange={(v) => setForm({ ...form, isAvailable: v })} className="data-[state=checked]:bg-emerald-500" />
                <Label className="text-neutral-300 text-sm">Available</Label>
              </div>
            </div>
            <Button onClick={handleSubmit} disabled={submitting} className="w-full bg-amber-500 text-black hover:bg-amber-400 font-semibold">
              {submitting ? 'Saving...' : editId ? 'Update Item' : 'Create Item'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
