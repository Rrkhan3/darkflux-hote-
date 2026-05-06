const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "API Error");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export function createWebSocket(
  channel: string,
  onMessage: (data: Record<string, unknown>) => void
): WebSocket {
  const ws = new WebSocket(`${WS_BASE}/ws/${channel}`);
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch {
      // ignore
    }
  };
  return ws;
}

// Auth
export const login = (username: string, password: string) =>
  apiFetch<{
    access_token: string;
    user: User;
  }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

// Menu
export const getCategories = () => apiFetch<Category[]>("/menu/categories");
export const getMenuItems = (categoryId?: number) =>
  apiFetch<MenuItem[]>(
    `/menu/items${categoryId ? `?category_id=${categoryId}` : ""}`
  );
export const createCategory = (data: Partial<Category>) =>
  apiFetch<Category>("/menu/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
export const createMenuItem = (data: Partial<MenuItem>) =>
  apiFetch<MenuItem>("/menu/items", {
    method: "POST",
    body: JSON.stringify(data),
  });
export const updateMenuItem = (id: number, data: Partial<MenuItem>) =>
  apiFetch<MenuItem>(`/menu/items/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

// Orders
export const createOrder = (data: OrderCreateData) =>
  apiFetch<Order>("/orders", { method: "POST", body: JSON.stringify(data) });
export const createOrderAuthenticated = (data: OrderCreateData) =>
  apiFetch<Order>("/orders/authenticated", {
    method: "POST",
    body: JSON.stringify(data),
  });
export const getOrders = (status?: string) =>
  apiFetch<Order[]>(`/orders${status ? `?status_filter=${status}` : ""}`);
export const getOrder = (id: number) => apiFetch<Order>(`/orders/${id}`);
export const getOrderByNumber = (num: string) =>
  apiFetch<Order>(`/orders/number/${num}`);
export const updateOrderStatus = (id: number, status: string) =>
  apiFetch<Order>(`/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });

// Bills
export const createBill = (data: {
  order_id: number;
  discount?: number;
  tax_rate?: number;
}) =>
  apiFetch<Bill>("/bills", { method: "POST", body: JSON.stringify(data) });
export const getBills = (paymentStatus?: string) =>
  apiFetch<Bill[]>(
    `/bills${paymentStatus ? `?payment_status=${paymentStatus}` : ""}`
  );
export const getBillByOrder = (orderId: number) =>
  apiFetch<Bill>(`/bills/order/${orderId}`);
export const payBill = (
  billId: number,
  method: string
) =>
  apiFetch<Bill>(`/bills/${billId}/pay`, {
    method: "PATCH",
    body: JSON.stringify({ payment_method: method }),
  });

// Analytics
export const getAnalytics = () => apiFetch<Analytics>("/analytics/summary");

// Users
export const getUsers = () => apiFetch<User[]>("/users");
export const createUser = (data: Partial<User> & { password: string }) =>
  apiFetch<User>("/users", { method: "POST", body: JSON.stringify(data) });
export const updateUser = (id: number, data: Partial<User>) =>
  apiFetch<User>(`/users/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
export const deleteUser = (id: number) =>
  apiFetch<void>(`/users/${id}`, { method: "DELETE" });

// Types
export interface User {
  id: number;
  username: string;
  full_name: string;
  email: string | null;
  role: "admin" | "staff" | "kitchen";
  is_active: boolean;
  created_at: string | null;
}

export interface Category {
  id: number;
  name: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string | null;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: number;
  is_available: boolean;
  is_vegetarian: boolean;
  preparation_time: number;
  created_at: string | null;
}

export interface OrderItem {
  id: number;
  order_id: number;
  menu_item_id: number;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  notes: string | null;
}

export interface Order {
  id: number;
  order_number: string;
  table_number: string | null;
  room_number: string | null;
  order_type: string;
  status: string;
  customer_name: string | null;
  special_instructions: string | null;
  staff_id: number | null;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  items: OrderItem[];
  created_at: string | null;
  updated_at: string | null;
}

export interface OrderCreateData {
  table_number?: string;
  room_number?: string;
  order_type?: string;
  customer_name?: string;
  special_instructions?: string;
  items: { menu_item_id: number; quantity: number; notes?: string }[];
}

export interface Bill {
  id: number;
  bill_number: string;
  order_id: number;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount: number;
  total_amount: number;
  payment_status: string;
  payment_method: string | null;
  staff_id: number | null;
  table_number: string | null;
  room_number: string | null;
  created_at: string | null;
  paid_at: string | null;
}

export interface ItemSales {
  item_name: string;
  quantity_sold: number;
  total_revenue: number;
}

export interface DailySales {
  date: string;
  total_sales: number;
  order_count: number;
}

export interface StaffPerformance {
  staff_id: number;
  staff_name: string;
  order_count: number;
  total_sales: number;
}

export interface Analytics {
  today_sales: number;
  today_orders: number;
  week_sales: number;
  month_sales: number;
  top_items: ItemSales[];
  daily_sales: DailySales[];
  staff_performance: StaffPerformance[];
  pending_orders: number;
  unpaid_bills: number;
}
