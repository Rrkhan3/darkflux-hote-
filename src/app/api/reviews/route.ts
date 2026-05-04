import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const roomId = searchParams.get('roomId');
    const foodItemId = searchParams.get('foodItemId');

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (roomId) where.roomId = roomId;
    if (foodItemId) where.foodItemId = foodItemId;

    const reviews = await db.review.findMany({
      where,
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const review = await db.review.create({ data, include: { user: true } });
    
    // Update average rating for room or food item
    if (data.type === 'room' && data.roomId) {
      const reviews = await db.review.findMany({ where: { roomId: data.roomId } });
      const avgRating = reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length;
      // Note: Room model doesn't have a rating field in our schema, so we skip this
    }
    if (data.type === 'food' && data.foodItemId) {
      const reviews = await db.review.findMany({ where: { foodItemId: data.foodItemId } });
      const avgRating = reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length;
      await db.foodItem.update({ where: { id: data.foodItemId }, data: { rating: avgRating } });
    }
    
    return NextResponse.json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
  }
}
