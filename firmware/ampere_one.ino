/*
 * Ampere One — ESP32 firmware
 * GCIP-SA 2026 demo unit. One box, two resources: electricity + water.
 *
 *   Energy : SCT-013-030 clamp CT (voltage output)  -> GPIO34 (ADC), RMS current -> watts
 *   Water  : JSN-SR04T ultrasonic tank level         -> TRIG GPIO5 / ECHO GPIO18 -> % full
 *   Water  : YF-S201 hall flow (optional inline)      -> GPIO4 pulse count -> L/min + leak flag
 *   Out    : BLE notify, one JSON characteristic the Ampere app subscribes to
 *   Local  : SSD1306 OLED live readout for the demo bench
 *
 * Board: ESP32 DevKit v1.  Arduino-ESP32 core 2.x.
 * Libs : Adafruit_SSD1306 + Adafruit_GFX (OLED). BLE is built into the core.
 *
 * Calibrate the CONSTANTS block against a reference meter before the demo.
 */

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

// ---------- CONSTANTS (calibrate these) ----------
#define MAINS_VOLTAGE     230.0   // SA nominal; replace with ZMPT reading for true power
#define POWER_FACTOR      0.95    // assumed; resistive-ish loads
#define CT_CAL            30.0    // SCT-013-030 = 30A per 1V output
#define ADC_REF           3.3
#define ADC_COUNTS        4096.0
#define ENERGY_SAMPLES    1480    // ~ a few mains cycles of sampling

#define TANK_FULL_CM      20.0    // sensor->water surface when FULL
#define TANK_EMPTY_CM     150.0   // sensor->bottom when EMPTY
#define PULSES_PER_LITRE  450.0   // YF-S201 ~7.5 pulses/L/min -> 450 pulses/L
#define LEAK_MIN_LPM      0.05    // sustained flow below this with no tap event = suspicious
#define LEAK_WINDOW_MS    180000  // 3 min of continuous low flow -> leak

// ---------- PINS ----------
#define PIN_CT      34
#define PIN_TRIG    5
#define PIN_ECHO    18
#define PIN_FLOW    4
#define OLED_SDA    21
#define OLED_SCL    22

// ---------- BLE UUIDs ----------
#define SVC_UUID    "a1b20001-5c6d-4e7f-8a9b-0c1d2e3f4a5b"
#define CHR_UUID    "a1b20002-5c6d-4e7f-8a9b-0c1d2e3f4a5b"

Adafruit_SSD1306 oled(128, 64, &Wire, -1);
BLECharacteristic *chr;
bool clientConnected = false;

volatile unsigned long flowPulses = 0;
unsigned long lastFlowCalc = 0;
unsigned long lowFlowSince = 0;

void IRAM_ATTR onFlowPulse() { flowPulses++; }

class ConnCB : public BLEServerCallbacks {
  void onConnect(BLEServer*) override { clientConnected = true; }
  void onDisconnect(BLEServer* s) override { clientConnected = false; s->startAdvertising(); }
};

// ---- Energy: RMS current from the clamp CT, then estimate watts ----
float readWatts() {
  long   sumSq = 0;
  double offset = ADC_COUNTS / 2.0;   // running DC-bias tracker
  for (int i = 0; i < ENERGY_SAMPLES; i++) {
    int raw = analogRead(PIN_CT);
    offset += (raw - offset) / 1024.0;            // low-pass to track bias point
    double centred = raw - offset;
    sumSq += (long)(centred * centred);
    delayMicroseconds(50);
  }
  double rmsCounts = sqrt((double)sumSq / ENERGY_SAMPLES);
  double rmsVolts  = (rmsCounts / ADC_COUNTS) * ADC_REF;
  double amps      = rmsVolts * CT_CAL;           // 30A per 1V
  if (amps < 0.05) amps = 0;                       // noise floor
  return amps * MAINS_VOLTAGE * POWER_FACTOR;
}

// ---- Water: tank level % from ultrasonic distance ----
float readTankPct() {
  digitalWrite(PIN_TRIG, LOW);  delayMicroseconds(2);
  digitalWrite(PIN_TRIG, HIGH); delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);
  long us = pulseIn(PIN_ECHO, HIGH, 40000);        // 40ms timeout (~6.8m)
  if (us == 0) return -1;                           // no echo
  float cm = us / 58.0;
  float pct = (TANK_EMPTY_CM - cm) / (TANK_EMPTY_CM - TANK_FULL_CM) * 100.0;
  return constrain(pct, 0, 100);
}

void setup() {
  Serial.begin(115200);
  analogReadResolution(12);
  analogSetPinAttenuation(PIN_CT, ADC_11db);       // full 0-3.3V range

  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);
  pinMode(PIN_FLOW, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(PIN_FLOW), onFlowPulse, FALLING);

  Wire.begin(OLED_SDA, OLED_SCL);
  if (oled.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    oled.clearDisplay(); oled.setTextColor(SSD1306_WHITE);
    oled.setTextSize(1); oled.setCursor(0,0); oled.print("Ampere One"); oled.display();
  }

  BLEDevice::init("Ampere One");
  BLEServer *srv = BLEDevice::createServer();
  srv->setCallbacks(new ConnCB());
  BLEService *svc = srv->createService(SVC_UUID);
  chr = svc->createCharacteristic(CHR_UUID,
          BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_NOTIFY);
  chr->addDescriptor(new BLE2902());
  svc->start();
  BLEAdvertising *adv = BLEDevice::getAdvertising();
  adv->addServiceUUID(SVC_UUID);
  adv->setScanResponse(true);
  BLEDevice::startAdvertising();
  Serial.println("Ampere One advertising over BLE");
  lastFlowCalc = millis();
}

void loop() {
  float watts = readWatts();
  float tank  = readTankPct();

  // flow over the last interval
  unsigned long now = millis();
  float lpm = 0;
  if (now - lastFlowCalc >= 1000) {
    noInterrupts(); unsigned long p = flowPulses; flowPulses = 0; interrupts();
    float litres = p / PULSES_PER_LITRE;
    lpm = litres * (60000.0 / (now - lastFlowCalc));
    lastFlowCalc = now;
  }

  // crude leak heuristic: continuous trickle for LEAK_WINDOW_MS
  bool leak = false;
  if (lpm > LEAK_MIN_LPM && lpm < 2.0) {
    if (lowFlowSince == 0) lowFlowSince = now;
    if (now - lowFlowSince > LEAK_WINDOW_MS) leak = true;
  } else {
    lowFlowSince = 0;
  }

  char json[160];
  snprintf(json, sizeof(json),
    "{\"w\":%.0f,\"tank\":%.0f,\"lpm\":%.2f,\"leak\":%s}",
    watts, tank, lpm, leak ? "true" : "false");

  if (clientConnected) { chr->setValue((uint8_t*)json, strlen(json)); chr->notify(); }
  Serial.println(json);

  // OLED bench readout
  oled.clearDisplay();
  oled.setTextSize(1); oled.setCursor(0,0);  oled.print("AMPERE ONE");
  oled.setCursor(0,16); oled.setTextSize(2); oled.printf("%.0fW", watts);
  oled.setTextSize(1);
  oled.setCursor(0,40); oled.printf("Tank %.0f%%", tank);
  oled.setCursor(0,52); oled.printf("Flow %.1f L/m %s", lpm, leak ? "LEAK!" : "");
  oled.display();

  delay(1000);
}
