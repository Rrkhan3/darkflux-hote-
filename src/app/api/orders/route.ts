import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const orders = await db.foodOrder.findMany({
      where,
      include: {
        user: true,
        items: { include: { foodItem: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Calculate total
    let totalAmount = 0;
    for (const item of data.items) {
      const foodItem = await db.foodItem.findUnique({ where: { id: item.foodItemId } });
      if (foodItem) {
        totalAmount += foodItem.price * item.quantity;
        // Update order count
        await db.foodItem.update({
          where: { id: item.foodItemId },
          data: { orderCount: { increment: item.quantity } },
        });
      }
    }

    const order = await db.foodOrder.create({
      data: {
        userId: data.userId,
        roomNumber: data.roomNumber,
        status: 'preparing',
        totalAmount,
        deliveryTime: '20-30 min',
        paymentMethod: data.paymentMethod || 'pay_at_hotel',
        paymentStatus: 'pending',
        items: {
          create: data.items.map((item: { foodItemId: string; quantity: number; price: number }) => ({
            foodItemId: item.foodItemId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: { include: { foodItem: true } },
        user: true,
      },
    });
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
