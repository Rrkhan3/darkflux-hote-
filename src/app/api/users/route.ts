import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const users = await db.user.findMany({
      include: {
        _count: { select: { bookings: true, foodOrders: true, reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    // Mask passwords before sending to client
    const safeUsers = users.map(({ password, ...user }) => ({
      ...user,
      hasPassword: !!password,
    }));
    return NextResponse.json(safeUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const existing = await db.user.findUnique({ where: { email: data.email } });
    if (existing) {
      const { password, ...userWithoutPassword } = existing;
      return NextResponse.json(userWithoutPassword);
    }

    const user = await db.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: data.password || 'no-password-set',
        phone: data.phone,
        role: data.role || 'customer',
        avatar: data.avatar,
      },
    });
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
