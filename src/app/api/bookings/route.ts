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

    const bookings = await db.booking.findMany({
      where,
      include: { user: true, room: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Check room availability
    const existingBookings = await db.booking.findMany({
      where: {
        roomId: data.roomId,
        status: { in: ['confirmed', 'checked_in'] },
        OR: [
          { checkIn: { lte: new Date(data.checkOut) }, checkOut: { gte: new Date(data.checkIn) } },
        ],
      },
    });

    if (existingBookings.length > 0) {
      return NextResponse.json({ error: 'Room is not available for the selected dates' }, { status: 400 });
    }

    const booking = await db.booking.create({
      data: {
        userId: data.userId,
        roomId: data.roomId,
        checkIn: new Date(data.checkIn),
        checkOut: new Date(data.checkOut),
        guests: data.guests || 1,
        status: 'confirmed',
        totalPrice: data.totalPrice,
        paymentMethod: data.paymentMethod || 'pay_at_hotel',
        paymentStatus: data.paymentMethod === 'pay_at_hotel' ? 'pending' : 'paid',
      },
      include: { room: true, user: true },
    });
    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}
