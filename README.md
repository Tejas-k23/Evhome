<div align="center">

# ⚡ EV Home
### EV Charging Station Management Platform

*Connecting EV drivers, station owners, and administrators with IoT-enabled charging hardware*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19+-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8+-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com)
[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [🏗️ Architecture](#️-architecture)
- [🚀 Installation](#-installation)
- [💻 Usage](#-usage)
- [🔌 API Endpoints](#-api-endpoints)
- [📁 Project Structure](#-project-structure)
- [🔧 Environment Variables](#-environment-variables)
- [🚀 Deployment](#-deployment)
- [🧪 Testing](#-testing)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [👥 Author](#-author)

---

## ✨ Features

### 👤 Multi-Role User System

| Role | Capabilities |
|------|-------------|
| 🚗 **EV Drivers** | Book charging slots · Monitor real-time charging · View & pay bills |
| 🏪 **Station Owners** | Manage stations · Monitor revenue · Configure IoT devices |
| 🛡️ **Administrators** | Platform-wide management · User oversight · Analytics |

### 🔋 Core Functionality

- **Real-time Monitoring** — Live voltage, current, power, and energy consumption via IoT
- **Smart Booking System** — Time-slot based charging reservations
- **Automated Billing** — Energy-based cost calculation and payment tracking
- **IoT Integration** — ESP32 + PZEM energy meter for hardware connectivity
- **Map-based Discovery** — Interactive station locator with live availability status

### 🛡️ Security & Reliability

- **OTP Authentication** — Secure mobile-based login (no passwords)
- **JWT Protection** — Token-based API security
- **Role-based Access Control** — Granular permissions per user type
- **Error Handling** — Comprehensive middleware for robust operations

---

## 🛠️ Tech Stack

<table>
<tr>
<td valign="top" width="25%">

**Frontend**
- React 19
- Vite
- React Router
- Framer Motion
- Mapbox GL
- Lucide React

</td>
<td valign="top" width="25%">

**Backend**
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Auth
- bcryptjs
- CORS

</td>
<td valign="top" width="25%">

**IoT & Hardware**
- ESP32
- PZEM-004T
- WiFi Integration

</td>
<td valign="top" width="25%">

**Tooling**
- Jest
- Supertest
- ESLint
- Nodemon

</td>
</tr>
</table>

---

## 🏗️ Architecture

```
┌──────────────┐    ┌────────────────┐    ┌─────────────────┐
│  EV Drivers  │    │ Station Owners │    │  Administrators │
└──────┬───────┘    └───────┬────────┘    └────────┬────────┘
       └────────────────────┼─────────────────────┘
                            │
                  ┌─────────▼─────────┐
                  │    React App      │
                  │     (Vite)        │
                  └─────────┬─────────┘
                            │
                  ┌─────────▼─────────┐
                  │   Express API     │
                  │    (Node.js)      │
                  └─────────┬─────────┘
                            │
                  ┌─────────▼─────────┐
                  │     MongoDB       │
                  │   (Mongoose)      │
                  └─────────┬─────────┘
                            │
                  ┌─────────▼─────────┐
                  │   IoT Devices     │
                  │  ESP32 + PZEM     │
                  └───────────────────┘
```

---

## 🚀 Installation

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ev-home.git
cd ev-home
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your values

# Start dev server
npm run dev
```

### 3. Frontend Setup

```bash
# From root directory
cd ..
npm install
npm run dev
```

### 4. Seed the Database

```bash
cd backend
npm run seed
```

---

## 💻 Usage

<details>
<summary><b>🚗 For EV Drivers</b></summary>

1. **Sign up** with your vehicle registration and mobile number
2. **Browse stations** on the interactive map
3. **Book a charging slot** for your preferred time
4. **Monitor charging** in real-time via the dashboard
5. **View and pay** your energy bills

</details>

<details>
<summary><b>🏪 For Station Owners</b></summary>

1. **Register** your account and business details
2. **Add charging stations** with location and pricing
3. **Configure IoT devices** and WiFi networks
4. **Monitor active sessions** and revenue
5. **Manage bookings** and maintenance schedules

</details>

<details>
<summary><b>🛡️ For Administrators</b></summary>

1. **Access admin dashboard** with credentials
2. **View platform analytics** and statistics
3. **Manage users and stations** across the platform
4. **Monitor all bookings** and billing activity

</details>

---

## 🔌 API Endpoints

### 🔐 Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/validate-for-otp` | Request OTP |
| `POST` | `/api/auth/verify-msg91-token` | Verify OTP and login |
| `GET` | `/api/auth/me` | Get current user info |

### 🏪 Stations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/stations` | Get all stations |
| `POST` | `/api/stations` | Create station *(Owner/Admin)* |
| `PUT` | `/api/stations/:id` | Update station *(Owner/Admin)* |
| `DELETE` | `/api/stations/:id` | Delete station *(Admin)* |

### 📅 Bookings

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/bookings` | Get user bookings |
| `POST` | `/api/bookings` | Create booking |
| `PUT` | `/api/bookings/:id/status` | Update booking status |

### ⚡ Sessions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/sessions` | Get charging sessions |
| `POST` | `/api/sessions/start` | Start charging session |
| `PUT` | `/api/sessions/:id/stop` | Stop charging session |

### 💳 Billing

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/bills` | Get user bills |
| `PUT` | `/api/bills/:id/pay` | Mark bill as paid |

### 📡 IoT Integration

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/iot/data` | Receive sensor data from ESP32 |
| `GET` | `/api/iot/config` | Get device configuration |

---

## 📁 Project Structure

```
EV-Home/
├── backend/                    # Node.js Express API
│   ├── config/                 # Database configuration
│   ├── controllers/            # Route handlers
│   ├── middleware/             # Auth, error handling
│   ├── models/                 # Mongoose schemas
│   ├── routes/                 # API route definitions
│   ├── iot/                    # ESP32 firmware
│   ├── seed/                   # Database seeding
│   ├── tests/                  # API tests
│   ├── utils/                  # Helper functions
│   ├── server.js               # Main server file
│   └── package.json
├── src/                        # React frontend
│   ├── admin/                  # Admin dashboard
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   ├── owner/                  # Owner dashboard
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   ├── components/             # Shared components
│   ├── pages/                  # Public pages
│   ├── services/               # API services
│   ├── context/                # React context
│   ├── config/                 # Configuration files
│   ├── App.jsx
│   └── main.jsx
├── public/                     # Static assets
├── index.html
├── package.json
├── vite.config.js
├── vercel.json
└── README.md
```

---

## 🔧 Environment Variables

### Backend — `backend/.env`

```env
# Database
MONGODB_URI=mongodb://localhost:27017/evhome

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=30d

# MSG91 OTP Service
MSG91_AUTH_KEY=your-msg91-auth-key
MSG91_TEMPLATE_ID=your-template-id

# IoT Configuration
IOT_API_KEY=your-iot-api-key

# Server
PORT=5000
NODE_ENV=development
```

### Frontend — `.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_MAPBOX_ACCESS_TOKEN=your-mapbox-token
```

---

## 🚀 Deployment

| Service | Platform | Notes |
|---------|----------|-------|
| **Backend** | [Render](https://render.com) | Connect GitHub repo, set env vars |
| **Frontend** | [Vercel](https://vercel.com) | Auto-deploys via `vercel.json` |
| **Database** | [MongoDB Atlas](https://cloud.mongodb.com) | Free tier available |

---

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend linting
cd ..
npm run lint
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit** your changes
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push** to your branch
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open** a Pull Request

### Guidelines
- Follow the existing ESLint configuration
- Write tests for new features
- Update documentation as needed
- Use conventional commit messages

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 👥 Author

**Your Name**

[![GitHub](https://img.shields.io/badge/GitHub-@yourusername-181717?logo=github)](https://github.com/Tejas-k23)


---

<div align="center">

⭐ **Star this repo** if you find it helpful!

**Further Reading**

[Deployment Guide](DEPLOYMENT.md) · [IoT Setup Guide](IOT_SETUP.md) · [MSG91 OTP Docs](MSG91_OTP_IMPLEMENTATION.md) · [Portals Guide](PORTALS_GUIDE.md)

</div>
