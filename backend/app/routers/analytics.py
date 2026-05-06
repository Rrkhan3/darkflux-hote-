from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import require_role
from app.models.bill import Bill, PaymentStatus
from app.models.order import Order, OrderItem, OrderStatus
from app.models.user import User, UserRole
from app.schemas.analytics import (
    AnalyticsSummary,
    DailySales,
    ItemSales,
    StaffPerformance,
)

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/summary", response_model=AnalyticsSummary)
async def get_summary(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_role(UserRole.ADMIN)),
):
    now = datetime.now(timezone.utc)
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_start = today_start - timedelta(days=now.weekday())
    month_start = today_start.replace(day=1)

    # Today's sales
    result = await db.execute(
        select(func.coalesce(func.sum(Order.total_amount), 0), func.count(Order.id)).where(
            Order.created_at >= today_start,
            Order.status != OrderStatus.CANCELLED,
        )
    )
    row = result.one()
    today_sales = float(row[0])
    today_orders = int(row[1])

    # Week sales
    result = await db.execute(
        select(func.coalesce(func.sum(Order.total_amount), 0)).where(
            Order.created_at >= week_start,
            Order.status != OrderStatus.CANCELLED,
        )
    )
    week_sales = float(result.scalar())

    # Month sales
    result = await db.execute(
        select(func.coalesce(func.sum(Order.total_amount), 0)).where(
            Order.created_at >= month_start,
            Order.status != OrderStatus.CANCELLED,
        )
    )
    month_sales = float(result.scalar())

    # Top items
    result = await db.execute(
        select(
            OrderItem.item_name,
            func.sum(OrderItem.quantity).label("qty"),
            func.sum(OrderItem.total_price).label("rev"),
        )
        .group_by(OrderItem.item_name)
        .order_by(func.sum(OrderItem.quantity).desc())
        .limit(10)
    )
    top_items = [
        ItemSales(item_name=r[0], quantity_sold=int(r[1]), total_revenue=float(r[2]))
        for r in result.all()
    ]

    # Daily sales (last 30 days)
    daily_sales = []
    for i in range(30):
        day_start = today_start - timedelta(days=i)
        day_end = day_start + timedelta(days=1)
        result = await db.execute(
            select(
                func.coalesce(func.sum(Order.total_amount), 0),
                func.count(Order.id),
            ).where(
                Order.created_at >= day_start,
                Order.created_at < day_end,
                Order.status != OrderStatus.CANCELLED,
            )
        )
        row = result.one()
        daily_sales.append(
            DailySales(
                date=day_start.strftime("%Y-%m-%d"),
                total_sales=float(row[0]),
                order_count=int(row[1]),
            )
        )
    daily_sales.reverse()

    # Staff performance
    result = await db.execute(
        select(
            Order.staff_id,
            func.count(Order.id).label("cnt"),
            func.coalesce(func.sum(Order.total_amount), 0).label("total"),
        )
        .where(Order.staff_id.isnot(None))
        .group_by(Order.staff_id)
        .order_by(func.sum(Order.total_amount).desc())
    )
    staff_rows = result.all()
    staff_perf = []
    for r in staff_rows:
        user_result = await db.execute(select(User).where(User.id == r[0]))
        user = user_result.scalar_one_or_none()
        staff_perf.append(
            StaffPerformance(
                staff_id=r[0],
                staff_name=user.full_name if user else "Unknown",
                order_count=int(r[1]),
                total_sales=float(r[2]),
            )
        )

    # Pending orders
    result = await db.execute(
        select(func.count(Order.id)).where(
            Order.status.in_([OrderStatus.PENDING, OrderStatus.COOKING])
        )
    )
    pending_orders = int(result.scalar())

    # Unpaid bills
    result = await db.execute(
        select(func.count(Bill.id)).where(Bill.payment_status == PaymentStatus.UNPAID)
    )
    unpaid_bills = int(result.scalar())

    return AnalyticsSummary(
        today_sales=today_sales,
        today_orders=today_orders,
        week_sales=week_sales,
        month_sales=month_sales,
        top_items=top_items,
        daily_sales=daily_sales,
        staff_performance=staff_perf,
        pending_orders=pending_orders,
        unpaid_bills=unpaid_bills,
    )
