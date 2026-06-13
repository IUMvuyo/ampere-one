# Ampere One — Web

Live electricity + water resource dashboard for the GCIP-SA 2026 cleantech grant. Next.js (JSX, App Router), static-exported, deployed to GitHub Pages → `ampereone.quantyx.co.za`.

## Run locally
```bash
cd web
npm install
npm run dev        # http://localhost:3000
npm run build      # static export to ./out
```

## What it does
- **Live dashboard** (`/dashboard`) — connects to the Ampere One ESP32 over **Web Bluetooth** (Chrome/Edge desktop or Android), or **Run demo** for a simulated SA-home day on any browser.
- Energy tiles (W, kWh, Rand, CO₂) + live sparkline; water tiles (tank gauge, flow, leak status).
- **Appliance disaggregation** (NILM-lite) from whole-home power steps.
- **AI resource coach** — ranked, Rand-denominated actions (leak, geyser-in-peak, standby, load-shedding).
- **Solar right-sizing** from live Open-Meteo irradiance; **air quality** from Open-Meteo AQ.
- **Impact calculator** (`/impact`) — the grant climate math, interactive.
- **Grant page** (`/grant`) — the pitch.

## Public APIs (see ../docs/PUBLIC_APIS.md)
- **Open-Meteo Forecast** + **Air Quality** — keyless, CORS-OK, called client-side. Verified live.
- **EskomSePush** — token + CORS-blocked → must route via `ampere-proxy` (stage selector is the fallback here).
- Tariffs + grid factor are verified static constants (`lib/tariffs.js`, `lib/carbon.js`).

## Deploy
Pushing to `main` triggers `.github/workflows/deploy.yml` → builds the static export → GitHub Pages.
In the repo: **Settings → Pages → Source: GitHub Actions**. The `public/CNAME` pins the custom domain;
point a DNS `CNAME` for `ampereone` at `<github-user>.github.io`.

## Hardware
Firmware + BOM live in `../firmware/` and `../docs/HARDWARE_BOM.md`. BLE contract:
service `a1b20001-…`, notify char `a1b20002-…`, JSON `{w,tank,lpm,leak}`.
