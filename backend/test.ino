
#include <WiFi.h>
#include <WebSocketsServer.h>
#include <ArduinoJson.h>

const char* WIFI_SSID = "realme 13+ 5G";
const char* WIFI_PASS = "123456789";


const uint8_t TRIG_PINS[4] = {32, 26, 12, 31};
const uint8_t ECHO_PINS[4] = {35, 27, 13, 30};

WebSocketsServer webSocket(81);

float readDistanceCm(uint8_t trig, uint8_t echo) {
  digitalWrite(trig, LOW);
  delayMicroseconds(2);
  digitalWrite(trig, HIGH);
  delayMicroseconds(10);
  digitalWrite(trig, LOW);

  long duration = pulseIn(echo, HIGH, 30000);
  if (duration == 0) return 999.0;            
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
  Serial.printf("Connect React app to:  ws://%s:81\n", WiFi.localIP().toString().c_str());

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
      delay(30); 
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
