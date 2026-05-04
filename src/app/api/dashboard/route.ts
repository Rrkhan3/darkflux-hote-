import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const [totalBookings, totalFoodOrders, totalUsers, totalRooms, totalFoodItems] = await Promise.all([
      db.booking.count(),
      db.foodOrder.count(),
      db.user.count({ where: { role: 'customer' } }),
      db.room.count(),
      db.foodItem.count(),
    ]);

    const roomRevenue = await db.booking.aggregate({ _sum: { totalPrice: true } });
    const foodRevenue = await db.foodOrder.aggregate({ _sum: { totalAmount: true } });

    const activeBookings = await db.booking.count({ where: { status: 'confirmed' } });
    const activeOrders = await db.foodOrder.count({ where: { status: 'preparing' } });

    // Recent bookings
    const recentBookings = await db.booking.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: true, room: true },
    });

    // Recent orders
    const recentOrders = await db.foodOrder.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: true, items: { include: { foodItem: true } } },
    });

    // Popular food items
    const popularFood = await db.foodItem.findMany({
      take: 5,
      orderBy: { orderCount: 'desc' },
    });

    // Room type distribution
    const roomsByType = await db.room.groupBy({ by: ['type'], _count: { type: true } });

    // Booking status distribution
    const bookingsByStatus = await db.booking.groupBy({ by: ['status'], _count: { status: true } });

    // Monthly revenue (last 6 months)
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    const monthlyBookings = await db.booking.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { totalPrice: true, createdAt: true },
    });

    const monthlyFoodOrders = await db.foodOrder.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { totalAmount: true, createdAt: true },
    });

    return NextResponse.json({
      stats: {
        totalBookings,
        totalFoodOrders,
        totalUsers,
        totalRooms,
        totalFoodItems,
        roomRevenue: roomRevenue._sum.totalPrice || 0,
        foodRevenue: foodRevenue._sum.totalAmount || 0,
        totalRevenue: (roomRevenue._sum.totalPrice || 0) + (foodRevenue._sum.totalAmount || 0),
        activeBookings,
        activeOrders,
      },
      recentBookings,
      recentOrders,
      popularFood,
      roomsByType,
      bookingsByStatus,
      monthlyBookings,
      monthlyFoodOrders,
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
