# Got-Nexus — Deployment Guide

Step-by-step guide to deploy the Got-Nexus EV Charging platform in production. Covers the backend API, frontend React app, database setup, and IoT device configuration.

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Prerequisites](#2-prerequisites)
3. [MongoDB Atlas Setup (Cloud Database)](#3-mongodb-atlas-setup-cloud-database)
4. [Backend Deployment (Render)](#4-backend-deployment-render)
5. [Frontend Deployment (Vercel)](#5-frontend-deployment-vercel)
6. [Connect Frontend to Backend](#6-connect-frontend-to-backend)
7. [Seed the Database](#7-seed-the-database)
8. [IoT Device Configuration](#8-iot-device-configuration)
9. [Environment Variables Reference](#9-environment-variables-reference)
10. [Alternative Deployment Options](#10-alternative-deployment-options)
11. [Local Development Setup](#11-local-development-setup)
12. [Post-Deployment Checklist](#12-post-deployment-checklist)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. Project Structure

```
Got-Nexus/
├── backend/                 # Node.js + Express API
│   ├── config/              # Database connection
│   ├── controllers/         # Route handlers
│   ├── middleware/           # Auth, error handling
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API routes
│   ├── seed/                # Database seed script
│   ├── iot/                 # ESP32 firmware code
│   ├── server.js            # Entry point
│   ├── package.json
│   └── .env                 # Environment variables (DO NOT commit)
├── src/                     # React frontend (Vite)
│   ├── admin/               # Admin dashboard pages & services
│   ├── owner/               # Owner dashboard pages & services
│   ├── pages/               # User-facing pages
│   ├── components/          # Shared components
│   ├── services/            # API service files
│   ├── context/             # Auth context
│   └── App.jsx              # Router & layout
├── public/                  # Static assets
├── index.html               # HTML entry point
├── package.json             # Frontend dependencies
├── vite.config.js           # Vite configuration
└── vercel.json              # Vercel routing config
```

---

## 2. Prerequisites

Before deploying, make sure you have:

- **Node.js** v18 or later — [Download](https://nodejs.org/)
- **npm** v9 or later (comes with Node.js)
- **Git** installed — [Download](https://git-scm.com/)
- **GitHub account** — for connecting to deployment platforms
- **MongoDB Atlas account** (free tier) — [Sign up](https://www.mongodb.com/cloud/atlas)
- **Vercel account** (free tier) — [Sign up](https://vercel.com/) (for frontend)
- **Render account** (free tier) — [Sign up](https://render.com/) (for backend)

---

## 3. MongoDB Atlas Setup (Cloud Database)

You need a cloud MongoDB instance accessible from your deployed backend.

### Step 1: Create a cluster

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click **Build a Database**
3. Choose **M0 Free Tier**
4. Select a cloud provider and region (pick one close to your Render region)
5. Click **Create Cluster**

### Step 2: Create a database user

1. Go to **Database Access** in the left sidebar
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Set a username and a strong password
5. Under **Database User Privileges**, select **Read and write to any database**
6. Click **Add User**

### Step 3: Allow network access

1. Go to **Network Access** in the left sidebar
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (adds `0.0.0.0/0`)
   - This is required since Render's IP addresses can change
4. Click **Confirm**

### Step 4: Get connection string

1. Go to **Database** > **Connect**
2. Choose **Connect your application**
3. Copy the connection string — it looks like:
   ```
   mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `USERNAME` and `PASSWORD` with the credentials from Step 2
5. Save this — you'll use it as `MONGO_URI`

---

## 4. Backend Deployment (Render)

Render offers free Node.js hosting with easy GitHub integration.

### Step 1: Push code to GitHub

```bash
# Initialize git (if not already)
cd Got-Nexus
git init
git add .
git commit -m "Initial commit"

# Create a GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/got-nexus.git
git branch -M main
git push -u origin main
```

### Step 2: Create a Render Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New** > **Web Service**
3. Connect your GitHub account and select the **got-nexus** repository
4. Configure the service:

   | Setting | Value |
   |---------|-------|
   | **Name** | `got-nexus-api` |
   | **Region** | Choose closest to your users |
   | **Branch** | `main` |
   | **Root Directory** | `backend` |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install` |
   | **Start Command** | `node server.js` |
   | **Instance Type** | Free |

5. Click **Advanced** and add **Environment Variables**:

   | Key | Value |
   |-----|-------|
   | `PORT` | `5000` |
   | `MONGO_URI` | `mongodb+srv://...` (from Step 3) |
   | `JWT_SECRET` | A long random string (e.g., `myS3cur3JwtK3y!@#2024xYz`) |
   | `JWT_EXPIRE` | `30d` |
   | `ADMIN_SECRET_KEY` | `EVHOME@123` (or any secret you choose) |
   | `NODE_ENV` | `production` |

6. Click **Create Web Service**

### Step 3: Wait for deployment

- Render will install dependencies and start the server
- Once deployed, you'll get a URL like: `https://got-nexus-api.onrender.com`
- Test it by visiting: `https://got-nexus-api.onrender.com/` — you should see:
  ```json
  { "message": "EV Home API is running" }
  ```

> **Note:** Render free tier sleeps after 15 minutes of inactivity. The first request after sleep takes ~30 seconds to wake up. For production, consider the paid tier.

---

## 5. Frontend Deployment (Vercel)

The frontend is already configured for Vercel with `vercel.json`.

### Step 1: Install Vercel CLI (optional, for CLI deployment)

```bash
npm install -g vercel
```

### Step 2: Deploy via Vercel Dashboard (recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** > **Project**
3. Import your GitHub repository
4. Configure the project:

   | Setting | Value |
   |---------|-------|
   | **Framework Preset** | Vite |
   | **Root Directory** | `.` (root, not `backend`) |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `dist` |
   | **Install Command** | `npm install` |

5. Add **Environment Variables** (if you plan to use API calls from frontend):

   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://got-nexus-api.onrender.com/api` |

6. Click **Deploy**

### Step 3: Verify deployment

- Vercel gives you a URL like: `https://got-nexus.vercel.app`
- Visit it — you should see the Got-Nexus homepage
- The `vercel.json` rewrites handle client-side routing (all paths serve `index.html`)

### Deploy via CLI (alternative)

```bash
cd Got-Nexus
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - Project name? got-nexus
# - Directory? ./
# - Override settings? No
```

---

## 6. Connect Frontend to Backend

The frontend services currently use mock/localStorage data. To connect them to the real backend, the service files in `src/services/` need to make HTTP requests to your deployed backend URL.

### API Base URL

When the frontend services are updated to call the real API, they should use:

```
Production:  https://got-nexus-api.onrender.com/api
Development: http://localhost:5000/api
```

You can set this via a Vite environment variable:

Create a `.env` file in the project root (not in backend):

```
VITE_API_URL=https://got-nexus-api.onrender.com/api
```

Then reference it in service files as:

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

> **Current state:** The frontend services (`authService.js`, `bookingService.js`, `iotService.js`) use localStorage mock data. The admin and owner services may already call the backend. When connecting everything, update the user-facing services to call the real API endpoints.

---

## 7. Seed the Database

After the backend is deployed and connected to MongoDB Atlas, seed it with demo data.

### Option A: Run locally pointing to Atlas

```bash
cd backend

# Temporarily set your .env to use the Atlas connection string
# Then run:
npm run seed
```

You should see:

```
MongoDB Connected: cluster0-shard-00-02.xxxxx.mongodb.net
Cleared all collections
Admin created: admin@evhome.com / Admin@123
Owner created: owner@evhome.com / Owner@123
User created: MH 12 TK 0210 / 9876543211
3 stations created
12 sockets created
Sample booking and bill created

--- Seed Complete ---
Admin Key: EVHOME@123
Test OTP: 123456
```

### Option B: Run via Render Shell

1. Go to your Render Web Service dashboard
2. Click **Shell** tab
3. Run: `node seed/seed.js`

### Default Credentials After Seeding

| Role | Login | Password/OTP |
|------|-------|-------------|
| Admin | admin@evhome.com | Admin@123 |
| Admin (key) | Secret Key | EVHOME@123 |
| Owner | owner@evhome.com | Owner@123 |
| User | MH 12 TK 0210 / 9876543211 | OTP: 123456 |

---

## 8. IoT Device Configuration

After the backend is deployed, configure the ESP32 to point to it.

### Step 1: Generate an API key

```bash
# Login as owner
curl -X POST https://got-nexus-api.onrender.com/api/owner/login \
  -H "Content-Type: application/json" \
  -d '{"email": "owner@evhome.com", "password": "Owner@123"}'

# Copy the token, then generate API key for a station
curl -X POST https://got-nexus-api.onrender.com/api/owner/stations/STATION_ID/api-key \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 2: Configure WiFi from dashboard

```bash
curl -X PUT https://got-nexus-api.onrender.com/api/owner/stations/STATION_ID/wifi \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "wifiNetworks": [
      { "ssid": "StationWiFi", "password": "pass123", "priority": 1 },
      { "ssid": "BackupWiFi", "password": "pass456", "priority": 2 },
      { "ssid": "Hotspot", "password": "pass789", "priority": 3 }
    ]
  }'
```

### Step 3: Flash the ESP32

Edit these lines in `backend/iot/esp32_energy_meter.ino`:

```cpp
#define BACKEND_URL "https://got-nexus-api.onrender.com"
#define IOT_API_KEY "your_generated_api_key"
#define SOCKET_NUMBER 1
```

Upload to the ESP32 via Arduino IDE.

> **Important:** If using Render free tier, the backend may sleep. The ESP32 will keep retrying, and the first successful push after a sleep will wake the server. Consider Render paid tier for production IoT use.

> See `IOT_SETUP.md` for full hardware wiring and setup instructions.

---

## 9. Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PORT` | No | Server port (default: 5000) | `5000` |
| `MONGO_URI` | Yes | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/evhome` |
| `JWT_SECRET` | Yes | Secret for signing JWT tokens | `my_super_secret_key_123` |
| `JWT_EXPIRE` | No | Token expiry (default: 30d) | `30d` |
| `ADMIN_SECRET_KEY` | Yes | Key for admin first-time login | `EVHOME@123` |
| `NODE_ENV` | No | Environment mode | `production` |

### Frontend (`.env` in project root)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_URL` | No | Backend API base URL | `https://got-nexus-api.onrender.com/api` |
| `VITE_MAPBOX_TOKEN` | No | Mapbox GL token (if externalized) | `pk.eyJ1...` |

---

## 10. Alternative Deployment Options

### Backend Alternatives

| Platform | Free Tier | Notes |
|----------|-----------|-------|
| **Render** | Yes (sleeps after 15m) | Easiest for Node.js |
| **Railway** | $5 credit/month | No sleep, faster |
| **Fly.io** | Yes (limited) | Global edge deployment |
| **AWS EC2** | 12 months free (t2.micro) | Full control, more setup |
| **DigitalOcean App Platform** | No | $5/month, reliable |
| **VPS (any provider)** | Varies | Use PM2 for process management |

### Frontend Alternatives

| Platform | Free Tier | Notes |
|----------|-----------|-------|
| **Vercel** | Yes | Best for Vite/React, instant deploys |
| **Netlify** | Yes | Similar to Vercel, great for SPAs |
| **Cloudflare Pages** | Yes | Fast, unlimited bandwidth |
| **GitHub Pages** | Yes | Static only, no server-side rendering |

### Database Alternatives

| Service | Free Tier | Notes |
|---------|-----------|-------|
| **MongoDB Atlas** | 512 MB free | Recommended, easiest |
| **Railway MongoDB** | $5 credit | Managed, no config |
| **Self-hosted MongoDB** | N/A | On your own VPS |

---

## 11. Local Development Setup

For development on your local machine:

### Backend

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB URI and secrets

# Seed the database
npm run seed

# Start development server (with auto-reload)
npm run dev
```

The backend runs at `http://localhost:5000`.

### Frontend

```bash
# From project root
npm install

# Start Vite dev server
npm run dev
```

The frontend runs at `http://localhost:5173`.

### Running both together

Open two terminals:

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
npm run dev
```

---

## 12. Post-Deployment Checklist

After deploying, verify everything works:

- [ ] **Backend health check** — Visit `https://YOUR_BACKEND_URL/` and confirm `"EV Home API is running"`
- [ ] **Database connection** — Check Render logs for `"MongoDB Connected: ..."`
- [ ] **Seed data** — Run the seed script and confirm demo data is created
- [ ] **Frontend loads** — Visit your Vercel URL and confirm the homepage renders
- [ ] **Admin login** — Login with `admin@evhome.com` / `Admin@123`
- [ ] **Owner login** — Login with `owner@evhome.com` / `Owner@123`
- [ ] **User login** — Login with vehicle `MH 12 TK 0210`, mobile `9876543211`, OTP `123456`
- [ ] **Stations visible** — Confirm demo stations appear on the station list/map
- [ ] **Booking flow** — Create a test booking, start charging, stop, verify bill
- [ ] **Generate IoT API key** — Go to owner dashboard, generate key for a station
- [ ] **Configure WiFi** — Set WiFi networks for a station from owner dashboard
- [ ] **IoT device** — Flash ESP32, confirm data appears in session monitoring

### Security Checklist (before going public)

- [ ] Change `JWT_SECRET` to a strong random string (not the default)
- [ ] Change `ADMIN_SECRET_KEY` to something secure
- [ ] Change all default passwords in seed data
- [ ] Replace test OTP (`123456`) with real SMS service (Twilio, MSG91)
- [ ] Ensure `backend/.env` is not committed to git (check `.gitignore`)
- [ ] Restrict MongoDB Atlas network access to your backend IP (instead of `0.0.0.0/0`) if on a paid Render plan with static IP
- [ ] Set up HTTPS (Render and Vercel handle this automatically)
- [ ] Add rate limiting to API endpoints (use `express-rate-limit`)

---

## 13. Troubleshooting

### Backend won't start on Render

- Check **Logs** in Render dashboard for error messages
- Ensure `Root Directory` is set to `backend`
- Verify all environment variables are set correctly
- Make sure `MONGO_URI` has the correct password (no special character issues — URL-encode if needed)

### "MongoDB connection error" in logs

- Check `MONGO_URI` is correct
- Ensure the Atlas cluster is running (not paused)
- Verify Network Access allows `0.0.0.0/0`
- Check the database user password

### Frontend shows blank page

- Open browser DevTools > Console for errors
- Ensure Vercel build succeeded (check Vercel deployment logs)
- Check that `vercel.json` is present in the root

### Frontend can't reach backend (CORS errors)

- The backend already has `cors()` enabled for all origins
- If you need to restrict it, update `server.js`:
  ```javascript
  app.use(cors({ origin: 'https://got-nexus.vercel.app' }));
  ```

### Render free tier keeps sleeping

- The free tier spins down after 15 minutes of no requests
- Options:
  1. Use a cron service (like [cron-job.org](https://cron-job.org)) to ping your backend URL every 14 minutes
  2. Upgrade to Render paid tier ($7/month for always-on)
  3. Use Railway instead (stays awake within the free credit)

### ESP32 can't reach the deployed backend

- Render free tier uses HTTPS — the ESP32 `HTTPClient` may need `WiFiClientSecure` instead of plain `HTTPClient` for HTTPS. If so, update the IoT code to use:
  ```cpp
  #include <WiFiClientSecure.h>
  WiFiClientSecure client;
  client.setInsecure(); // Skip certificate verification for simplicity
  HTTPClient http;
  http.begin(client, url);
  ```
- Alternatively, if you deploy the backend on a VPS, you can use plain HTTP

### Build fails on Vercel

- Check that `package.json` is in the root directory
- Ensure the build command is `npm run build`
- Check Vercel build logs for specific error messages
- Ensure no `import` errors in the React code

---

## Quick Deploy Summary

| Component | Platform | URL Pattern |
|-----------|----------|-------------|
| Database | MongoDB Atlas | `mongodb+srv://...` |
| Backend API | Render | `https://got-nexus-api.onrender.com` |
| Frontend | Vercel | `https://got-nexus.vercel.app` |
| IoT Device | ESP32 (on-site) | `http://DEVICE_LOCAL_IP` |
