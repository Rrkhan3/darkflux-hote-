import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isVeg = searchParams.get('isVeg');
    const available = searchParams.get('available');
    const sortBy = searchParams.get('sortBy'); // popular | rating | price_asc | price_desc

    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (isVeg !== null) where.isVeg = isVeg === 'true';
    if (available === 'true') where.isAvailable = true;

    let orderBy: Record<string, string> = { createdAt: 'desc' };
    if (sortBy === 'popular') orderBy = { orderCount: 'desc' };
    if (sortBy === 'rating') orderBy = { rating: 'desc' };
    if (sortBy === 'price_asc') orderBy = { price: 'asc' };
    if (sortBy === 'price_desc') orderBy = { price: 'desc' };

    const foodItems = await db.foodItem.findMany({ where, orderBy });
    return NextResponse.json(foodItems);
  } catch (error) {
    console.error('Error fetching food items:', error);
    return NextResponse.json({ error: 'Failed to fetch food items' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const foodItem = await db.foodItem.create({ data });
    return NextResponse.json(foodItem);
  } catch (error) {
    console.error('Error creating food item:', error);
    return NextResponse.json({ error: 'Failed to create food item' }, { status: 500 });
  }
}
