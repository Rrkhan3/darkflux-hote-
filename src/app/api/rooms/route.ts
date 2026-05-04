import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const available = searchParams.get('available');

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (available === 'true') where.isAvailable = true;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) (where.price as Record<string, unknown>).gte = parseFloat(minPrice);
      if (maxPrice) (where.price as Record<string, unknown>).lte = parseFloat(maxPrice);
    }

    const rooms = await db.room.findMany({
      where,
      include: { reviews: true },
      orderBy: { price: 'asc' },
    });

    const roomsWithAvgRating = rooms.map(room => ({
      ...room,
      avgRating: room.reviews.length > 0
        ? room.reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / room.reviews.length
        : 0,
      amenities: room.amenities.split(','),
      images: room.images.split(','),
    }));

    return NextResponse.json(roomsWithAvgRating);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const room = await db.room.create({
      data: {
        name: data.name,
        type: data.type,
        price: data.price,
        capacity: data.capacity,
        description: data.description,
        amenities: data.amenities.join(','),
        images: data.images.join(','),
        isAvailable: data.isAvailable ?? true,
      },
    });
    return NextResponse.json(room);
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}
