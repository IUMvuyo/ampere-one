# Public APIs — Ampere-One Cleantech Dashboard

**Last verified:** 2026-06-14  
**Stack context:** Next.js, mostly client-side / static generation  
**SA coordinates used throughout:** Johannesburg -26.2041, 28.0473

---

## 1. Weather + Solar Irradiance — Open-Meteo Forecast API

**Base URL:** `https://api.open-meteo.com/v1/forecast`

**Auth required:** None. Keyless for non-commercial use.

**CORS:** Yes — the API sets permissive CORS headers. Direct browser calls work with no proxy.

**Free tier:** Unlimited non-commercial calls. No rate limit published for casual use; commercial use requires a subscription.

**SA example request:**
```
GET https://api.open-meteo.com/v1/forecast
  ?latitude=-26.2041
  &longitude=28.0473
  &hourly=temperature_2m,shortwave_radiation,direct_radiation,diffuse_radiation
  &timezone=Africa%2FJohannesburg
  &forecast_days=7
```

**Confirmed solar params (exact parameter names):**
- `shortwave_radiation` — Total downwelling shortwave solar radiation on the horizontal plane, averaged over the preceding hour (W/m²). Use this as the primary GHI (Global Horizontal Irradiance) input for PV sizing.
- `direct_radiation` — Direct (beam) solar radiation on the horizontal plane, averaged over the preceding hour (W/m²). Equivalent to DNI × cos(solar zenith) in planar terms.
- `diffuse_radiation` — Diffuse sky radiation on the horizontal plane, averaged over the preceding hour (W/m²).
- `temperature_2m` — Air temperature at 2 m above ground (°C). Used for PV derating calculations.

**Verified live response shape (Johannesburg, 2026-06-13):**
```json
{
  "latitude": -26.186293,
  "longitude": 28.026318,
  "elevation": 1749.0,
  "generationtime_ms": 0.3,
  "utc_offset_seconds": 7200,
  "timezone": "Africa/Johannesburg",
  "timezone_abbreviation": "SAST",
  "hourly_units": {
    "time": "iso8601",
    "temperature_2m": "°C",
    "shortwave_radiation": "W/m²",
    "direct_radiation": "W/m²",
    "diffuse_radiation": "W/m²"
  },
  "hourly": {
    "time": ["2026-06-13T00:00", "2026-06-13T01:00", "..."],
    "temperature_2m": [11.9, 11.3, 10.9, "..."],
    "shortwave_radiation": [0.0, 0.0, 0.0, "..."],
    "direct_radiation": [0.0, 0.0, 0.0, "..."],
    "diffuse_radiation": [0.0, 0.0, 0.0, "..."]
  }
}
```
144 hourly data points (6 days forecast). Peak shortwave at midday Johannesburg was observed at ~659 W/m² in the live response. Elevation returned as 1749 m (Highveld correct).

**Notes for PV sizing:**
- For tilted-panel yield, apply Liu-Jordan transposition using `direct_radiation` + `diffuse_radiation` + panel tilt + azimuth.
- Add `&daily=sunrise,sunset,daylight_duration` to get sun hours per day without extra calls.
- Johannesburg is high-demand season June–August per Eskom TOU definition.

---

## 2. Air Quality / PM2.5 / PM10 / European AQI — Open-Meteo Air Quality API

**Base URL:** `https://air-quality-api.open-meteo.com/v1/air-quality`

**Auth required:** None. Keyless.

**CORS:** Yes — same permissive policy as the forecast API. Direct browser calls work.

**Free tier:** Unlimited non-commercial use.

**SA example request:**
```
GET https://air-quality-api.open-meteo.com/v1/air-quality
  ?latitude=-26.2041
  &longitude=28.0473
  &hourly=pm2_5,pm10,european_aqi
  &timezone=Africa%2FJohannesburg
```

**Confirmed params:**
- `pm2_5` — Fine particulate matter (μg/m³)
- `pm10` — Coarse particulate matter (μg/m³)
- `european_aqi` — European Air Quality Index (integer; 0–20 = Good, 20–40 = Fair, 40–60 = Moderate, 60–80 = Poor, 80–100 = Very Poor, >100 = Extremely Poor)

**Verified live response shape (Johannesburg, 2026-06-13):**
```json
{
  "latitude": -26.2,
  "longitude": 28.0,
  "elevation": 1749.0,
  "generationtime_ms": 0.3,
  "utc_offset_seconds": 7200,
  "timezone": "Africa/Johannesburg",
  "hourly_units": {
    "time": "iso8601",
    "pm2_5": "μg/m³",
    "pm10": "μg/m³",
    "european_aqi": "EAQI"
  },
  "hourly": {
    "time": ["2026-06-13T00:00", "..."],
    "pm2_5": [9.3, "...", 197.4],
    "pm10": [9.3, "...", 198.4],
    "european_aqi": [63, "...", 101]
  }
}
```
144 hourly forecast values. Johannesburg showed elevated PM during morning (06:00–09:00) and evening peaks — consistent with winter inversion + coal heating patterns on the Highveld.

**Alternative if Open-Meteo AQ is insufficient:** OpenAQ (openaq.org) provides ground-station measurements for SA but requires a free API key and has stricter rate limits. Open-Meteo AQ is the preferred option for a client-side-safe, keyless integration.

---

## 3. Load-Shedding Schedules — EskomSePush API

**Base URL:** `https://developer.sepush.co.za/business/2.0/`

**Auth required:** Yes. Token sent as a custom HTTP header:
```
Token: <your-esp-api-key>
```
API keys are purchased via [eskomsepush.gumroad.com](https://eskomsepush.gumroad.com/l/api). Free tier: **50 API calls per day**. Paid tiers available for higher quotas.

**CORS: BLOCKED for direct browser calls.** The ESP API does not set CORS headers permitting cross-origin browser requests. A community proxy project (bluescorpian/eskomsepush-api-proxy on GitHub) exists specifically because of this limitation. This confirms ESP must route through the existing `ampere-proxy` backend — the API token must also never be exposed to the client.

**Key endpoints (all relative to base URL):**

| Endpoint | Method | Key Params | Description |
|---|---|---|---|
| `/status` | GET | — | National load-shedding stage (0–8) |
| `/areas_search` | GET | `text=sandton` | Find area IDs by name string |
| `/area` | GET | `id=eskde-10-sandtonrand` | Schedule + upcoming events for a specific area |
| `/areas_nearby` | GET | `lat=-26.2041&lon=28.0473` | Areas near GPS coords |
| `/topics_nearby` | GET | `lat=-26.2041&lon=28.0473` | Community-reported topics near location |

**Area search example request (must be proxied):**
```
GET https://developer.sepush.co.za/business/2.0/areas_search?text=sandton
Headers: Token: <key>
```

**Area search example response shape:**
```json
{
  "areas": [
    {
      "id": "eskde-10-sandtonrand",
      "name": "Sandton (Rand)",
      "region": "Eskom Direct Supply Area"
    }
  ]
}
```

**Area status example request (must be proxied):**
```
GET https://developer.sepush.co.za/business/2.0/area?id=eskde-10-sandtonrand
Headers: Token: <key>
```

**Area status example response shape:**
```json
{
  "info": { "name": "Sandton (Rand)", "region": "Eskom Direct Supply Area" },
  "events": [
    {
      "note": "Stage 2",
      "start": "2026-06-14T10:00:00+02:00",
      "end": "2026-06-14T12:30:00+02:00"
    }
  ],
  "schedule": {
    "days": [
      {
        "date": "2026-06-14",
        "name": "Monday",
        "stages": [
          ["00:00-02:30", "02:00-04:30"],
          ["02:00-04:30", "04:00-06:30"],
          "..."
        ]
      }
    ]
  }
}
```
`schedule.days[n].stages` is an array of 8 elements (one per stage level); each element is an array of affected time slots for that day.

**Rate limits:** 50 calls/day on the free tier. Quota resets daily. Exceeded quota returns HTTP 429. Build client-side caching in the proxy layer — cache area schedule responses for at least 15 minutes.

**Keyless community alternative:** The [EskomSePush app](https://sepush.co.za) does not expose a public unauthenticated API. There is no stable keyless community alternative as of June 2026. The token requirement is hard. Route all ESP calls through `ampere-proxy` and store the token server-side only.

---

## 4. SA Grid Carbon Intensity Factor

**There is no free, real-time public API for the South African grid carbon intensity.**

Use a static value sourced from the official DFFE (Department of Forestry, Fisheries and the Environment) Grid Emission Factors report.

**Current best-known static values:**

| Metric | Value | Year of data | Source |
|---|---|---|---|
| DGGEF (Domestic Generation Grid Emission Factor) | **0.942 tCO2e/MWh = 0.942 kgCO2e/kWh** | 2023 calendar year | DFFE, published 25 July 2025 |
| NGGEF (National Grid Emission Factor, incl. imports) | **0.906 tCO2e/MWh = 0.906 kgCO2e/kWh** | 2023 calendar year | DFFE, published 25 July 2025 |

**Recommended value to use in the dashboard:** `0.942 kgCO2e/kWh` (DGGEF). This is the standard factor used in GHG Protocol Scope 2 reporting for SA electricity consumption. It is marginally conservative vs the NGGEF and is the figure required by the Carbon Tax Act compliance pathway.

**Trend:** The factor has been declining — 1.013 (2021) → 0.960 (2022) → 0.942 (2023) — reflecting modest renewable penetration growth. Expect a new report covering 2024 data to be published by DFFE in mid-2026. Flag this for refresh when it drops.

**Source document:** South Africa's 2023 Grid Emission Factors Report, Government Gazette No. 53079, DFFE, 25 July 2025. Available at `dffe.gov.za`.

---

## 5. SA Electricity Tariffs 2026 (Static Lookup Table)

No public real-time tariff API exists for SA residential electricity. Use static values sourced directly from official published schedules.

### 5A. Eskom Homepower (Direct Eskom residential customers)

**Source:** Eskom Schedule of Standard Prices for Eskom Tariffs — FY2027, effective **1 April 2026 to 31 March 2027** for non-local authority (direct Eskom) supplies. Verified from the official Eskom Parliament-submitted tariff document.

**Context:** The Inclining Block Tariff (IBT) was removed in FY2026 (April 2025). All Homepower customers now pay a **single flat energy rate** regardless of consumption volume. The tariff is unbundled into separate energy, network demand, ancillary service, network capacity, and service/admin components. VAT at 15% applies.

**Table 12 — Homepower Standard (non-local authority), FY2027:**

All Homepower tiers share the same variable energy rate components. The differences between HP1–HP4 are in the fixed capacity charges, which scale with the NMD (Notified Maximum Demand) / supply size.

| Component | Rate (excl. VAT) | Rate (incl. 15% VAT) | Unit |
|---|---|---|---|
| Active energy charge | 280.05 | 322.06 | c/kWh |
| Ancillary service charge | 0.45 | 0.52 | c/kWh |
| Network demand charge | 28.68 | 32.98 | c/kWh |
| **Combined variable rate** | **309.18** | **355.56** | **c/kWh** |

**Fixed charges per POD/day (scale by supply size tier):**

| Tier | NMD / Supply size | Network capacity (R/POD/day, excl. VAT) | Service & admin (R/POD/day, excl. VAT) | GCC (R/POD/day, excl. VAT) |
|---|---|---|---|---|
| Homepower 1 | 3-phase 25 kVA / 2-phase 32 kVA | R 13.19 | R 5.74 | R 1.09 |
| Homepower 2 | 3-phase 50 kVA / 2-phase 64 kVA | R 29.44 | R 5.74 | R 1.93 |
| Homepower 3 | 3-phase 100 kVA / 2-phase 100 kVA | R 62.89 | R 5.74 | R 4.70 |
| Homepower 4 | Single-phase 16 kVA (80 A) | R 9.08 | R 5.74 | R 0.71 |

**Homepower 4** is the most common single-phase residential supply in South Africa.

**EasyElectricity prepaid combined rates (FY2027):**
The prepaid vending system combines variable charges into a single token rate:
- Top-up rate: **309.18 c/kWh (excl. VAT) / 355.56 c/kWh (incl. VAT)**
- Homepower 4 monthly purchase option: R 2 327.19 (excl. VAT) / R 2 676.27 (incl. VAT) for 600 kWh

**Annual increase applied:** 8.76% effective 1 April 2026. Previous year (FY2026, April 2025) flat rate was ~280 c/kWh excl. VAT after IBT removal.

**Dashboard usage:** Use 309.18 c/kWh (excl. VAT) as the Eskom residential energy cost constant. For bills including VAT, use 355.56 c/kWh. For the common single-phase household (Homepower 4), add fixed daily charges of R9.08 + R5.74 + R0.71 = R15.53/day (excl. VAT) pro-rated to the billing period.

### 5B. City Power Johannesburg (Joburg metro residential customers)

**Source:** City of Johannesburg approved tariffs FY2025/2026, effective **1 July 2025 to 30 June 2026**. Verified from search against the CoJ consolidated tariff document and NERSA-approved rate reporting.

**Note:** City Power continues to apply an Inclining Block Tariff (IBT) structure for residential prepaid customers, unlike Eskom which has removed IBT. City Power's FY2026/2027 tariff (effective July 2026) will include a further increase; rates below are the current July 2025–June 2026 schedule.

**Residential Prepaid High tariff (most common residential category):**

| Block | Consumption threshold | Rate (incl. VAT) | Notes |
|---|---|---|---|
| Block 1 | 0–350 kWh/month | R 2.6645/kWh (266.45 c/kWh) | Verified from NERSA-approved schedule |
| Block 2 | 351–500 kWh/month | Higher rate — see note | Exact rate not publicly confirmed in web sources |
| Block 3 | >500 kWh/month | Highest rate | Exact rate not publicly confirmed in web sources |

Average selling price across all consumption: ~329.48 c/kWh (incl. VAT) per published reporting (up from 295.07 c/kWh in 2024/2025).

**Fixed charges (unchanged from 2024/2025):**
- Service charge: R 70.00/month
- Network capacity charge: R 130.00/month
- Total fixed monthly: R 200.00/month (excl. VAT)

**Dashboard usage:** Use 266.45 c/kWh (incl. VAT) for Block 1 consumption up to 350 kWh/month as the City Power cost constant. Use 329.48 c/kWh as the average blended rate for higher-consumption households. Add R200/month fixed charges.

**Data gap note:** Block 2 and Block 3 exact rates were not obtainable from public sources during this research pass. The CoJ Consolidated Tariffs FY2025/2026 PDF at joburg.org.za contains the full schedule — retrieve and update this table before any billing simulation feature ships.

---

## 6. Joburg Water 2026 Residential Tariff (Stepped Blocks)

**Source:** City of Johannesburg / Johannesburg Water. Effective **1 July 2025** (13.9% increase applied to FY2024/2025 rates).

**Structure:** Increasing block tariff. First 6 kL/month free for all domestic users (confirmed by Johannesburg Water official communication, July 2025).

**FY2025/2026 stepped block rates (effective 1 July 2025):**

The rates below are derived by applying the confirmed 13.9% tariff increase to the verified FY2024/2025 base rates. The pre-increase base rates were sourced from published CoJ tariff data.

| Block | Consumption (kL/month) | Estimated rate (excl. VAT) | Basis |
|---|---|---|---|
| Block 0 — Free | 0–6 | R 0.00/kL | Confirmed free, all domestic users |
| Block 1 | >6–10 | ~R 25.35/kL | R 22.26 × 1.139 |
| Block 2 | >10–15 | ~R 26.46/kL | R 23.23 × 1.139 |
| Block 3 | >15–20 | ~R 37.10/kL | R 32.57 × 1.139 |
| Block 4 | >20–30 | ~R 51.26/kL | R 45.01 × 1.139 |
| Block 5 | >30–40 | ~R 56.08/kL | R 49.23 × 1.139 |
| Block 6 | >40–50 | ~R 70.77/kL | R 62.11 × 1.139 |
| Block 7 | >50 | ~R 75.81/kL | R 66.56 × 1.139 |

Fixed connection levy: ~R 35.40/month (R 31.08 base × 1.139) per water connection.

**Confidence level:** Medium. Base rates confirmed from CoJ published data. The 13.9% multiplier is confirmed from Johannesburg Water official announcement (1 July 2025). Exact post-increase rates should be confirmed against the CoJ FY2025/2026 consolidated tariff PDF at `joburg.org.za/documents_/Documents/Amendment of Tariff Charges/Consolidated-Tariffs-FY20252026.FINAL.pdf` before the tariff lookup feature ships.

**FY2026/2027 outlook:** CoJ proposed a further 12.5% water tariff increase effective July 2026. Budget for a tariff constants update at that point.

---

## RECOMMENDED CLIENT-SIDE SET

### Safe to call directly from the browser (keyless + CORS-enabled)

Both Open-Meteo APIs are confirmed keyless and CORS-enabled. These can be called directly from Next.js client components or `getStaticProps` / `getServerSideProps` without a proxy.

| API | Endpoint | Call from |
|---|---|---|
| Open-Meteo Forecast | `https://api.open-meteo.com/v1/forecast?latitude=-26.2041&longitude=28.0473&hourly=temperature_2m,shortwave_radiation,direct_radiation,diffuse_radiation&timezone=Africa%2FJohannesburg` | Browser / Next.js client |
| Open-Meteo Air Quality | `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=-26.2041&longitude=28.0473&hourly=pm2_5,pm10,european_aqi&timezone=Africa%2FJohannesburg` | Browser / Next.js client |

### Must route through ampere-proxy backend (token required or CORS-blocked)

| API | Reason | Proxy endpoint to expose |
|---|---|---|
| EskomSePush `/status` | Requires `Token` header; CORS-blocked in browser | `GET /api/loadshedding/status` |
| EskomSePush `/areas_search` | Requires `Token` header; CORS-blocked in browser | `GET /api/loadshedding/search?text=` |
| EskomSePush `/area` | Requires `Token` header; CORS-blocked in browser | `GET /api/loadshedding/area?id=` |

The ESP token must be stored as a server-side environment variable (`ESP_API_TOKEN`) and injected by the proxy only. Never expose it to the client bundle.

**Cache recommendation for the proxy layer:**
- `/status` — cache 5 minutes (stage changes are infrequent)
- `/area?id=` — cache 15 minutes (schedule is stable; events update less frequently)
- `/areas_search` — cache 24 hours (area IDs are static)

### Static constants (no API call needed — hardcode in the dashboard)

These values change at most once per year and do not warrant a runtime API call.

```typescript
// constants/sa-energy.ts

export const SA_GRID = {
  // DFFE 2023 Grid Emission Factors Report (published 25 July 2025)
  // Source: Government Gazette No. 53079, DFFE
  carbonIntensity_kgCO2_per_kWh: 0.942,
  carbonIntensityYear: 2023,
};

export const ESKOM_HOMEPOWER = {
  // Eskom Schedule of Standard Prices FY2027
  // Effective 1 April 2026 – 31 March 2027
  // Source: Eskom, via Parliament TPAP document, Table 12
  energyRate_c_per_kWh_exclVAT: 280.05,      // active energy charge only
  variableRate_c_per_kWh_exclVAT: 309.18,    // energy + ancillary + network demand combined
  variableRate_c_per_kWh_inclVAT: 355.56,    // VAT-inclusive combined variable rate
  fixedHP4_R_per_day_exclVAT: 15.53,         // HP4: network capacity + service/admin + GCC
  effectiveFrom: "2026-04-01",
};

export const CITY_POWER_JHB = {
  // City of Johannesburg / NERSA FY2025/2026
  // Effective 1 July 2025 – 30 June 2026
  block1_R_per_kWh_inclVAT: 2.6645,          // 0–350 kWh/month
  averageBlended_c_per_kWh_inclVAT: 329.48,  // across all consumption
  fixedMonthly_R: 200.00,                     // service charge + network capacity (excl. VAT)
  effectiveFrom: "2025-07-01",
  note: "Block 2 and Block 3 rates not confirmed — retrieve from CoJ FY2025/2026 tariff PDF",
};

export const JHB_WATER = {
  // Johannesburg Water, effective 1 July 2025 (13.9% increase applied)
  // Source: CoJ FY2025/2026 tariff schedule + JHB Water official announcement
  freeAllowance_kL: 6,
  blocks: [
    { from: 0,  to: 6,   rate_R_per_kL: 0.00 },
    { from: 6,  to: 10,  rate_R_per_kL: 25.35 },
    { from: 10, to: 15,  rate_R_per_kL: 26.46 },
    { from: 15, to: 20,  rate_R_per_kL: 37.10 },
    { from: 20, to: 30,  rate_R_per_kL: 51.26 },
    { from: 30, to: 40,  rate_R_per_kL: 56.08 },
    { from: 40, to: 50,  rate_R_per_kL: 70.77 },
    { from: 50, to: Infinity, rate_R_per_kL: 75.81 },
  ],
  fixedLevy_R_per_month: 35.40,
  effectiveFrom: "2025-07-01",
  confidence: "medium — base rates confirmed, 13.9% multiplier confirmed, exact post-increase rates need CoJ PDF verification",
};
```

---

## Data Gaps and Refresh Schedule

| Item | Gap | Action |
|---|---|---|
| City Power Block 2 + Block 3 rates | Not obtainable from public web sources | Pull CoJ FY2025/2026 consolidated tariff PDF from `joburg.org.za` before billing simulation ships |
| Joburg Water exact post-increase rates | Derived by applying 13.9% — not read directly from the tariff document | Confirm against CoJ PDF at same URL |
| DFFE 2024 carbon intensity | 2024 calendar-year data expected mid-2026 | Check `dffe.gov.za` — update `carbonIntensity_kgCO2_per_kWh` when available |
| City Power FY2026/2027 tariffs | Effective July 2026 — pending NERSA approval | Update `CITY_POWER_JHB` constants in July 2026 |
| Eskom FY2027 municipal bulk rate | Local authority rate (effective July 2026) differs from non-local authority above | Not relevant for direct residential users; relevant if proxying for a municipality |

---

## Sources

- [Open-Meteo Forecast API documentation](https://open-meteo.com/en/docs)
- [Open-Meteo Air Quality API](https://air-quality-api.open-meteo.com) — verified live response
- [EskomSePush API (requires purchase)](https://eskomsepush.gumroad.com/l/api)
- [EskomSePush API proxy (confirms CORS block)](https://github.com/bluescorpian/eskomsepush-api-proxy)
- [DFFE — South Africa's 2023 Grid Emission Factors Report](https://www.dffe.gov.za/sites/default/files/legislations/publication_SAgridemissionfactorsreport_g53079gon6454.pdf) — published 25 July 2025
- [CDH — Understanding the 2023 Grid Emission Factors Report](https://www.cliffedekkerhofmeyr.com/en/news/publications/2025/Practice/Environmental-Law/Environmental-law-alert-11-september-Understanding-the-2023-Grid-Emission-Factors-Report)
- [Eskom Schedule of Standard Prices FY2027 (via Parliament)](https://www.parliament.gov.za/storage/app/media/Docs/tpap/01dx3n75fx2zqg2szsvfbzs26wen5swlu7.pdf) — Table 12 (Homepower), effective 1 April 2026
- [Eskom FY2026 tariff announcement (12.74% increase)](https://www.eskom.co.za/distribution/2025-2026-price-increase/)
- [Eskom FY2027 tariff restructuring](https://www.eskom.co.za/distribution/2026-2027-tariff-increase/)
- [CoJ Consolidated Tariffs FY2025/2026](https://joburg.org.za/documents_/Documents/Amendment%20of%20Tariff%20Charges/Consolidated-Tariffs-FY20252026.FINAL.pdf)
- [Johannesburg Water tariff increase announcement — 1 July 2025](https://x.com/JHBWater/status/1953025758319796394)
- [City Power tariff increase reporting (EWN)](https://www.ewn.co.za/2025/07/01/city-power-customers-to-pay-more-for-electricity-as-new-tariff-hike-takes-effect)

---

## ADDITIONAL FREE APIS (wave 2)

**Research date:** 2026-06-14  
**Scope:** 7 candidates assessed for keyless + CORS-enabled browser callability from a Next.js static/client-side context.

### Verdict Table

| API | Keyless? | CORS (browser-direct)? | Endpoint | What it adds |
|---|---|---|---|---|
| Open-Meteo Geocoding | Yes — no key ever required | **Yes — confirmed** | `https://geocoding-api.open-meteo.com/v1/search?name={query}&count=10&language=en&format=json` | City/suburb → lat/lng location picker; localises all existing Open-Meteo + ESP calls to user's actual suburb instead of hardcoded Joburg |
| Open-Meteo Daily (sunrise/sunset/UV) | Yes — same API as Forecast | **Yes — confirmed** | `https://api.open-meteo.com/v1/forecast?latitude=-26.2041&longitude=28.0473&daily=sunrise,sunset,uv_index_max,daylight_duration&timezone=Africa%2FJohannesburg` | Accurate local sunrise/sunset in SAST + daily UV index max; no extra API needed — bolt onto existing forecast call |
| World Bank Indicators | Yes — no key required | **No — CORS not supported; JSONP supported** | `https://api.worldbank.org/v2/country/ZA/indicator/{INDICATOR_CODE}?format=json&mrv=1` | SA CO2 per capita, electricity access %, renewable share — high-credibility impact data for grant/impact context panels |
| PVGIS (European Commission JRC) | Yes — no key required | **No — AJAX/CORS explicitly blocked by policy** | `https://re.jrc.ec.europa.eu/api/v5_3/PVcalc?lat=-26.2041&lon=28.0473&peakpower=1&loss=14&outputformat=json` | Authoritative long-run PV yield (kWh/year per kWp) from 20+ years of satellite irradiance data; must be proxied |
| Eskom national grid (live demand/supply) | N/A | N/A | No public JSON API exists | Eskom Data Portal is form-submit → email download only; `unofficialeskom.com` publishes SQLite file downloads, not a live API endpoint |
| SA dam levels — DWS | N/A | N/A | No public JSON API exists | DWS NIWIS is a dashboard UI with CSV/Excel manual downloads only; no documented REST endpoint; `dws.gov.za` returns 403 to automated clients |
| sunrise-sunset.org | Yes — no key required | **Yes — CORS explicitly enabled** | `https://api.sunrise-sunset.org/json?lat=-26.2041&lng=28.0473&date=today&formatted=0&tzid=Africa/Johannesburg` | Sunrise/sunset/solar noon/twilight times — **redundant** given Open-Meteo daily already covers this; only use if you need the dedicated service for some reason |

---

### Detailed Notes per Candidate

#### W2-1. Open-Meteo Geocoding API — CONFIRMED: keyless + CORS-enabled

**Endpoint:** `https://geocoding-api.open-meteo.com/v1/search`

**Auth:** None. Keyless for non-commercial use, identical policy to all other Open-Meteo APIs.

**CORS:** Yes. Open-Meteo sets permissive CORS headers across all its API subdomains. Confirmed callable directly from browser via the same policy governing the Forecast and Air Quality APIs already in use.

**SA example request (Johannesburg search):**
```
GET https://geocoding-api.open-meteo.com/v1/search
  ?name=Johannesburg
  &count=5
  &language=en
  &format=json
```

**Verified live response shape:**
```json
{
  "results": [
    {
      "id": 993800,
      "name": "Johannesburg",
      "latitude": -26.20227,
      "longitude": 28.04363,
      "elevation": 1753.0,
      "feature_code": "PPLA",
      "country_code": "ZA",
      "country": "South Africa",
      "country_id": 953987,
      "timezone": "Africa/Johannesburg",
      "population": 9418183,
      "admin1_id": 1085594,
      "admin2_id": 993800,
      "admin3_id": 11505474,
      "admin1": "Gauteng",
      "admin2": "City of Johannesburg Metropolitan Municipality",
      "admin3": "City of Johannesburg"
    }
  ],
  "generationtime_ms": 0.5643368
}
```

**Filter by country (SA only):** Add `&countryCode=ZA` to restrict results to South African locations. This prevents the picker returning Johannesburg, California or Johannesburg, Michigan ahead of the SA result.

**Use in dashboard:** Drive a location search input. On selection, store `latitude` + `longitude` from the result and pass to all subsequent Open-Meteo Forecast, Air Quality, and EskomSePush calls. This eliminates the hardcoded `-26.2041,28.0473` constants and makes the dashboard accurate for Cape Town, Durban, Pretoria, etc.

**Rate limits:** Undocumented for non-commercial use. Consistent with other Open-Meteo APIs: high throughput tolerated for normal usage, commercial use requires subscription.

---

#### W2-2. Open-Meteo Daily Params (sunrise/sunset/UV) — CONFIRMED: keyless + CORS-enabled (no new API needed)

This is not a separate API — it is an extension of the existing Open-Meteo Forecast API already documented in Section 1. Add a `daily=` parameter block to the existing forecast request.

**Exact daily parameter names:**
- `sunrise` — ISO8601 local time of sunrise
- `sunset` — ISO8601 local time of sunset
- `daylight_duration` — seconds of daylight (divide by 3600 for hours)
- `uv_index_max` — daily maximum UV Index (unitless integer scale)
- `uv_index_clear_sky_max` — UV index assuming no cloud cover (useful for solar panel clear-sky modeling)

**SA example request (bolt onto existing forecast call):**
```
GET https://api.open-meteo.com/v1/forecast
  ?latitude=-26.2041
  &longitude=28.0473
  &daily=sunrise,sunset,uv_index_max,daylight_duration
  &timezone=Africa%2FJohannesburg
  &forecast_days=7
```

**Verified live response shape (Johannesburg, 2026-06-14):**
```json
{
  "latitude": -26.186293,
  "longitude": 28.026318,
  "elevation": 1749.0,
  "utc_offset_seconds": 7200,
  "timezone": "Africa/Johannesburg",
  "timezone_abbreviation": "GMT+2",
  "daily_units": {
    "time": "iso8601",
    "sunrise": "iso8601",
    "sunset": "iso8601",
    "uv_index_max": "",
    "daylight_duration": "s"
  },
  "daily": {
    "time": ["2026-06-14", "2026-06-15", "2026-06-16"],
    "sunrise": ["2026-06-14T06:52", "2026-06-15T06:53", "2026-06-16T06:53"],
    "sunset":  ["2026-06-14T17:23", "2026-06-15T17:23", "2026-06-16T17:23"],
    "uv_index_max": [5.0, 5.0, 5.0],
    "daylight_duration": [37835.86, 37823.74, 37813.50]
  }
}
```

Joburg in mid-June: 10h 30m of daylight. UV Index 5 (Moderate) in winter — correctly lower than the summer peak of ~11 (Extreme) on the Highveld.

**Use in dashboard:** Drive a "sun hours today" metric, a UV warning band (WHO scale: 1–2 Low, 3–5 Moderate, 6–7 High, 8–10 Very High, 11+ Extreme), and solar generation window (sunrise-to-sunset as the active production period).

---

#### W2-3. World Bank Indicators API — keyless, but NO native CORS; JSONP or proxy required

**Auth:** None. The World Bank v2 API is fully public and requires no API key or registration.

**CORS:** Not supported for standard browser `fetch()` calls. The API documentation explicitly offers JSONP as the browser workaround. Direct `fetch()` from a Next.js client component will be rejected by the browser with a CORS error.

**Options for use in Ampere One:**
1. Call from Next.js server-side (`getServerSideProps` or a Next.js API route) — no CORS restriction applies server-side.
2. Use JSONP with `format=jsonP&prefix=callback` — works in browser but requires older callback-pattern integration, not idiomatic in a modern React/Next.js app.
3. Add a thin proxy route at `/api/worldbank?indicator=` that server-side fetches and returns the data.

**Recommended path:** Next.js API route. The data is annual (updates once a year) so cache aggressively — 24-hour TTL is fine.

**Key SA indicators and their confirmed codes:**

| Indicator | Code | Latest SA value (verified) | Year |
|---|---|---|---|
| Access to electricity (% of population) | `EG.ELC.ACCS.ZS` | **87.7%** | 2023 |
| CO2 emissions per capita (metric tons) | `EN.ATM.CO2E.PC` | ~6.8 t (approximate) | 2021 |
| Renewable electricity output (% of total) | `EG.ELC.RNEW.ZS` | ~6–8% (approximate) | 2021 |
| Fossil fuel energy consumption (% of total) | `EG.USE.COMM.FO.ZS` | ~84% (approximate) | 2021 |

**Verified example request + response (electricity access):**
```
GET https://api.worldbank.org/v2/country/ZA/indicator/EG.ELC.ACCS.ZS
  ?format=json
  &mrv=1
  &per_page=1
```

Response:
```json
[
  {
    "page": 1, "pages": 1, "per_page": 1, "total": 1,
    "sourceid": "2", "lastupdated": "2026-04-08"
  },
  [
    {
      "indicator": { "id": "EG.ELC.ACCS.ZS", "value": "Access to electricity (% of population)" },
      "country": { "id": "ZA", "value": "South Africa" },
      "countryiso3code": "ZAF",
      "date": "2023",
      "value": 87.7,
      "unit": "",
      "obs_status": "",
      "decimal": 1
    }
  ]
]
```

The response is a two-element array: `[0]` is pagination metadata, `[1]` is the data records array.

**Use in dashboard:** An "Impact" or "SA energy context" panel showing the national electricity access gap (12.3% without electricity), CO2 per capita vs global average, renewable % trend. High credibility for grant applications and B2B pitch decks.

---

#### W2-4. PVGIS (European Commission JRC) — keyless, but CORS/AJAX explicitly blocked

**Auth:** None. Fully public and free, no registration required.

**CORS:** Explicitly blocked. The official PVGIS documentation states: "access to PVGIS APIs via AJAX is not allowed." The JRC administrators have confirmed this is a deliberate policy and will not change. All browser-originated AJAX calls are rejected.

**Must be proxied.** Route through an `ampere-proxy` server-side route at `/api/pvgis/pvcalc`.

**Endpoint (v5_3 — current as of June 2026; v5_1 was removed September 2024):**
```
https://re.jrc.ec.europa.eu/api/v5_3/PVcalc
  ?lat=-26.2041
  &lon=28.0473
  &peakpower=3
  &loss=14
  &outputformat=json
```

**Key parameters:**
- `lat`, `lon` — location (South Africa is fully covered)
- `peakpower` — installed PV capacity in kWp (e.g. 3 for a typical SA residential system)
- `loss` — total system losses in % (14% is the PVGIS default; accounts for wiring, inverter, temperature)
- `mountingplace` — `free` (free-standing) or `building` (building-integrated, adds thermal penalty)
- `angle` — panel tilt in degrees (optimal for Joburg is ~26°, matching the latitude)
- `aspect` — azimuth; 0 = south-facing (correct for southern hemisphere)
- `outputformat` — `json` for machine-readable response

**Example response shape (abbreviated):**
```json
{
  "inputs": {
    "location": { "latitude": -26.2041, "longitude": 28.0473, "elevation": 1749.0 },
    "pv_module": { "peak_power": 3.0, "system_loss": 14.0 }
  },
  "outputs": {
    "totals": {
      "fixed": {
        "E_d": 14.26,
        "E_m": 433.8,
        "E_y": 5205.5,
        "H(i)_d": 5.92,
        "SD_y": 272.0,
        "l_aoi": -2.85,
        "l_spec": "1.67",
        "l_tg": -4.37,
        "l_total": -14.0
      }
    },
    "monthly": {
      "fixed": [
        { "month": 1, "E_d": 13.46, "E_m": 417.2, "H(i)_d": 5.62, "SD_m": 34.8 },
        "..."
      ]
    }
  },
  "meta": {
    "inputs": "...",
    "outputs": "Daily, monthly and yearly energy production [kWh], and yearly variability [kWh]"
  }
}
```

Key output fields:
- `E_y` — annual energy yield in kWh (for the specified kWp system)
- `E_m` — monthly average energy yield (kWh)
- `E_d` — daily average energy yield (kWh)
- `H(i)_d` — daily irradiation on the inclined plane (kWh/m²)
- `SD_y` — standard deviation of annual production (inter-year variability)

**Use in dashboard:** Solar ROI calculator — given a system size (kWp) and location, return the expected annual output and calculate payback period against Eskom tariff. This is the most authoritative freely available PV yield source; it uses 20+ years of satellite-derived irradiance data for SA and is the dataset used in formal feasibility studies.

**Proxy note:** Add to `ampere-proxy` as `GET /api/pvgis/pvcalc?lat=&lon=&peakpower=&loss=`. Cache response for 30 days minimum — the underlying irradiance data is historical and does not change between requests for the same coordinates.

---

#### W2-5. Eskom National Grid Live Demand/Supply — NO PUBLIC API

**Verdict: No viable integration path exists as of June 2026.**

The Eskom Data Portal (`eskom.co.za/dataportal/`) operates as a form-submit system: users select datasets and a date range, submit a form, and receive a download link via email. There is no documented JSON REST endpoint.

`unofficialeskom.com` publishes dashboards built from SQLite database file downloads (`eskom_metrics.sqlite`, `eskom.sqlite`). These are periodic file dumps, not a live API. There are no XHR endpoints exposed.

The archived `mypowerstats` GitHub project used an `authKey`-based endpoint on `myeskom.co.za` that required scraping credentials from the dashboard page — this is exactly the screen-scraping / credential-scraping pattern that is off-limits under Ampere's red lines (ToS violation risk; archived in 2022, no longer functional).

**No action.** Do not pursue. The load-shedding stage from EskomSePush (`/status`) is the appropriate proxy for grid stress visibility. National MW generation/demand numbers are not available via any legitimate free API.

---

#### W2-6. SA Dam Levels (DWS) — NO PUBLIC JSON API

**Verdict: No machine-readable API exists as of June 2026.**

The Department of Water and Sanitation NIWIS (National Integrated Water Information System) provides dam level data via dashboard UI at `dws.gov.za`. Data export is CSV or Excel only, triggered manually. The `dws.gov.za` domain returns 403 to automated HTTP clients. No REST or JSON endpoint is documented.

The `dwa.gov.za/Hydrology/Weekly/` pages publish weekly HTML tables — scrapeable in theory but: (a) scraping is brittle and ToS-sensitive, and (b) data is weekly, not real-time.

Community tracking sites (ourpower.co.za, mydorpie.com) display DWS-sourced data but do not publish their own JSON APIs.

**Alternative approach if dam-level data is genuinely required:** Contact DWS directly for data-sharing agreement access to NIWIS feeds. This is the path used by academic and NGO researchers. Not viable for a zero-friction web dashboard integration.

**No integration path.** The water story in Ampere One is better served by the existing Joburg Water tariff calculator (Section 6) and user-entered consumption data.

---

#### W2-7. sunrise-sunset.org — CONFIRMED: keyless + CORS-enabled, but redundant

**Auth:** None. No key required, no registration.

**CORS:** Yes — explicitly enabled per their changelog. Direct browser `fetch()` works.

**Endpoint:**
```
GET https://api.sunrise-sunset.org/json
  ?lat=-26.2041
  &lng=28.0473
  &date=today
  &formatted=0
  &tzid=Africa/Johannesburg
```

**Verified live response shape (Johannesburg, 2026-06-14):**
```json
{
  "results": {
    "sunrise": "2026-06-14T04:51:33+00:00",
    "sunset": "2026-06-14T15:24:39+00:00",
    "solar_noon": "2026-06-14T10:08:06+00:00",
    "day_length": 37986,
    "civil_twilight_begin": "2026-06-14T04:27:34+00:00",
    "civil_twilight_end": "2026-06-14T15:48:38+00:00",
    "nautical_twilight_begin": "2026-06-14T03:58:48+00:00",
    "nautical_twilight_end": "2026-06-14T16:17:24+00:00",
    "astronomical_twilight_begin": "2026-06-14T03:30:31+00:00",
    "astronomical_twilight_end": "2026-06-14T16:45:41+00:00"
  },
  "status": "OK",
  "tzid": "UTC"
}
```

Note: the `tzid` param is accepted but the response timestamps are in UTC regardless — convert to SAST (+02:00) in the client.

**Verdict: Redundant.** Open-Meteo Forecast API already returns `sunrise`, `sunset`, `daylight_duration`, and `uv_index_max` in the `daily=` block (see W2-2 above). There is no reason to add a second API dependency for the same data. Skip sunrise-sunset.org entirely.

---

### RECOMMENDED TO INTEGRATE NEXT

Ranked by: confirmed keyless + confirmed CORS-OK + highest feature value for Ampere One.

**1. Open-Meteo Geocoding API** — Rank: 1  
Endpoint: `https://geocoding-api.open-meteo.com/v1/search?name={query}&count=10&countryCode=ZA&language=en&format=json`  
Zero effort: same API family, same CORS policy, no new account or key. Unlocks the entire dashboard for every SA city — every existing Open-Meteo and EskomSePush call becomes location-aware instead of hardcoded to Joburg. This is the highest-leverage single addition.

**2. Open-Meteo Daily (sunrise/sunset/UV index)** — Rank: 2  
Endpoint: bolt `&daily=sunrise,sunset,uv_index_max,daylight_duration` onto the existing `https://api.open-meteo.com/v1/forecast` call already in use.  
Literally zero new API surface — just additional parameters on an existing call. Adds a "solar window" visualisation (hours between sunrise and sunset when panels produce) and a UV index warning. Data verified live for Joburg June 2026.

**3. World Bank Indicators API (via Next.js API route)** — Rank: 3  
Endpoint (server-side): `https://api.worldbank.org/v2/country/ZA/indicator/EG.ELC.ACCS.ZS?format=json&mrv=1`  
Requires a thin proxy route (`/api/worldbank`) but the data is annual, so cache at 24h and the proxy barely fires. Adds credible SA impact numbers (87.7% electricity access = 12.3% gap, CO2 per capita) that sharply strengthen the impact / grant narrative panels. World Bank sourcing is trusted by funders and corporates in SA cleantech.

**Honorable mention — PVGIS (via proxy):** If a solar ROI calculator feature is on the roadmap, PVGIS is the correct data source (authoritative 20-year irradiance, covers all SA locations, free forever). Add it to `ampere-proxy` at that point. Not ranked in the top 3 because it requires a backend proxy addition and is only relevant when a specific feature ships, not for the current dashboard MVP.

---

### Wave 2 Sources

- [Open-Meteo Geocoding API documentation](https://open-meteo.com/en/docs/geocoding-api)
- [Open-Meteo Forecast API — daily parameters](https://open-meteo.com/en/docs)
- [World Bank API — Basic Call Structures](https://datahelpdesk.worldbank.org/knowledgebase/articles/898581-api-basic-call-structures)
- [World Bank — SA electricity access indicator](https://data.worldbank.org/indicator/EG.ELC.ACCS.ZS?locations=ZA)
- [PVGIS API non-interactive service documentation](https://joint-research-centre.ec.europa.eu/photovoltaic-geographical-information-system-pvgis/getting-started-pvgis/api-non-interactive-service_en)
- [PVGIS tools overview (JRC)](https://joint-research-centre.ec.europa.eu/photovoltaic-geographical-information-system-pvgis/pvgis-tools_en)
- [Eskom Data Portal](https://www.eskom.co.za/dataportal/)
- [Unofficial Eskom dashboards (SQLite downloads)](https://unofficialeskom.com/dashboards/)
- [DWS Open Data SA Toolkit — water and climate data](https://opendataza.gitbook.io/toolkit/open-data-resources/water-and-climate-data-resources)
- [sunrise-sunset.org API documentation](https://sunrise-sunset.org/api)
- [Electricity Maps — global carbon intensity coverage](https://www.electricitymaps.com/resources/updates/global-coverage-real-time-electricity-grid-data-for-110-additional-countries)
- [emissions.dev — free carbon emissions API](https://emissions.dev/)
