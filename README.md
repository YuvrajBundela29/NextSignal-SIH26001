# NextSignal - AI-Powered Geohazard & Landslide Early Warning System
### Smart India Hackathon 2026 (SIH 26001) - Northeast Region Disaster Intelligence Platform
**Organization:** Ministry of Development of North Eastern Region (MDoNER)  
**Theme:** Disaster Management | **Category:** Software | **Team:** The Innovators  
**Live Production URL:** [https://next-signal.netlify.app](https://next-signal.netlify.app)

---

## Executive Summary & Two-Way Intelligence Architecture

The **Northeast Region of India (NER)** represents one of the world's most vulnerable mountainous terrains to rainfall-triggered landslides, seismic slope destabilization, and Glacial Lake Outburst Floods (GLOF).

**NextSignal** transforms geohazard risk management into a **Two-Way Disaster Intelligence Network**:
1. **Machine & Sensor Intelligence -> Government -> Citizens:** AI fuses multi-source geophysical telemetry (rainfall, DEM slope, root-zone soil moisture, USGS seismic shaking, and NASA historical landslide catalog) to forecast district-level risk across all 8 NER states.
2. **Citizen & Field Officials -> Ground Evidence -> Government -> Response:** Community members and field officials submit geo-tagged photo/video reports of road cracks, slope movement, and debris, providing ground truth for authority verification and emergency response prioritisation.

```
EXTERNAL TELEMETRY (Open-Meteo, USGS, DEM, Soil, COOLR)
                    |
                    v
    NexSignal 5-Factor Risk Engine
                    |
                    v
        +-----------+-----------+
        |                       |
        v                       v
[ GOVERNMENT / ADMIN ]    [ CITIZEN PORTAL ]
- 28 NER Districts HUD    - Location-Aware Safety
- 2D GIS & 3D Globe       - GPS / District Selector
- Highway Corridors       - 24h Rain & Hazard Triggers
- Evacuation Shelters     - 8 NER Languages
- Ground Report Review    - [REPORT A HAZARD]
        ^                       |
        |                       v
        +-- Geo-tagged Evidence +
            (Photos, Coordinates, Category, Status)
```

---

## Key System Capabilities

### 1. Dual-Role Experience (Zero-Auth Prototype UX)
* **Intro Cinematic Bootloader:** 2.5-second geospatial radar and contour boot sequence simulating sensor telemetry fusion.
* **Role Selection Gateway:** Direct entry into either **Government / Admin Portal** (regional operational decision support) or **Citizen Portal** (local-area safety & field reporting) without passwords or OTPs.
* **Instant Role Switcher:** Quick header toggle allowing hackathon evaluators to seamlessly switch between Government and Citizen perspectives during live demonstrations.

### 2. Government / Admin Portal (Regional Command & Control)
* **28 Northeast Districts HUD:** Real-time risk decomposition scores (R_composite from 0 to 100) categorized into Low, Moderate, High, and Critical.
* **2D Tactical GIS Map (Leaflet):** High-density vector visualization with live district risk pins, thermal heat gradient zones, seismic epicenter rings, NASA historical landslide coordinates, critical highway corridors (NH-10, NH-29, NH-102, NH-208), safe shelters, and geo-tagged citizen report pins.
* **3D WebGL Earth Globe (Three.js / Globe.gl):** Interactive planetary sphere with topographic elevation relief, atmospheric lighting, and high-zoom crystal-clear raster basemaps.
* **Decision-Support Dispatch Guidance:** Generates actionable deployment parameters (NDRF/SDRF battalion assignment, helipad staging coordinates, required personnel count) without claiming autonomous physical dispatch.
* **GLOF & River Basin Telemetry:** Real-time gauge monitoring for Brahmaputra, Teesta, and Subansiri river basins.

### 3. Citizen Portal (Localized Safety & Field Hazard Reporting)
* **Location-Aware Context:** Prominently answers *"Is my area safe right now?"* using browser GPS auto-detection with an intuitive fallback dropdown for all 8 NER states and 28 districts.
* **Local Hazard & Weather Metrics:** Live 24h rainfall, slope gradient, soil moisture, and active alert banners.
* **8-Language Multilingual Localization:** Instant translation across English, Hindi (हिन्दी), Bengali (বাংলা), Assamese (অসমীয়া), Manipuri (মৈতৈলোন্ / Meitei), Mizo (Mizo tawng), Bodo (बड़ो), and Khasi (Ka Ktien Khasi).
* **Safe Evacuation Locator:** Displays nearest verified shelter locations with distance and capacity.

### 4. Citizen Ground-Reporting & Administrative Verification Pipeline
* **[REPORT A HAZARD] Modal:** Citizen upload flow supporting photo evidence (preset demonstration samples or direct camera/file uploads), GPS geotagging, date/time stamp, description, and 6 hazard categories:
  * *Slope Movement / Slump*
  * *Ground / Tension Crack*
  * *Road Damage / Subsidence*
  * *Rockfall Debris*
  * *Blocked Highway*
  * *Culvert Overflow / Mudflow*
* **Real-Time Map & Panel Reflection:** Submitted reports immediately register as glowing pins on the Admin GIS map and populate the **Reports** management panel.
* **Operational Verification Workflow:** Government authorities can inspect evidence and transition report statuses:
  Pending -> Under Review -> Verified -> Escalated to SDRF -> Resolved / Rejected

---

## 5-Factor Geotechnical Risk Decomposition Algorithm

Every monitored district is continuously evaluated across 5 weighted geophysical variables:

Composite Risk = 0.30 * R_rain + 0.25 * S_slope + 0.20 * M_soil + 0.15 * E_quake + 0.10 * H_coolr

1. **Antecedent Rainfall (R_rain, 30%):** Open-Meteo API live 24h/72h cumulative precipitation vs. empirical threshold I_crit.
2. **Slope Topography (S_slope, 25%):** Digital Elevation Model (DEM) slope gradient steepness.
3. **Root-Zone Soil Saturation (M_soil, 20%):** Volumetric soil moisture percentage (0-100%) and pore-water pressure.
4. **Seismic Shaking & PGA (E_quake, 15%):** Live USGS earthquake telemetry, epicentral distance, and Peak Ground Acceleration.
5. **NASA COOLR Historical Catalog (H_coolr, 10%):** Historical landslide occurrence density index.

---

## SIH 26001 Requirement Traceability Matrix

| # | Official SIH 26001 Requirement | Implementation in NextSignal | Status |
|---|---|---|---|
| 1 | **Rainfall Patterns** | Live Open-Meteo API 24h precipitation & 72h antecedent rainfall tracking across 28 NER districts | **BUILT** |
| 2 | **Soil Moisture Sensor Data** | Volumetric soil saturation (0-100%) integrated into 5-factor risk decomposition equation | **BUILT** |
| 3 | **Satellite Imagery Feeds** | ESRI World Imagery, Sentinel NDVI infrared layers, and Land Surface Temp (LST) raster toggles | **BUILT** |
| 4 | **Terrain / Slope Data** | Digital Elevation Model (DEM) slope steepness and topographic contour overlays in 2D & 3D | **BUILT** |
| 5 | **Historical Landslide Records** | NASA Cooperative Open Online Landslide Repository (COOLR) records mapped across NER | **BUILT** |
| 6 | **AI/ML Risk Zone Identification** | Multi-factor weighted geotechnical formula decomposed into Low, Moderate, High, Critical risk tiers | **BUILT** |
| 7 | **Landslide Event Prediction** | Dynamic rainfall intensity-duration threshold exceedance modeling (I_crit) | **BUILT** |
| 8 | **Real-Time Alerts** | Audio siren synthesizers, top alert ticker, and browser Notification API triggers | **BUILT** |
| 9 | **GIS Mapping of Roads, Villages, Infrastructure** | GeoJSON overlays of critical highway corridors (NH-10, NH-29, NH-102), bridges, and shelters | **BUILT** |
| 10 | **Citizen & Field Geo-Tagged Photos/Videos** | GroundReportModal capturing photos, GPS coordinates, timestamps, and hazard classifications | **BUILT** |
| 11 | **Dashboard for Severity, Connectivity, Response** | Dedicated Admin Portal with risk HUD, highway blockages, shelters, and NDRF dispatch guidance | **BUILT** |
| 12 | **Multilingual Notifications** | Full i18n support across all 8 NER official languages (English, Hindi, Bengali, Assamese, Manipuri, Mizo, Bodo, Khasi) | **BUILT** |
| 13 | **Low-Network / Offline Capability** | LocalStorage state persistence and client-side cached fallback datasets | **BUILT** |
| 14 | **Mobile / Web Field Reporting** | Responsive, touch-optimized Citizen view and hazard reporting modal | **BUILT** |
| 15 | **IMD Weather API Integration** | Live Open-Meteo weather endpoint integration with pluggable IMD REST interface adapter | **BUILT** |
| 16 | **Automated Warning Dispatch** | Client-side dispatch template generator for NDMA/SDMA emergency broadcast | **BUILT** |
| 17 | **Physical IoT In-situ Sensors (Piezometers)** | Synthetic sensor feeds demonstrated in prototype; hardware ingestion pipeline architected | **ROADMAP** |
| 18 | **Automated Multi-Carrier SMS Gateway (C-DAC/CAP)** | Integration-ready webhook schema for Indian Common Alerting Protocol (CAP) gateway | **ROADMAP** |
| 19 | **Automated Edge Satellite InSAR Processing** | Pre-computed InSAR deformation maps shown; real-time automated cloud pipeline planned | **ROADMAP** |
| 20 | **P2P LoRa Mesh Offline Relay Network** | Client-side offline cache built; physical LoRa hardware mesh bridge in engineering roadmap | **ROADMAP** |

---

## Live Judge Demonstration Script (2-Minute Flow)

1. **Cinematic Boot (3s):** Open [https://next-signal.netlify.app](https://next-signal.netlify.app). Observe the radar sweep and topographic telemetry boot sequence.
2. **Role Selection (5s):** Click **"GOVERNMENT / ADMIN"** on the role selection card.
3. **Regional Risk Command (30s):**
   * Review the **28 NER Districts HUD** (e.g. Mangan / North Sikkim at High/Critical risk).
   * Toggle between **2D GIS Tactical Map** and **3D WebGL Globe**.
   * Switch map layers (Topographic Relief, Infrared Heat hotspots, Safe Shelters, Highway Corridors).
   * Open the **Reports** tab to inspect existing field reports from North Sikkim and Noney.
4. **Switch to Citizen Portal (20s):**
   * Click **"📱 Citizen Portal"** in the top header.
   * Select a district (e.g., *East Khasi Hills, Meghalaya* or *North Sikkim*).
   * Switch language to **Assamese (অসমীয়া)**, **Mizo (Mizo tawng)**, or **Khasi (Ka Ktien Khasi)** to demonstrate localized community warning cards.
5. **Report a Ground Hazard (30s):**
   * Click the prominent **"🚨 REPORT A HAZARD"** button.
   * Select a demo preset (e.g., *Slope Movement / Slump* in Chungthang).
   * Click **"Submit Geotagged Report"** -> Observe instant confirmation and unique Report ID (e.g., `NS-1048`).
6. **Government Verification Workflow (25s):**
   * Click **"🏛️ Govt / Admin"** in the top header.
   * Note the newly submitted report glowing as a red hazard pin on the 2D GIS Map.
   * Open the **Reports** tab, click **Review**, and click **[ Verify Report ]** or **[ Escalate to SDRF ]**.
   * Highlight the two-way intelligence synergy: *AI predicts emerging vulnerability; citizens and field officials confirm real-world ground conditions.*

---

## Technical Stack & Architecture

* **Frontend Framework:** Vanilla TypeScript 5.8 with Vite 5.4 (Zero heavy component libraries, ultra-fast render speed).
* **2D Mapping Engine:** Leaflet 1.9.4 with custom SVG canvas overlays and OpenStreetMap / CartoDB / ESRI raster tiles.
* **3D Planetary Engine:** Three.js r128 + Globe.gl WebGL canvas with custom camera tweening and orbital controls.
* **Audio Synthesis:** Web Audio API oscillator bank generating realistic 440Hz-880Hz disaster siren alerts.
* **Live Telemetry:**
  * Weather: Open-Meteo REST API (Live precipitation, temperature, wind).
  * Seismic: USGS Earthquake Hazards Program GeoJSON feed (M2.5+ events).
  * Historical: NASA COOLR Global Landslide Catalog.
* **Build & Deployment:** Netlify automated CI/CD pipeline.

---

## Attribution & License

* **Base Framework:** Derived from the open-source [WorldMonitor](https://github.com/koala73/worldmonitor) global intelligence dashboard (MIT License, Copyright (c) 2025 koala73).
* **SIH 26001 Original Code:** All geotechnical risk algorithms, 28 NER district dataset, 8-language localization, Citizen Ground-Reporting pipeline, Highway corridor vulnerability, and NDRF decision support modules were custom engineered for the Smart India Hackathon 2026.
* **License:** [MIT License](LICENSE)
