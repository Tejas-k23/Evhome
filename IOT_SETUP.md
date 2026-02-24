# Got-Nexus IoT Device Setup Guide

Complete guide to set up the ESP32 + PZEM-004T energy meter and connect it to the Got-Nexus EV Charging platform.

---

## Table of Contents

1. [Hardware Requirements](#1-hardware-requirements)
2. [Wiring Diagram](#2-wiring-diagram)
3. [Software Requirements](#3-software-requirements)
4. [Backend Setup (First Time)](#4-backend-setup-first-time)
5. [Generate IoT API Key](#5-generate-iot-api-key)
6. [Configure WiFi Networks](#6-configure-wifi-networks)
7. [Flash the ESP32](#7-flash-the-esp32)
8. [Testing the Connection](#8-testing-the-connection)
9. [Managing WiFi from Owner Dashboard](#9-managing-wifi-from-owner-dashboard)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Hardware Requirements

| Component | Description | Quantity |
|-----------|-------------|----------|
| **ESP32 DevKit** | ESP32-WROOM-32 development board | 1 |
| **PZEM-004T v3.0** | AC energy meter module (with CT clamp) | 1 |
| **CT Current Transformer** | Comes with PZEM-004T (100A split-core) | 1 |
| **USB Cable** | Micro-USB for programming ESP32 | 1 |
| **Jumper Wires** | Female-to-female for PZEM connection | 4 |
| **5V Power Supply** | To power ESP32 (or use USB) | 1 |

**Cost estimate:** ~Rs 800-1200 for all components

---

## 2. Wiring Diagram

### PZEM-004T to ESP32 Connections

```
PZEM-004T          ESP32
---------          -----
5V    ---------->  5V (VIN)
GND   ---------->  GND
TX    ---------->  GPIO 16 (RX2)
RX    ---------->  GPIO 17 (TX2)
```

### PZEM-004T AC Side (Mains Power)

```
AC MAINS INPUT         PZEM-004T         LOAD (EV Charger)
                    +--------------+
Live (L)  -------->| L-IN    L-OUT|--------> Live to Charger
Neutral (N) ------>| N-IN    N-OUT|--------> Neutral to Charger
                    +--------------+
                         |  CT  |
                    (Clamp around Live wire)
```

> **WARNING:** The PZEM-004T connects to mains AC voltage (220V). Work with an electrician if you are not experienced with high-voltage wiring. ALWAYS disconnect power before making connections.

### Quick Steps:

1. Connect ESP32 5V and GND to PZEM-004T 5V and GND
2. Connect PZEM TX to ESP32 GPIO 16 (this is ESP32's RX2)
3. Connect PZEM RX to ESP32 GPIO 17 (this is ESP32's TX2)
4. Pass the AC Live wire through the CT clamp
5. Connect AC Line In and Line Out on PZEM to mains and charger socket

---

## 3. Software Requirements

### On your computer (for flashing ESP32):

1. **Arduino IDE** (v2.0+ recommended)
   - Download: https://www.arduino.cc/en/software

2. **ESP32 Board Package**
   - In Arduino IDE: `File > Preferences`
   - Add this URL to "Additional Board Manager URLs":
     ```
     https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
     ```
   - Go to `Tools > Board > Board Manager`, search "esp32" and install

3. **Required Libraries** (install via `Sketch > Include Library > Manage Libraries`):

   | Library | Author | Purpose |
   |---------|--------|---------|
   | `PZEM004Tv30` | Jakub Mandula | PZEM sensor communication |
   | `ArduinoJson` | Benoit Blanchon | JSON parsing/creation |

### On your server:

- Got-Nexus backend running (Node.js + MongoDB)
- Backend accessible from the WiFi network the ESP32 will connect to

---

## 4. Backend Setup (First Time)

If you haven't set up the backend yet:

```bash
# Clone the repository
cd backend

# Install dependencies
npm install

# Create .env file with your MongoDB URI
# (see .env.example)

# Seed the database with demo data
npm run seed

# Start the server
npm run dev
```

The server will start on `http://localhost:5000` (or your configured port).

---

## 5. Generate IoT API Key

Each station needs a unique API key for its IoT devices to authenticate.

### Option A: Using the API directly

```bash
# 1. Login as station owner
curl -X POST http://YOUR_SERVER:5000/api/owner/login \
  -H "Content-Type: application/json" \
  -d '{"email": "owner@evhome.com", "password": "Owner@123"}'

# Copy the token from the response

# 2. Generate API key for your station
curl -X POST http://YOUR_SERVER:5000/api/owner/stations/STATION_ID/api-key \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response will contain: { "iotApiKey": "a1b2c3d4e5..." }
```

### Option B: From the Owner Dashboard (if frontend is implemented)

1. Login as Station Owner
2. Go to **My Stations**
3. Click on your station
4. Go to **IoT Settings** tab
5. Click **Generate API Key**
6. Copy the key — you'll need it for the ESP32 code

> **IMPORTANT:** Save this API key securely. If you regenerate it, the old key stops working and you'll need to re-flash the ESP32.

---

## 6. Configure WiFi Networks

You can configure up to 3 WiFi networks. The ESP32 will try them in order of priority (1 = highest).

### Option A: Set in code before flashing

Edit these lines in `esp32_energy_meter.ino`:

```cpp
#define WIFI_SSID_1 "YourPrimaryWiFi"
#define WIFI_PASS_1 "password1"

#define WIFI_SSID_2 "YourBackupWiFi"
#define WIFI_PASS_2 "password2"

#define WIFI_SSID_3 "YourMobileHotspot"
#define WIFI_PASS_3 "password3"
```

### Option B: Set from Owner Dashboard (recommended — can change anytime)

```bash
# Update WiFi networks via API
curl -X PUT http://YOUR_SERVER:5000/api/owner/stations/STATION_ID/wifi \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "wifiNetworks": [
      { "ssid": "StationWiFi", "password": "pass123", "priority": 1 },
      { "ssid": "BackupWiFi", "password": "pass456", "priority": 2 },
      { "ssid": "MobileHotspot", "password": "pass789", "priority": 3 }
    ]
  }'
```

The ESP32 fetches updated WiFi config from the server every 5 minutes. So after you change the WiFi from the dashboard, the device will pick up the new networks within 5 minutes automatically.

---

## 7. Flash the ESP32

### Step-by-step:

1. **Open the code** in Arduino IDE:
   - File: `backend/iot/esp32_energy_meter.ino`

2. **Update these 3 values** in the code:

   ```cpp
   #define BACKEND_URL "http://192.168.1.100:5000"  // Your backend IP
   #define IOT_API_KEY "paste_your_api_key_here"     // From step 5
   #define SOCKET_NUMBER 1                            // Which socket this device monitors
   ```

3. **Update default WiFi credentials** (from step 6)

4. **Select the board**:
   - `Tools > Board > ESP32 Arduino > ESP32 Dev Module`

5. **Select the port**:
   - `Tools > Port > COMx` (Windows) or `/dev/ttyUSB0` (Linux)

6. **Upload**:
   - Click the Upload button (right arrow icon)
   - Hold the BOOT button on ESP32 if upload doesn't start

7. **Open Serial Monitor** (`Tools > Serial Monitor`, baud: 115200):
   - You should see WiFi connection attempts
   - Then sensor readings every 2 seconds
   - And "Data pushed successfully" messages

---

## 8. Testing the Connection

### Verify on Serial Monitor:

```
========================================
  Got-Nexus EV Charging — Energy Meter
========================================

[WiFi] Configured networks:
  1. StationWiFi (priority 1)
  2. BackupWiFi (priority 2)
  3. MobileHotspot (priority 3)
[WiFi] Trying network 1: StationWiFi (priority 1)
.....
[WiFi] Connected to: StationWiFi
[WiFi] IP address: 192.168.1.45
[Web] Local HTTP server started on port 80
[Config] Configuration fetched successfully
[Heartbeat] OK

[Ready] Device initialized successfully

=================================
Voltage:      230.5 V
Current:      0.000 A
Power:        0.0 W
Energy:       0.000 kWh
Frequency:    50.0 Hz
Power Factor: 0.00
[API] Data pushed successfully: {"success":true,...}
```

### Verify local web page:

1. Open a browser on the same WiFi network
2. Go to `http://ESP32_IP_ADDRESS` (shown in Serial Monitor)
3. You should see the live energy dashboard

### Verify backend is receiving data:

```bash
# Check if sessions are being updated
curl http://YOUR_SERVER:5000/api/iot/heartbeat \
  -H "X-API-Key: YOUR_API_KEY"

# Should return: {"success": true, "serverTime": "...", "stationId": "..."}
```

### Test WiFi fallback:

1. Disconnect the primary WiFi (turn off router)
2. Watch Serial Monitor — it should say "Connection lost, reconnecting..."
3. It will try WiFi 2, then WiFi 3
4. When primary comes back, it stays on whatever network is currently connected

---

## 9. Managing WiFi from Owner Dashboard

The key advantage: **station owners can change WiFi networks without physically touching the device**.

### How it works:

1. Owner logs into the dashboard
2. Goes to station settings > IoT Settings
3. Adds/edits up to 3 WiFi networks with priorities
4. Clicks Save
5. Within 5 minutes, the ESP32 fetches the new config
6. New WiFi networks are saved to ESP32's persistent storage (survives reboots)
7. On next connection attempt, it uses the updated networks

### API endpoints for WiFi management:

| Action | Method | Endpoint |
|--------|--------|----------|
| Get WiFi config | GET | `/api/owner/stations/:id/wifi` |
| Update WiFi networks | PUT | `/api/owner/stations/:id/wifi` |
| Generate API key | POST | `/api/owner/stations/:id/api-key` |

---

## 10. Troubleshooting

### ESP32 won't connect to WiFi

- Check SSID and password are correct (case-sensitive)
- Ensure the WiFi is 2.4 GHz (ESP32 doesn't support 5 GHz)
- Move ESP32 closer to the router
- Check if the router allows new devices

### "Error reading from PZEM" on Serial Monitor

- Check wiring: TX/RX might be swapped
- Ensure PZEM is powered (needs AC mains connected)
- Try adding a 1-second delay before first read in setup()
- Check the CT clamp is properly clamped on the Live wire

### Backend not receiving data

- Check BACKEND_URL is correct (use IP, not hostname)
- Ensure the backend server is running
- Check the API key matches what's in the database
- Verify the ESP32 and server are on the same network (or server is publicly accessible)
- Check firewall isn't blocking port 5000

### Data shows on local page but not in backend

- API key might be wrong — regenerate and re-flash
- Backend URL might be unreachable from the ESP32's network
- Check Serial Monitor for HTTP error codes

### ESP32 keeps resetting

- Power supply might be insufficient (use USB from computer for testing)
- Add a 470uF capacitor between 3.3V and GND on the ESP32

### WiFi config not updating from dashboard

- The ESP32 fetches config every 5 minutes — wait for the next fetch
- Check if the API key is valid
- Check Serial Monitor for "[Config] Fetch failed" messages

---

## Quick Reference

### Default Credentials (from seed data)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@evhome.com | Admin@123 |
| Owner | owner@evhome.com | Owner@123 |

Admin Secret Key: `EVHOME@123`

### ESP32 Pin Summary

| ESP32 Pin | Connected To |
|-----------|-------------|
| GPIO 16 | PZEM TX |
| GPIO 17 | PZEM RX |
| 5V (VIN) | PZEM 5V |
| GND | PZEM GND |

### API Endpoints for IoT Device

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/iot/data` | POST | Push energy readings |
| `/api/iot/config` | GET | Fetch WiFi + station config |
| `/api/iot/heartbeat` | POST | Confirm device is alive |

All IoT endpoints require `X-API-Key` header.
