# Ampere One — GCIP-SA 2026 Pitch Deck

> 12 slides. Focus area: Resource Efficiency (touches Renewable Energy + Water Management).
> Programme: GCIP-SA — UNIDO / DSI / TIA, hosted at Tshimologong (Wits). Deadline: 10 July 2026.

---

## Slide 1 — Title

**AMPERE ONE — One device. Two resources. Measured in Rand.**

- One ~R750 device + one app turns an SA home or spaza shop into a measured, optimised resource system.
- Electricity AND water — cutting kWh, litres, Rand and CO₂.
- Built on Ampere, the live cross-platform SA energy app (iOS + Android).
- GCIP-SA 2026 · Focus area: Resource Efficiency.

> SPEAKER NOTE: We're not pitching a maybe — we're extending a product already live in the App Store and Play Store.

---

## Slide 2 — The Problem

**SA homes are blind to their two most expensive, most rationed resources.**

- Electricity tariffs up ~3× in a decade (Joburg ~R3/kWh in 2026); load-shedding still biting; coal grid at ~0.95 kgCO₂/kWh.
- Gauteng water-shedding is now routine.
- Municipalities lose ~41% of supply to non-revenue water — ~R10bn/yr.
- Households can't see a burst pipe until the bill lands.

> SPEAKER NOTE: You cannot manage what you cannot measure — and right now nobody can measure either resource affordably.

---

## Slide 3 — The Solution

**Ampere One: one ~R750 device + one app, for electricity and water.**

- No-electrician energy metering: clip-on, non-invasive CT sensor reads whole-home current — no mains contact, no certified install.
- Water intelligence: inline flow sensor + tank ultrasonic → live usage, JoJo tank level, leak alerts within minutes, outage prediction.
- AI resource coach: on-device appliance disaggregation (NILM), load-shedding-aware scheduling, solar/battery right-sizing — all priced in Rand and CO₂.
- Streams over BLE to the already-shipping Ampere app; ampere-proxy backend aggregates for analytics and B2B/B2G dashboards.

> SPEAKER NOTE: Smart meters cost thousands and need a certified electrician or plumber — Ampere One is no-install and under R1,000.

---

## Slide 4 — Live Demo

**We arrive with a working device on the table, not a render.**

- Clip the CT sensor onto a live DB board → watts move on the phone as a kettle switches on.
- Open a tap → litres flow and a leak alert fires on the phone.
- AI coach says: "shift your geyser off-peak, save R X/mo."
- Real hardware, real app, real numbers.

> SPEAKER NOTE: This 60–90s film is the differentiator — it's what beats a deck.

---

## Slide 5 — Why It's Innovative / IP

**The first cheap box that meters both energy and water for the SA home.**

- Combined energy + water resource graph for the SA home/SMME — nobody bundles both in one cheap box.
- No-install whole-home metering (clip-on CT) — removes the #1 adoption barrier for SA mass market.
- On-device NILM tuned for SA appliance signatures (geyser, kettle, pool pump) — builds on Ampere's existing acoustic/CoreML work.
- Load-shedding-aware optimisation — uniquely SA; foreign products don't model EskomSePush schedules.

> SPEAKER NOTE: Each of these alone is a wedge; combined in one R750 box, they're defensible.

---

## Slide 6 — Impact

**~R1,900 saved · 365 kgCO₂ · 26 kL per connected home, per year.**

- Electricity: ~8% (~384 kWh) → ~R1,100 + ~365 kgCO₂ via real-time feedback + scheduling.
- Water: ~12% (~26 kL) → ~R780 via leak detection + behaviour (excl. one-off burst catches).
- At 100,000 homes (0.6% of SA's ~17m households): ~36,500 tCO₂/yr avoided.
- Plus ~2.6 billion litres water saved and ~R190m back in households' pockets.

> SPEAKER NOTE: Conservative by design — we model the low end of well-evidenced 5–15% energy and 10–15% water savings.

---

## Slide 7 — Market & Scalability

**~17m SA households + millions of SMMEs, replicable across SADC.**

- TAM: ~17m SA households + millions of SMMEs/spaza shops; replicable across SADC (same grid/water stress).
- Wedge: start with the ~3m solar/inverter- + tank-owning middle-class homes already paying to self-provision — they want to measure ROI.
- Scale path: device is commodity electronics (ESP32 + sensors), locally assemblable.
- Software margin compounds as the install base grows.

> SPEAKER NOTE: We land where people already spend to self-provision, then ride the software margin down-market.

---

## Slide 8 — Business Model (Multi-Rail)

**Four rails: device, SaaS, B2B/B2G analytics, carbon.**

- Device: ~R750 BOM → ~R1,499 retail once-off (or utility/insurer-subsidised, or financed).
- SaaS: Ampere Pro (StoreKit already live) at ~R49/mo — AI coach, history, family/multi-site.
- B2B/B2G: per-meter analytics licensing to municipalities (non-revenue-water), utilities (demand response), insurers (leak = fewer claims) — the scalable, fundable rail.
- Carbon: aggregate verified household savings → carbon credits under SA's carbon-tax regime.

> SPEAKER NOTE: The B2B/B2G analytics rail is where this becomes fundable and scalable, not just a gadget.

---

## Slide 9 — Inclusive Green Economy

**Green jobs + cost control for the homes where R1,900/yr is material.**

- Local assembly + youth installer/calibration network = green jobs.
- Spaza-shop & township energy/water cost control — for whom ~R1,900/yr is material.
- Cheap enough to subsidise via municipal/utility programmes for low-income housing.
- Directly serves the DSI/TIA inclusive-green-economy mandate.

> SPEAKER NOTE: This is the DSI/TIA hot button — the savings matter most to the households that need them most.

---

## Slide 10 — Traction & Team

**The unfair edge: Ampere is already LIVE.**

- Ampere is live — native iOS (apps/ampere) + Android (AmpereAndroid) + backend (ampere-proxy).
- Quantyx portfolio proves we ship: LedgerAI, The Daily Me, DebitWatch — multiple live App Store apps.
- Founder: Vuyo Nkadimeng — senior full-stack dev manager (Alpha Group), director of Quantyx + Africortex. Stack: AWS, Node, SwiftUI, AI/agents, SA fintech.
- We arrive with a working device on the table, not a render.

> SPEAKER NOTE: Ampere One is the hardware + water expansion of a product that already ships — the app screen is the demo.

---

## Slide 11 — Roadmap

**From flashed firmware to 500 deployed devices.**

- Done: concept locked; firmware (firmware/ampere_one.ino — ESP32 → CT + flow + tank → BLE), ready to flash on parts arrival; BOM + wiring (~R750, under R1,000).
- Next: BLE manager in Ampere iOS (CoreBluetooth) + Android — live "Device" screen.
- Next: demo video shoot; GCIP application + pitch deck.
- Risk mitigations: calibrate ESP32 ADC against a reference meter and sell on relative feedback + leak detection (not billing-grade) for v1; ship ultrasonic/tank-level as the no-plumb default; start DIY/kit + partner assembly.

> SPEAKER NOTE: Hardware is staged to de-risk — relative feedback and tank-level first; software is the moat.

---

## Slide 12 — The Ask

**Acceleration + pilot funding: 500 devices across Gauteng homes + 5 municipal sites.**

- Deploy 500 devices across Gauteng homes + 5 municipal sites.
- Prove the energy + water savings at scale.
- Prove non-revenue-water analytics for municipalities.
- The live door this cycle: GCIP-SA open call, deadline 10 July 2026.

> SPEAKER NOTE: Fund the pilot and we prove ~R1,900/home and the non-revenue-water rail on real Gauteng sites.
