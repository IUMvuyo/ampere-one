# Ampere One — GCIP-SA 2026 Venture Brief

> **Working name** (vetoable). The hardware + water expansion of Ampere, the live cross-platform
> SA energy app. One device + one app that turns a South African home or spaza shop into a
> measured, optimised resource system — **electricity AND water** — cutting kWh, litres, Rand
> and CO₂.

**Programme:** Global Cleantech Innovation Programme South Africa (GCIP-SA) — UNIDO / DSI / TIA, hosted at Tshimologong (Wits).
**Apply:** gcip.tech · **Deadline: 10 July 2026** · **Focus area: Resource Efficiency** (also touches Renewable Energy + Water Management).

> ⚠️ The R20m *National Cleantech Innovation Challenge* (Gauteng "Smart Mobility" lane) closed **21 Apr 2026**.
> The live door this cycle is the **GCIP-SA open call (10 Jul 2026)** where energy/water/resource-efficiency all qualify.

---

## 1. The problem (felt by the judges personally)
South African homes and small businesses are blind to their two most expensive, most rationed resources:
- **Electricity** — tariffs up ~3× in a decade (Joburg ~R3/kWh in 2026), load-shedding still biting, a coal grid at ~0.95 kgCO₂/kWh.
- **Water** — Gauteng water-shedding is now routine; municipalities lose **~41% of supply to non-revenue water (~R10bn/yr)**; households can't see a burst pipe until the bill lands.

You cannot manage what you cannot measure. Smart meters cost thousands and need a certified electrician/plumber. **There is no affordable, no-install, single device that meters a household's energy *and* water and tells you — in Rand — what to do about it.**

## 2. The solution
**Ampere One = one ~R750 device + one app (live on iOS & Android).**
- **No-electrician energy metering:** a clip-on, non-invasive CT sensor reads whole-home current. No mains contact, no certified install.
- **Water intelligence:** inline flow sensor + tank ultrasonic → live usage, JoJo tank level, **leak alerts within minutes**, outage prediction.
- **AI resource coach:** on-device appliance disaggregation (NILM), load-shedding-aware scheduling, solar/battery right-sizing, water-saving nudges — all priced in Rand and CO₂.
- Streams over BLE to the **already-shipping Ampere app**; backend (ampere-proxy) aggregates for analytics and B2B/B2G dashboards.

## 3. Why it's innovative / defensible IP
- **Combined energy + water resource graph** for the SA home/SMME — nobody bundles both in one cheap box.
- **No-install whole-home metering** (clip-on CT) — removes the #1 adoption barrier for SA mass market.
- **On-device NILM (appliance disaggregation)** tuned for SA appliance signatures (geyser, kettle, pool pump) — builds on Ampere's existing acoustic/CoreML work.
- **Load-shedding-aware optimisation** — uniquely SA; foreign products don't model EskomSePush schedules.

## 4. Impact (quantified, conservative, defensible)
Per connected home/year:
| Resource | Saving | Mechanism | Value |
|---|---|---|---|
| Electricity | ~8% (~384 kWh) | real-time feedback + scheduling | ~R1,100 + **~365 kgCO₂** |
| Water | ~12% (~26 kL) | leak detection + behaviour | ~R780 (excl. one-off burst catches) |
| **Total/home** | | | **~R1,900 saved · 365 kgCO₂ · 26 kL** |

**At 100,000 homes (0.6% of SA's ~17m households):**
**~36,500 tCO₂/yr avoided · ~2.6 billion litres water saved · ~R190m back in households' pockets.**
(Feedback-driven savings: 5–15% energy is well-evidenced; 10–15% water with leak detection. We model the low end.)

## 5. Market & scalability
- **TAM:** ~17m SA households + millions of SMMEs/spaza shops; replicable across SADC (same grid/water stress).
- **Wedge:** start with the ~3m solar/inverter-owning + tank-owning middle-class homes already spending to self-provision — they *want* to measure ROI.
- **Scale path:** device is commodity electronics (ESP32 + sensors), locally assemblable; software margin compounds.

## 6. Business model (multi-rail)
1. **Device** — ~R750 BOM → ~R1,499 retail once-off (or utility/insurer-subsidised, or financed).
2. **SaaS** — Ampere Pro (StoreKit already live) at ~R49/mo: AI coach, history, family/multi-site.
3. **B2B/B2G** — per-meter analytics licensing to **municipalities (non-revenue-water), utilities (demand response), and insurers (leak = fewer claims)**. This is the scalable, fundable rail.
4. **Carbon** — aggregate *verified* household savings → carbon credits under SA's carbon-tax regime.

## 7. Inclusive green economy (the DSI/TIA hot button)
- **Local assembly + youth installer/calibration network** = green jobs.
- **Spaza-shop & township energy/water cost control** — the people for whom R1,900/yr is material.
- Cheap enough to subsidise via municipal/utility programmes for low-income housing.

## 8. Team & traction — the unfair edge
This is what beats a deck. We don't pitch a maybe; we extend a shipping product.
- **Ampere is LIVE** — native iOS (`apps/ampere`) + Android (`AmpereAndroid`) + backend (`ampere-proxy`).
- **Quantyx portfolio** proves we ship: LedgerAI, The Daily Me, DebitWatch — multiple live App Store apps.
- Founder: Vuyo Nkadimeng — senior full-stack dev manager (Alpha Group), director of Quantyx (AI dev house) + Africortex (IT services). Stack: AWS, Node, SwiftUI, AI/agents, SA fintech.
- **We will arrive with a working device on the table**, not a render.

## 9. The demo (the differentiator)
A 60–90s film: clip the CT sensor on a live DB board → watts move on the phone as a kettle switches on → open a tap → litres/leak alert fires on the phone → AI coach says "shift your geyser off-peak, save R X/mo." Real hardware, real app, real numbers.

## 10. Risks & mitigations
- **ESP32 ADC accuracy** → calibrate against a reference meter; sell on *relative* feedback + leak detection, not billing-grade accuracy (v1).
- **Flow sensor needs inline plumbing** → ship ultrasonic/tank-level as the no-plumb default; inline flow for prosumers.
- **Hardware logistics** → start DIY/kit + partner assembly; software is the moat.

## 11. The ask (to GCIP)
Acceleration + pilot funding to deploy **500 devices across Gauteng homes + 5 municipal sites** to prove the energy+water savings and non-revenue-water analytics at scale.

---
### Build status / next actions
- [x] Concept locked: combined energy + water resource-efficiency platform on the live Ampere base.
- [x] Firmware: `firmware/ampere_one.ino` (ESP32 → CT + flow + tank → BLE). Ready to flash on parts arrival.
- [x] BOM + wiring: `docs/HARDWARE_BOM.md` (~R750, under R1,000).
- [ ] App: BLE manager in Ampere iOS (CoreBluetooth) + Android — live "Device" screen.
- [ ] Demo video script + shoot.
- [ ] GCIP application form on gcip.tech + pitch deck (route via agent org).
