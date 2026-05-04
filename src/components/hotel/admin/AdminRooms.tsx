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
  DialogTrigger,
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
import { Plus, Pencil, Trash2, DoorOpen } from 'lucide-react';

interface Room {
  id: string;
  name: string;
  type: string;
  price: number;
  capacity: number;
  description: string;
  amenities: string[];
  images: string[];
  isAvailable: boolean;
}

const roomTypes = ['Single', 'Deluxe', 'Suite', 'Presidential'];

const emptyRoom = {
  name: '',
  type: 'Single',
  price: 0,
  capacity: 1,
  description: '',
  amenities: '',
  images: '',
  isAvailable: true,
};

export default function AdminRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyRoom);
  const [submitting, setSubmitting] = useState(false);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/rooms');
      const data = await res.json();
      setRooms(data);
    } catch {
      toast.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const openAdd = () => {
    setEditId(null);
    setForm(emptyRoom);
    setDialogOpen(true);
  };

  const openEdit = (room: Room) => {
    setEditId(room.id);
    setForm({
      name: room.name,
      type: room.type,
      price: room.price,
      capacity: room.capacity,
      description: room.description,
      amenities: Array.isArray(room.amenities) ? room.amenities.join(', ') : room.amenities,
      images: Array.isArray(room.images) ? room.images.join(', ') : room.images,
      isAvailable: room.isAvailable,
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
      const amenitiesArr = typeof form.amenities === 'string'
        ? form.amenities.split(',').map((s) => s.trim()).filter(Boolean)
        : form.amenities;
      const imagesArr = typeof form.images === 'string'
        ? form.images.split(',').map((s) => s.trim()).filter(Boolean)
        : form.images;

      const body = {
        name: form.name,
        type: form.type,
        price: Number(form.price),
        capacity: Number(form.capacity),
        description: form.description,
        amenities: amenitiesArr,
        images: imagesArr,
        isAvailable: form.isAvailable,
      };

      if (editId) {
        const res = await fetch(`/api/rooms/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          toast.success('Room updated');
        } else {
          toast.error('Failed to update room');
        }
      } else {
        const res = await fetch('/api/rooms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (res.ok) {
          toast.success('Room created');
        } else {
          toast.error('Failed to create room');
        }
      }
      setDialogOpen(false);
      fetchRooms();
    } catch {
      toast.error('Failed to save room');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    try {
      await fetch(`/api/rooms/${id}`, { method: 'DELETE' });
      toast.success('Room deleted');
      fetchRooms();
    } catch {
      toast.error('Failed to delete room');
    }
  };

  const toggleAvailability = async (room: Room) => {
    try {
      await fetch(`/api/rooms/${room.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: !room.isAvailable }),
      });
      fetchRooms();
    } catch {
      toast.error('Failed to update');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Room Management</h1>
          <p className="text-neutral-500 mt-1">{rooms.length} rooms total</p>
        </div>
        <Button onClick={openAdd} className="bg-amber-500 text-black hover:bg-amber-400 font-semibold">
          <Plus className="h-4 w-4 mr-2" />
          Add Room
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
          <Table>
            <TableHeader>
              <TableRow className="border-[#2e2e2e] hover:bg-transparent">
                <TableHead className="text-neutral-500">Name</TableHead>
                <TableHead className="text-neutral-500">Type</TableHead>
                <TableHead className="text-neutral-500">Price</TableHead>
                <TableHead className="text-neutral-500">Capacity</TableHead>
                <TableHead className="text-neutral-500">Available</TableHead>
                <TableHead className="text-neutral-500 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((room) => (
                <TableRow key={room.id} className="border-[#2e2e2e] hover:bg-[#252525]">
                  <TableCell className="text-white font-medium">{room.name}</TableCell>
                  <TableCell>
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">
                      {room.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-amber-500">NPR {room.price.toLocaleString()}</TableCell>
                  <TableCell className="text-neutral-400">{room.capacity}</TableCell>
                  <TableCell>
                    <Switch
                      checked={room.isAvailable}
                      onCheckedChange={() => toggleAvailability(room)}
                      className="data-[state=checked]:bg-emerald-500"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(room)} className="h-8 w-8 text-neutral-400 hover:text-amber-500">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(room.id)} className="h-8 w-8 text-neutral-400 hover:text-red-500">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {rooms.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-neutral-500 py-8">
                    <DoorOpen className="h-8 w-8 mx-auto mb-2 text-neutral-700" />
                    No rooms yet. Add your first room!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#1a1a1a] border-[#2e2e2e] max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-white">{editId ? 'Edit Room' : 'Add Room'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1">
              <Label className="text-neutral-300 text-sm">Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-[#252525] border-[#2e2e2e] text-white" placeholder="Room name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-neutral-300 text-sm">Type *</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger className="bg-[#252525] border-[#2e2e2e] text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-[#2e2e2e]">
                    {roomTypes.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-neutral-300 text-sm">Price (NPR) *</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="bg-[#252525] border-[#2e2e2e] text-white" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-neutral-300 text-sm">Capacity</Label>
                <Input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })} className="bg-[#252525] border-[#2e2e2e] text-white" />
              </div>
              <div className="space-y-1 flex items-end">
                <div className="flex items-center gap-2">
                  <Switch checked={form.isAvailable} onCheckedChange={(v) => setForm({ ...form, isAvailable: v })} className="data-[state=checked]:bg-emerald-500" />
                  <Label className="text-neutral-300 text-sm">Available</Label>
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-neutral-300 text-sm">Description</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-[#252525] border-[#2e2e2e] text-white" placeholder="Room description" />
            </div>
            <div className="space-y-1">
              <Label className="text-neutral-300 text-sm">Amenities (comma-separated)</Label>
              <Input value={typeof form.amenities === 'string' ? form.amenities : (form.amenities as string[]).join(', ')} onChange={(e) => setForm({ ...form, amenities: e.target.value })} className="bg-[#252525] border-[#2e2e2e] text-white" placeholder="WiFi, AC, TV, Mini Bar" />
            </div>
            <div className="space-y-1">
              <Label className="text-neutral-300 text-sm">Image URLs (comma-separated)</Label>
              <Input value={typeof form.images === 'string' ? form.images : (form.images as string[]).join(', ')} onChange={(e) => setForm({ ...form, images: e.target.value })} className="bg-[#252525] border-[#2e2e2e] text-white" placeholder="https://..." />
            </div>
            <Button onClick={handleSubmit} disabled={submitting} className="w-full bg-amber-500 text-black hover:bg-amber-400 font-semibold">
              {submitting ? 'Saving...' : editId ? 'Update Room' : 'Create Room'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
