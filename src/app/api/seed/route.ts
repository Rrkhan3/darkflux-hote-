import { db } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Seed admin user with hashed password
    const admin = await db.user.upsert({
      where: { email: 'admin@darkflux.com' },
      update: {},
      create: {
        email: 'admin@darkflux.com',
        name: 'Darkflux Admin',
        phone: '+977-9800000000',
        role: 'admin',
        password: hashPassword('admin123'),
      },
    });

    // Seed demo customer with hashed password
    const customer = await db.user.upsert({
      where: { email: 'guest@darkflux.com' },
      update: {},
      create: {
        email: 'guest@darkflux.com',
        name: 'Demo Guest',
        phone: '+977-9812345678',
        role: 'customer',
        password: hashPassword('guest123'),
      },
    });

    // Seed rooms
    const roomData = [
      {
        name: 'Cozy Single Room',
        type: 'Single',
        price: 2500,
        capacity: 1,
        description: 'A comfortable single room with all essential amenities. Perfect for solo travelers looking for a peaceful stay with modern conveniences.',
        amenities: 'WiFi,AC,TV,Hot Shower',
        images: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600,https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600',
        isAvailable: true,
      },
      {
        name: 'Comfort Double Room',
        type: 'Single',
        price: 3500,
        capacity: 2,
        description: 'Spacious double room designed for comfort with elegant interiors. Ideal for couples or friends seeking a relaxing getaway.',
        amenities: 'WiFi,AC,TV,Mini Bar,Hot Shower,Coffee Maker',
        images: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600,https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600',
        isAvailable: true,
      },
      {
        name: 'Deluxe Mountain View',
        type: 'Deluxe',
        price: 5500,
        capacity: 2,
        description: 'Experience luxury with breathtaking mountain views from your private balcony. This deluxe room offers premium comfort with traditional Nepali touches.',
        amenities: 'WiFi,AC,TV,Mini Bar,Hot Shower,Balcony,Coffee Maker,Bathrobe,Room Service',
        images: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=600,https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=600',
        isAvailable: true,
      },
      {
        name: 'Deluxe Garden Suite',
        type: 'Deluxe',
        price: 6500,
        capacity: 3,
        description: 'A serene garden-facing deluxe room with premium furnishings. Wake up to the sounds of nature and enjoy your morning coffee overlooking lush gardens.',
        amenities: 'WiFi,AC,TV,Mini Bar,Hot Shower,Garden View,Coffee Maker,Bathrobe,Room Service,Seating Area',
        images: 'https://images.unsplash.com/photo-1602002418082-a4443e081dd1?w=600,https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600',
        isAvailable: true,
      },
      {
        name: 'Royal Suite',
        type: 'Suite',
        price: 12000,
        capacity: 4,
        description: 'Our signature Royal Suite offers unmatched luxury with a separate living area, premium amenities, and stunning views. Experience the finest hospitality.',
        amenities: 'WiFi,AC,TV,Mini Bar,Hot Shower,Balcony,Coffee Maker,Bathrobe,Room Service,Seating Area,Jacuzzi,Fireplace',
        images: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600,https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=600',
        isAvailable: true,
      },
      {
        name: 'Presidential Penthouse',
        type: 'Presidential',
        price: 25000,
        capacity: 6,
        description: 'The ultimate in luxury living. Our Presidential Penthouse spans the entire top floor with panoramic views, private dining, and dedicated butler service.',
        amenities: 'WiFi,AC,TV,Mini Bar,Hot Shower,Balcony,Coffee Maker,Bathrobe,Room Service,Seating Area,Jacuzzi,Fireplace,Private Dining,Butler Service,Panoramic View',
        images: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600,https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600',
        isAvailable: true,
      },
    ];

    for (const room of roomData) {
      await db.room.upsert({
        where: { id: room.name.toLowerCase().replace(/\s+/g, '-') },
        update: {},
        create: { id: room.name.toLowerCase().replace(/\s+/g, '-'), ...room },
      });
    }

    // Seed food items
    const foodData = [
      {
        name: 'Chicken Mo:Mo',
        category: 'MoMo',
        price: 250,
        description: 'Steamed dumplings filled with spiced chicken, served with authentic Nepali achar and clear soup.',
        image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400',
        isVeg: false,
        isAvailable: true,
        rating: 4.8,
        orderCount: 156,
      },
      {
        name: 'Veg Mo:Mo',
        category: 'MoMo',
        price: 180,
        description: 'Fresh vegetable-stuffed steamed dumplings with cabbage, carrots, and spring onions. Served with sesame achar.',
        image: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=400',
        isVeg: true,
        isAvailable: true,
        rating: 4.5,
        orderCount: 134,
      },
      {
        name: 'Fried Mo:Mo',
        category: 'MoMo',
        price: 280,
        description: 'Crispy golden-fried dumplings with your choice of chicken or veg filling. The perfect crunchy appetizer.',
        image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400',
        isVeg: false,
        isAvailable: true,
        rating: 4.6,
        orderCount: 98,
      },
      {
        name: 'Chicken Chowmein',
        category: 'Noodles',
        price: 220,
        description: 'Stir-fried noodles tossed with tender chicken strips, fresh vegetables, and signature wok sauce.',
        image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400',
        isVeg: false,
        isAvailable: true,
        rating: 4.4,
        orderCount: 112,
      },
      {
        name: 'Thukpa',
        category: 'Noodles',
        price: 200,
        description: 'A hearty Tibetan noodle soup with rich broth, fresh vegetables, and aromatic herbs. The perfect comfort food.',
        image: 'https://images.unsplash.com/photo-1555126634-323283e090fa?w=400',
        isVeg: false,
        isAvailable: true,
        rating: 4.7,
        orderCount: 89,
      },
      {
        name: 'Veg Chowmein',
        category: 'Noodles',
        price: 180,
        description: 'Wok-tossed noodles with fresh seasonal vegetables, ginger, garlic, and a splash of soy sauce.',
        image: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=400',
        isVeg: true,
        isAvailable: true,
        rating: 4.3,
        orderCount: 76,
      },
      {
        name: 'Chicken Biryani',
        category: 'Rice',
        price: 350,
        description: 'Fragrant basmati rice layered with tender spiced chicken, saffron, and caramelized onions. A royal feast.',
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400',
        isVeg: false,
        isAvailable: true,
        rating: 4.9,
        orderCount: 167,
      },
      {
        name: 'Dal Bhat',
        category: 'Rice',
        price: 280,
        description: 'The classic Nepali meal - steamed rice served with lentil soup, seasonal vegetables, pickles, and papad.',
        image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400',
        isVeg: true,
        isAvailable: true,
        rating: 4.6,
        orderCount: 145,
      },
      {
        name: 'Butter Chicken',
        category: 'Curry',
        price: 380,
        description: 'Tender chicken pieces in a rich, creamy tomato-butter sauce with aromatic spices. Served with naan bread.',
        image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400',
        isVeg: false,
        isAvailable: true,
        rating: 4.8,
        orderCount: 132,
      },
      {
        name: 'Paneer Tikka Masala',
        category: 'Curry',
        price: 320,
        description: 'Grilled paneer cubes in a velvety spiced tomato gravy. A vegetarian favorite that satisfies every palate.',
        image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400',
        isVeg: true,
        isAvailable: true,
        rating: 4.5,
        orderCount: 78,
      },
      {
        name: 'Mango Lassi',
        category: 'Drinks',
        price: 120,
        description: 'A refreshing blend of sweet mango pulp and creamy yogurt. The perfect accompaniment to any spicy dish.',
        image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=400',
        isVeg: true,
        isAvailable: true,
        rating: 4.7,
        orderCount: 200,
      },
      {
        name: 'Masala Chai',
        category: 'Drinks',
        price: 80,
        description: 'Traditional Nepali spiced tea brewed with cardamom, cinnamon, ginger, and fresh milk. Pure warmth in a cup.',
        image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400',
        isVeg: true,
        isAvailable: true,
        rating: 4.6,
        orderCount: 230,
      },
      {
        name: 'Cold Coffee',
        category: 'Drinks',
        price: 150,
        description: 'Chilled blended coffee with ice cream and chocolate drizzle. The ultimate pick-me-up on a warm day.',
        image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400',
        isVeg: true,
        isAvailable: true,
        rating: 4.4,
        orderCount: 156,
      },
      {
        name: 'Gulab Jamun',
        category: 'Desserts',
        price: 150,
        description: 'Soft, melt-in-your-mouth milk dumplings soaked in fragrant rose-cardamom sugar syrup.',
        image: 'https://images.unsplash.com/photo-1666190050766-e985f7149261?w=400',
        isVeg: true,
        isAvailable: true,
        rating: 4.8,
        orderCount: 90,
      },
      {
        name: 'Rice Pudding (Kheer)',
        category: 'Desserts',
        price: 130,
        description: 'Creamy slow-cooked rice pudding with cardamom, saffron, almonds, and raisins. A traditional delight.',
        image: 'https://images.unsplash.com/photo-1571006459739-0c531bfbc982?w=400',
        isVeg: true,
        isAvailable: true,
        rating: 4.5,
        orderCount: 67,
      },
      {
        name: 'Samosa',
        category: 'Snacks',
        price: 80,
        description: 'Crispy golden pastry triangles stuffed with spiced potatoes and peas. Served with mint and tamarind chutney.',
        image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400',
        isVeg: true,
        isAvailable: true,
        rating: 4.4,
        orderCount: 120,
      },
      {
        name: 'Chicken Sekuwa',
        category: 'Snacks',
        price: 300,
        description: 'Smoky charcoal-grilled marinated chicken skewers. A beloved Nepali street food elevated to gourmet perfection.',
        image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=400',
        isVeg: false,
        isAvailable: true,
        rating: 4.7,
        orderCount: 88,
      },
    ];

    for (const food of foodData) {
      await db.foodItem.upsert({
        where: { id: food.name.toLowerCase().replace(/[\s:(]+/g, '-').replace(/[^a-z0-9-]/g, '') },
        update: {},
        create: { id: food.name.toLowerCase().replace(/[\s:(]+/g, '-').replace(/[^a-z0-9-]/g, ''), ...food },
      });
    }

    return NextResponse.json({
      message: 'Seed data created successfully',
      admin: { email: 'admin@darkflux.com', password: 'admin123' },
      rooms: roomData.length,
      foodItems: foodData.length,
    });
  } catch (error) {
    console.error('Error seeding data:', error);
    return NextResponse.json({ error: 'Failed to seed data' }, { status: 500 });
  }
}
