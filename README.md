# DarkFlux Hotel & Restaurant Management System

A complete, production-ready hotel and restaurant management application with real-time ordering, billing, staff management, kitchen display system, and analytics.

## Features

### Customer Ordering
- Dynamic food menu with categories, prices, and images
- Add to cart and place orders with table/room number
- QR code-based ordering (scan & order)
- Real-time order tracking

### Auto Bill Generation
- Automatic bill generation with itemized details
- Tax calculation (13% VAT)
- Multiple payment methods (Cash, Card, eSewa, Khalti)
- Paid/unpaid bill tracking

### Admin Dashboard
- Real-time order monitoring
- Filter by date, status, table, staff
- Mark orders as completed/delivered
- Full order lifecycle management

### Sales Analytics
- Today/weekly/monthly sales reports
- Top-selling items charts
- Daily sales trend graphs
- Staff performance ranking

### Staff Management
- Role-based access (Admin, Staff, Kitchen)
- Staff account CRUD operations
- Per-staff order and sales tracking
- Activity logging

### Kitchen Display System (KDS)
- Real-time incoming order display
- Three-column Kanban board (Pending → Cooking → Ready)
- Urgent order highlighting (>15 min)
- Touch-friendly interface for kitchen staff

### UI/UX
- Mobile-first responsive design
- Dark/light mode support
- Clean modern interface
- Tablet-optimized kitchen view

## Tech Stack

- **Frontend**: Next.js 16 (React) + Tailwind CSS
- **Backend**: FastAPI (Python) + SQLAlchemy
- **Database**: SQLite (swappable to PostgreSQL)
- **Real-time**: WebSockets
- **Auth**: JWT with role-based access control

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- npm

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -e .
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API runs at `http://localhost:8000`. API docs at `http://localhost:8000/docs`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

### Default Accounts

| Role    | Username  | Password    |
|---------|-----------|-------------|
| Admin   | admin     | admin123    |
| Staff   | waiter1   | staff123    |
| Staff   | waiter2   | staff123    |
| Kitchen | kitchen1  | kitchen123  |

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── core/          # Config, DB, security, WebSocket
│   │   ├── models/        # SQLAlchemy models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── routers/       # API endpoints
│   │   ├── services/      # Business logic & seed data
│   │   └── main.py        # FastAPI application
│   └── pyproject.toml
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js pages (App Router)
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React contexts (Auth, Cart, Theme)
│   │   └── lib/           # API client & types
│   └── package.json
└── README.md
```

## API Endpoints

| Method | Endpoint                    | Description               |
|--------|-----------------------------|---------------------------|
| POST   | /api/auth/login             | User login                |
| GET    | /api/menu/categories        | List categories           |
| GET    | /api/menu/items             | List menu items           |
| POST   | /api/orders                 | Create order (public)     |
| GET    | /api/orders                 | List orders               |
| PATCH  | /api/orders/{id}/status     | Update order status       |
| POST   | /api/bills                  | Generate bill             |
| PATCH  | /api/bills/{id}/pay         | Mark bill as paid         |
| GET    | /api/analytics/summary      | Get analytics data        |
| GET    | /api/users                  | List staff (admin only)   |
| WS     | /ws/{channel}               | WebSocket (kitchen/admin) |

## License

MIT
