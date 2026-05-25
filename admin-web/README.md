# Blue Tomato - Admin Dashboard

A React-based web admin dashboard for managing the Blue Tomato platform.

## Features

- **Dashboard Overview**: Real-time statistics, revenue charts, order status distribution
- **Vendor Management**: Approve/reject vendor registrations, activate/deactivate vendors, view vendor details
- **User Management**: View users, activate/deactivate accounts, delete users
- **Restaurant Management**: View restaurants, toggle active/featured status
- **Service/Food Management**: Browse all services and menu items, toggle availability
- **Order Management**: View all orders, filter by status, update order status
- **Transaction Management**: View all transactions, revenue summaries

## Tech Stack

- React 19 + Vite
- Tailwind CSS
- React Router v7
- Axios
- Recharts (charts)
- Lucide React (icons)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The admin panel will be available at `http://localhost:5173`

## Default Admin Credentials

After running `npm run admin:seed` in the backend:
- **Email**: `admin@bluetomato.com`
- **Password**: `Admin@123`

## API Proxy

The Vite dev server is configured to proxy `/api` requests to `http://localhost:5000` (the backend server).

## Build for Production

```bash
npm run build
```

This will create a production build in the `dist/` directory.
