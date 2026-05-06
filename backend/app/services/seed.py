from sqlalchemy import select

from app.core.database import async_session
from app.core.security import hash_password
from app.models.menu import Category, MenuItem
from app.models.user import User, UserRole


async def seed_data():
    async with async_session() as db:
        result = await db.execute(select(User))
        if result.scalars().first() is not None:
            return

        # Create default users
        users = [
            User(
                username="admin",
                full_name="System Admin",
                email="admin@hotel.com",
                hashed_password=hash_password("admin123"),
                role=UserRole.ADMIN,
            ),
            User(
                username="waiter1",
                full_name="Ram Sharma",
                email="ram@hotel.com",
                hashed_password=hash_password("staff123"),
                role=UserRole.STAFF,
            ),
            User(
                username="waiter2",
                full_name="Sita Thapa",
                email="sita@hotel.com",
                hashed_password=hash_password("staff123"),
                role=UserRole.STAFF,
            ),
            User(
                username="kitchen1",
                full_name="Chef Raju",
                email="raju@hotel.com",
                hashed_password=hash_password("kitchen123"),
                role=UserRole.KITCHEN,
            ),
        ]
        db.add_all(users)
        await db.flush()

        # Create categories
        categories = [
            Category(name="Appetizers", description="Start your meal right", display_order=1),
            Category(name="Main Course", description="Hearty main dishes", display_order=2),
            Category(name="Dal & Rice", description="Traditional Nepali staples", display_order=3),
            Category(name="Noodles & Momo", description="Asian favorites", display_order=4),
            Category(name="Beverages", description="Refreshing drinks", display_order=5),
            Category(name="Desserts", description="Sweet endings", display_order=6),
        ]
        db.add_all(categories)
        await db.flush()

        cat_map = {c.name: c.id for c in categories}

        # Create menu items
        items = [
            # Appetizers
            MenuItem(
                name="Spring Rolls",
                description="Crispy vegetable spring rolls",
                price=150,
                category_id=cat_map["Appetizers"],
                is_vegetarian=True,
                preparation_time=10,
                image_url="https://images.unsplash.com/photo-1544025162-d76694265947?w=400",
            ),
            MenuItem(
                name="Chicken Wings",
                description="Spicy buffalo chicken wings",
                price=350,
                category_id=cat_map["Appetizers"],
                preparation_time=15,
                image_url="https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400",
            ),
            MenuItem(
                name="Paneer Tikka",
                description="Grilled cottage cheese with spices",
                price=280,
                category_id=cat_map["Appetizers"],
                is_vegetarian=True,
                preparation_time=12,
                image_url="https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400",
            ),
            # Main Course
            MenuItem(
                name="Butter Chicken",
                description="Creamy tomato chicken curry",
                price=450,
                category_id=cat_map["Main Course"],
                preparation_time=20,
                image_url="https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400",
            ),
            MenuItem(
                name="Mutton Curry",
                description="Slow-cooked mutton in rich gravy",
                price=550,
                category_id=cat_map["Main Course"],
                preparation_time=25,
                image_url="https://images.unsplash.com/photo-1545247181-516773cae754?w=400",
            ),
            MenuItem(
                name="Fish Fry",
                description="Crispy fried river fish",
                price=400,
                category_id=cat_map["Main Course"],
                preparation_time=15,
                image_url="https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400",
            ),
            MenuItem(
                name="Palak Paneer",
                description="Spinach with cottage cheese",
                price=320,
                category_id=cat_map["Main Course"],
                is_vegetarian=True,
                preparation_time=18,
                image_url="https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=400",
            ),
            # Dal & Rice
            MenuItem(
                name="Dal Bhat Set",
                description="Traditional Nepali thali set",
                price=250,
                category_id=cat_map["Dal & Rice"],
                is_vegetarian=True,
                preparation_time=10,
                image_url="https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=400",
            ),
            MenuItem(
                name="Chicken Biryani",
                description="Aromatic basmati rice with chicken",
                price=380,
                category_id=cat_map["Dal & Rice"],
                preparation_time=20,
                image_url="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400",
            ),
            MenuItem(
                name="Jeera Rice",
                description="Cumin-flavored steamed rice",
                price=120,
                category_id=cat_map["Dal & Rice"],
                is_vegetarian=True,
                preparation_time=8,
                image_url="https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=400",
            ),
            # Noodles & Momo
            MenuItem(
                name="Chicken Momo",
                description="Steamed chicken dumplings (10 pcs)",
                price=200,
                category_id=cat_map["Noodles & Momo"],
                preparation_time=15,
                image_url="https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400",
            ),
            MenuItem(
                name="Veg Momo",
                description="Steamed vegetable dumplings (10 pcs)",
                price=150,
                category_id=cat_map["Noodles & Momo"],
                is_vegetarian=True,
                preparation_time=15,
                image_url="https://images.unsplash.com/photo-1625220194771-7ebdea0b70b9?w=400",
            ),
            MenuItem(
                name="Chow Mein",
                description="Stir-fried noodles with vegetables",
                price=180,
                category_id=cat_map["Noodles & Momo"],
                is_vegetarian=True,
                preparation_time=12,
                image_url="https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400",
            ),
            MenuItem(
                name="Thukpa",
                description="Tibetan noodle soup",
                price=220,
                category_id=cat_map["Noodles & Momo"],
                preparation_time=15,
                image_url="https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400",
            ),
            # Beverages
            MenuItem(
                name="Masala Tea",
                description="Spiced Nepali milk tea",
                price=50,
                category_id=cat_map["Beverages"],
                is_vegetarian=True,
                preparation_time=5,
                image_url="https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400",
            ),
            MenuItem(
                name="Fresh Juice",
                description="Seasonal fresh fruit juice",
                price=120,
                category_id=cat_map["Beverages"],
                is_vegetarian=True,
                preparation_time=5,
                image_url="https://images.unsplash.com/photo-1534353473418-4cfa6c56fd38?w=400",
            ),
            MenuItem(
                name="Lassi",
                description="Cool yogurt-based drink",
                price=100,
                category_id=cat_map["Beverages"],
                is_vegetarian=True,
                preparation_time=5,
                image_url="https://images.unsplash.com/photo-1626200419199-391ae4be7a41?w=400",
            ),
            # Desserts
            MenuItem(
                name="Gulab Jamun",
                description="Deep-fried milk dumplings in syrup",
                price=120,
                category_id=cat_map["Desserts"],
                is_vegetarian=True,
                preparation_time=5,
                image_url="https://images.unsplash.com/photo-1666190020955-99ff8871d188?w=400",
            ),
            MenuItem(
                name="Kheer",
                description="Rice pudding with nuts",
                price=100,
                category_id=cat_map["Desserts"],
                is_vegetarian=True,
                preparation_time=5,
                image_url="https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400",
            ),
            MenuItem(
                name="Ice Cream",
                description="Assorted flavors",
                price=150,
                category_id=cat_map["Desserts"],
                is_vegetarian=True,
                preparation_time=3,
                image_url="https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400",
            ),
        ]
        db.add_all(items)
        await db.commit()
