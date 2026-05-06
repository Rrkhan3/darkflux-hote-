from datetime import datetime

from pydantic import BaseModel


class CategoryCreate(BaseModel):
    name: str
    description: str | None = None
    image_url: str | None = None
    display_order: int = 0


class CategoryResponse(BaseModel):
    id: int
    name: str
    description: str | None
    image_url: str | None
    display_order: int
    is_active: bool
    created_at: datetime | None

    model_config = {"from_attributes": True}


class MenuItemCreate(BaseModel):
    name: str
    description: str | None = None
    price: float
    image_url: str | None = None
    category_id: int
    is_vegetarian: bool = False
    preparation_time: int = 15


class MenuItemUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: float | None = None
    image_url: str | None = None
    category_id: int | None = None
    is_available: bool | None = None
    is_vegetarian: bool | None = None
    preparation_time: int | None = None


class MenuItemResponse(BaseModel):
    id: int
    name: str
    description: str | None
    price: float
    image_url: str | None
    category_id: int
    is_available: bool
    is_vegetarian: bool
    preparation_time: int
    created_at: datetime | None

    model_config = {"from_attributes": True}
