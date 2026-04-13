/*
 * Got-Nexus EV Charging Station — ESP32 Energy Meter
 * 
 * Hardware: ESP32 + PZEM-004T v3.0
 * Features:
 *   - 3 WiFi networks with automatic fallback
 *   - Sends live energy data to Got-Nexus backend API
 *   - Fetches WiFi config from server (owner can update from dashboard)
 *   - Local web dashboard still accessible on the same network
 *   - Heartbeat to confirm device is online
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <WebServer.h>
#include <PZEM004Tv30.h>
#include <Preferences.h>
#include <ArduinoJson.h>

// ============================================================
// CONFIGURATION — Change these before uploading
// ============================================================

// Backend server URL (your Got-Nexus backend)
#define BACKEND_URL "https://evhome.onrender.com/api"

// IoT API Key — generated from Station Owner Dashboard
// Go to Owner Dashboard > Your Station > IoT Settings > Generate API Key
#define IOT_API_KEY "04cec5d5c273d888072749d2a392e312607404d334392c45b7e3e18c0010aa61"

// Socket number this device is monitoring (1, 2, 3, etc.)
#define SOCKET_NUMBER 1

// Default WiFi credentials (can be updated remotely from owner dashboard)
#define WIFI_SSID_1 "realme 12 Pro+ 5G"
#define WIFI_PASS_1 "amey@1103"
//just git push
#define WIFI_SSID_2 "BackupWiFi1"
#define WIFI_PASS_2 "password2"

#define WIFI_SSID_3 "BackupWiFi2"
#define WIFI_PASS_3 "password3"

// Data push interval (milliseconds)
#define PUSH_INTERVAL 3000

// Config fetch interval — check for WiFi updates every 5 minutes
#define CONFIG_FETCH_INTERVAL 300000

// Heartbeat interval — 30 seconds
#define HEARTBEAT_INTERVAL 30000

// WiFi connection timeout per network (milliseconds)
#define WIFI_TIMEOUT 10000

// ============================================================
// GLOBALS
// ============================================================

PZEM004Tv30 pzem(Serial2, 16, 17);
WebServer server(80);
Preferences prefs;

struct WifiNetwork {
  String ssid;
  String password;
  int priority;
};

WifiNetwork wifiNetworks[3];
int networkCount = 3;
int currentNetworkIndex = -1;

float voltage = 0, current = 0, power = 0, energy = 0, frequency = 0, pf = 0;
float peakPower = 0, powerSum = 0;
unsigned long powerReadings = 0;

unsigned long lastPushTime = 0;
unsigned long lastConfigFetch = 0;
unsigned long lastHeartbeat = 0;
unsigned long lastWifiCheck = 0;
unsigned long startTime = 0;

bool backendReachable = false;

// ============================================================
// WIFI MANAGEMENT — 3 networks with fallback
// ============================================================

void loadWifiFromPreferences() {
  prefs.begin("wifi", true);

  wifiNetworks[0].ssid = prefs.getString("ssid1", WIFI_SSID_1);
  wifiNetworks[0].password = prefs.getString("pass1", WIFI_PASS_1);
  wifiNetworks[0].priority = prefs.getInt("prio1", 1);

  wifiNetworks[1].ssid = prefs.getString("ssid2", WIFI_SSID_2);
  wifiNetworks[1].password = prefs.getString("pass2", WIFI_PASS_2);
  wifiNetworks[1].priority = prefs.getInt("prio2", 2);

  wifiNetworks[2].ssid = prefs.getString("ssid3", WIFI_SSID_3);
  wifiNetworks[2].password = prefs.getString("pass3", WIFI_PASS_3);
  wifiNetworks[2].priority = prefs.getInt("prio3", 3);

  prefs.end();

  // Sort by priority
  for (int i = 0; i < 2; i++) {
    for (int j = i + 1; j < 3; j++) {
      if (wifiNetworks[j].priority < wifiNetworks[i].priority) {
        WifiNetwork temp = wifiNetworks[i];
        wifiNetworks[i] = wifiNetworks[j];
        wifiNetworks[j] = temp;
      }
    }
  }
}

void saveWifiToPreferences() {
  prefs.begin("wifi", false);
  for (int i = 0; i < 3; i++) {
    prefs.putString(("ssid" + String(i + 1)).c_str(), wifiNetworks[i].ssid);
    prefs.putString(("pass" + String(i + 1)).c_str(), wifiNetworks[i].password);
    prefs.putInt(("prio" + String(i + 1)).c_str(), wifiNetworks[i].priority);
  }
  prefs.end();
}

bool connectToWifi() {
  for (int i = 0; i < 3; i++) {
    if (wifiNetworks[i].ssid.length() == 0) continue;

    Serial.printf("[WiFi] Trying network %d: %s (priority %d)\n",
                  i + 1, wifiNetworks[i].ssid.c_str(), wifiNetworks[i].priority);

    WiFi.disconnect(true);
    delay(100);
    WiFi.begin(wifiNetworks[i].ssid.c_str(), wifiNetworks[i].password.c_str());

    unsigned long connectStart = millis();
    while (WiFi.status() != WL_CONNECTED && millis() - connectStart < WIFI_TIMEOUT) {
      delay(250);
      Serial.print(".");
    }
    Serial.println();

    if (WiFi.status() == WL_CONNECTED) {
      currentNetworkIndex = i;
      Serial.printf("[WiFi] Connected to: %s\n", wifiNetworks[i].ssid.c_str());
      Serial.printf("[WiFi] IP address: %s\n", WiFi.localIP().toString().c_str());
      return true;
    }

    Serial.printf("[WiFi] Failed to connect to: %s\n", wifiNetworks[i].ssid.c_str());
  }

  Serial.println("[WiFi] All networks failed!");
  currentNetworkIndex = -1;
  return false;
}

void ensureWifiConnected() {
  if (WiFi.status() == WL_CONNECTED) return;

  Serial.println("[WiFi] Connection lost, reconnecting...");
  connectToWifi();
}

// ============================================================
// BACKEND COMMUNICATION
// ============================================================

void pushDataToBackend() {
  if (WiFi.status() != WL_CONNECTED) return;
  if (isnan(voltage)) return;

  HTTPClient http;
  String url = String(BACKEND_URL) + "/api/iot/data";

  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-API-Key", IOT_API_KEY);

  JsonDocument doc;
  doc["socketNumber"] = SOCKET_NUMBER;
  doc["voltage"] = round(voltage * 100.0) / 100.0;
  doc["current"] = round(current * 1000.0) / 1000.0;
  doc["power"] = round(power * 100.0) / 100.0;
  doc["energy"] = round(energy * 1000.0) / 1000.0;
  doc["frequency"] = round(frequency * 10.0) / 10.0;
  doc["pf"] = round(pf * 100.0) / 100.0;

  String payload;
  serializeJson(doc, payload);

  int httpCode = http.POST(payload);
  if (httpCode == 200) {
    backendReachable = true;
    String response = http.getString();
    Serial.printf("[API] Data pushed successfully: %s\n", response.c_str());
  } else {
    backendReachable = false;
    Serial.printf("[API] Push failed, HTTP code: %d\n", httpCode);
  }

  http.end();
}

void fetchConfigFromServer() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = String(BACKEND_URL) + "/api/iot/config";

  http.begin(url);
  http.addHeader("X-API-Key", IOT_API_KEY);

  int httpCode = http.GET();
  if (httpCode == 200) {
    String response = http.getString();

    JsonDocument doc;
    DeserializationError error = deserializeJson(doc, response);

    if (!error && doc["success"].as<bool>()) {
      JsonArray networks = doc["config"]["wifiNetworks"].as<JsonArray>();

      if (networks.size() > 0) {
        bool changed = false;

        for (int i = 0; i < min((int)networks.size(), 3); i++) {
          String newSsid = networks[i]["ssid"].as<String>();
          String newPass = networks[i]["password"].as<String>();
          int newPrio = networks[i]["priority"].as<int>();

          // Ignore empty entries from server so local fallbacks remain
          if (newSsid.length() == 0) {
            continue;
          }

          if (newSsid != wifiNetworks[i].ssid || newPass != wifiNetworks[i].password || newPrio != wifiNetworks[i].priority) {
            changed = true;
          }

          wifiNetworks[i].ssid = newSsid;
          wifiNetworks[i].password = newPass;
          wifiNetworks[i].priority = newPrio;
        }

        if (changed) {
          // Sort by priority after applying updates
          for (int i = 0; i < 2; i++) {
            for (int j = i + 1; j < 3; j++) {
              if (wifiNetworks[j].priority < wifiNetworks[i].priority) {
                WifiNetwork temp = wifiNetworks[i];
                wifiNetworks[i] = wifiNetworks[j];
                wifiNetworks[j] = temp;
              }
            }
          }
          saveWifiToPreferences();
          Serial.println("[Config] WiFi networks updated from server");

          // Reconnect if we're offline or current SSID is no longer in the list
          bool currentInList = false;
          String currentSsid = WiFi.SSID();
          for (int i = 0; i < 3; i++) {
            if (wifiNetworks[i].ssid == currentSsid) {
              currentInList = true;
              break;
            }
          }
          if (WiFi.status() != WL_CONNECTED || !currentInList) {
            connectToWifi();
          }
        }
      }

      Serial.println("[Config] Configuration fetched successfully");
    }
  } else {
    Serial.printf("[Config] Fetch failed, HTTP code: %d\n", httpCode);
  }

  http.end();
}

void sendHeartbeat() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  String url = String(BACKEND_URL) + "/api/iot/heartbeat";

  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("X-API-Key", IOT_API_KEY);

  int httpCode = http.POST("{}");
  backendReachable = (httpCode == 200);

  if (httpCode == 200) {
    Serial.println("[Heartbeat] OK");
  } else {
    Serial.printf("[Heartbeat] Failed, HTTP code: %d\n", httpCode);
  }

  http.end();
}

// ============================================================
// PZEM SENSOR READING
// ============================================================

void readSensor() {
  voltage = pzem.voltage();
  current = pzem.current();
  power = pzem.power();
  energy = pzem.energy();
  frequency = pzem.frequency();
  pf = pzem.pf();

  if (!isnan(power)) {
    if (power > peakPower) peakPower = power;
    powerSum += power;
    powerReadings++;
  }

  if (!isnan(voltage)) {
    Serial.println("=================================");
    Serial.printf("Voltage:      %.1f V\n", voltage);
    Serial.printf("Current:      %.3f A\n", current);
    Serial.printf("Power:        %.1f W\n", power);
    Serial.printf("Energy:       %.3f kWh\n", energy);
    Serial.printf("Frequency:    %.1f Hz\n", frequency);
    Serial.printf("Power Factor: %.2f\n", pf);
  } else {
    Serial.println("[PZEM] Error reading sensor");
  }
}

// ============================================================
// LOCAL WEB SERVER HANDLERS
// ============================================================

void handleRoot() {
  String connectedSSID = (currentNetworkIndex >= 0) ? wifiNetworks[currentNetworkIndex].ssid : "None";
  String backendStatus = backendReachable ? "Connected" : "Disconnected";

  String html = R"rawliteral(
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <title>EV Energy Meter</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 10px 10px 20px;
    }
    .header { text-align: center; color: white; padding: 20px 10px; margin-bottom: 20px; }
    .header h1 { font-size: 1.8em; font-weight: 700; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
    .status-bar {
      display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;
      margin-bottom: 15px;
    }
    .status-chip {
      background: rgba(255,255,255,0.2); color: white; padding: 6px 14px;
      border-radius: 20px; font-size: 0.8em; backdrop-filter: blur(10px);
    }
    .status-chip.online { background: rgba(76, 175, 80, 0.6); }
    .status-chip.offline { background: rgba(244, 67, 54, 0.6); }
    .energy-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px; padding: 25px; box-shadow: 0 8px 20px rgba(0,0,0,0.2);
      text-align: center; margin-bottom: 15px; color: white;
      border: 2px solid rgba(255,255,255,0.2);
    }
    .energy-card .value { font-size: 3em; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.2); }
    .energy-card .label { color: rgba(255,255,255,0.9); font-size: 1em; margin-top: 5px; }
    .metrics-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 15px; }
    .metric-card {
      background: rgba(255,255,255,0.95); border-radius: 20px; padding: 20px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.15); text-align: center;
      position: relative; overflow: hidden;
    }
    .metric-card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 4px;
      background: linear-gradient(90deg, #667eea, #764ba2);
    }
    .metric-card .icon { font-size: 2em; margin-bottom: 8px; }
    .metric-card .value { font-size: 2em; font-weight: bold; color: #667eea; line-height: 1; }
    .metric-card .unit { font-size: 0.6em; color: #999; font-weight: normal; }
    .metric-card .label { font-size: 0.85em; color: #666; font-weight: 600; text-transform: uppercase; margin-top: 8px; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 15px; }
    .info-card {
      background: rgba(255,255,255,0.95); border-radius: 15px; padding: 15px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .info-card .title { font-size: 0.75em; color: #999; text-transform: uppercase; margin-bottom: 8px; font-weight: 600; }
    .info-card .value { font-size: 1.6em; font-weight: bold; color: #333; }
    .stats-card {
      background: rgba(255,255,255,0.95); border-radius: 20px; padding: 20px;
      box-shadow: 0 8px 20px rgba(0,0,0,0.15); margin-bottom: 15px;
    }
    .stats-card h3 { color: #667eea; margin-bottom: 15px; font-size: 1.1em; }
    .stat-row {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 0; border-bottom: 1px solid #eee;
    }
    .stat-row:last-child { border-bottom: none; }
    .stat-row .label { font-size: 0.9em; color: #666; }
    .stat-row .value { font-size: 1.1em; font-weight: bold; color: #333; }
    .btn {
      display: block; width: 100%; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white; border: none; padding: 18px; border-radius: 15px;
      font-size: 1em; font-weight: 600; cursor: pointer; text-transform: uppercase;
      box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3); margin-bottom: 12px;
    }
    .footer { text-align: center; color: rgba(255,255,255,0.8); font-size: 0.85em; padding: 15px; margin-top: 20px; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    .pulse { animation: pulse 2s infinite; }
    @media (min-width: 600px) { .metrics-grid { grid-template-columns: repeat(3, 1fr); } }
  </style>
</head>
<body>
  <div class="header">
    <h1>&#9889; EV Energy Meter</h1>
    <p style="color: rgba(255,255,255,0.8); margin-top: 5px;">Socket #)rawliteral" + String(SOCKET_NUMBER) + R"rawliteral(</p>
  </div>

  <div class="status-bar">
    <span class="status-chip" id="wifiChip">WiFi: )rawliteral" + connectedSSID + R"rawliteral(</span>
    <span class="status-chip" id="backendChip">Server: )rawliteral" + backendStatus + R"rawliteral(</span>
  </div>

  <div class="energy-card">
    <div style="font-size: 3em;">&#128202;</div>
    <div class="value" id="energy">0.000</div>
    <div class="label">Total Energy Consumed (kWh)</div>
  </div>

  <div class="metrics-grid">
    <div class="metric-card">
      <div class="icon">&#9889;</div>
      <div class="value"><span id="voltage">0</span><span class="unit"> V</span></div>
      <div class="label">Voltage</div>
    </div>
    <div class="metric-card">
      <div class="icon">&#128268;</div>
      <div class="value"><span id="current">0</span><span class="unit"> A</span></div>
      <div class="label">Current</div>
    </div>
    <div class="metric-card">
      <div class="icon">&#128161;</div>
      <div class="value"><span id="power">0</span><span class="unit"> W</span></div>
      <div class="label">Power</div>
    </div>
    <div class="metric-card">
      <div class="icon">&#9881;&#65039;</div>
      <div class="value"><span id="pf">0</span></div>
      <div class="label">Power Factor</div>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-card">
      <div class="title">Frequency</div>
      <div class="value"><span id="frequency">0</span> Hz</div>
    </div>
    <div class="info-card">
      <div class="title">Cost Estimate</div>
      <div class="value">&#8377;<span id="cost">0.00</span></div>
    </div>
  </div>

  <div class="stats-card">
    <h3>&#128200; Session Stats</h3>
    <div class="stat-row">
      <span class="label">Peak Power</span>
      <span class="value"><span id="peakPower">0</span> W</span>
    </div>
    <div class="stat-row">
      <span class="label">Avg Power</span>
      <span class="value"><span id="avgPower">0</span> W</span>
    </div>
    <div class="stat-row">
      <span class="label">Uptime</span>
      <span class="value" id="uptime">00:00:00</span>
    </div>
    <div class="stat-row">
      <span class="label">Last Update</span>
      <span class="value" id="lastUpdate">Just now</span>
    </div>
    <div class="stat-row">
      <span class="label">Backend</span>
      <span class="value" id="backendStatusText">--</span>
    </div>
  </div>

  <button class="btn" onclick="resetEnergy()">&#128260; Reset Energy Counter</button>

  <div class="footer">
    Got-Nexus EV Charging IoT Device<br>Auto-refresh every 2 seconds
  </div>

  <script>
    var peakP = 0, sumP = 0, countP = 0, startT = Date.now(), lastT = Date.now();

    function updateData() {
      fetch('/data').then(r => r.json()).then(function(d) {
        document.getElementById('voltage').textContent = d.voltage.toFixed(1);
        document.getElementById('current').textContent = d.current.toFixed(2);
        document.getElementById('power').textContent = d.power.toFixed(0);
        document.getElementById('energy').textContent = d.energy.toFixed(3);
        document.getElementById('pf').textContent = d.pf.toFixed(2);
        document.getElementById('frequency').textContent = d.frequency.toFixed(1);
        document.getElementById('cost').textContent = (d.energy * d.pricePerKwh).toFixed(2);
        document.getElementById('backendStatusText').textContent = d.backendReachable ? 'Connected' : 'Offline';

        if (d.power > peakP) { peakP = d.power; }
        document.getElementById('peakPower').textContent = peakP.toFixed(0);
        sumP += d.power; countP++;
        document.getElementById('avgPower').textContent = (sumP / countP).toFixed(0);

        var up = Date.now() - startT;
        var s = Math.floor(up/1000), h = Math.floor(s/3600), m = Math.floor((s%3600)/60);
        document.getElementById('uptime').textContent =
          String(h).padStart(2,'0') + ':' + String(m).padStart(2,'0') + ':' + String(s%60).padStart(2,'0');

        lastT = Date.now();
        document.getElementById('lastUpdate').textContent = 'Just now';
      }).catch(function() {});
    }

    function resetEnergy() {
      if (confirm('Reset energy counter?')) {
        fetch('/reset').then(function() {
          peakP = 0; sumP = 0; countP = 0; startT = Date.now();
          alert('Energy counter reset!');
          updateData();
        });
      }
    }

    setInterval(updateData, 2000);
    setInterval(function() {
      var diff = Math.floor((Date.now() - lastT) / 1000);
      document.getElementById('lastUpdate').textContent =
        diff < 5 ? 'Just now' : diff < 60 ? diff + 's ago' : Math.floor(diff/60) + 'm ago';
    }, 1000);
    updateData();
  </script>
</body>
</html>
)rawliteral";

  server.send(200, "text/html", html);
}

void handleData() {
  String json = "{";
  json += "\"voltage\":" + String(isnan(voltage) ? 0 : voltage, 2) + ",";
  json += "\"current\":" + String(isnan(current) ? 0 : current, 3) + ",";
  json += "\"power\":" + String(isnan(power) ? 0 : power, 2) + ",";
  json += "\"energy\":" + String(isnan(energy) ? 0 : energy, 3) + ",";
  json += "\"frequency\":" + String(isnan(frequency) ? 0 : frequency, 1) + ",";
  json += "\"pf\":" + String(isnan(pf) ? 0 : pf, 2) + ",";
  json += "\"pricePerKwh\":10,";
  json += "\"backendReachable\":" + String(backendReachable ? "true" : "false");
  json += "}";

  server.send(200, "application/json", json);
}

void handleReset() {
  pzem.resetEnergy();
  server.send(200, "text/plain", "Energy counter reset!");
}

void handleStatus() {
  String connectedSSID = (currentNetworkIndex >= 0) ? wifiNetworks[currentNetworkIndex].ssid : "None";

  String json = "{";
  json += "\"wifiConnected\":" + String(WiFi.status() == WL_CONNECTED ? "true" : "false") + ",";
  json += "\"ssid\":\"" + connectedSSID + "\",";
  json += "\"ip\":\"" + WiFi.localIP().toString() + "\",";
  json += "\"rssi\":" + String(WiFi.RSSI()) + ",";
  json += "\"backendReachable\":" + String(backendReachable ? "true" : "false") + ",";
  json += "\"uptime\":" + String(millis() / 1000) + ",";
  json += "\"freeHeap\":" + String(ESP.getFreeHeap());
  json += "}";

  server.send(200, "application/json", json);
}

// ============================================================
// SETUP & LOOP
// ============================================================

void setup() {
  Serial.begin(115200);
  Serial.println("\n========================================");
  Serial.println("  Got-Nexus EV Charging — Energy Meter");
  Serial.println("========================================\n");

  // Load stored WiFi networks (or use defaults)
  loadWifiFromPreferences();

  Serial.println("[WiFi] Configured networks:");
  for (int i = 0; i < 3; i++) {
    Serial.printf("  %d. %s (priority %d)\n", i + 1, wifiNetworks[i].ssid.c_str(), wifiNetworks[i].priority);
  }

  // Connect to WiFi with fallback
  if (!connectToWifi()) {
    Serial.println("[WiFi] Starting without WiFi — will retry periodically");
  }

  // Setup local web server
  server.on("/", handleRoot);
  server.on("/data", handleData);
  server.on("/reset", handleReset);
  server.on("/status", handleStatus);
  server.begin();
  Serial.println("[Web] Local HTTP server started on port 80");

  // Initial config fetch from server
  fetchConfigFromServer();
  sendHeartbeat();

  startTime = millis();
  Serial.println("\n[Ready] Device initialized successfully\n");
}

void loop() {
  server.handleClient();

  unsigned long now = millis();

  // Read sensor every loop (~2s with delays)
  readSensor();

  // Ensure WiFi is connected — check every 30 seconds
  if (now - lastWifiCheck > 30000) {
    ensureWifiConnected();
    lastWifiCheck = now;
  }

  // Push data to backend
  if (now - lastPushTime > PUSH_INTERVAL) {
    pushDataToBackend();
    lastPushTime = now;
  }

  // Fetch config from server periodically
  if (now - lastConfigFetch > CONFIG_FETCH_INTERVAL) {
    fetchConfigFromServer();
    lastConfigFetch = now;
  }

  // Send heartbeat
  if (now - lastHeartbeat > HEARTBEAT_INTERVAL) {
    sendHeartbeat();
    lastHeartbeat = now;
  }

  delay(2000);
}
