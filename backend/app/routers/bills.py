import random
import string
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.bill import Bill, PaymentStatus
from app.models.order import Order
from app.models.user import User
from app.schemas.bill import BillCreate, BillPayment, BillResponse

router = APIRouter(prefix="/bills", tags=["Bills"])


def generate_bill_number() -> str:
    ts = datetime.now(timezone.utc).strftime("%m%d%H%M")
    rand = "".join(random.choices(string.digits, k=4))
    return f"BILL-{ts}-{rand}"


@router.post("", response_model=BillResponse, status_code=status.HTTP_201_CREATED)
async def create_bill(
    data: BillCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Order).where(Order.id == data.order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    existing = await db.execute(select(Bill).where(Bill.order_id == data.order_id))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Bill already exists for this order")

    subtotal = order.subtotal
    tax_amount = subtotal * data.tax_rate / 100
    total = subtotal + tax_amount - data.discount

    bill = Bill(
        bill_number=generate_bill_number(),
        order_id=order.id,
        subtotal=round(subtotal, 2),
        tax_rate=data.tax_rate,
        tax_amount=round(tax_amount, 2),
        discount=data.discount,
        total_amount=round(total, 2),
        staff_id=current_user.id,
        table_number=order.table_number,
        room_number=order.room_number,
    )
    db.add(bill)
    await db.commit()
    await db.refresh(bill)
    return BillResponse.model_validate(bill)


@router.get("", response_model=list[BillResponse])
async def list_bills(
    payment_status: PaymentStatus | None = None,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = select(Bill).order_by(Bill.created_at.desc())
    if payment_status:
        query = query.where(Bill.payment_status == payment_status)
    result = await db.execute(query)
    return [BillResponse.model_validate(b) for b in result.scalars().all()]


@router.get("/{bill_id}", response_model=BillResponse)
async def get_bill(bill_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Bill).where(Bill.id == bill_id))
    bill = result.scalar_one_or_none()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    return BillResponse.model_validate(bill)


@router.get("/order/{order_id}", response_model=BillResponse)
async def get_bill_by_order(order_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Bill).where(Bill.order_id == order_id))
    bill = result.scalar_one_or_none()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    return BillResponse.model_validate(bill)


@router.patch("/{bill_id}/pay", response_model=BillResponse)
async def pay_bill(
    bill_id: int,
    data: BillPayment,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(get_current_user),
):
    result = await db.execute(select(Bill).where(Bill.id == bill_id))
    bill = result.scalar_one_or_none()
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found")
    bill.payment_status = PaymentStatus.PAID
    bill.payment_method = data.payment_method
    bill.paid_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(bill)
    return BillResponse.model_validate(bill)
