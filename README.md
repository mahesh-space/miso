# 🍱 Foody — miso MVP

A **role-based food delivery web app** built with Vite + React and backed by Supabase. The app exposes three separate workspaces — **Customer**, **Driver**, and **Admin** — each with its own routes, guards, and real-time updates. Without Supabase credentials the app runs fully in-browser using a deterministic in-memory mock adapter.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Supabase Setup](#supabase-setup)
- [Demo Accounts (No-Backend Mode)](#demo-accounts-no-backend-mode)
- [Routes & Role Guards](#routes--role-guards)
- [Features by Role](#features-by-role)
- [Automatic Dispatch Engine](#automatic-dispatch-engine)
- [Database Schema](#database-schema)
- [Architecture Overview](#architecture-overview)

---

## Tech Stack

| Layer         | Technology                                   |
|---------------|----------------------------------------------|
| Build tool    | [Vite](https://vitejs.dev/)                  |
| UI            | [React](https://react.dev/) (JSX)            |
| Routing       | [React Router DOM](https://reactrouter.com/) |
| Backend       | [Supabase](https://supabase.com/) (optional) |
| UI primitives | [Radix UI](https://www.radix-ui.com/) Dialog |
| Icons         | [Lucide React](https://lucide.dev/)          |
| Styling       | Vanilla CSS (`src/styles.css`)               |

---

## Project Structure

```
foody/
├── index.html
├── package.json
├── .env.example
└── src/
    ├── main.jsx              # React DOM entry point
    ├── App.jsx               # Router + role Guard component
    ├── styles.css            # Global design system & tokens
    ├── context/
    │   └── AppContext.jsx    # Global state, auth, CRUD actions, toasts
    ├── pages/
    │   ├── AuthPage.jsx      # Login / Sign-up
    │   ├── CustomerPage.jsx  # Browse restaurants, cart, place orders
    │   ├── DriverPage.jsx    # Delivery queue & earnings dashboard
    │   ├── AdminPage.jsx     # Overview, orders, restaurants, partners
    │   └── SettingsPage.jsx  # Profile settings (all roles)
    ├── components/
    │   ├── Layout.jsx        # AppShell, nav, sidebar
    │   ├── CartReview.jsx    # Cart summary before checkout
    │   ├── PaymentModal.jsx  # Payment confirmation dialog
    │   └── StatusTracker.jsx # Live order status stepper
    ├── lib/
    │   ├── supabase.js       # Supabase client initialisation
    │   ├── dispatch.js       # Automatic driver assignment engine
    │   └── schema.sql        # Full Supabase SQL schema + RLS policies
    └── data/
        └── mockData.js       # Seed data for the in-memory adapter
```

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
```

The app opens at `http://localhost:5173` by default.

To build for production:

```bash
npm run build
npm run preview   # Preview the production build locally
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your Supabase project credentials:

```bash
cp .env.example .env
```

`.env.example`:

```env
VITE_SUPABASE_URL=https://your-supabase-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

> **Without these credentials** the app automatically falls back to the in-memory mock adapter. All three workspaces remain fully usable locally — no Supabase account required for development or testing.

---

## Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** and run [`src/lib/schema.sql`](src/lib/schema.sql).

The SQL script creates:

| Object                          | Purpose                                              |
|---------------------------------|------------------------------------------------------|
| `app_role` enum                 | `admin`, `driver`, `customer`                        |
| `profile_status` enum           | `online`, `offline`                                  |
| `order_status` enum             | `placed`, `preparing`, `picked_up`, `delivered`      |
| `profiles` table                | One row per user; extends `auth.users`               |
| `restaurants` table             | Restaurant catalogue                                 |
| `menu_items` table              | Items linked to restaurants                          |
| `orders` table                  | Orders with customer, driver, and status             |
| Row-Level Security (RLS)        | Per-table policies for each role                     |
| `supabase_realtime` publication | Enables live order updates via WebSocket             |

3. Add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to `.env` and restart the dev server.

---

## Demo Accounts (No-Backend Mode)

When running without Supabase, use these pre-seeded accounts. **Any password is accepted.**

| Role     | Email              |
|----------|--------------------|
| Customer | `maya@miso.app`    |
| Driver   | `arjun@miso.app`   |
| Admin    | `nia@miso.app`     |

With Supabase configured, standard Auth credentials are required and the role is read from the `profiles` table.

---

## Routes & Role Guards

Every workspace route is wrapped in a `<Guard role="...">` component that:

- Redirects unauthenticated users to `/login` (preserving the intended path).
- Redirects authenticated users who access the wrong workspace to their own workspace with a toast notification.
- Shows a loading screen while the Supabase session is being resolved.

| Route                 | Role     | Description                           |
|-----------------------|----------|---------------------------------------|
| `/login`              | —        | Login & sign-up                       |
| `/customer`           | customer | Browse menu, add to cart, place order |
| `/customer/orders`    | customer | Order history & live status tracking  |
| `/customer/settings`  | customer | Profile settings                      |
| `/driver`             | driver   | Active delivery queue                 |
| `/driver/earnings`    | driver   | Earnings summary                      |
| `/driver/settings`    | driver   | Profile & availability settings       |
| `/admin`              | admin    | Dashboard overview                    |
| `/admin/orders`       | admin    | All orders management                 |
| `/admin/restaurants`  | admin    | Restaurant & menu management          |
| `/admin/partners`     | admin    | Driver partner management             |
| `/admin/settings`     | admin    | Profile settings                      |
| `*`                   | —        | Redirects to role home or `/login`    |

---

## Features by Role

### 🛍️ Customer
- Browse restaurants and filter by cuisine
- Add items to cart and review before checkout
- Place orders with a delivery address
- Real-time order status tracking (`placed → preparing → picked up → delivered`)
- View full order history

### 🚴 Driver
- View and act on active delivery assignments
- Mark orders as picked up and delivered
- Toggle online/offline availability
- Track earnings and completed deliveries

### 🛠️ Admin
- Dashboard with live order feed and key metrics
- Full order management with status overrides
- Add/remove restaurants and menu items
- Manage driver partners (activate / freeze / deactivate accounts)
- Real-time Supabase notifications for new orders

---

## Automatic Dispatch Engine

[`src/lib/dispatch.js`](src/lib/dispatch.js) assigns the best available driver to every new order automatically.

### Scoring Formula

```
score = pickupETA + deliveryETA + (activeOrders × 12 min) − fairnessBonus
```

- **pickupETA / deliveryETA** — derived from Haversine distance ÷ average speed (25 km/h).
- **Active-orders penalty** — adds 12 minutes per currently active order for the driver.
- **Fairness bonus** — up to 2.5 minutes off for drivers with more completed deliveries (capped at 10 deliveries × 0.25 min).

### Dispatch Rules

- Only drivers with `account_status = 'active'` are eligible.
- Online drivers are preferred; all active drivers are considered if none are online.
- **Reservation locks** prevent the same driver from being double-assigned when a batch of new orders arrives simultaneously.
- Dispatch fires automatically on order creation **and** via Supabase Realtime `INSERT`/`UPDATE` events.
- The mock coordinate lookup can be swapped for a traffic-aware Maps ETA service without changing the dispatch contract.

---

## Database Schema

### `profiles`
Extends `auth.users`. Stores role, contact info, and role-specific fields.

| Column                 | Type           | Notes                                |
|------------------------|----------------|--------------------------------------|
| `id`                   | uuid (PK)      | References `auth.users`              |
| `email`                | text           | Unique                               |
| `full_name`            | text           |                                      |
| `role`                 | app_role enum  | `admin`, `driver`, `customer`        |
| `phone`                | text           |                                      |
| `address`              | text           | Customer delivery address            |
| `dietary_preference`   | text           | Customer preference                  |
| `vehicle_type`         | text           | Driver field                         |
| `vehicle_registration` | text           | Driver field                         |
| `license_number`       | text           | Driver field                         |
| `coverage_area`        | text           | Driver field                         |
| `team_name`            | text           | Admin field                          |
| `employee_id`          | text           | Admin field                          |
| `status`               | profile_status | `online` / `offline`                 |
| `account_status`       | text           | `active`, `frozen`, `deactivated`    |

### `restaurants`
Public read. Admin write.

| Column          | Type      | Notes               |
|-----------------|-----------|---------------------|
| `id`            | uuid (PK) |                     |
| `name`          | text      |                     |
| `cuisine`       | text      |                     |
| `image_url`     | text      |                     |
| `rating`        | numeric   | 0.0 – 5.0           |
| `address`       | text      |                     |
| `delivery_fee`  | integer   | In smallest currency unit |
| `min_order`     | integer   |                     |
| `delivery_time` | text      | e.g. `"30–45 min"` |
| `is_active`     | boolean   |                     |

### `menu_items`
Linked to a restaurant. Public read. Admin write.

| Column          | Type      | Notes         |
|-----------------|-----------|---------------|
| `id`            | uuid (PK) |               |
| `restaurant_id` | uuid (FK) |               |
| `name`          | text      |               |
| `price`         | integer   | ≥ 0           |
| `category`      | text      |               |
| `is_available`  | boolean   |               |
| `is_vegetarian` | boolean   |               |
| `is_spicy`      | boolean   |               |

### `orders`

| Column             | Type          | Notes                                              |
|--------------------|---------------|----------------------------------------------------|
| `id`               | uuid (PK)     |                                                    |
| `customer_id`      | uuid (FK)     | References `profiles`                              |
| `restaurant_id`    | uuid (FK)     | References `restaurants`                           |
| `driver_id`        | uuid (FK, null) | References `profiles`; null until dispatched     |
| `status`           | order_status  | `placed → preparing → picked_up → delivered`       |
| `total_amount`     | integer       | ≥ 0                                                |
| `delivery_address` | text          |                                                    |
| `items`            | jsonb         | Snapshot of ordered items at time of placement     |

---

## Architecture Overview

```
AppProvider (AppContext.jsx)
 ├── Supabase client (or in-memory mock adapter)
 ├── Auth: login / signup / logout
 ├── Real-time subscriptions (orders table via Supabase channel)
 ├── State: session, orders, restaurants, menuItems, users, toasts
 └── Actions: createOrder · updateOrder · assignOrderRecord
              addRestaurant · removeRestaurant · addMenuItem
              addDriver · updateDriver · updateProfile

App.jsx
 └── <Guard role="..."> wraps each workspace
      ├── /customer  → CustomerPage
      ├── /driver    → DriverPage
      └── /admin     → AdminPage (Overview · Orders · Restaurants · Partners)
```

All visual tokens and component styles are centralised in [`src/styles.css`](src/styles.css). Components consume class names defined there — no CSS-in-JS or utility framework is used.
