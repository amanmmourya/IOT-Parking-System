/*
  ESP32 Smart Parking - 4x HC-SR04 + WebSocket Server
  ----------------------------------------------------
  Libraries needed (Arduino IDE -> Library Manager):
    - WebSockets by Markus Sattler  (search: "WebSockets")
    - ArduinoJson  by Benoit Blanchon

  Wiring (HC-SR04 -> ESP32):
    Sensor 1: TRIG -> GPIO 5,  ECHO -> GPIO 18
    Sensor 2: TRIG -> GPIO 19, ECHO -> GPIO 21
    Sensor 3: TRIG -> GPIO 22, ECHO -> GPIO 23
    Sensor 4: TRIG -> GPIO 25, ECHO -> GPIO 26
    VCC -> 5V, GND -> GND
    NOTE: HC-SR04 ECHO outputs 5V. For safety use a voltage divider
          (1k + 2k resistors) between ECHO and ESP32 GPIO.

  After upload, open Serial Monitor (115200 baud) to see the ESP32 IP.
  In the React app, connect to:  ws://<ESP32_IP>:81
*/

#include <WiFi.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>

// ====== EDIT THESE ======
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASS = "YOUR_WIFI_PASSWORD";
// ========================

const uint8_t TRIG_PINS[4] = {5, 19, 22, 25};
const uint8_t ECHO_PINS[4] = {18, 21, 23, 26};

WebSocketsServer webSocket(81);

float readDistanceCm(uint8_t trig, uint8_t echo) {
  digitalWrite(trig, LOW);
  delayMicroseconds(2);
  digitalWrite(trig, HIGH);
  delayMicroseconds(10);
  digitalWrite(trig, LOW);

  // Timeout 30 ms ~ 5 m max range
  long duration = pulseIn(echo, HIGH, 30000);
  if (duration == 0) return 999.0; // no echo -> treat as far / empty
  return duration * 0.0343 / 2.0;
}

void onWsEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  if (type == WStype_CONNECTED) {
    Serial.printf("[%u] Client connected\n", num);
  } else if (type == WStype_DISCONNECTED) {
    Serial.printf("[%u] Client disconnected\n", num);
  }
}

void setup() {
  Serial.begin(115200);
  delay(200);

  for (int i = 0; i < 4; i++) {
    pinMode(TRIG_PINS[i], OUTPUT);
    pinMode(ECHO_PINS[i], INPUT);
    digitalWrite(TRIG_PINS[i], LOW);
  }

  Serial.printf("Connecting to %s", WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) {
    delay(400);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("WiFi connected. IP: ");
  Serial.println(WiFi.localIP());
  Serial.println("Open the React app and connect to:");
  Serial.printf("  ws://%s:81\n", WiFi.localIP().toString().c_str());

  webSocket.begin();
  webSocket.onEvent(onWsEvent);
}

unsigned long lastSend = 0;

void loop() {
  webSocket.loop();

  if (millis() - lastSend > 300) {
    lastSend = millis();

    float d[4];
    for (int i = 0; i < 4; i++) {
      d[i] = readDistanceCm(TRIG_PINS[i], ECHO_PINS[i]);
      delay(30); // avoid sensor crosstalk
    }

    StaticJsonDocument<200> doc;
    JsonArray arr = doc.createNestedArray("distances");
    for (int i = 0; i < 4; i++) arr.add(d[i]);

    String out;
    serializeJson(doc, out);
    webSocket.broadcastTXT(out);

    Serial.println(out);
  }
}
