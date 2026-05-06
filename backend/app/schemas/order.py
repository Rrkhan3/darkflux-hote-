from datetime import datetime

from pydantic import BaseModel

from app.models.order import OrderStatus, OrderType


class OrderItemCreate(BaseModel):
    menu_item_id: int
    quantity: int = 1
    notes: str | None = None


class OrderItemResponse(BaseModel):
    id: int
    order_id: int
    menu_item_id: int
    item_name: str
    quantity: int
    unit_price: float
    total_price: float
    notes: str | None

    model_config = {"from_attributes": True}


class OrderCreate(BaseModel):
    table_number: str | None = None
    room_number: str | None = None
    order_type: OrderType = OrderType.DINE_IN
    customer_name: str | None = None
    special_instructions: str | None = None
    items: list[OrderItemCreate]


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class OrderResponse(BaseModel):
    id: int
    order_number: str
    table_number: str | None
    room_number: str | None
    order_type: OrderType
    status: OrderStatus
    customer_name: str | None
    special_instructions: str | None
    staff_id: int | None
    subtotal: float
    tax_amount: float
    total_amount: float
    items: list[OrderItemResponse] = []
    created_at: datetime | None
    updated_at: datetime | None

    model_config = {"from_attributes": True}
