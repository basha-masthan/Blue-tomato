# Blue Tomato

A multi-platform food delivery and home services application with customer app, vendor app, and admin dashboard.

## Project Structure

```
Blue-tomato/
├── backend/          # Express.js REST API + Socket.io server
├── frontend/         # Customer React Native (Expo) app
├── vendor-app/       # Vendor React Native (Expo) app
└── admin-web/        # Admin Dashboard (React + Vite + Tailwind)
```

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend | Node.js, Express.js, MongoDB (Mongoose), Socket.io |
| Customer App | React Native (Expo), React Navigation |
| Vendor App | React Native (Expo), React Navigation |
| Admin Dashboard | React 19, Vite, Tailwind CSS, Recharts |

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/blue-tomato
JWT_SECRET=your_jwt_secret
```

Start the server:
```bash
npm run dev
```

### Create Admin User

```bash
cd backend
npm run admin:seed
```

Default admin credentials:
- Email: `admin@bluetomato.com`
- Password: `Admin@123`

### Admin Dashboard Setup

```bash
cd admin-web
npm install
npm run dev
```

The admin panel will be available at `http://localhost:5173`

### Customer & Vendor Apps

```bash
cd frontend      # or vendor-app
npm install
npx expo start
```

## Admin Dashboard Features

- **Dashboard**: Real-time statistics, revenue charts, order analytics
- **Vendor Management**: 
  - Approve/reject vendor registrations (with reason message)
  - Activate/deactivate vendors
  - View vendor details (KYC, bank info, addresses)
- **User Management**: View users, toggle active status, delete users
- **Restaurant Management**: View restaurants, toggle active/featured status
- **Services & Food**: Browse all items, toggle availability, delete items
- **Orders**: View all orders, filter by status, update order status
- **Transactions**: Revenue summaries, transaction history

## API Endpoints

### Admin API (`/api/admin`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Admin login |
| GET | `/auth/me` | Get admin profile |
| GET | `/dashboard/stats` | Dashboard statistics |
| GET | `/vendors` | List all vendors |
| GET | `/vendors/:id` | Vendor details |
| PATCH | `/vendors/:id/approve` | Approve vendor |
| PATCH | `/vendors/:id/reject` | Reject vendor |
| PATCH | `/vendors/:id/toggle` | Toggle active status |
| GET | `/users` | List all users |
| GET | `/users/:id` | User details |
| PATCH | `/users/:id/toggle` | Toggle user active status |
| DELETE | `/users/:id` | Delete user |
| GET | `/services` | List services |
| GET | `/menu-items` | List food items |
| PATCH | `/services/:id/toggle` | Toggle availability |
| DELETE | `/services/:id` | Delete service |
| GET | `/orders` | List orders |
| GET | `/orders/:id` | Order details |
| PATCH | `/orders/:id/status` | Update order status |
| GET | `/transactions` | List transactions |
| GET | `/transactions/summary` | Transaction summary |
| GET | `/restaurants` | List restaurants |
| GET | `/restaurants/:id` | Restaurant details |
| PATCH | `/restaurants/:id` | Update restaurant |

## Vendor Approval Flow

1. Vendor registers via the vendor app
2. Registration status is set to `pending`
3. Admin reviews the vendor in the dashboard
4. Admin can either:
   - **Approve**: Vendor becomes active and can login
   - **Reject**: Vendor receives a rejection reason and cannot login
5. Approved vendors can be activated/deactivated by admin at any time

## Seed Scripts

```bash
# Create demo users
cd backend && npm run seed

# Create demo vendors with orders
cd backend && npm run vendor:seed

# Create admin user
cd backend && npm run admin:seed
```

## License

ISC
