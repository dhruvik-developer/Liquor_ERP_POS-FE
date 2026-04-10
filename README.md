# Liquor ERP POS Frontend

Frontend application for a liquor retail ERP and POS system, built with React, Vite, Tailwind CSS, and a REST API backend. The project includes an admin portal, a staff-facing POS terminal, a synced customer display, and operational screens for inventory, people, purchases, sales, stores, cash drawer, roles, permissions, and settings.

## What This Project Includes

- Role-based app entry with JWT login and automatic redirect to the correct portal.
- Admin workspace under `/admin` for dashboard, catalog, purchasing, people, stores, reports, and access control.
- Staff POS workspace under `/pos` focused on terminal operations.
- Dedicated customer display routes for both staff and admin use cases.
- Inventory management with filters, inactive-item toggle, and add/edit product modal support.
- Item master lookups for departments, UOMs, sizes, packs, and brands.
- People management for users, customers, and vendors.
- Purchase bill, purchase order, receiving, and purchase return screens.
- Sales screens, cash drawer, low stock, stock adjustment, and settings pages.
- Age verification flow for restricted items in the POS cart.
- UPC-based product image lookup support through a Vite proxy.
- Shared toast, modal, dropdown, table, and form primitives.

## Tech Stack

- React 19
- Vite 7
- React Router 7
- Tailwind CSS 3
- Axios
- Zustand
- Framer Motion
- Recharts
- date-fns
- lucide-react

## App Areas

### 1. Authentication and Routing

- Splash screen at `/` checks stored auth and redirects to login or the correct portal.
- Login page posts credentials to `/auth/login/`.
- Protected routes separate admin and staff access.
- Default route behavior:
  - Admin users go to `/admin/dashboard`
  - Staff users go to `/pos/terminal`

### 2. Admin Portal

Key admin routes include:

- `/admin/dashboard`
- `/admin/products`
- `/admin/purchase-bills`
- `/admin/purchase-orders`
- `/admin/purchase-return`
- `/admin/sales`
- `/admin/people`
- `/admin/stores`
- `/admin/item-master`
- `/admin/cash-drawer`
- `/admin/reports`
- `/admin/settings`
- `/admin/roles`
- `/admin/permissions`
- `/admin/profile`

### 3. Staff POS Portal

Key staff routes include:

- `/pos/terminal`
- `/pos/customer-display`

The staff portal uses the same app shell but skips the admin sidebar and keeps the experience centered on checkout flow.

### 4. Customer Display

The customer display is available at:

- `/pos/customer-display`
- `/admin/customer-display`

It syncs cart state across windows using `BroadcastChannel` plus `localStorage`, rotates promotions from `/inventory/promotions/`, and hides restricted items until age verification is complete.

## Backend and API Expectations

This frontend is designed around a REST API with trailing-slash endpoints and bearer-token authentication. The codebase expects a backend that provides endpoints such as:

- `/auth/login/`, `/auth/logout/`, `/auth/access-check/`
- `/users/`, `/roles/`, `/permissions/`, `/stores/`
- `/inventory/products/`, `/inventory/categories/`, `/inventory/promotions/`
- `/people/customers/`, `/people/vendors/`
- `/sales/orders/`
- `/lookups/departments/`, `/lookups/uoms/`, `/lookups/sizes/`, `/lookups/packs/`, `/lookups/brands/`, `/lookups/tax-rates/`
- `/reports/dashboard/`

There are also service helpers for dashboard-style endpoints like `/dashboard/summary/`, `/dashboard/store-performance/`, and `/dashboard/sales-analytics/`, including mock fallback data where applicable.

## Environment Variables

Copy `.env.example` to `.env` and update values for your environment.

| Variable | Required | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Yes | Base API URL, for example `http://localhost:8000/api` |
| `VITE_UPC_LOOKUP_BASE_URL` | Recommended | UPC image lookup proxy path, default is `/upc-lookup` |

Current `.env.example`:

```env
VITE_API_BASE_URL=http://192.168.1.89:8000/api
VITE_UPC_LOOKUP_BASE_URL=/upc-lookup
```

## Local Development

### Prerequisites

- Node.js 18+ recommended
- npm
- Running backend API with the expected endpoints

### Install

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

The Vite dev server is configured to run on port `5172`.

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the built app locally |
| `npm run lint` | Run ESLint across the project |

## Project Structure

```text
.
|-- public/
|-- src/
|   |-- assets/                  # Static images and icon assets
|   |-- components/
|   |   |-- common/              # Shared UI primitives
|   |   |-- dashboard/           # Dashboard widgets, charts, tables
|   |   |-- pos/                 # POS, inventory, people, purchase, report screens
|   |   |-- routing/             # Route guards
|   |-- context/                 # App-level providers such as calculator state
|   |-- hooks/                   # Reusable data and lookup hooks
|   |-- mocks/                   # Dashboard fallback mock data
|   |-- pages/                   # Route pages like splash and login
|   |-- services/                # Axios/fetch API clients and domain services
|   |-- store/                   # Zustand POS store
|   |-- utils/                   # Auth, toast, URL, date, customer display helpers
|   |-- App.jsx                  # Main route tree
|   |-- main.jsx                 # React entry point
|-- .env.example
|-- vite.config.js
|-- tailwind.config.js
|-- eslint.config.js
```

## Important Implementation Notes

- Auth state is stored in `localStorage` using `access_token` and `auth_user`.
- Admin detection is derived from role metadata or `is_super_admin`.
- The POS cart uses Zustand and currently applies a tax rate of `18%`.
- The customer display only shows age-restricted items after verification succeeds.
- `vite.config.js` proxies `/upc-lookup` to the Scanbot UPC lookup endpoint for product image fetches.
- Some dashboard and POS helpers include fallback behavior so screens can still render when selected endpoints fail.
- The reports dashboard currently provides a structured report-selection and filter UI; backend report execution is not fully wired in this frontend alone.

## Suggested Onboarding Flow

1. Configure `.env` with the correct backend base URL.
2. Run `npm install`.
3. Start the backend.
4. Run `npm run dev`.
5. Log in with an admin account to verify the full route tree.
6. Open `/pos/terminal` and `/pos/customer-display` in separate windows to test the checkout and customer display experience together.

## Repository Purpose

This repository is best understood as the frontend shell for a liquor-store ERP + checkout system. It already contains the main operational surfaces and shared frontend architecture needed for day-to-day POS, inventory, purchasing, people management, and back-office administration.
