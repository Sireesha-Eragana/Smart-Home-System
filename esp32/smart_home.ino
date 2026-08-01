/*
 * =====================================================================================
 *                            SMART HOME AUTOMATION SYSTEM
 *                                ESP32 FIRMWARE CODE
 * =====================================================================================
 * Hardware Components:
 *  - ESP32 NodeMCU Development Board
 *  - DHT22 Temperature & Humidity Sensor (Pin 23)
 *  - PIR Motion Sensor (Pin 16)
 *  - LDR Light Dependent Resistor (Pin 34 - Analog ADC)
 *  - MQ2 Gas & Smoke Sensor (Pin 35 - Analog ADC)
 *  - Flame Sensor (Pin 32 - Digital / Analog)
 *  - 4-Channel Relay Module (Pins 2, 4, 5, 13)
 *  - Active Buzzer (Pin 19)
 * 
 * Libraries Required:
 *  - WiFi.h
 *  - PubSubClient.h (MQTT Client)
 *  - DHT.h (Adafruit DHT Sensor Library)
 *  - ArduinoJson.h (v6+)
 * =====================================================================================
 */

#include <WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

// -------------------------------------------------------------------------------------
// CONFIGURATION & CREDENTIALS
// -------------------------------------------------------------------------------------
const char* WIFI_SSID     = "Your_WiFi_SSID";
const char* WIFI_PASSWORD = "Your_WiFi_Password";

const char* MQTT_SERVER   = "broker.hivemq.com"; // Default public MQTT broker or local server
const int   MQTT_PORT     = 1883;
const char* MQTT_CLIENT_ID= "ESP32_SmartHome_Gateway_01";

// MQTT Topics
const char* TOPIC_SENSORS = "smarthome/sensors";
const char* TOPIC_RELAYS  = "smarthome/relays";
const char* TOPIC_ALERTS  = "smarthome/alerts";
const char* TOPIC_COMMAND = "smarthome/commands";

// -------------------------------------------------------------------------------------
// PIN DEFINITIONS
// -------------------------------------------------------------------------------------
#define DHTPIN        23
#define DHTTYPE       DHT22

#define PIR_PIN       16
#define LDR_PIN       34   // ADC1_CH6
#define MQ2_PIN       35   // ADC1_CH7
#define FLAME_PIN     32   // Digital Flame Pin

#define RELAY_1_PIN   2    // Living Room Light
#define RELAY_2_PIN   4    // Fan
#define RELAY_3_PIN   5    // Kitchen Exhaust Fan
#define RELAY_4_PIN   13   // AC / Auxiliary Relay
#define BUZZER_PIN    19   // Safety Alarm Siren

// -------------------------------------------------------------------------------------
// GLOBAL OBJECTS & VARIABLES
// -------------------------------------------------------------------------------------
DHT dht(DHTPIN, DHTTYPE);
WiFiClient espClient;
PubSubClient mqttClient(espClient);

// Sensor values
float temperature   = 0.0;
float humidity      = 0.0;
int   gasLevel      = 0;
int   lightLevel    = 0;
bool  isMotion      = false;
bool  isFlame       = false;

// Thresholds for Local Auto Control
const int GAS_THRESHOLD_PPM  = 250;
const int LIGHT_DARK_LUX     = 300;

unsigned long lastSensorPublish = 0;
const long sensorInterval       = 3000; // Publish sensors every 3 seconds

// -------------------------------------------------------------------------------------
// HARDWARE INITIALIZATION
// -------------------------------------------------------------------------------------
void setupPins() {
  pinMode(PIR_PIN, INPUT);
  pinMode(FLAME_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  pinMode(RELAY_1_PIN, OUTPUT);
  pinMode(RELAY_2_PIN, OUTPUT);
  pinMode(RELAY_3_PIN, OUTPUT);
  pinMode(RELAY_4_PIN, OUTPUT);

  // Relays are active LOW on standard relay modules
  digitalWrite(RELAY_1_PIN, HIGH);
  digitalWrite(RELAY_2_PIN, HIGH);
  digitalWrite(RELAY_3_PIN, HIGH);
  digitalWrite(RELAY_4_PIN, HIGH);
}

void setupWiFi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to WiFi network: ");
  Serial.println(WIFI_SSID);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi Connected successfully!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

// -------------------------------------------------------------------------------------
// MQTT CALLBACK & RECONNECT
// -------------------------------------------------------------------------------------
void mqttCallback(char* topic, byte* message, unsigned int length) {
  Serial.print("Message arrived on topic [");
  Serial.print(topic);
  Serial.print("]: ");
  
  String messageBuffer;
  for (int i = 0; i < length; i++) {
    messageBuffer += (char)message[i];
  }
  Serial.println(messageBuffer);

  // Parse JSON Command
  StaticJsonDocument<256> doc;
  DeserializationError error = deserializeJson(doc, messageBuffer);

  if (error) {
    Serial.print("deserializeJson() failed: ");
    Serial.println(error.f_str());
    return;
  }

  // Handle Relay Control Commands
  if (doc.containsKey("relay") && doc.containsKey("state")) {
    int relayNum = doc["relay"];
    bool state = doc["state"]; // true = ON, false = OFF
    
    // Active LOW relay handling
    uint8_t pinValue = state ? LOW : HIGH;

    switch (relayNum) {
      case 1:
        digitalWrite(RELAY_1_PIN, pinValue);
        Serial.printf("Relay 1 set to %s\n", state ? "ON" : "OFF");
        break;
      case 2:
        digitalWrite(RELAY_2_PIN, pinValue);
        Serial.printf("Relay 2 set to %s\n", state ? "ON" : "OFF");
        break;
      case 3:
        digitalWrite(RELAY_3_PIN, pinValue);
        Serial.printf("Relay 3 set to %s\n", state ? "ON" : "OFF");
        break;
      case 4:
        digitalWrite(RELAY_4_PIN, pinValue);
        Serial.printf("Relay 4 set to %s\n", state ? "ON" : "OFF");
        break;
      case 5: // Buzzer / Alarm
        digitalWrite(BUZZER_PIN, state ? HIGH : LOW);
        Serial.printf("Buzzer set to %s\n", state ? "ON" : "OFF");
        break;
    }

    // Publish confirmation
    publishRelayStatus();
  }
}

void reconnectMQTT() {
  while (!mqttClient.connected()) {
    Serial.print("Attempting MQTT connection to ");
    Serial.print(MQTT_SERVER);
    Serial.print("...");

    if (mqttClient.connect(MQTT_CLIENT_ID)) {
      Serial.println("CONNECTED!");
      // Subscribe to command topic
      mqttClient.subscribe(TOPIC_COMMAND);
      
      // Publish initial hardware handshake alert
      StaticJsonDocument<128> alertDoc;
      alertDoc["event"] = "esp32_online";
      alertDoc["msg"] = "ESP32 Hardware Node Online and Ready";
      char alertBuf[128];
      serializeJson(alertDoc, alertBuf);
      mqttClient.publish(TOPIC_ALERTS, alertBuf);

      publishRelayStatus();
    } else {
      Serial.print("Failed, rc=");
      Serial.print(mqttClient.state());
      Serial.println(" Retrying in 5 seconds...");
      delay(5000);
    }
  }
}

// -------------------------------------------------------------------------------------
// SENSOR READING & LOGIC
// -------------------------------------------------------------------------------------
void readSensors() {
  // Read DHT22
  float h = dht.readHumidity();
  float t = dht.readTemperature();

  if (!isnan(h) && !isnan(t)) {
    humidity = h;
    temperature = t;
  }

  // Read Motion (PIR)
  isMotion = (digitalRead(PIR_PIN) == HIGH);

  // Read Flame Sensor (Active LOW or HIGH depending on module)
  isFlame = (digitalRead(FLAME_PIN) == LOW);

  // Read MQ2 Gas Sensor (ADC 0 - 4095 mapped to 0-1000 PPM roughly)
  int rawGas = analogRead(MQ2_PIN);
  gasLevel = map(rawGas, 0, 4095, 0, 1000);

  // Read LDR Light Sensor (0 - 4095 mapped to Lux)
  int rawLdr = analogRead(LDR_PIN);
  lightLevel = map(rawLdr, 0, 4095, 0, 1024);
}

void processLocalSafetyRules() {
  // Local Emergency Automation: If Gas exceeds threshold or Flame detected
  if (gasLevel > GAS_THRESHOLD_PPM || isFlame) {
    // Sound Buzzer
    digitalWrite(BUZZER_PIN, HIGH);
    // Turn ON Exhaust Fan (Relay 3 Active LOW)
    digitalWrite(RELAY_3_PIN, LOW);

    // Send Emergency MQTT Alert
    StaticJsonDocument<256> alertDoc;
    alertDoc["type"] = isFlame ? "fire_alert" : "gas_leak";
    alertDoc["gasPpm"] = gasLevel;
    alertDoc["flame"] = isFlame;
    alertDoc["msg"] = isFlame ? "CRITICAL: Flame detected!" : "WARNING: Gas leak detected!";
    
    char buffer[256];
    serializeJson(alertDoc, buffer);
    mqttClient.publish(TOPIC_ALERTS, buffer);
  } else {
    // Turn off Buzzer if no command override
    // digitalWrite(BUZZER_PIN, LOW);
  }
}

void publishSensors() {
  StaticJsonDocument<256> doc;
  doc["temperature"]     = temperature;
  doc["humidity"]        = humidity;
  doc["gasLevel"]        = gasLevel;
  doc["isGasAlert"]      = (gasLevel > GAS_THRESHOLD_PPM);
  doc["isMotionDetected"]= isMotion;
  doc["isFlameDetected"] = isFlame;
  doc["lightLevel"]      = lightLevel;
  doc["isDark"]          = (lightLevel < LIGHT_DARK_LUX);
  doc["uptimeMs"]        = millis();

  char jsonBuffer[256];
  serializeJson(doc, jsonBuffer);
  mqttClient.publish(TOPIC_SENSORS, jsonBuffer);

  Serial.print("Published Sensor Telemetry: ");
  Serial.println(jsonBuffer);
}

void publishRelayStatus() {
  StaticJsonDocument<128> doc;
  doc["relay1"] = (digitalRead(RELAY_1_PIN) == LOW);
  doc["relay2"] = (digitalRead(RELAY_2_PIN) == LOW);
  doc["relay3"] = (digitalRead(RELAY_3_PIN) == LOW);
  doc["relay4"] = (digitalRead(RELAY_4_PIN) == LOW);
  doc["buzzer"] = (digitalRead(BUZZER_PIN) == HIGH);

  char jsonBuffer[128];
  serializeJson(doc, jsonBuffer);
  mqttClient.publish(TOPIC_RELAYS, jsonBuffer);
}

// -------------------------------------------------------------------------------------
// MAIN ARDUINO LOOP
// -------------------------------------------------------------------------------------
void setup() {
  Serial.begin(115200);
  Serial.println("\nInitializing Smart Home Automation Node...");
  
  setupPins();
  dht.begin();
  
  setupWiFi();
  
  mqttClient.setServer(MQTT_SERVER, MQTT_PORT);
  mqttClient.setCallback(mqttCallback);
}

void loop() {
  if (!mqttClient.connected()) {
    reconnectMQTT();
  }
  mqttClient.loop();

  unsigned long now = millis();
  if (now - lastSensorPublish >= sensorInterval) {
    lastSensorPublish = now;
    
    readSensors();
    processLocalSafetyRules();
    publishSensors();
  }
}
