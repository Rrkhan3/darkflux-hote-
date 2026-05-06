import enum

from sqlalchemy import Column, DateTime, Enum, Float, Integer, String, func

from app.models.base import Base


class PaymentStatus(str, enum.Enum):
    UNPAID = "unpaid"
    PAID = "paid"
    PARTIAL = "partial"


class PaymentMethod(str, enum.Enum):
    CASH = "cash"
    CARD = "card"
    ESEWA = "esewa"
    KHALTI = "khalti"
    OTHER = "other"


class Bill(Base):
    __tablename__ = "bills"

    id = Column(Integer, primary_key=True, index=True)
    bill_number = Column(String(20), unique=True, nullable=False, index=True)
    order_id = Column(Integer, nullable=False, index=True)
    subtotal = Column(Float, nullable=False)
    tax_rate = Column(Float, default=13.0)
    tax_amount = Column(Float, nullable=False)
    discount = Column(Float, default=0.0)
    total_amount = Column(Float, nullable=False)
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.UNPAID)
    payment_method = Column(Enum(PaymentMethod), nullable=True)
    staff_id = Column(Integer, nullable=True)
    table_number = Column(String(20), nullable=True)
    room_number = Column(String(20), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    paid_at = Column(DateTime(timezone=True), nullable=True)
