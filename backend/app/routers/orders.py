import random
import string
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.core.websocket_manager import manager
from app.models.menu import MenuItem
from app.models.order import Order, OrderItem, OrderStatus
from app.models.user import User
from app.schemas.order import OrderCreate, OrderItemResponse, OrderResponse, OrderStatusUpdate

router = APIRouter(prefix="/orders", tags=["Orders"])

TAX_RATE = 13.0


def generate_order_number() -> str:
    ts = datetime.now(timezone.utc).strftime("%m%d%H%M")
    rand = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"ORD-{ts}-{rand}"


async def build_order_response(order: Order, db: AsyncSession) -> OrderResponse:
    result = await db.execute(select(OrderItem).where(OrderItem.order_id == order.id))
    items = [OrderItemResponse.model_validate(i) for i in result.scalars().all()]
    resp = OrderResponse.model_validate(order)
    resp.items = items
    return resp


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    data: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = None,
):
    if not data.items:
        raise HTTPException(status_code=400, detail="Order must have at least one item")

    order = Order(
        order_number=generate_order_number(),
        table_number=data.table_number,
        room_number=data.room_number,
        order_type=data.order_type,
        customer_name=data.customer_name,
        special_instructions=data.special_instructions,
        staff_id=current_user.id if current_user else None,
        status=OrderStatus.PENDING,
    )
    db.add(order)
    await db.flush()

    subtotal = 0.0
    for item_data in data.items:
        result = await db.execute(select(MenuItem).where(MenuItem.id == item_data.menu_item_id))
        menu_item = result.scalar_one_or_none()
        if not menu_item:
            raise HTTPException(
                status_code=404, detail=f"Menu item {item_data.menu_item_id} not found"
            )
        if not menu_item.is_available:
            raise HTTPException(status_code=400, detail=f"{menu_item.name} is not available")

        total_price = menu_item.price * item_data.quantity
        order_item = OrderItem(
            order_id=order.id,
            menu_item_id=menu_item.id,
            item_name=menu_item.name,
            quantity=item_data.quantity,
            unit_price=menu_item.price,
            total_price=total_price,
            notes=item_data.notes,
        )
        db.add(order_item)
        subtotal += total_price

    tax_amount = subtotal * TAX_RATE / 100
    order.subtotal = round(subtotal, 2)
    order.tax_amount = round(tax_amount, 2)
    order.total_amount = round(subtotal + tax_amount, 2)

    await db.commit()
    await db.refresh(order)

    resp = await build_order_response(order, db)
    await manager.broadcast(
        {"type": "new_order", "order": resp.model_dump(mode="json")},
        channel="kitchen",
    )
    await manager.broadcast(
        {"type": "new_order", "order": resp.model_dump(mode="json")},
        channel="admin",
    )
    return resp


@router.post("/authenticated", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order_authenticated(
    data: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not data.items:
        raise HTTPException(status_code=400, detail="Order must have at least one item")

    order = Order(
        order_number=generate_order_number(),
        table_number=data.table_number,
        room_number=data.room_number,
        order_type=data.order_type,
        customer_name=data.customer_name,
        special_instructions=data.special_instructions,
        staff_id=current_user.id,
        status=OrderStatus.PENDING,
    )
    db.add(order)
    await db.flush()

    subtotal = 0.0
    for item_data in data.items:
        result = await db.execute(select(MenuItem).where(MenuItem.id == item_data.menu_item_id))
        menu_item = result.scalar_one_or_none()
        if not menu_item:
            raise HTTPException(
                status_code=404, detail=f"Menu item {item_data.menu_item_id} not found"
            )
        if not menu_item.is_available:
            raise HTTPException(status_code=400, detail=f"{menu_item.name} is not available")

        total_price = menu_item.price * item_data.quantity
        order_item = OrderItem(
            order_id=order.id,
            menu_item_id=menu_item.id,
            item_name=menu_item.name,
            quantity=item_data.quantity,
            unit_price=menu_item.price,
            total_price=total_price,
            notes=item_data.notes,
        )
        db.add(order_item)
        subtotal += total_price

    tax_amount = subtotal * TAX_RATE / 100
    order.subtotal = round(subtotal, 2)
    order.tax_amount = round(tax_amount, 2)
    order.total_amount = round(subtotal + tax_amount, 2)

    await db.commit()
    await db.refresh(order)

    resp = await build_order_response(order, db)
    await manager.broadcast(
        {"type": "new_order", "order": resp.model_dump(mode="json")},
        channel="kitchen",
    )
    await manager.broadcast(
        {"type": "new_order", "order": resp.model_dump(mode="json")},
        channel="admin",
    )
    return resp


@router.get("", response_model=list[OrderResponse])
async def list_orders(
    status_filter: OrderStatus | None = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(Order).order_by(Order.created_at.desc())
    if status_filter:
        query = query.where(Order.status == status_filter)
    result = await db.execute(query)
    orders = []
    for order in result.scalars().all():
        orders.append(await build_order_response(order, db))
    return orders


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return await build_order_response(order, db)


@router.get("/number/{order_number}", response_model=OrderResponse)
async def get_order_by_number(order_number: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Order).where(Order.order_number == order_number))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return await build_order_response(order, db)


@router.patch("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: int,
    data: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = data.status
    order.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(order)

    resp = await build_order_response(order, db)
    msg = {"type": "order_status_update", "order": resp.model_dump(mode="json")}
    await manager.broadcast(msg, channel="kitchen")
    await manager.broadcast(msg, channel="admin")
    await manager.broadcast(msg, channel="customer")
    return resp
