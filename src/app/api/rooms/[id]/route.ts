import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const room = await db.room.findUnique({
      where: { id },
      include: { reviews: { include: { user: true } } },
    });
    if (!room) return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    return NextResponse.json({
      ...room,
      avgRating: room.reviews.length > 0
        ? room.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / room.reviews.length
        : 0,
      amenities: room.amenities.split(','),
      images: room.images.split(','),
    });
  } catch (error) {
    console.error('Error fetching room:', error);
    return NextResponse.json({ error: 'Failed to fetch room' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();
    const updateData: Record<string, unknown> = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.capacity !== undefined) updateData.capacity = data.capacity;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.amenities !== undefined) updateData.amenities = Array.isArray(data.amenities) ? data.amenities.join(',') : data.amenities;
    if (data.images !== undefined) updateData.images = Array.isArray(data.images) ? data.images.join(',') : data.images;
    if (data.isAvailable !== undefined) updateData.isAvailable = data.isAvailable;

    const room = await db.room.update({ where: { id }, data: updateData });
    return NextResponse.json(room);
  } catch (error) {
    console.error('Error updating room:', error);
    return NextResponse.json({ error: 'Failed to update room' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.room.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting room:', error);
    return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 });
  }
}
