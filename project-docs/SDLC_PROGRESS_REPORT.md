# SDLC Progress Report — miso (foody)

> **Generated:** 2026-07-30 · **Scope:** Full codebase analysis of `/foody`
> **Purpose:** Living project status document for developers and AI coding assistants.
> **Single source of truth** — base all continuation work on this document.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [SDLC Status](#2-sdlc-status)
3. [Completed Features](#3-completed-features)
4. [Role-Based Feature Matrix](#4-role-based-feature-matrix)
5. [Navigation Audit](#5-navigation-audit)
6. [UI Implementation Status](#6-ui-implementation-status)
7. [Backend Integration Status](#7-backend-integration-status)
8. [Database Status](#8-database-status)
9. [Component Inventory](#9-component-inventory)
10. [Code Quality](#10-code-quality)
11. [Testing Status](#11-testing-status)
12. [Known Issues](#12-known-issues)
13. [Technical Debt](#13-technical-debt)
14. [Security Review](#14-security-review)
15. [Performance Review](#15-performance-review)
16. [Dependency Review](#16-dependency-review)
17. [Documentation Status](#17-documentation-status)
18. [Git Readiness](#18-git-readiness)
19. [Recommended Next Tasks](#19-recommended-next-tasks)
20. [Overall Project Health](#20-overall-project-health)

---

## 1. Project Overview

| Field              | Value |
|--------------------|-------|
| **Project name**   | **miso** (repository folder: `foody`) |
| **Purpose**        | Role-based food delivery MVP — three workspaces (Customer, Driver, Admin) |
| **Dev stage**      | MVP / Alpha — functional but pre-production |
| **Primary stack**  | React 18 + Vite, Supabase (PostgreSQL + Auth + Realtime), Vanilla CSS |
| **State**          | Single React Context (`AppContext`) — no Redux / Zustand / Jotai |
| **Routing**        | React Router v6 |
| **UI components**  | Radix UI Dialog (payment only), Lucide React icons, custom CSS |
| **Backend**        | Supabase (real DB) with deterministic in-memory fallback adapter |

### Architecture Overview

```
src/
├── main.jsx               # Entry point; wraps app in BrowserRouter + AppProvider
├── App.jsx                # Route definitions + role-guard HOC
├── styles.css             # 36 KB single stylesheet (entire design system)
├── context/
│   └── AppContext.jsx     # Global state, all CRUD ops, Supabase calls, auth
├── lib/
│   ├── supabase.js        # Supabase client (nullable; null = mock mode)
│   ├── dispatch.js        # Deterministic driver-ranking algorithm (Haversine + ETA)
│   └── schema.sql         # Full DB schema + RLS policies
├── data/
│   └── mockData.js        # Seed users, restaurants, menu items, orders + helpers
├── hooks/
│   ├── useGeolocation.js  # Browser GPS watcher with mocked fallback
│   └── usePayment.js      # Mock payment processor (card / UPI / COD validation)
├── pages/
│   ├── AuthPage.jsx       # Login + role-switched signup form
│   ├── CustomerPage.jsx   # Discover + order placement + order history
│   ├── DriverPage.jsx     # Delivery queue + earnings ledger + MockMap
│   ├── AdminPage.jsx      # Overview, orders, restaurant CRUD, partners
│   └── SettingsPage.jsx   # Role-aware account settings
└── components/
    ├── Layout.jsx          # AppShell sidebar + Topbar + QuickActions panel
    ├── CartReview.jsx      # Cart drawer (qty edit, notes, address, total)
    ├── PaymentModal.jsx    # Radix Dialog checkout (card / UPI / COD)
    └── StatusTracker.jsx   # Step-progress indicator + OrderCard sub-component
```

### Folder Structure Summary

| Folder         | Purpose                          | Files |
|----------------|----------------------------------|-------|
| `src/`         | Application root                 | 3     |
| `context/`     | Global state management          | 1     |
| `lib/`         | Services, DB schema, dispatch    | 3     |
| `data/`        | Mock/seed data                   | 1     |
| `hooks/`       | Custom React hooks               | 2     |
| `pages/`       | Route-level page components      | 5     |
| `components/`  | Reusable UI components           | 4     |
| `project-docs/`| Documentation                    | 1     |

---

## 2. SDLC Status

| Phase       | Status              | Notes |
|-------------|---------------------|-------|
| Requirements | ✅ Complete         | Three-role food delivery MVP requirements clearly reflected in code |
| Planning     | ✅ Complete         | Architecture decisions made and implemented (context, dual-adapter, dispatch) |
| Design       | ✅ Complete         | Full visual design system in `styles.css`; responsive layout implemented |
| Development  | 🟡 In Progress      | Core flows done; several features are mock/placeholder or incomplete |
| Testing      | ⏳ Not Started      | Zero automated tests exist in the repository |
| Deployment   | ⚠ Needs Attention   | Supabase credentials in `.env` match `.env.example` (key exposed); no CI/CD |
| Maintenance  | ⏳ Not Started      | No monitoring, error tracking, or changelog established |

---

## 3. Completed Features

### 3.1 Authentication

| Feature | Status | Notes |
|---------|--------|-------|
| Login (email + password) | ✅ Complete | Supabase auth + mock adapter |
| Logout | ✅ Complete | Clears Supabase session and React state |
| Registration / Signup | ✅ Complete | Role-specific detail fields; profiles upserted to Supabase |
| Role-based workspace selection | ✅ Complete | Three-tab selector (Customer / Partner / Admin) |
| Session persistence | ✅ Complete | Supabase `persistSession: true` |
| Auto session hydration | ✅ Complete | `hydrateSupabase()` runs on mount |
| Account status check | ✅ Complete | Blocks `frozen` / `deactivated` accounts at login |
| Password reset | ⏳ Not Started | No UI or Supabase trigger implemented |
| Email verification | ⏳ Not Started | Supabase confirmation not enforced |
| Admin invite code check | ⚠ Placeholder | Form collects `approvalCode` but it is never validated |
| Double-submit guard | ✅ Complete | `signupInFlight` ref prevents duplicate Supabase calls |

**Module status: Partial (~75% complete)**

---

### 3.2 Customer Workspace

| Feature | Status | Notes |
|---------|--------|-------|
| Restaurant discovery grid | ✅ Complete | Filtered by cuisine chip + search field |
| Cuisine filter chips | ✅ Complete | Dynamic from restaurant list |
| Restaurant search | ✅ Complete | Matches name + cuisine |
| Restaurant card with image | ✅ Complete | URL image or emoji fallback |
| "See menu" dialog | ✅ Complete | Custom backdrop modal with item list |
| Quick-add item from card | ✅ Complete | Adds first menu item directly |
| Add item to cart from menu | ✅ Complete | Qty accumulation |
| Cart review drawer | ✅ Complete | Qty +/-, notes per item, remove, delivery address |
| Payment modal (Card/UPI/COD) | ✅ Complete | Mock payment processor with validation |
| Order placement | ✅ Complete | Creates order in Supabase/mock + triggers dispatch |
| Order history view | ✅ Complete | `/customer/orders` — per-customer filtered |
| Order status tracker | ✅ Complete | Step-progress bar (Placed → Preparing → Out → Delivered) |
| Floating cart FAB | ✅ Complete | Shows item count + total |
| Real-time order status updates | ✅ Complete | Via Supabase Realtime + toast notification |
| Restaurant ratings display | ✅ Complete | Displayed; admin cannot update them yet |
| "Filters" button | ⚠ Placeholder | Shows toast; no advanced filter sheet implemented |
| Dietary preference filtering | ⏳ Not Started | Collected in settings but not applied to results |

**Module status: Partial (~80% complete)**

---

### 3.3 Driver Workspace

| Feature | Status | Notes |
|---------|--------|-------|
| Delivery queue (active + available) | ✅ Complete | Shows driver's own + unassigned orders |
| Accept order | ✅ Complete | Updates DB; notify on success |
| Pass/reject order | ⚠ Placeholder | Triggers toast but order is not skipped persistently |
| Advance order status (Picked up / Complete) | ✅ Complete | Two-step status progression |
| Online/offline toggle | ✅ Complete | UI toggle; local state only — not persisted to DB |
| Earnings ledger | ✅ Complete | `/driver/earnings` — 18% commission per delivered order |
| Stat cards (deliveries, earnings, avg time) | ⚠ Hardcoded | "12 deliveries", "22 min", "+3 from yesterday" are static values |
| MockMap (live location during delivery) | ✅ Complete | CSS map with animated driver icon; GPS or simulated |
| GPS geolocation | ✅ Complete | `useGeolocation` hook with browser GPS fallback |
| Online status persisted to DB | ⏳ Not Started | Toggle only updates local state |
| Driver pickup address | ⚠ Placeholder | Shows "Linking Road" hardcoded; no real restaurant address |

**Module status: Partial (~65% complete)**

---

### 3.4 Admin Workspace

| Feature | Status | Notes |
|---------|--------|-------|
| Dashboard overview | ✅ Complete | KPI cards + animated bar chart + live orders + partner pulse |
| KPI stats | ⚠ Partial | Real data augmented with static offsets (e.g., `+ 1282`, `+ 184200`) |
| All orders view | ✅ Complete | Table with driver assignment dropdown + status badge |
| Manual driver assignment | ✅ Complete | Dropdown per order; updates DB |
| Auto-assign fastest drivers button | ✅ Complete | Triggers dispatch engine for all unassigned orders |
| Unassigned filter | ✅ Complete | Toggle between all / unassigned |
| Restaurant CRUD | ✅ Complete | Add + delete + list with item count |
| Menu item CRUD | ✅ Complete | Add item form with all fields incl. vegetarian/spicy flags |
| Restaurant edit / update | ⏳ Not Started | No edit form; only add + delete |
| Menu item edit / delete | ⏳ Not Started | No update or remove per item |
| Partners management | ✅ Complete | List, add, activate/freeze/deactivate actions |
| Partner invite (Supabase Auth) | ⚠ Placeholder | `addDriver` only creates a local profile; no Edge Function |
| Order statistics / analytics | ⏳ Not Started | No charts for historical data |
| Customer management | ⏳ Not Started | No admin view of customer accounts |
| Restaurant approval workflow | ⚠ Placeholder | Settings checkbox exists; no actual approval gate |

**Module status: Partial (~60% complete)**

---

### 3.5 Settings

| Feature | Status | Notes |
|---------|--------|-------|
| Profile details (name, email, phone) | ✅ Complete | Saves to Supabase `profiles` |
| Customer: saved addresses | ⚠ Placeholder | TextArea with hardcoded default; not persisted |
| Customer: payment preferences | ⚠ Placeholder | Three buttons — visual only |
| Customer: dietary preferences | ⚠ Placeholder | Checkboxes not connected to any filtering logic |
| Driver: vehicle & documents | ⚠ Placeholder | Select + input fields; not persisted to DB |
| Driver: delivery zones | ⚠ Placeholder | Checkboxes not connected to dispatch coverage |
| Driver: payout preferences | ⚠ Placeholder | UPI ID field not persisted |
| Admin: team permissions | ⚠ Placeholder | Checkboxes not connected to any backend enforcement |
| Admin: restaurant approval mode | ⚠ Placeholder | Select not connected to any logic |
| Notification preferences | ⚠ Partial | Toggle state maintained in component; not persisted |
| Sign-out button | ⚠ Bug | "Session active" navigates to `/login` without calling `logout()` — session not cleared |

**Module status: Partial (~30% complete — mostly placeholder forms)**

---

### 3.6 Core Infrastructure

| Feature | Status | Notes |
|---------|--------|-------|
| Role guard (route protection) | ✅ Complete | `<Guard>` HOC redirects wrong-role access + toast |
| Supabase / mock dual adapter | ✅ Complete | `isSupabaseConfigured` flag gates all Supabase calls |
| Global toast notification system | ✅ Complete | `notify(message, tone)` with auto-dismiss after 4.5 s |
| Real-time order events (Supabase Realtime) | ✅ Complete | `postgres_changes` subscription on `orders` table |
| Auto-dispatch on order placement | ✅ Complete | `assignOrderRecord()` called immediately after `createOrder()` |
| Event-driven auto-dispatch watcher | ✅ Complete | Watches `orders` state; dispatches any unassigned `placed` order |
| Dispatch engine (Haversine ETA + fairness) | ✅ Complete | `dispatch.js` — scores drivers by pickup+delivery ETA |
| Concurrent dispatch reservation | ✅ Complete | `dispatchReservations` ref prevents duplicate assignments |
| Sidebar collapse / expand | ✅ Complete | Persisted to `localStorage` |
| Mobile sidebar overlay | ✅ Complete | `mobileOpen` toggle with hamburger icon |
| Responsive layout | ✅ Complete | CSS handles mobile breakpoints in `styles.css` |

---

## 4. Role-Based Feature Matrix

| Feature | Customer | Driver | Admin | Status |
|---------|:--------:|:------:|:-----:|--------|
| Login / Signup | ✅ | ✅ | ✅ | Complete |
| Settings (profile) | ✅ | ✅ | ✅ | Complete |
| Restaurant discovery | ✅ | ❌ | ❌ | Complete |
| Cart & checkout | ✅ | ❌ | ❌ | Complete |
| Payment (mock) | ✅ | ❌ | ❌ | Complete |
| Order history | ✅ | ❌ | ❌ | Complete |
| Real-time order status | ✅ | ✅ | ✅ | Complete |
| Delivery queue | ❌ | ✅ | ❌ | Complete |
| Accept / advance order | ❌ | ✅ | ❌ | Complete |
| Earnings ledger | ❌ | ✅ | ❌ | Partial (hardcoded stats) |
| Online/offline toggle | ❌ | ✅ | ❌ | Partial (not persisted) |
| Live map during delivery | ❌ | ✅ | ❌ | Partial (mock only) |
| Admin dashboard KPIs | ❌ | ❌ | ✅ | Partial (inflated with statics) |
| All-orders management | ❌ | ❌ | ✅ | Complete |
| Manual driver assignment | ❌ | ❌ | ✅ | Complete |
| Auto-assign dispatch | ❌ | ❌ | ✅ | Complete |
| Restaurant CRUD | ❌ | ❌ | ✅ | Partial (no edit) |
| Menu item CRUD | ❌ | ❌ | ✅ | Partial (no edit/delete) |
| Partner management | ❌ | ❌ | ✅ | Partial (no real invite) |
| Password reset | ❌ | ❌ | ❌ | ⏳ Not Started |
| Customer management | ❌ | ❌ | ❌ | ⏳ Not Started |
| Dietary preference filtering | ❌ | ❌ | ❌ | ⏳ Not Started |
| Analytics / reporting | ❌ | ❌ | ❌ | ⏳ Not Started |

---

## 5. Navigation Audit

### Implemented Routes

| Route | Guard Role | Component | Status |
|-------|------------|-----------|--------|
| `/login` | Public | `AuthPage` | ✅ Connected |
| `/customer` | customer | `CustomerPage` | ✅ Connected |
| `/customer/orders` | customer | `CustomerPage (ordersOnly)` | ✅ Connected |
| `/customer/settings` | customer | `SettingsPage` | ✅ Connected |
| `/driver` | driver | `DriverPage` | ✅ Connected |
| `/driver/earnings` | driver | `DriverPage (earningsOnly)` | ✅ Connected |
| `/driver/settings` | driver | `SettingsPage` | ✅ Connected |
| `/admin` | admin | `AdminOverview` | ✅ Connected |
| `/admin/orders` | admin | `AdminOrders` | ✅ Connected |
| `/admin/restaurants` | admin | `AdminRestaurants` | ✅ Connected |
| `/admin/partners` | admin | `AdminPartners` | ✅ Connected |
| `/admin/settings` | admin | `SettingsPage` | ✅ Connected |
| `*` | — | Redirect to role home | ✅ Connected |

### Missing Routes

| Route | Notes |
|-------|-------|
| `/forgot-password` | Password reset not implemented |
| `/admin/customers` | Customer management page absent |
| `/restaurant/:id` | Deep link to individual restaurant (currently dialog-only) |
| `/admin/analytics` | Reporting / charts page |
| `/driver/profile` | Vehicle document upload |

### Navigation Issues

- **"Session active" button** in `SettingsPage` calls `navigate('/login')` without invoking `logout()` — session state persists (bug, see §12).
- **Order badge "2"** in sidebar nav is a hardcoded string literal; not computed from actual order count.
- No `<Link>` elements used — all navigation goes through imperative `navigate()` calls (intentional but limits `<a href>` accessibility/SEO).

---

## 6. UI Implementation Status

### Implemented ✅

| Element | Location |
|---------|----------|
| Auth layout (2-column art + form) | `AuthPage.jsx` |
| Role-switcher tabs | `AuthPage.jsx` |
| Signup role-specific detail fields | `AuthPage.jsx` |
| App shell sidebar (collapsible, localStorage) | `Layout.jsx` |
| Topbar with mobile hamburger | `Layout.jsx` |
| QuickActions profile panel | `Layout.jsx` |
| Hero banner | `CustomerPage.jsx` |
| Restaurant grid cards | `CustomerPage.jsx` |
| Cuisine chip filters | `CustomerPage.jsx` |
| Search field | `CustomerPage.jsx` |
| Menu dialog modal | `CustomerPage.jsx` |
| Floating cart FAB | `CustomerPage.jsx` |
| Cart review drawer | `CartReview.jsx` |
| Payment modal (Radix Dialog) | `PaymentModal.jsx` |
| Order cards with status badge | `CustomerPage.jsx`, `StatusTracker.jsx` |
| Status tracker step bar | `StatusTracker.jsx` |
| Delivery queue cards | `DriverPage.jsx` |
| MockMap with driver position | `DriverPage.jsx` |
| Online/offline toggle | `DriverPage.jsx` |
| Stat cards grid | `DriverPage.jsx`, `AdminPage.jsx` |
| Admin animated bar chart | `AdminPage.jsx` |
| Admin order table with driver dropdown | `AdminPage.jsx` |
| Restaurant / partner row list | `AdminPage.jsx` |
| Add restaurant / menu form panels | `AdminPage.jsx` |
| Partner actions dropdown menu | `AdminPage.jsx` |
| Settings page (role-aware sections) | `SettingsPage.jsx` |
| Toast notification viewport | `AppContext.jsx` |
| Empty states (cart, orders, queue) | Multiple pages |
| Loading screen | `App.jsx` |

### Partial / Placeholder ⚠

| Element | Issue |
|---------|-------|
| "Filters" button | Shows info toast; no filter panel implemented |
| Settings checkboxes (driver zones, dietary, admin perms) | Not wired to any state or DB |
| Settings payment preference buttons | Visual only |
| Driver stat card values | Hardcoded strings ("12", "22 min") |
| Admin KPI stat offsets | Padded with static constants |

### Missing ❌

| Element | Notes |
|---------|-------|
| Password reset form | No UI exists |
| Restaurant edit dialog | No inline edit for restaurant metadata |
| Menu item edit / delete UI | No controls in restaurant list |
| Customer account management (admin) | No page |
| Advanced filter sheet | Described in copy; not built |
| Pagination / infinite scroll | All lists render entirely without limit |
| Charts / analytics dashboard | No historical chart page |
| Loading skeletons | Full-screen loader only; no per-list skeleton |
| React error boundary | No error boundary component |
| Image upload UI | Admin uses URL input; no file upload |

---

## 7. Backend Integration Status

### Supabase Operations

| Operation | Table | Implemented | Notes |
|-----------|-------|:-----------:|-------|
| Fetch restaurants | `restaurants` | ✅ | Public read; runs pre-login |
| Fetch menu items | `menu_items` | ✅ | Public read; runs pre-login |
| Fetch session profile | `profiles` | ✅ | Single row by auth UID |
| Fetch all profiles (admin) | `profiles` | ✅ | Admin-gated via RLS |
| Fetch all orders | `orders` | ✅ | Auth required |
| Sign up | `auth.users` | ✅ | + upsert to `profiles` |
| Sign in | `auth.users` | ✅ | `signInWithPassword` |
| Sign out | `auth.users` | ✅ | `supabase.auth.signOut()` |
| Create order | `orders` | ✅ | |
| Update order (status/driver) | `orders` | ✅ | |
| Add restaurant | `restaurants` | ✅ | |
| Delete restaurant | `restaurants` | ✅ | Cascades to `menu_items` |
| Add menu item | `menu_items` | ✅ | |
| Update profile (settings) | `profiles` | ✅ | name, email, phone, status |
| Update driver account status | `profiles` | ✅ | account_status + status |
| Real-time orders subscription | `orders` | ✅ | `postgres_changes` via Realtime |
| Delete order | `orders` | ❌ | No UI or context function |
| Update restaurant | `restaurants` | ❌ | No update function in context |
| Update menu item | `menu_items` | ❌ | No update function in context |
| Delete menu item | `menu_items` | ❌ | No context function |
| Update driver online status | `profiles` | ❌ | Toggle only changes local state |
| Invite driver (Edge Function) | — | ❌ | Comment says "Connect an invite Edge Function" |

### Mock Adapter (no Supabase configured)

All Supabase operations fall back to in-memory state mutations using seed data from `mockData.js`. Data does not persist across page refreshes in mock mode.

### Missing Integrations

- **Payment gateway** — `usePayment.js` is fully mocked; no Stripe/Razorpay/PayU
- **Push notifications** — Realtime events trigger in-app toasts only; no mobile push
- **Maps API** — Haversine distance used; no Google Maps / Mapbox integration
- **Email service** — No transactional email (order confirmation, password reset)
- **Background jobs** — No cron or Supabase Edge Function triggers
- **File storage** — Restaurant images use URL strings; no Supabase Storage

---

## 8. Database Status

### Existing Tables and Relationships

```
auth.users (Supabase managed)
    │
    └─(1:1)──► profiles
                  ├── role: enum(admin | driver | customer)
                  ├── status: enum(online | offline)
                  ├── account_status: text check(active | frozen | deactivated)
                  └── … (phone, address, dietary, vehicle fields)

profiles ◄──(M:1)── orders.customer_id
profiles ◄──(M:1)── orders.driver_id (nullable)
restaurants ◄──(1:M)── menu_items.restaurant_id (cascade delete)
restaurants ◄──(M:1)── orders.restaurant_id
```

### Column Completeness

| Table | Column | In Schema | App Used | Notes |
|-------|--------|:---------:|:--------:|-------|
| `profiles` | `dietary_preference` | ✅ | ⚠ | Written at signup; never read back for filtering |
| `profiles` | `vehicle_type` | ✅ | ⚠ | Written at signup; settings field not persisted |
| `profiles` | `coverage_area` | ✅ | ⚠ | Written at signup; not used in dispatch logic |
| `profiles` | `team_name` | ✅ | ⚠ | Written at signup; not displayed anywhere |
| `profiles` | `employee_id` | ✅ | ⚠ | Written at signup; not displayed |
| `profiles` | `license_number` | ✅ | ⚠ | Written at signup; not displayed |
| `menu_items` | `image_url` | ❌ | ✅ | Referenced in app but absent from schema SQL |
| `restaurants` | `color` | ❌ | ✅ | Used for card background; absent from schema |
| `restaurants` | `tag` | ❌ | ✅ | Used for card badge; absent from schema |
| `restaurants` | `eta` | ❌ | ✅ | Aliased; schema uses `delivery_time` |
| `orders` | `items` | ✅ | ✅ | JSONB array of cart items |

### Missing Entities

| Entity | Notes |
|--------|-------|
| `categories` | Hard-coded string arrays in `AdminPage.jsx` |
| `reviews` / `ratings` | Ratings stored per restaurant; no review model |
| `notifications` | No table for persistent notification history |
| `payouts` | Earnings computed client-side; no ledger table |
| `zones` / `coverage` | Coverage areas hard-coded as strings |

### Migrations & Seed Data

- **No migration tooling** — one monolithic `schema.sql` file; no versioned migrations
- **Seed data** — provided in `mockData.js` (in-memory only); no SQL seed file for Supabase

### RLS Policies

- ✅ `profiles`: select own or admin; insert own; update own
- ✅ `restaurants`: public read; admin write
- ✅ `menu_items`: public read; admin write
- ✅ `orders`: customer/driver reads own; customer inserts; driver/admin updates

---

## 9. Component Inventory

| Component | File | Status | Notes |
|-----------|------|--------|-------|
| `AppShell` | `Layout.jsx` | ✅ Complete | Sidebar + Topbar shell |
| `Topbar` | `Layout.jsx` | ✅ Complete | Mobile-aware, role-greetings |
| `QuickActions` | `Layout.jsx` | ✅ Complete | Profile slide-in panel |
| `Guard` | `App.jsx` | ✅ Complete | Route protection HOC |
| `AuthPage` | `pages/AuthPage.jsx` | ✅ Complete | Login + signup |
| `SignupDetails` | `pages/AuthPage.jsx` | ✅ Complete | Role-specific detail fields |
| `RoleIcon` | `pages/AuthPage.jsx` | ✅ Complete | Lucide icon switcher |
| `CustomerPage` | `pages/CustomerPage.jsx` | ✅ Complete | Main + ordersOnly modes |
| `RestaurantCard` | `pages/CustomerPage.jsx` | ✅ Complete | Image + quick-add |
| `MenuDialog` | `pages/CustomerPage.jsx` | ✅ Complete | Custom backdrop modal |
| `DriverPage` | `pages/DriverPage.jsx` | ✅ Complete | Queue + earningsOnly modes |
| `Stat` | `DriverPage.jsx` & `AdminPage.jsx` | ⚠ Duplicate | Same component defined twice |
| `MockMap` | `pages/DriverPage.jsx` | ✅ Complete | GPS-aware simulated map |
| `AdminOverview` | `pages/AdminPage.jsx` | ✅ Complete | |
| `AdminOrders` | `pages/AdminPage.jsx` | ✅ Complete | |
| `AdminRestaurants` | `pages/AdminPage.jsx` | ✅ Complete | |
| `AdminPartners` | `pages/AdminPage.jsx` | ✅ Complete | |
| `AdminOrderRow` | `pages/AdminPage.jsx` | ✅ Complete | Used in both Overview and Orders |
| `SettingsPage` | `pages/SettingsPage.jsx` | ✅ Complete | Role-aware sections |
| `SettingsSection` | `pages/SettingsPage.jsx` | ✅ Complete | Reusable section wrapper |
| `CartReview` | `components/CartReview.jsx` | ✅ Complete | |
| `PaymentModal` | `components/PaymentModal.jsx` | ✅ Complete | Radix UI Dialog |
| `StatusTracker` | `components/StatusTracker.jsx` | ✅ Complete | |
| `OrderCard` | `components/StatusTracker.jsx` | ⚠ Unused | Exported but never imported anywhere |
| `ToastViewport` | `context/AppContext.jsx` | ✅ Complete | Inline in context file |

**Duplicates:** `Stat` component defined identically in `DriverPage.jsx` and `AdminPage.jsx`.
**Unused:** `OrderCard` in `StatusTracker.jsx` — exported but never imported.

---

## 10. Code Quality

### Project Structure

- ✅ Clear folder separation (pages / components / context / lib / data / hooks)
- ⚠ All page components are single-file monoliths compressed into 1–2 lines with no formatting
- ⚠ `App.jsx` route tree is entirely on 2 minified lines — unreadable without a formatter

### Naming Consistency

- ✅ Files follow PascalCase for components
- ✅ Context functions follow camelCase CRUD verbs (`createOrder`, `updateOrder`, etc.)
- ⚠ Dual naming for same concept: `restaurantId` (mock) vs `restaurant_id` (Supabase DB) — normalised in context but fragile

### Reusability

- ✅ `notify()` used consistently across all pages
- ✅ `money()` formatter used throughout
- ✅ `statusLabels` / `statusSteps` imported from `mockData.js` in multiple files
- ⚠ `Stat` component duplicated; should be extracted to `components/`
- ⚠ `AdminOrderRow` only used within `AdminPage.jsx` — would benefit from moving to `components/`

### Dead / Unused Code

| Item | File | Notes |
|------|------|-------|
| `OrderCard` component | `StatusTracker.jsx` | Exported but never used |
| `dispatchReservations` Set | `AppContext.jsx` | Works but could retain stale entries on error path |

### Code Style Issues

- ⚠ All page components written as minified single-line JSX — severely impacts readability (`AuthPage.jsx`, `CustomerPage.jsx`, `DriverPage.jsx`, `SettingsPage.jsx`)
- ⚠ No ESLint or Prettier configuration files present

### TODOs / FIXMEs

No explicit `TODO` or `FIXME` comments found in the codebase. Inline comments describe future extension points (e.g., "Replace the mock coordinates with a maps/ETA API").

---

## 11. Testing Status

| Test Type | Status | Coverage |
|-----------|--------|----------|
| Unit tests | ⏳ Not Started | 0% |
| Integration tests | ⏳ Not Started | 0% |
| Component tests | ⏳ Not Started | 0% |
| E2E tests | ⏳ Not Started | 0% |
| Manual testing | 🟡 Implied | Core flows appear tested (working app) |

- No test runner configured (`vitest`, `jest`, `playwright` — none present)
- No `__tests__` directory or `.test.js` / `.spec.js` files anywhere in the repo
- `dispatch.js` is a pure function — ideal first candidate for unit tests
- `usePayment.js` validation logic is unit-testable without UI

---

## 12. Known Issues

| # | Severity | Module | Description | Suggested Fix |
|---|----------|--------|-------------|---------------|
| 1 | 🔴 High | Settings | Sign-out button calls `navigate('/login')` without invoking `logout()` — Supabase session remains active | Replace `navigate('/login')` with the `logout()` context function |
| 2 | 🔴 High | Security | `.env` and `.env.example` contain identical real Supabase credentials — anon key in source control | Rotate the key, remove real credentials from `.env.example`, add `.env` to `.gitignore` |
| 3 | 🟠 Medium | Driver | Online/offline toggle updates only local state; `profiles.status` in Supabase not updated | Call `updateProfile({ status: online ? 'online' : 'offline' })` on toggle |
| 4 | 🟠 Medium | Driver | Delivery pickup address always shows "Linking Road" hardcoded | Resolve actual restaurant address from `restaurants` state |
| 5 | 🟠 Medium | Admin | Overview KPI cards use fixed offsets (`+ 1282`, `+ 184200`, `"8,492"`) — misleading to operators | Compute real aggregates from Supabase or remove offsets |
| 6 | 🟠 Medium | Driver | Earnings stat cards show "12 deliveries", "22 min avg", "+3 from yesterday" as hardcoded strings | Query actual delivered order counts per driver |
| 7 | 🟠 Medium | Layout | Sidebar order badge is hardcoded `'2'` regardless of actual order count | Derive from `customerOrders.filter(o => o.status !== 'delivered').length` |
| 8 | 🟡 Low | Admin | Restaurant edit not implemented — created restaurants cannot be updated (only deleted) | Add edit form / inline editing |
| 9 | 🟡 Low | Admin | Menu items cannot be edited or deleted from the UI | Add edit + delete controls to `AdminRestaurants` |
| 10 | 🟡 Low | Admin | `addDriver` creates a profile object without a real Supabase Auth account — partner cannot log in | Implement invite Edge Function or use Supabase admin API |
| 11 | 🟡 Low | Auth | Admin invite `approvalCode` is collected but never validated | Validate against a stored code or remove the field |
| 12 | 🟡 Low | Customer | "Filters" button shows toast instead of opening a filter panel | Implement filter sheet with price range, delivery time, rating, dietary |
| 13 | 🟡 Low | Customer | Order badge in sidebar is always `'2'` | Compute from real order state |
| 14 | 🟡 Low | DB | Schema missing `image_url` on `menu_items`, and `color`, `tag`, `eta` on `restaurants` | Add columns to `schema.sql` and run migration |

---

## 13. Technical Debt

| Item | Location | Description | Impact |
|------|----------|-------------|--------|
| Minified JSX source | Page files, `App.jsx` | All logic on 1–2 lines; no formatting | High — unmaintainable |
| No ESLint / Prettier | Project root | No linting or formatting enforced | High — code quality risk |
| No test suite | Entire project | Zero automated tests | High — regressions undetected |
| Dual `restaurantId` / `restaurant_id` naming | `AppContext`, pages | Two identifiers for same FK — fragile | Medium |
| `Stat` component duplication | `DriverPage.jsx`, `AdminPage.jsx` | Identical component in two files | Low |
| `OrderCard` dead export | `StatusTracker.jsx` | Exported component never used | Low |
| Hardcoded stat offsets | `AdminPage.jsx`, `DriverPage.jsx` | Static numbers inflate real metrics | High (data integrity) |
| Hardcoded sidebar order badge | `Layout.jsx` | `'2'` literal not derived from state | Medium |
| Hardcoded pickup address "Linking Road" | `DriverPage.jsx` | Not resolved from restaurant record | Medium |
| Mock payment only | `usePayment.js` | No real payment gateway; simulated delays | High (production blocker) |
| No migration system | `lib/schema.sql` | Single SQL file; no versioning | Medium |
| No seed SQL | — | Supabase cannot be seeded automatically | Low |
| Settings forms not persisted | `SettingsPage.jsx` | Vehicle, dietary, zone, payout fields have no DB write | Medium |
| `dispatchReservations` leak risk | `AppContext.jsx` | Driver ID stays reserved if catch path is hit before `.delete()` | Low |
| Real credentials in `.env.example` | `.env.example` | Leaks actual Supabase anon key to anyone cloning the repo | 🔴 Critical |
| `"latest"` dependency versions | `package.json` | Non-pinned deps break reproducible builds | Medium |

---

## 14. Security Review

| Area | Status | Detail |
|------|--------|--------|
| Supabase anon key exposure | 🔴 **Critical** | Real anon key committed to `.env.example` — must rotate and add to `.gitignore` |
| Row-Level Security | ✅ Good | All four tables have RLS enabled with appropriate policies |
| Route authorization | ✅ Good | `<Guard>` HOC redirects unauthorised role access before rendering |
| Input validation (signup) | ✅ Good | Form `required` attributes; `minLength=6` on password |
| Input validation (payment) | ✅ Good | `usePayment.js` validates card format, expiry MM/YY, CVV regex |
| Input validation (admin forms) | 🟡 Partial | Name/price/address checked but no max-length or XSS sanitisation |
| Admin invite code validation | ⚠ Missing | `approvalCode` collected but never verified |
| Session sign-out bug | 🔴 High | Settings sign-out bypasses `logout()` — real Supabase session not terminated |
| SQL injection | ✅ N/A | Supabase JS SDK uses parameterised queries |
| CORS / API key security | 🟡 Partial | Anon key is intentionally public but should be restricted via Supabase project settings |
| Sensitive data in `profiles` | ⚠ Needs Verification | `license_number`, `vehicle_registration` stored as plaintext |
| Environment variable naming | ✅ Good | Only `VITE_` prefixed keys; no server secrets exposed to browser |
| Content Security Policy | ⏳ Not started | No CSP headers configured |

---

## 15. Performance Review

| Area | Concern | Severity |
|------|---------|----------|
| No `React.memo` on list items | `RestaurantCard`, `AdminOrderRow`, `PartnerRow` re-render on every state change | Medium |
| `useMemo` in `CustomerPage` | `cuisines`, `filtered`, `customerOrders` memoised ✅ | — |
| No pagination | All records rendered at once — fine for MVP; degrades at 1000+ rows | Medium |
| `hydrateSupabase` fetches all profiles | `select('*')` on `profiles` — no pagination | Medium |
| `styles.css` is 36 KB unminified | Single large stylesheet; no code splitting by route | Low |
| Unsplash images without `srcset` | `?w=900&q=85` params help but no responsive image set | Low |
| Auto-dispatch watcher | Runs on every `orders` state change — intentional but could cause excess calls at scale | Low |
| No lazy-loading | All pages eagerly loaded; `React.lazy` not used | Low |

---

## 16. Dependency Review

| Package | Version | Purpose | Notes |
|---------|---------|---------|-------|
| `react` | `latest` | UI framework | ⚠ Should pin to specific version |
| `react-dom` | `latest` | React DOM renderer | ⚠ Should pin |
| `react-router-dom` | `latest` | Client-side routing | ⚠ Should pin |
| `@supabase/supabase-js` | `^2.111.0` | Backend client (auth, DB, realtime) | ✅ Pinned with caret |
| `@radix-ui/react-dialog` | `latest` | Accessible dialog primitive | ⚠ Should pin |
| `lucide-react` | `latest` | Icon library (25+ icons used) | ⚠ Should pin |
| `vite` | `latest` | Dev server + build tool | ⚠ Should be in `devDependencies` + pinned |
| `@vitejs/plugin-react` | `latest` | Vite React plugin | ⚠ Should be in `devDependencies` + pinned |

**No devDependencies defined** — `vite` and `@vitejs/plugin-react` belong under `devDependencies`.
**No testing library, no ESLint, no Prettier, no TypeScript** configured.
**All `"latest"` pins are a reproducibility risk** — lock to explicit semver versions.

---

## 17. Documentation Status

| Document | Exists | Quality | Notes |
|----------|--------|---------|-------|
| `README.md` | ✅ | Good | Covers setup, Supabase config, demo accounts, routes, dispatch algorithm |
| `schema.sql` | ✅ | Good | Inline SQL comments; all policies documented |
| `dispatch.js` | ✅ | Good | Clear inline comment explaining replacement point |
| API documentation | ❌ | — | No OpenAPI / Swagger doc |
| Architecture decision records | ❌ | — | No ADR files |
| Component storybook | ❌ | — | No isolated component docs |
| Deployment guide | ❌ | — | No production deployment instructions |
| Contribution guide | ❌ | — | No `CONTRIBUTING.md` |
| Changelog | ❌ | — | No `CHANGELOG.md` |
| Environment setup guide | ✅ (Partial) | Fair | README covers `.env` setup but not full Supabase project creation |

---

## 18. Git Readiness

| Gate | Status | Blocker |
|------|--------|---------|
| Production readiness | 🔴 Not ready | Mock payment, no tests, credential exposure |
| Staging readiness | 🟠 Partial | Sign-out bug, online-status not persisted, hardcoded stats |
| Development / Demo | ✅ Ready | Fully functional dual-adapter MVP |

### Blockers Before Staging

- [ ] Fix sign-out bug in `SettingsPage`
- [ ] Rotate and protect Supabase anon key; add `.env` to `.gitignore`
- [ ] Persist driver online/offline status to `profiles`
- [ ] Replace hardcoded stat offsets with real queries
- [ ] Add ESLint + Prettier; format all files

### Blockers Before Production

- [ ] Real payment gateway integration (Razorpay / Stripe)
- [ ] Automated test suite (at minimum unit tests for dispatch, payment, auth)
- [ ] Password reset flow
- [ ] Admin invite Edge Function for driver provisioning
- [ ] Implement pagination for all list views
- [ ] Error boundary component
- [ ] Production monitoring (Sentry or equivalent)

---

## 19. Recommended Next Tasks

### 🔴 High Priority

| # | Task | Complexity | Dependencies | Expected Outcome |
|---|------|-----------|--------------|-----------------|
| 1 | **Fix sign-out bug** — Replace `navigate('/login')` in `SettingsPage` with `logout()` | Low | None | Users properly signed out; Supabase session cleared |
| 2 | **Rotate Supabase key & secure credentials** — Remove real key from `.env.example`, add `.env` to `.gitignore`, generate new anon key | Low | Supabase dashboard access | Security vulnerability eliminated |
| 3 | **Persist driver online/offline toggle** — Call `updateProfile({ status })` when driver toggles | Low | None | Dispatch engine sees correct driver availability after refresh |
| 4 | **Format all source files** — Add `prettier` + `eslint` config; run formatter on all files | Low | None | Codebase becomes readable and maintainable |
| 5 | **Remove hardcoded stat offsets** — Compute real aggregates from `orders` / `users` state | Medium | None | Admin KPIs reflect real data |
| 6 | **Fix order badge in sidebar** — Compute from `customerOrders` state, not hardcoded `'2'` | Low | None | Badge shows accurate unresolved order count |

### 🟠 Medium Priority

| # | Task | Complexity | Dependencies | Expected Outcome |
|---|------|-----------|--------------|-----------------|
| 7 | **Add restaurant edit form** — Inline edit panel in `AdminRestaurants` with pre-filled fields + Supabase update | Medium | `updateRestaurant` context function | Admins can correct restaurant metadata |
| 8 | **Add menu item edit + delete** — Per-item actions in restaurant list | Medium | `updateMenuItem`, `removeMenuItem` context functions | Full menu item CRUD |
| 9 | **Implement driver invite via Supabase** — Supabase Edge Function or admin API to provision Auth account | High | Supabase Edge Function or Service Role key | Partners can log in after being added by admin |
| 10 | **Fix driver pickup address** — Resolve restaurant address from `restaurants` array | Low | None | Drivers see correct pickup location |
| 11 | **Add schema columns for missing fields** — `image_url` on `menu_items`; `color`, `tag`, `eta` on `restaurants` | Low | Supabase migration | Schema matches app data model |
| 12 | **Implement password reset** — Supabase `resetPasswordForEmail` + `/forgot-password` route | Medium | None | Users can recover accounts |
| 13 | **Extract `Stat` component to `components/`** — Remove duplicate definition | Low | None | DRY codebase |
| 14 | **Persist settings form fields** — Wire driver vehicle/zone/payout, customer dietary, admin permissions to DB | Medium | Schema columns | Settings page is functional |
| 15 | **Add unit tests for `dispatch.js`** — Pure functions; easy to test with Vitest | Low | Vitest | Regression protection for dispatch algorithm |

### 🟡 Low Priority

| # | Task | Complexity | Dependencies | Expected Outcome |
|---|------|-----------|--------------|-----------------|
| 16 | **Implement advanced filter panel** — Price range, delivery time, rating, dietary filter sheet | Medium | Dietary preference stored per user | Full-featured restaurant discovery |
| 17 | **Add React error boundary** — Catch render errors; show friendly fallback | Low | None | App does not white-screen on unexpected errors |
| 18 | **Real payment gateway** — Integrate Razorpay or Stripe | High | Backend webhook endpoint | Revenue can be processed |
| 19 | **Pin all dependencies** — Replace `"latest"` with specific versions | Low | None | Reproducible builds |
| 20 | **Add pagination to lists** — Cursor-based pagination for orders, restaurants, partners | Medium | None | Performance at scale |
| 21 | **`React.lazy` code splitting** — Lazy-load each page component | Low | None | Faster initial load |
| 22 | **Admin analytics page** — Historical charts (revenue over time, orders per day, top restaurants) | High | Supabase aggregation queries | Operational visibility |
| 23 | **Admin customer management** — View, search, and manage customer accounts | Medium | Admin RLS read on profiles | Full admin workspace |
| 24 | **Move build devDependencies** — Move `vite` and `@vitejs/plugin-react` to `devDependencies` | Low | None | Correct `package.json` structure |
| 25 | **Add `CONTRIBUTING.md` and `CHANGELOG.md`** | Low | None | Developer onboarding |
| 26 | **Delete unused `OrderCard` export** — Remove from `StatusTracker.jsx` or wire it in | Low | None | No dead code |
| 27 | **Supabase seed SQL file** — Write a `seed.sql` with demo restaurants and menu items | Low | None | Supabase project can be bootstrapped quickly |

---

## 20. Overall Project Health

### Executive Summary

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Completion** | ~58% | Core flows functional; many sections are placeholder |
| **Code quality** | 3/10 | No formatting, no linting, severely compressed source |
| **Architecture** | 7/10 | Clean separation; dual-adapter pattern is elegant |
| **Security** | 4/10 | RLS good; credentials leaked; sign-out broken |
| **Testing** | 0/10 | Zero automated tests |
| **Documentation** | 5/10 | Good README and schema; no ADRs or component docs |
| **Production readiness** | 2/10 | MVP/demo only |

### Strengths

- **Dual adapter pattern** — app works entirely offline with mock data; Supabase integration is clean and non-invasive
- **Auto-dispatch engine** — algorithmic driver ranking (Haversine + fairness bonus + concurrency reservation) is well thought out
- **Real-time updates** — Supabase Realtime subscription properly maintains live order state
- **Role-based routing** — `<Guard>` HOC cleanly enforces workspace isolation with toast feedback
- **Visual design** — Rich, consistent design system in a single `styles.css`; responsive and polished
- **RLS policies** — All four tables correctly secured; appropriate enum types used

### Weaknesses

- **Source code formatting** — Every page file is essentially a minified one-liner; impossible to read or review
- **No tests** — Zero coverage; dispatch engine, payment validation, and auth logic have no regression protection
- **Credentials in source control** — Critical security issue
- **Significant placeholder UI** — Settings, driver stats, admin KPIs are mostly non-functional scaffolding
- **Missing CRUD operations** — Restaurant edit, menu item edit/delete, and online-status persistence are absent
- **No real payment** — Application cannot process real transactions

### Highest Risks

1. 🔴 **Real Supabase anon key committed to `.env.example`** — anyone with repo access can interact with the live database
2. 🔴 **Sign-out does not terminate Supabase session** — authentication bypass possible on shared devices
3. 🔴 **No payment gateway** — app is not monetisable as-is
4. 🟠 **Driver online status not persisted** — dispatch engine ignores actual availability after page refresh

### Immediate Priorities

1. **Security** — Rotate credentials, fix sign-out (estimated 2 hours)
2. **Data integrity** — Remove hardcoded stat offsets, fix driver status persistence (estimated 4 hours)
3. **Readability** — Format all source files with Prettier (estimated 1 hour)
4. **Coverage** — Write unit tests for `dispatch.js` and `usePayment.js` (estimated 4 hours)

### Recommendation for Next Development Milestone

> **Milestone: "Staging Ready" (estimated 2–3 days)**
>
> Focus entirely on the 6 High Priority tasks plus the 3 schema/credential fixes. This milestone makes the application safe to demonstrate to stakeholders on a real Supabase backend without data integrity concerns. After that, tackle restaurant and menu item CRUD completion (Medium Priority 7 & 8) and the driver invite flow (Medium Priority 9) to bring the Admin workspace to a shippable state.

---

*This report reflects the state of the codebase as of **2026-07-30**. Re-run this analysis after major feature additions or refactors.*
