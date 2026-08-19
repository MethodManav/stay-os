# StayOS 🏨 — B2B Multi-Tenant Hospitality SaaS Platform

StayOS is a modern, end-to-end Property Management System (PMS) and Hospitality SaaS designed to empower hotels, guest houses, and boutique accommodations. It provides hotel operators with the tools to manage bookings, optimize room inventory, run guest CRMs, customize booking websites, process payments, interact with guests via an AI Assistant, and oversee operations from a Super Admin Console.

---

## 🚀 Key Features

### 🏢 B2B Multi-Tenancy & Tenant Onboarding
- **Multi-Tenant Isolation**: Complete database and logical segregation of organizational data.
- **Onboarding Wizard**: Step-by-step tenant setup configuring business profiles, currency, checkout policies, and initial room types.
- **Organization & Business Scope**: Support for multiple business branches/hotels under a single parent organization.

### 📊 Real-Time Operations Dashboard
- **Front-Desk Dashboard**: Interactive metrics detailing occupancy rate, daily revenues, active guests, and pending arrivals.
- **Check-In/Check-Out Manager**: Smooth workflow transition for arrivals and departures.

### 📅 Booking & Reservations System
- **Interactive Planner**: Comprehensive calendar view of current, historical, and future bookings.
- **Booking Pipeline**: Reservations lifecycle tracking states from `pending` -> `confirmed` -> `checked-in` -> `checked-out` -> `cancelled`.

### 🛏️ Rooms & Room Types Inventory
- **Dynamic Cataloging**: Define custom room configurations, guest capacity limits, amenities, and default base rates.
- **Status Monitoring**: Live status tagging for rooms (`available`, `occupied`, `maintenance`).

### 👥 Guest Relationship Manager (CRM)
- **Guest Profiles**: Automatic collection of contact cards, preferences, and private notes.
- **VIP & Tag Categorization**: Classifies guests using automated tags (e.g., `VIP`, `Returning Guest`, `High Value`).
- **Spending Analytics**: Tracks total booking count and historical revenue per guest.

### 🌐 No-Code Website Builder
- **Tenant Subdomain Portals**: Instant generation of public-facing websites at `/site/:subdomain` for direct booking.
- **Branding Customizer**: Live toggle options for sections (Hero, About, Amenities, Reviews, Contact) and visual styling (primary/secondary color themes, fonts, buttons).

### 💬 AI-Powered Guest Inbox & Assistant
- **AI Auto-Responder**: Intelligent guest inquiry handler that answers questions about facilities, Wi-Fi, policy, and availability.
- **Lead Capture & Escalation**: Converts inquiries into booking leads and escalates complex queries to front-desk staff.

### 💳 Simulated Payment Gateway
- **Integrated Checkouts**: Demo payment processing utilizing simulated Stripe and Razorpay integrations.
- **Transaction Logs**: Tracks payment statuses (`paid`, `pending`, `refunded`) and payment method analytics.

### 👑 Super Admin Control Center
- **Global Overview**: Manage all registered organisations, track monthly recurring revenue (MRR), monitor database health, and view tenant licensing models.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.2 (with TypeScript)
- **Build Tool**: Vite 8.1
- **Routing**: React Router v7
- **Styling**: Tailwind CSS v4 (with modern transitions and flexbox layout grids)
- **State & Storage**: AppContext State with LocalDB (IndexedDB/localStorage/in-memory mocks) for seamless demo sandboxing.
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js & TypeScript
- **Framework**: Express (with modular routes)
- **Database**: MongoDB (via Mongoose)
- **Security & Middleware**: Helmet, Express Rate Limit, Cors, BCryptJS, and JSON Web Tokens (JWT).
- **Loggers**: Winston & Morgan HTTP middleware
- **Validation**: Zod (type-safe schemas)
- **Testing**: Jest & Supertest

---

## 📁 Directory Structure

```text
StayOS/
├── frontend/                 # Client SPA and Tenant Marketing Pages
│   ├── src/
│   │   ├── components/       # Pages, layout dashboards, onboarding, and tabs
│   │   ├── App.tsx           # React Router Route declarations (app, admin, subdomains)
│   │   ├── AppContext.tsx    # Primary state context and local mock data operations
│   │   ├── api.ts            # REST HTTP client connecting to the Node.js backend
│   │   ├── db.ts             # Static typing and localStorage fallback schemas
│   │   ├── index.css         # Tailwind directives and CSS variables
│   │   └── main.tsx          # Client-side mounting
│   ├── package.json          # Node scripts, Tailwind v4, React 19 configuration
│   └── vite.config.ts        # Vite configuration
│
├── backend/                  # REST API Service
│   ├── src/
│   │   ├── config/           # AppConfig & EnvConfig mapping
│   │   ├── core/             # Base middleware, errors, and database bootstrap
│   │   ├── modules/          # Business logic structured by domain components:
│   │   │   ├── auth/         # JWT generation, token refresh, and login
│   │   │   ├── users/        # User repositories and schemas
│   │   │   ├── organizations/# Multi-tenant management
│   │   │   ├── bookings/     # Booking services, models, and reservation statuses
│   │   │   ├── rooms/        # Room configurations and room type listings
│   │   │   ├── guests/       # Guest CRM databases
│   │   │   ├── websites/     # Website section and style presets
│   │   │   ├── payments/     # Payment gateway interfaces (Stripe/Razorpay)
│   │   │   ├── ai/           # AI response generation services
│   │   │   └── analytics/    # Aggregations for revenue and occupancy
│   │   ├── routes/           # Global REST path register (/api/v1)
│   │   └── server.ts         # Server initiator & MongoDB connection runner
│   ├── tests/                # Test suites for backend endpoints
│   └── package.json          # Express, Mongoose, and dev dependencies
```

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn
- MongoDB running locally or on a remote instance (e.g. Atlas)

---

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
4. Update `.env` with your Mongo connection URI and secrets:
   ```env
   PORT=5001
   MONGO_URI=mongodb://localhost:27017/stayos
   JWT_ACCESS_SECRET=your_jwt_access_secret_should_be_long_and_random_string
   JWT_REFRESH_SECRET=your_jwt_refresh_secret_should_be_long_and_random_string
   CLIENT_URL=http://localhost:5173
   ```
5. Run the server in development mode (using Nodemon):
   ```bash
   npm run dev
   ```

---

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server (using Vite):
   ```bash
   npm run dev
   ```
4. Access the web app in your browser at `http://localhost:5173`.

---

## 🧪 Running Tests & Quality Checks

### Backend Test Suite
The backend contains automated Jest tests that run against memory databases:
```bash
cd backend
npm run test
```

### Linting
To check for code issues on both backend and frontend:
```bash
# Frontend linting
cd frontend
npm run lint

# Backend linting
cd backend
npm run lint
```
