from pydantic import BaseModel


class DailySales(BaseModel):
    date: str
    total_sales: float
    order_count: int


class ItemSales(BaseModel):
    item_name: str
    quantity_sold: int
    total_revenue: float


class StaffPerformance(BaseModel):
    staff_id: int
    staff_name: str
    order_count: int
    total_sales: float


class AnalyticsSummary(BaseModel):
    today_sales: float
    today_orders: int
    week_sales: float
    month_sales: float
    top_items: list[ItemSales]
    daily_sales: list[DailySales]
    staff_performance: list[StaffPerformance]
    pending_orders: int
    unpaid_bills: int
