# NextSignal &bull; AI-Powered Geohazard & Landslide Early Warning System
### Smart India Hackathon (SIH 26001) &bull; Northeast Region Disaster Intelligence System

[![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Three.js / Globe.gl](https://img.shields.io/badge/WebGL-Three.js%20%2F%20Globe.gl-000000?logo=three.js&logoColor=white)](https://globe.gl/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9-199900?logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![Netlify Status](https://img.shields.io/badge/Deploy-Netlify-00C7B7?logo=netlify&logoColor=white)](https://www.netlify.com/)

---

## ðŸ“Œ Executive Summary & SIH Problem Statement (SIH 26001)
The **Northeast Region of India (NER)** represents one of the world's most vulnerable mountainous terrains to rainfall-triggered landslides, seismic slope destabilization, and Glacial Lake Outburst Floods (GLOF).

**NextSignal** is an enterprise-grade, real-time geohazard intelligence dashboard engineered for the **National Disaster Management Authority (NDMA)**, **State Disaster Management Authorities (SDMA)**, **NDRF Battalions**, and **citizens across all 8 NER states** (Assam, Arunachal Pradesh, Meghalaya, Sikkim, Manipur, Mizoram, Nagaland, Tripura).

---

## ðŸŒŸ Key System Capabilities

### 1. Dual 2D/3D Geospatial Situation Engine
* **2D Leaflet Tactical Map:** High-performance vector rendering with real-time district risk pins, thermal heat gradient circles for India, seismic epicenter rings, NASA COOLR historical landslide coordinates, and safe shelters.
* **3D WebGL Earth Globe:** Photorealistic planetary view powered by Three.js/Globe.gl with flat geospatial surface markers and real-time atmospheric lighting.
* **Synchronized Layer Switching:** Real-time hot-swapping between **4K Satellite Imagery**, **Dark Tactical Base**, **Live Land Surface Temp (LST)**, **Satellite Clouds (IR)**, **Doppler Weather Radar**, and **Topographic DEM Relief**.

### 2. Multi-Spectral Sensor Optics
* **FLIR Thermal [2]:** Heat gradient visualization highlighting critical slope moisture hotspots.
* **Night Vision (NVG) [3]:** High-contrast phosphor luminescence for low-light night monitoring.
* **CRT Scanline [4]:** Military-grade command center tactical overlay.
* **Recon Noir [5] & Rock Scar [6]:** High-frequency geological contrast for active fault detection.

### 3. 5-Factor Geotechnical Risk Decomposition Algorithm
Every monitored district in Northeast India is evaluated continuously across 5 weighted geophysical variables:
$$\text{Composite Risk} = 0.30 \cdot R_{\text{rain}} + 0.25 \cdot S_{\text{slope}} + 0.20 \cdot M_{\text{soil}} + 0.15 \cdot E_{\text{quake}} + 0.10 \cdot H_{\text{coolr}}$$

* **Antecedent Rainfall (30%):** Open-Meteo & IMD 24h/72h cumulative precipitation vs. dynamic threshold $I_{\text{crit}}$.
* **Slope Topography (25%):** Digital Elevation Model (DEM) gradient analysis.
* **Root-Zone Soil Saturation (20%):** Live soil moisture percentage and pore-water pressure ($u$).
* **Seismic Shaking & PGA (15%):** Live USGS earthquake telemetry and Peak Ground Acceleration impact.
* **NASA COOLR Historical (10%):** Global landslide catalog density index.

### 4. Decision-Support Dispatch Recommendations for NDRF & SDRF
* Real-time generation of **Decision-Support Dispatch Recommendations** specifying assigned battalions (e.g. 1st Bn Guwahati, 12th Bn Itanagar), designated helipad staging coordinates, and required personnel count.
* One-click instant copy for emergency response dispatchers.

### 5. Hydrological Basin & GLOF Early Warning Gauges
* Continuous tracking of high-altitude river gauges along the **Teesta**, **Brahmaputra**, and **Subansiri** basins.
* Trend monitoring (`â–² Rising` vs `â–¶ Steady`) and danger level exceedance detection.

### 6. Citizen Early Warning Portal & Multi-Lingual Interface
* Instant toggle between **Authority Command View** and **Citizen Public Portal**.
* Full English and **Hindi (à¤¹à¤¿à¤¨à¥à¤¦à¥€)** localized warnings, emergency helplines (`1070`, `1077`, `112`), and live risk advisories.

### 7. Strategic Corridor Inspection & Rangefinder
* **Cinematic Tour:** Autonomous camera navigation through critical mountain highway choke points (Chungthang, Dima Hasao, Noney, Sela Pass).
* **Geodetic Rangefinder:** Calculates distance, terrain elevation delta ($\Delta h$), and exact rescue arrival ETAs for **IAF Helicopter Airlift** and **Ground 4x4 QRV Teams**.

---

## ðŸ—ï¸ Architecture & Technology Stack

```
NextSignal-SIH26001/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ services/
â”‚   â”‚   â””â”€â”€ landslide/            # Geohazard services, Open-Meteo, USGS, NDRF dispatch
â”‚   â”œâ”€â”€ ui/
â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â”œâ”€â”€ UnifiedSituationMap.ts  # Integrated 2D/3D map controller & GIS toolbar
â”‚   â”‚   â”‚   â”œâ”€â”€ TacticalGlobe3D.ts      # Flat WebGL 3D Globe with layer/optic sync
â”‚   â”‚   â”‚   â”œâ”€â”€ LandslideMap.ts         # 2D Leaflet geospatial map engine
â”‚   â”‚   â”‚   â”œâ”€â”€ DistrictHud.ts          # Executive risk telemetry HUD
â”‚   â”‚   â”‚   â”œâ”€â”€ AlertTicker.ts          # Dark command alert marquee
â”‚   â”‚   â”‚   â”œâ”€â”€ CitizenView.ts          # Public emergency warning view (EN/HI)
â”‚   â”‚   â”‚   â”œâ”€â”€ HighwayNavigationModal.ts # Highway corridor evacuation planner
â”‚   â”‚   â”‚   â””â”€â”€ sensor-optics.ts        # FLIR, NVG, CRT, Noir optical shaders
â”‚   â”‚   â””â”€â”€ LandslideDashboard.ts       # Master dashboard orchestrator
â”œâ”€â”€ index.html                    # Single Page Application entry
â”œâ”€â”€ netlify.toml                  # Netlify deployment configuration
â””â”€â”€ vite.config.ts                # Optimized Vite bundler configuration
```

---

## ðŸš€ Getting Started Locally

### Prerequisites
* **Node.js**: v18.0 or higher (v20+ recommended)
* **npm**: v9.0 or higher

### Installation & Run
```bash
# 1. Clone the repository
git clone https://github.com/YuvrajBundela29/NextSignal-SIH26001.git
cd NextSignal-SIH26001

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Visit **`http://localhost:3000`** in your browser.

---

## ðŸŒ Deploy to Netlify

This project is pre-configured with [`netlify.toml`](./netlify.toml) for 1-click zero-config deployment:

1. Connect your GitHub repository to [Netlify](https://app.netlify.com/).
2. Set the build settings:
   * **Build Command:** `npm run build`
   * **Publish Directory:** `dist`
3. Click **Deploy Site** â€” your live dashboard will be active in seconds!

---

## ðŸ‘¥ Contributors & SIH Team
* **Project Name:** NextSignal
* **Problem Statement:** SIH 26001
* **Lead Developer:** Yuvraj Singh Bundela

---

## Attribution & Originality Disclosure

This project was developed for **Smart India Hackathon 2024 — Problem Statement SIH 26001**
("AI-Based Early Warning and Landslide Risk Monitoring System in NER"),
sponsored by the Ministry of Development of North Eastern Region (MDoNER),
theme: Disaster Management.

### Base Infrastructure (Forked & Heavily Adapted)

The dashboard shell — Vite/TypeScript build tooling, CSS layout primitives (dark tactical theme,
sidebar/tab layout), Leaflet 2D map container, and Globe.gl 3D WebGL wrapper — was
adapted from an existing AGPL-3.0 licensed open-source geospatial dashboard project (WorldMonitor / NextSignal by Elie Habib),
originally released under the **GNU Affero General Public License v3.0 (AGPL-3.0)**.

Original license: AGPL-3.0 (upstream repo is private/commercial; URL unverified at time of submission)

### Original Work Built on Top (100% New for SIH 26001)

All of the following were written from scratch for this submission and contain no code
from the original project:

| Module | Description |
|---|---|
| src/services/landslide/ | Entire geohazard intelligence stack (24 files) |
| src/services/landslide/risk-engine.ts | 5-factor weighted geotechnical composite score |
| src/services/landslide/ner-districts.ts | 28-district NER GIS database with slope/elevation/multilingual data |
| src/services/landslide/coolr-dataset.ts | 10 curated NASA COOLR / GSI historical NER landslide events |
| src/services/landslide/backtest-validator.ts | Historical backtest — detection rate validation against COOLR events |
| src/services/landslide/usgs-seismic.ts | Live USGS FDSN earthquake ingestion for NER bounding box |
| src/services/landslide/open-meteo.ts | Live Open-Meteo precipitation / soil moisture ingestion |
| src/services/landslide/ndrf-dispatch.ts | Structured decision-support dispatch recommendations |
| src/services/landslide/river-gauges.ts | High-altitude GLOF river basin monitoring |
| src/services/landslide/highway-corridors.ts | 8 arterial NER mountain corridor vulnerability profiles |
| src/ui/components/DistrictHud.ts | Executive geotechnical telemetry HUD |
| src/ui/components/BacktestPanel.ts | Historical validation chart & precision report |
| src/ui/components/CitizenView.ts | Multi-lingual citizen early warning view (8 NER languages) |
| src/ui/LandslideDashboard.ts | Master dashboard orchestrator (rewritten from ground up) |

### License Compliance Note

The AGPL-3.0 license requires derivative works to be released under the same license.
This repository **complies** with AGPL-3.0: the source code is publicly available at
https://github.com/YuvrajBundela29/NextSignal-SIH26001 and this attribution is provided.
The original AGPL-3.0 license text is preserved in the LICENSE file.
