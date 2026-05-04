import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const foodItem = await db.foodItem.findUnique({
      where: { id },
      include: { reviews: { include: { user: true } } },
    });
    if (!foodItem) return NextResponse.json({ error: 'Food item not found' }, { status: 404 });
    return NextResponse.json(foodItem);
  } catch (error) {
    console.error('Error fetching food item:', error);
    return NextResponse.json({ error: 'Failed to fetch food item' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await request.json();
    const foodItem = await db.foodItem.update({ where: { id }, data });
    return NextResponse.json(foodItem);
  } catch (error) {
    console.error('Error updating food item:', error);
    return NextResponse.json({ error: 'Failed to update food item' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await db.foodItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting food item:', error);
    return NextResponse.json({ error: 'Failed to delete food item' }, { status: 500 });
  }
}
