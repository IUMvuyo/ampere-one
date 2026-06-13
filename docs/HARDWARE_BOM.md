# Ampere One — Hardware BOM & Wiring (≤ R1,000)

Realistic SA prices (Micro Robotics / Communica / DIY Electronics, mid-2026). One demo unit.

| # | Part | Role | ~ZAR |
|---|------|------|-----:|
| 1 | ESP32 DevKit v1 (WROOM-32) | brain + BLE + WiFi | 150 |
| 2 | SCT-013-030 clamp CT (voltage-output, 1V @ 30A) | **no-electrician energy metering** | 180 |
| 3 | 2× 10kΩ + 1× 10µF (DC bias network for CT) | center CT signal on ADC | 25 |
| 4 | JSN-SR04T waterproof ultrasonic | **tank level (no-plumb water default)** | 120 |
| 5 | YF-S201 hall flow sensor | inline water flow / leak detection | 90 |
| 6 | 0.96" SSD1306 OLED (I²C) | on-device demo readout | 60 |
| 7 | Breadboard + jumpers + 3.5mm jack (for CT) | prototyping | 90 |
| 8 | 5V/2A USB supply + cable | power | 70 |
| 9 | 2× 1kΩ + 2kΩ (echo divider 5V→3.3V) | level shift ultrasonic/flow | 15 |
| | **TOTAL** | | **~800** |

**~R200 spare** — buy a 2nd SCT-013 (whole-home L1+L2 / two-circuit demo) or a TDS sensor for water-quality bonus.

---

## Wiring

### Energy — SCT-013-030 (voltage output, NO burden resistor needed)
The -030 variant outputs 0–1V directly, so we only DC-bias it onto the ADC midpoint.
```
CT tip  ──┬── ESP32 GPIO34 (ADC1_CH6)
          │
   10kΩ ──┼── 3V3
   10kΩ ──┼── GND      (two 10k form a 1.65V divider = bias point)
  10µF  ──┘── GND      (decoupling, + leg to bias node)
CT sleeve ── GND
```
Clip the CT around **one** live conductor in the DB board (the main feed, or a single circuit for the demo). It is non-contact — the jaw never touches bare copper.

### Water tank — JSN-SR04T ultrasonic
```
VCC → 5V   GND → GND
TRIG → GPIO5
ECHO → GPIO18  (through 2k/1k divider: ECHO─2k─GPIO18─1k─GND)
```
Mount at top of tank pointing down; firmware converts distance → % full from tank height.

### Water flow — YF-S201 (optional inline)
```
Red → 5V   Black → GND
Yellow (pulse) → GPIO4   (3.3V tolerant on most boards; add 1k series if unsure)
```
~7.5 pulses per L/min (calibrate). A sustained low flow with no tap event = leak.

### OLED (demo readout)
```
VCC → 3V3   GND → GND   SDA → GPIO21   SCL → GPIO22
```

---

## Calibration notes
- **Energy:** ESP32 ADC is nonlinear/noisy. v1 sells on *relative feedback + appliance disaggregation*, not billing accuracy. Calibrate `CT_CAL` against a plug-in reference meter (e.g. known kettle ~2000W).
- **Power estimate:** P ≈ Vnominal(230) × Irms × PF(≈0.95). Skip the voltage sensor for the demo; add ZMPT101B later for true power.
- **Tank %:** set `TANK_EMPTY_CM` (sensor→bottom) and `TANK_FULL_CM` (sensor→full surface).
- **Flow:** confirm `PULSES_PER_LITRE` by running a measured 1L through it.
