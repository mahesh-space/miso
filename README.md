# miso MVP

Vite + React role-based food delivery MVP. The visual system lives in `src/styles.css`; behavior is split into route pages, shared components, React Context state, hooks, and Supabase integration.

## Run

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env` and add Supabase credentials to enable the real backend. Without credentials the app uses a deterministic in-memory demo adapter so the three workspaces remain usable locally.

## Supabase setup

Run [`src/lib/schema.sql`](src/lib/schema.sql) in the Supabase SQL editor. It creates the required profiles, restaurants, menu_items, and orders tables, role/status enums, row-level security policies, and the realtime publication for orders.

Seed/demo accounts when running without Supabase:

- Customer: `maya@miso.app`
- Driver: `arjun@miso.app`
- Admin: `nia@miso.app`

Any password is accepted by the local adapter. With Supabase configured, native Auth credentials are required and the role is read from `profiles`.

## Routes

- `/login`
- `/customer`, `/customer/orders`
- `/driver`, `/driver/earnings`
- `/admin`, `/admin/orders`, `/admin/restaurants`, `/admin/partners`

Role guards redirect unauthorized deep links to the correct workspace and send a toast notification.

## Automatic dispatch

`src/lib/dispatch.js` ranks eligible drivers using a deterministic minimum-ETA score:

`score = pickup ETA + delivery ETA + (active orders × 12 minutes) − fairness bonus`

Only active, online drivers are eligible. Haversine distance is used by the mock adapter; production can replace the coordinate lookup with a traffic-aware maps ETA service without changing the dispatch contract. Concurrent assignments reserve selected drivers briefly so a batch of new orders is distributed instead of choosing the same driver repeatedly.
