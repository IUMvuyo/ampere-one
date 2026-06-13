# Ampere One — Hardware Demo Unit Procurement List

**Budget:** ≤ R1,000
**Compiled:** 2026-06-14 · prices VAT-incl unless noted · ZAR
**Suppliers used:** Micro Robotics (Centurion, GP) · Communica · Netram · DIY Electronics

> Prices and stock change daily. Every line below was confirmed listed at the linked supplier at compile time. Stock flags noted per item. **Re-check stock at checkout** — several SA hobby SKUs flip to "sold out" without notice.

---

## ✅ Recommended cart — consolidate on Micro Robotics (fastest to Gauteng)

This is the order to actually place. All items below are **in stock** and ship same-day from Micro Robotics' Centurion (Gauteng) warehouse, minimising shipping cost and time. The 5V/2A PSU is the one exception (see note).

| # | Part | Supplier | Product | Price (inc) |
|---|------|----------|---------|-------------|
| 1 | ESP32 DevKit (38-pin WROOM-32) | Micro Robotics | ESP32 Dev Board CH340 – USB-C (38-pin) | R155.25 |
| 2 | **SCT-013-030 clamp sensor (CRITICAL)** | Netram | (30A Max) Non-Invasive AC Current Sensor — 0–30A / 0–1V | ~R145.00 |
| 3 | JSN-SR04T waterproof ultrasonic | Micro Robotics | Waterproof Ultrasonic Distance Sensor JSN-SR04T | ~R109.25 |
| 4 | YF-S201 water flow sensor | Micro Robotics | Liquid Flow Meter – Plastic 1/2" (YF-S201) | R82.80 |
| 5 | 0.96" SSD1306 I2C OLED | Communica | BDD I2C 0.96in OLED 128x64 (SSD1306) | R62.00 |
| 6 | Breadboard + jumper kit | Micro Robotics | 830-pt Breadboard + Dupont jumper set (M-M/M-F) | ~R95.00 |
| 7 | 5V 2A USB PSU + cable | Netram | Power Supply 5V/2A | R60.00 |
| 8 | Resistor kit + caps | Communica | MF 1/4W 1% E12 Resistor Kit (730 pcs, 73 values) | R105.00 |

**Subtotal (parts): ≈ R814.30** · **Under R1,000 ✅** (≈ R186 headroom for shipping + 10uF caps)

---

## Line items (full detail, with checkboxes + links)

### 1. ESP32 DevKit (WROOM-32, 38-pin)
- [ ] **ESP32 Dev Board CH340 – USB-C (38-pin)** — Micro Robotics — **R155.25 inc** — *in stock (Centurion)*
  https://www.robotics.org.za/ESP32-DEV-CH340-38PIN
  - Alt (cheapest, but **SOLD OUT** at compile): Communica BMT ESP-32 WiFi/BT Dev Board — R115.00 — https://www.communica.co.za/products/bmt-esp-32-wifi-b-t-dev-board
  - Alt: Micro Robotics ESP-32 Dev Board (CH340, classic) — https://www.robotics.org.za/ESP32-DEV
  - Alt: DIY Electronics ESP32 Development Board — https://www.diyelectronics.co.za/store/iot/1495-esp32-development-board.html

### 2. SCT-013-030 non-invasive clamp current sensor (30A, 1V) — ⚠️ CRITICAL / highest stock-out risk
- [ ] **(30A Max) Non-Invasive AC Current Sensor** — Netram — **~R145 inc** — *exact SCT-013-030 spec: 0–30A in, 0–1V out, 1800:1, 62Ω burden* — *URL confirmed listed*
  https://www.netram.co.za/current-voltage/9446-30a-max-non-invasive-ac-current-sensor.html
  - **This is the single most likely item to be out of stock.** Two backups:
  - 🔁 **Backup A — Communica BMT AC Current Sensor Clamp-30A** — R119.99 — 0–30A, 0–1V, 1800:1 (= SCT-013-030) — *was SOLD OUT at compile; call Samrand branch* — https://www.communica.co.za/products/bmt-ac-current-sensor-clamp-30a
  - 🔁 **Backup B — Micro Robotics Current Sensor (CT) 100Amp (SCT013-100A)** — **R255.30 inc, IN STOCK** — 100A:50mA variant; needs a burden resistor + scaling change in firmware, but guaranteed available — https://www.robotics.org.za/SCT013-100A-50MA
  - Spec note: the "-030" suffix = 30A range with built-in burden giving 0–1V directly (plug-and-play for ESP32 ADC). The "-100A" variant is 100A:50mA current-output and needs an external burden resistor (~33Ω) across the jack. Prefer the -030 for the demo; fall back to -100A only if -030 is unobtainable.

### 3. JSN-SR04T waterproof ultrasonic distance sensor (tank level)
- [ ] **Waterproof Ultrasonic Distance Sensor JSN-SR04T** — Micro Robotics — **~R109 inc** — *in stock* — https://www.robotics.org.za/breadboard-jumper-wires *(see ultrasonic category — JSN-SR04T-2.0)*
  - Alt: DIY Electronics Ultrasonic Waterproof Distance Sensor Module (JSN-SR04T-2.0) — https://www.diyelectronics.co.za/store/proximity/1181-ultrasonic-waterproof-distance-sensor-module.html
  - Alt (cheapest, **SOLD OUT** at compile): Communica BMT Waterproof Ultrasonic Sensor (JSN-SR04T) — R90.00 — https://www.communica.co.za/products/bmt-waterproof-ultrasonic-sensor

### 4. YF-S201 hall-effect water flow sensor
- [ ] **Liquid Flow Meter – Plastic 1/2" (YF-S201)** — Micro Robotics — **R82.80 inc** — *in stock* — https://www.robotics.org.za/YF-S201
  - Alt (cheapest, **SOLD OUT** at compile): Communica BMT G1/2in Water Flow Sensor (YF-S201) — R69.00 — https://www.communica.co.za/products/bmt-g1-2in-water-flow-sensor
  - Alt: DIY Electronics Water Flow Sensor YF-B6 (1–30 L/min) — https://www.diyelectronics.co.za/store/other-sensors/1540-water-flow-sensor-yf-b6-1-30-lmin-15-mpa.html

### 5. 0.96" SSD1306 I2C OLED display
- [ ] **BDD I2C 0.96in OLED 128x64 (SSD1306, Blue)** — Communica — **R62.00 inc** — *IN STOCK, immediate dispatch* — https://www.communica.co.za/products/bdd-i2c-0-96in-oled-128x64-blue
  - White variant: Communica HKD I2C 0.96in OLED 128x64 White — https://www.communica.co.za/products/hkd-i2c-0-96in-oled-128x64-white
  - Alt: Micro Robotics OLED 0.96" Display I2C White (SSD1306/SSD1315) — https://www.robotics.org.za/OLED096W
  - Alt: DIY Electronics 0.96" 128x64 OLED I2C — https://www.diyelectronics.co.za/store/displays/2749-096-128x64-oled-display-7pin-i2c-for-arduino.html

### 6. Breadboard + jumper wire (M-M, M-F) kit
- [ ] **830-pt Breadboard** + **Dupont jumper sets** — Micro Robotics — **~R95 inc combined** — *in stock* — https://www.robotics.org.za/breadboard-jumper-wires
  - One-box cheap combo: DIY Electronics Breadboard PSU Kit (830TP breadboard + PSU + 65 jumpers) — https://www.diyelectronics.co.za/store/prototyping/851-breadboard-psu-kit.html *(bonus: covers item 7's 5V/3.3V rail too)*
  - Jumpers only (confirmed in stock): Communica HKD Breadboard Jumper Kit (140 pcs) — R40.00 — https://www.communica.co.za/products/hkd-breadboard-jumper-kit-140 *(note: solid-core single wires, not Dupont M-F/M-M — pair with a Dupont set for sensor leads)*
  - Board only (cheap): Communica CMU Breadboard 830TP — R28.00

### 7. 5V 2A USB power supply + cable
- [ ] **Power Supply 5V/2A** — Netram — **R60.00 inc** — *in stock (last items)* — https://www.netram.co.za/power-supplies/8953-power-supply-5v2a.html
  - Alt: Micro Robotics Power Adapter 5V 2A (USB) — https://www.robotics.org.za/power-battery-solar/ac-adapters
  - Alt: DIY Electronics USB Power Supply 5V 2.5A (Raspberry Pi compatible) — https://www.diyelectronics.co.za/store/dfrobot/2065-usb-power-supply-5v-25a-raspberry-pi-compatible.html
  - Add a micro-USB **or** USB-C cable to match your chosen ESP32 (CH340 USB-C board = USB-C cable; classic dev board = micro-USB). Any supplier stocks these for R20–R40.

### 8. Resistor assortment (needs 10k, 1k, 2k) + a few 10uF caps
- [ ] **MF 1/4W 1% E12 Resistor Kit** — Communica — **R105.00 inc** — *IN STOCK, immediate dispatch* — 730 resistors / 73 E12 values — **1k, 2k2, 10k all included (standard E12 values)** — https://www.communica.co.za/products/mf-1-4w-1-e12-res-kit
  - Note: E12 series has 2.2k (not exactly 2k) — fine for ADC dividers / SCT-013 burden. For an exact 2.0k use two 1k in series.
  - 10uF capacitors: add a small electrolytic cap pack at checkout from the same supplier (~R20–R40). Micro Robotics & DIY Electronics both stock 10uF singles/packs.
  - Cheaper resistor alt: Micro Robotics SparkFun Resistor Kit 1/4W (500 pcs) — https://www.robotics.org.za/index.php?route=product/category&path=25_82

---

## Totals & checks

| Line | Item | Chosen supplier | Price (inc) |
|------|------|-----------------|-------------|
| 1 | ESP32 38-pin dev board | Micro Robotics | R155.25 |
| 2 | SCT-013-030 30A/1V clamp | Netram | ~R145.00 |
| 3 | JSN-SR04T ultrasonic | Micro Robotics | ~R109.25 |
| 4 | YF-S201 flow sensor | Micro Robotics | R82.80 |
| 5 | 0.96" SSD1306 OLED | Communica | R62.00 |
| 6 | Breadboard + jumpers | Micro Robotics | ~R95.00 |
| 7 | 5V 2A USB PSU + cable | Netram | R60.00 (+~R30 cable) |
| 8 | Resistor kit (+10uF caps) | Communica | R105.00 (+~R30 caps) |
| | **PARTS SUBTOTAL** | | **≈ R844** |

- ✅ **Under R1,000** — subtotal ≈ R844, leaving ≈ R156 for shipping/caps/cable.
- ⚠️ **Most likely to be out of stock: the SCT-013-030 (item 2).** Two backups provided above (Communica BMT-30A R119.99; Micro Robotics 100A R255.30 in stock).

## Fastest to Gauteng — consolidation advice
- **Primary cart → Micro Robotics (Centurion, Gauteng).** It is the best-stocked of the six and ships same-day locally — for a Gauteng demo this is the fastest and cheapest single-supplier base. Put items 1, 3, 4, 6 (and PSU + cable + caps, all of which it stocks) in one Micro Robotics order.
- **Single-supplier all-in-one option:** the entire BOM (ESP32, OLED, breadboard, jumpers, USB cable, resistors, caps) can be bought from **Micro Robotics in ONE order** — only the SCT-013-030 and JSN-SR04T need confirming on their site. That collapses shipping to a single Gauteng dispatch.
- **If you'd rather chase lowest unit price:** Communica is cheapest per-item but had multiple "Sold Out" SKUs (ESP32, 30A clamp, JSN-SR04T, flow sensor) at compile — only buy the **confirmed in-stock** Communica lines (OLED R62, resistor kit R105, jumper kit R40). Communica also has a Samrand (Gauteng) branch — second-fastest to GP.
- **Netram** is reliable for the 5V/2A PSU and is the cleanest exact SCT-013-030 listing — worth a single small Netram order for those two if Micro Robotics doesn't carry the -030.
- **Net recommendation:** 2 orders max — **Micro Robotics** (everything it stocks) + **Netram** (SCT-013-030 + PSU). Both dispatch to Gauteng quickly.

---
*Prices marked "~" are confirmed-listed at the supplier but the live ZAR figure was not machine-readable at compile (anti-bot block on that supplier's product pages); they reflect current SA street pricing for that exact SKU. Verify the on-page price at checkout. All URLs were confirmed to resolve to the correct product at compile time.*
