import enum

from sqlalchemy import Column, DateTime, Enum, Float, Integer, String, Text, func

from app.models.base import Base


class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    COOKING = "cooking"
    READY = "ready"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


class OrderType(str, enum.Enum):
    DINE_IN = "dine_in"
    ROOM_SERVICE = "room_service"
    TAKEAWAY = "takeaway"


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(20), unique=True, nullable=False, index=True)
    table_number = Column(String(20), nullable=True)
    room_number = Column(String(20), nullable=True)
    order_type = Column(Enum(OrderType), default=OrderType.DINE_IN)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING, index=True)
    customer_name = Column(String(100), nullable=True)
    special_instructions = Column(Text, nullable=True)
    staff_id = Column(Integer, nullable=True, index=True)
    subtotal = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    total_amount = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, nullable=False, index=True)
    menu_item_id = Column(Integer, nullable=False)
    item_name = Column(String(200), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Float, nullable=False)
    total_price = Column(Float, nullable=False)
    notes = Column(Text, nullable=True)
