# StayOS AI Booking Agent & Model Context Protocol (MCP) Guide

This guide details the architecture, configuration, local development, deployment, and testing procedures for the **StayOS Multi-Tenant AI Hotel Booking Concierge** powered by **Google Gemini** (`@google/genai`) and **Model Context Protocol (MCP)** tools.

---

## 1. Architectural Overview

StayOS is a B2B multi-tenant hospitality platform where every registered hotel is an isolated tenant. The booking agent interacts with hotel property inventory through a single reusable MCP server that enforces strict tenant isolation:

```text
Guest Browser (/site/:slug)
       │
       ▼
Public Chat Endpoint (POST /api/v1/public/businesses/:slug/chat)
       │
       ▼ Tenant Resolution (slug -> hotelId, business, organizationId)
Gemini Booking Agent (src/agent/agent.ts using @google/genai)
       │
       ▼ (Autonomous tool calls triggered by LLM reasoning)
MCP Tools Layer (src/mcp/server.ts & tools/*.ts)
 [Injected with trusted TenantContext: { hotelId, organizationId }]
       │
       ▼
StayOS Service Layer (src/services/ & modules/*)
 ├── HotelService (tenant verification & property metadata)
 ├── RoomService (catalog & physical room availability)
 └── BookingService (conflict detection, pricing calculation, atomic booking)
       │
       ▼
MongoDB Database (Scoped queries: { businessId: hotelId })
```

### Security & Multi-Tenant Rules
- **Trusted Tenant Resolution**: The tenant `hotelId` is resolved from the hotel website slug (e.g. `/site/taj-example`) or secure headers. It is **never** accepted from or chosen by Gemini.
- **Backend Pricing Enforcement**: Total pricing is calculated by `BookingService` from room rates, nights, and statutory taxes. Any price parameters provided by the model are ignored.
- **Double Booking Prevention**: Overlapping dates are evaluated against physical room inventory using database conflict queries.
- **Zero Cross-Tenant Leakage**: Every query for room categories, availability, physical rooms, and bookings is strictly filtered by `businessId: hotelId`.

---

## 2. MCP Tools Specification

StayOS implements 6 initial MCP tools:

| Tool Name | Purpose | Key Inputs | Injected Context |
|---|---|---|---|
| `searchRooms` | Search available rooms for date range | `checkIn`, `checkOut`, `guests` | `hotelId` (tenant) |
| `getRoomDetails` | Retrieve room specs and amenities | `roomId` | `hotelId` (tenant) |
| `checkAvailability` | Check date availability and calculate price | `roomId`, `checkIn`, `checkOut` | `hotelId` (tenant) |
| `createBooking` | Confirm reservation and allocate room | `roomId`, `checkIn`, `checkOut`, `guests`, `guest` details | `hotelId` (tenant) |
| `getBooking` | Retrieve booking details with verification | `bookingId`, `email?`, `phone?` | `hotelId` (tenant) |
| `cancelBooking` | Cancel booking and enforce policy | `bookingId`, `email?`, `phone?`, `reason?` | `hotelId` (tenant) |

---

## 3. Environment Variables Configuration

Create or update `.env` in the `backend/` directory:

```env
# Server
NODE_ENV=development
PORT=5001
CLIENT_URL=http://localhost:5173

# Database (Supports both MONGODB_URI and MONGO_URI)
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/stay-os
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/stay-os

# Google Gemini API Key
GEMINI_API_KEY=AIzaSy...your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Internal URLs
BACKEND_URL=http://localhost:5001
MCP_SERVER_URL=http://localhost:5001/mcp

# Authentication Secrets
JWT_ACCESS_SECRET=supersecretaccesskeyforlocaldevelopment123456
JWT_REFRESH_SECRET=supersecretrefreshkeyforlocaldevelopment123456s
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

> **Note**: If `GEMINI_API_KEY` is not provided, the agent gracefully falls back to simulated concierge mode so local development and automated CI tests never fail unexpectedly.

---

## 4. Local Development Setup

### Prerequisites
- Node.js v20+ or v22+
- MongoDB instance (local or MongoDB Atlas)

### Step-by-Step Instructions

1. **Install Backend Dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Start Backend in Development Mode:**
   ```bash
   npm run dev
   ```
   The server starts on `http://localhost:5001`.

3. **Start Frontend:**
   ```bash
   cd ../frontend
   npm run dev
   ```
   Open `http://localhost:5173/site/:subdomain` to experience the hotel website and chatbot.

4. **Run Automated Test Suite:**
   ```bash
   cd ../backend
   npm test tests/agent-mcp.test.ts
   ```

---

## 5. Render Deployment Instructions

StayOS is designed to deploy smoothly on **Render** as a Web Service:

### Step 1: Create a New Web Service on Render
1. Connect your GitHub repository: `MethodManav/stay-os`.
2. Select **Node** as the environment.
3. Set **Root Directory**: `backend`.

### Step 2: Build & Start Commands
- **Build Command**:
  ```bash
  npm install && npm run build
  ```
- **Start Command**:
  ```bash
  npm run start
  ```

### Step 3: Configure Environment Variables in Render Dashboard
Add the following under **Environment Variables**:
- `NODE_ENV`: `production`
- `PORT`: `5001`
- `MONGODB_URI`: `mongodb+srv://...` (your MongoDB connection string)
- `GEMINI_API_KEY`: `AIzaSy...` (your Google AI Studio key)
- `CLIENT_URL`: `https://your-frontend-app.onrender.com`
- `JWT_ACCESS_SECRET`: `[generate a secure 32+ character random string]`
- `JWT_REFRESH_SECRET`: `[generate a secure 32+ character random string]`
- `BACKEND_URL`: `https://your-backend-app.onrender.com`
- `MCP_SERVER_URL`: `https://your-backend-app.onrender.com/mcp`

### Step 4: Health Check Path
Set Health Check Path to:
```text
/api/v1/health
```

---

## 6. Example API Requests

### 1. Chat with Hotel Concierge
```bash
curl -X POST http://localhost:5001/api/v1/public/businesses/taj-gateway/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What rooms do you have available for 2 guests from 2026-09-20 to 2026-09-22?",
    "guestName": "Manav",
    "guestEmail": "manav@example.com",
    "guestPhone": "9876543210"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reply": "Welcome to Taj Gateway Resort! For your dates (September 20-22, 2026), we have the following rooms available:\n\n• **Deluxe Room**: ₹4,000/night (Max 2 guests) - Spacious ocean-facing room.\n• **Executive Suite**: ₹8,500/night (Max 4 guests) - Premium suite with jacuzzi.\n\nWould you like me to book one of these for you?",
    "toolCalls": [
      {
        "name": "searchRooms",
        "args": { "checkIn": "2026-09-20", "checkOut": "2026-09-22", "guests": 2 },
        "result": { "totalFound": 2 }
      }
    ]
  }
}
```

### 2. Confirm Booking via Chatbot
```bash
curl -X POST http://localhost:5001/api/v1/public/businesses/taj-gateway/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Please book the Deluxe Room for me from 2026-09-20 to 2026-09-22. My name is Manav, email is manav@example.com, and phone is 9876543210."
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "reply": "🎉 Congratulations Manav! Your reservation at Taj Gateway Resort is confirmed.\n\n• Confirmation Code: STY-E74A21\n• Room: Deluxe Room\n• Dates: 2026-09-20 to 2026-09-22 (2 nights)\n• Total Price: ₹8,960 (including taxes)\n• Status: CONFIRMED\n\nWe have sent your receipt to manav@example.com. We look forward to your arrival!",
    "booking": {
      "bookingId": "66e5f1...",
      "confirmationCode": "STY-E74A21",
      "roomName": "Deluxe Room",
      "checkIn": "2026-09-20",
      "checkOut": "2026-09-22",
      "pricing": { "total": 8960, "currency": "INR" },
      "bookingStatus": "CONFIRMED"
    }
  }
}
```

### 3. Retrieve Existing Booking
```bash
curl -X POST http://localhost:5001/api/v1/public/businesses/taj-gateway/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Can you check the status of my booking STY-E74A21?",
    "guestEmail": "manav@example.com"
  }'
```

### 4. Direct MCP Tool Execution (HTTP Endpoint)
```bash
curl -X POST http://localhost:5001/mcp/execute \
  -H "Content-Type: application/json" \
  -H "x-hotel-slug: taj-gateway" \
  -d '{
    "tool": "checkAvailability",
    "args": {
      "roomId": "66e5f...",
      "checkIn": "2026-09-20",
      "checkOut": "2026-09-22"
    }
  }'
```

---

## 7. Example Chatbot Conversation Transcript

```text
User:
Hello! I'm planning a weekend trip to Surat for two people.

Agent:
Hello! Welcome to Taj Gateway Resort. I would be delighted to assist with your stay in Surat. What dates are you planning to visit?

User:
September 20th to 22nd.

Agent:
[Agent executes MCP tool: searchRooms(checkIn="2026-09-20", checkOut="2026-09-22", guests=2)]
I checked our availability for September 20-22, 2026 (2 nights). Here are the available options:
1. Deluxe Room - ₹4,000 per night (Ocean view, King Bed, Free WiFi)
2. Executive Suite - ₹8,500 per night (Jacuzzi, 2 Bedrooms, Balcony)

Which room category would you prefer?

User:
Which one is cheaper?

Agent:
The Deluxe Room is the more affordable choice at ₹4,000 per night (total approximately ₹8,960 including 12% statutory tax for the 2-night stay).

User:
Great, let's book the Deluxe Room.

Agent:
Wonderful! To finalize your reservation, could you please provide your full name, email address, and contact phone number?

User:
Manav, manav@example.com, 9876543210

Agent:
[Agent executes MCP tool: checkAvailability(roomId="...", checkIn="2026-09-20", checkOut="2026-09-22")]
[Agent executes MCP tool: createBooking(roomId="...", checkIn="2026-09-20", checkOut="2026-09-22", guests=2, guest={...})]

🎉 Your booking has been confirmed!
• Confirmation Code: STY-E74A21
• Property: Taj Gateway Resort
• Room: Deluxe Room
• Check-In: September 20, 2026 (from 14:00)
• Check-Out: September 22, 2026 (until 11:00)
• Total Paid/Due: ₹8,960
• Status: Confirmed

A confirmation email has been dispatched to manav@example.com. Please let me know if you have any questions before your trip!
```
