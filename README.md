# BISUM Conference 2025 Web Platform

The official web platform and conference management system for **BISUM Conference 2025** (Business, Investment, Leadership & Technology Summit), hosted by Higher Ground Baptist Church (HGBC), Ogbomoso, Nigeria.

---

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide Icons
- **Backend API:** Node.js, Express, TypeScript
- **Database & Auth:** Supabase (PostgreSQL with Row Level Security and Realtime Channels)
- **Payment Gateway:** Paystack (Inline checkout, transaction verification, and secure HMAC webhooks)
- **Email Delivery:** Resend API (Transactional registration & merchandise order notifications)

---

## Core Features

- **Public Conference Portal:**
  - Dynamic event landing page with countdown timer and interactive sections.
  - Featured speakers directory and 3-day conference schedule.
  - Conference merchandise store with item variations (color, size, quantity).
- **Participant Registration:**
  - Paid admission tiers: **Student Pass (₦1,000)** and **Professional Pass (₦2,000)**.
  - Breakout masterclass track selection (Investment, Tech, Fashion, Agribusiness, Food Business).
  - Sequential 4-digit zero-padded registration ID generation (`0001`, `0002`, ...).
- **Payment & Transaction Engine:**
  - Seamless Paystack payment checkout for registrations and merchandise.
  - Secure HMAC-SHA512 webhook handling and server-side verification callbacks.
  - Automated confirmation email dispatch with admission details and order receipts.
- **Admin Management Dashboard:**
  - Real-time KPI monitor: Total Registrations, Total Merchandise Purchased, Combined Revenue (₦), and Pending Transactions.
  - Full CRUD operations on participant registrations and merchandise orders.
  - Inline merchandise fulfillment status updater (`Unfulfilled` ➔ `Ready` ➔ `Picked Up`).
  - Search, multi-criteria filtering, CSV and PDF report exports.
  - One-click confirmation email resend tools.

---

## Project Structure

```text
bisum/
├── public/                  # Static assets (logos, banners, speaker images)
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── admin/           # Admin dashboard (Overview, Registrations, Merchandise, Payments)
│   │   ├── merchandise/     # Merchandise catalog and pre-order pages
│   │   ├── payment/         # Paystack transaction verification callback
│   │   ├── register/        # Conference registration flow
│   │   ├── schedule/        # 3-day event schedule
│   │   ├── speakers/        # Speaker directory
│   │   ├── layout.tsx       # Root layout, metadata & JSON-LD event schema
│   │   ├── robots.ts        # Search crawler directives
│   │   └── sitemap.ts       # Dynamic XML sitemap generator
│   ├── components/          # Reusable UI components
│   ├── data/                # Static datasets and reusable text configuration
│   ├── hooks/               # Custom hooks (Supabase realtime stream)
│   ├── lib/                 # Supabase client initialization
│   ├── services/            # API client services
│   └── types/               # TypeScript interfaces
├── server/                  # Node.js / Express backend service
│   ├── src/
│   │   ├── controllers/     # Route controllers (Admin, Registration, Merchandise, Payments)
│   │   ├── middlewares/     # Supabase auth and webhook validation middlewares
│   │   ├── routes/          # Express API route declarations
│   │   ├── services/        # Business logic, Supabase Admin & Resend email templates
│   │   └── server.ts        # Express application entrypoint
│   └── database.sql         # PostgreSQL schema, sequences, and RLS policies
└── package.json
```

---

## Environment Variables

### Frontend (`.env.local`)
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
```

### Backend (`server/.env.local`)
```env
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=your_paystack_public_key
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=BISUM Conference <bisum@yourdomain.com>
```

---

## Getting Started

### 1. Clone Repository & Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 2. Database Migration

Run the SQL script located at `server/database.sql` in your **Supabase Project > SQL Editor** to create all tables, indexes, registration sequence, and RLS policies.

### 3. Start Development Servers

```bash
# Terminal 1: Run Backend API (from server directory)
cd server
npm run dev

# Terminal 2: Run Frontend Next.js app (from root directory)
npm run dev
```

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **Backend API:** [http://localhost:5000](http://localhost:5000)
- **Admin Dashboard:** [http://localhost:3000/admin](http://localhost:3000/admin)

---

## Deployment

- **Frontend:** Deploy to [Vercel](https://vercel.com) (set root directory to `.`).
- **Backend:** Deploy to [Render](https://render.com) or [Railway](https://railway.app) (set root directory to `server`, build command `npm install && npm run build`, start command `npm start`).
- **Paystack Webhook Configuration:** Set your Paystack Webhook URL to `https://<your-backend-domain>/api/webhooks/paystack`.

---

## License

All rights reserved © 2025 BISUM Conference. Powered by Higher Ground Baptist Church (HGBC).
