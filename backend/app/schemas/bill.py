from datetime import datetime

from pydantic import BaseModel

from app.models.bill import PaymentMethod, PaymentStatus


class BillCreate(BaseModel):
    order_id: int
    discount: float = 0.0
    tax_rate: float = 13.0


class BillPayment(BaseModel):
    payment_method: PaymentMethod


class BillResponse(BaseModel):
    id: int
    bill_number: str
    order_id: int
    subtotal: float
    tax_rate: float
    tax_amount: float
    discount: float
    total_amount: float
    payment_status: PaymentStatus
    payment_method: PaymentMethod | None
    staff_id: int | None
    table_number: str | None
    room_number: str | None
    created_at: datetime | None
    paid_at: datetime | None

    model_config = {"from_attributes": True}
