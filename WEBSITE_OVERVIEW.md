# Got-Nexus — Platform Overview

A comprehensive overview of how the Got-Nexus EV Charging Station platform works, covering all user roles, features, data flow, and how IoT hardware integrates with the web application.

---

## What is Got-Nexus?

Got-Nexus is a full-stack EV (Electric Vehicle) charging station management platform. It connects three types of users — **EV Drivers**, **Station Owners**, and **Admins** — with physical charging hardware through an IoT-enabled backend.

Think of it like this: Station owners install EV chargers at their locations, the IoT devices (ESP32 + energy meters) monitor real-time electricity usage, and EV drivers can find stations, book charging slots, and pay for the energy they consume — all through the platform.

---

## The Three User Roles

### 1. EV Driver (User)

The end customer who needs to charge their vehicle.

**How they use the platform:**

- **Sign up** using their vehicle registration number and mobile number (OTP-based authentication — no passwords needed)
- **Browse charging stations** on a map or list view, seeing station names, locations, prices, and availability
- **Book a charging slot** by selecting a station, choosing a time window, and confirming
- **Start charging** when they arrive at the station and plug in their vehicle
- **Monitor in real-time** — while charging, they see live voltage, current, power, and energy consumption (this data comes from the actual IoT hardware)
- **Stop charging** when done — the system calculates the total energy used and the cost
- **View and pay bills** — a bill is automatically generated based on energy consumed multiplied by the station's price per kWh
- **See history** of all past bookings and bills

### 2. Station Owner

The business owner who installs and operates charging stations.

**How they use the platform:**

- **Register** with name, email, mobile, and password
- **Create stations** — add their charging locations with details like name, address, GPS coordinates, number of charging sockets, and price per kWh
- **Manage sockets** — each station has multiple sockets (charging points). Owners can set individual sockets as Available, Occupied, or under Maintenance
- **Configure IoT devices** — set up WiFi networks for the ESP32 energy meters, generate API keys, and manage device connectivity (NEW)
- **Monitor active sessions** — see real-time data for every vehicle currently charging at their stations, including voltage, current, energy consumed, and running cost
- **View bookings** — see all past and upcoming bookings across their stations
- **Track revenue** — view all bills generated, payment status, and total revenue earned

### 3. Admin (Platform Administrator)

The platform-level administrator who oversees the entire system.

**How they use the platform:**

- **Login** using a secret admin key or email/password
- **Dashboard** — see platform-wide statistics: total users, total stations, total bookings, active bookings, total revenue
- **Manage users** — view all registered EV drivers, delete accounts if needed
- **Manage stations** — create, update, or delete any station on the platform (regardless of owner)
- **View all bookings** — see every booking across all stations
- **View all bills** — see every bill and payment status platform-wide

---

## How a Charging Session Works (End-to-End Flow)

Here's what happens from the moment a driver decides to charge until they pay:

```
Driver opens app
       |
       v
Browses available stations (sees locations, prices, socket availability)
       |
       v
Selects a station and books a time slot
       |
  [Booking created with status: BOOKED]
       |
       v
Driver arrives at station, plugs in, and taps "Start Charging"
       |
  [Booking status changes to: ACTIVE]
  [A Session record is created to track live data]
  [Socket status changes to: OCCUPIED]
       |
       v
While charging:
  - ESP32 IoT device reads the PZEM energy meter every 2-3 seconds
  - Sends voltage, current, power, energy, frequency, power factor to the backend
  - Backend updates the Session record with real data
  - Frontend polls the backend and shows live data to the driver
  - Owner's dashboard also shows this live session data
       |
       v
Driver taps "Stop Charging"
       |
  [Booking status changes to: COMPLETED]
  [Final energy and cost are saved]
  [A Bill is created: energy * pricePerKwh]
  [Socket status changes back to: AVAILABLE]
       |
       v
Driver views their bill and marks it as paid
       |
  [Bill payment status: PAID]
       |
       v
Owner sees the revenue in their dashboard
```

---

## System Architecture

```
+------------------+     +------------------+     +------------------+
|   EV Driver      |     |  Station Owner   |     |     Admin        |
|   (Mobile/Web)   |     |   (Dashboard)    |     |   (Dashboard)    |
+--------+---------+     +--------+---------+     +--------+---------+
         |                         |                        |
         |    REST API (JSON)      |                        |
         +------------+------------+------------------------+
                      |
                      v
         +------------+------------+
         |     Got-Nexus Backend   |
         |      (Node.js API)      |
         |                         |
         |  - Authentication (JWT) |
         |  - Booking Management   |
         |  - Session Tracking     |
         |  - Billing              |
         |  - Station Management   |
         |  - IoT Data Ingestion   |
         +------------+------------+
                      |
              +-------+-------+
              |               |
              v               v
     +--------+------+  +----+----------+
     |   MongoDB     |  |  ESP32 IoT    |
     |   Database    |  |  Devices      |
     |               |  |               |
     | - Users       |  | - PZEM-004T   |
     | - Owners      |  | - Energy data |
     | - Stations    |  | - WiFi mgmt   |
     | - Sockets     |  | - Local web   |
     | - Bookings    |  |   dashboard   |
     | - Sessions    |  +---------------+
     | - Bills       |
     | - Admins      |
     +---------------+
```

---

## Data Models — What Gets Stored

### Users
Every EV driver is identified by their vehicle registration number and mobile number. No passwords — authentication happens through OTP sent to their phone.

### Owners
Station owners have full accounts with email and password. They can own multiple stations.

### Stations
Each station represents a physical charging location. It stores the station name, address, GPS coordinates (for map display), number of charging sockets, price per kWh, active/inactive status, and WiFi configuration for IoT devices.

### Sockets
Each station has one or more sockets (individual charging points). Each socket tracks whether it's available, occupied by a charging vehicle, or under maintenance.

### Bookings
When a driver reserves a slot, a booking is created linking the user, station, time window, and status. The booking moves through states: BOOKED → ACTIVE → COMPLETED (or CANCELLED).

### Sessions
While a booking is active, a session record tracks the real-time energy data coming from the IoT hardware — voltage, current, power, energy consumed, frequency, power factor, and running cost. This is what powers the live monitoring dashboards.

### Bills
When charging completes, a bill is automatically generated showing the total energy consumed, the amount owed (energy × price per kWh), and payment status.

---

## Authentication — How Login Works

The platform uses **JWT (JSON Web Tokens)** for authentication. Different user types authenticate differently:

- **EV Drivers:** OTP-based login. They provide their vehicle number and mobile number, receive an OTP via SMS, and verify it. No password to remember. (Currently using test OTP "123456" for development.)

- **Station Owners:** Traditional email + password login. Passwords are securely hashed using bcrypt before storage.

- **Admins:** Can login either with a platform-wide secret key (which auto-creates a superadmin account) or with email/password.

- **IoT Devices:** Use an API key (X-API-Key header). Each station has a unique API key generated by the owner. This keeps device authentication separate from user authentication.

Every authenticated request carries a JWT token in the Authorization header. The token contains the user's ID and role, allowing the backend to enforce role-based access control.

---

## IoT Integration — How Hardware Connects to the Platform

This is the bridge between the physical world and the web platform.

### The Hardware
Each charging socket has an ESP32 microcontroller connected to a PZEM-004T energy meter. The energy meter measures voltage, current, power, energy consumption, frequency, and power factor of the electricity flowing to the EV charger.

### The Data Flow
1. The ESP32 reads the energy meter every 2-3 seconds
2. It sends this data as a JSON payload to the backend's `/api/iot/data` endpoint
3. The backend authenticates the device using its API key
4. It finds the station associated with that API key
5. It looks for an active booking on the specific socket
6. If found, it updates the Session record with real data
7. The frontend (driver's app or owner's dashboard) polls the `/api/sessions/:bookingId/live` endpoint
8. The backend checks if real IoT data is recent (less than 10 seconds old)
9. If yes, it returns the real data. If not, it falls back to simulated data

### WiFi Management
The ESP32 supports 3 WiFi networks with automatic fallback:
- If the primary WiFi goes down, it automatically tries the second, then the third
- Station owners can update WiFi credentials from their dashboard without touching the physical device
- The ESP32 checks for updated WiFi configuration from the server every 5 minutes
- New WiFi credentials are saved to persistent storage on the ESP32, so they survive power cycles

### Local Dashboard
Even without internet connectivity, the ESP32 runs a local web server. Anyone on the same WiFi network can access the device's IP address in a browser to see a real-time energy monitoring dashboard. This is useful for on-site monitoring or debugging.

---

## API Structure

The backend exposes a RESTful API organized by feature area:

### Public Endpoints (no login needed)
- Browse and search charging stations
- View station details

### Driver Endpoints (OTP login required)
- Create, view, and cancel bookings
- Start and stop charging sessions
- View live session data
- View and pay bills

### Owner Endpoints (email/password login required)
- Create and manage stations
- Manage charging sockets
- Configure IoT WiFi networks and API keys
- Monitor active charging sessions
- View bookings and revenue

### Admin Endpoints (admin login required)
- Platform-wide dashboard with statistics
- Manage all users, stations, bookings, and bills

### IoT Endpoints (API key required)
- Push energy meter readings
- Fetch station/WiFi configuration
- Send heartbeat to confirm device is online

---

## Security

- **Passwords** are hashed with bcrypt (12 salt rounds) — never stored in plain text
- **JWT tokens** expire after 30 days and are required for all protected endpoints
- **Role-based access** ensures drivers can't access owner features, owners can't access admin features, etc.
- **IoT API keys** are 64-character random hex strings, unique per station
- **Input validation** prevents malformed data from reaching the database
- **Error handling** returns appropriate HTTP status codes without leaking internal details

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose ODM |
| Authentication | JWT (jsonwebtoken) + bcrypt |
| IoT Hardware | ESP32 + PZEM-004T v3.0 |
| IoT Communication | HTTP REST (JSON) |
| IoT Storage | ESP32 Preferences (NVS flash) |
| IoT Libraries | ArduinoJson, PZEM004Tv30 |

---

## What's Simulated vs Real

| Feature | Current State |
|---------|--------------|
| Energy readings | **Real** when IoT device is connected; **Simulated** as fallback |
| OTP authentication | **Simulated** (hardcoded test OTP: 123456) — integrate Twilio/MSG91 for production |
| Payment processing | **Simulated** (bill marked as PAID manually) — integrate Razorpay/Stripe for production |
| Station locations | **Real** (stored GPS coordinates) |
| Pricing | **Real** (per-station configurable price per kWh) |
| WiFi management | **Real** (owner can update, device fetches and stores) |

---

## Future Enhancements

- **Real SMS OTP** via Twilio or MSG91
- **Payment gateway** integration (Razorpay, Stripe)
- **Push notifications** when charging completes
- **Station availability map** with real-time socket status
- **Historical analytics** — energy usage trends, peak hours, revenue charts
- **Multi-device per socket** — support redundant IoT devices
- **Firmware OTA updates** — push ESP32 firmware updates from the dashboard
- **WebSocket** for truly real-time live data (instead of polling)
