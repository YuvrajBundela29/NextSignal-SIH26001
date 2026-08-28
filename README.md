# NextSignal SIH26001 — AI-Based Early Warning & Landslide Risk Monitoring System in North Eastern Region (NER), India

[![Smart India Hackathon 2024](https://img.shields.io/badge/SIH-2024%20Submission-blue?style=for-the-badge)](https://sih.gov.in)
[![Ministry](https://img.shields.io/badge/Ministry-MDoNER-darkgreen?style=for-the-badge)](https://mdoner.gov.in)
[![Theme](https://img.shields.io/badge/Theme-Disaster%20Management-red?style=for-the-badge)]()
[![Free APIs](https://img.shields.io/badge/APIs-100%25%20Free%20%26%20Keyless-teal?style=for-the-badge)]()

An end-to-end, multi-sensor, AI-powered landslide susceptibility and early-warning intelligence dashboard tailored specifically for the 8 North Eastern States of India (Assam, Meghalaya, Arunachal Pradesh, Nagaland, Manipur, Mizoram, Tripura, Sikkim).

---

## 📌 Problem Statement (SIH26001)

- **ID**: SIH26001
- **Title**: AI-Based Early Warning and Landslide Risk Monitoring System in North Eastern Region (NER), India
- **Organization**: Ministry of Development of North Eastern Region (MDoNER)
- **Category**: Software
- **Theme**: Disaster Management

The North Eastern Region (NER) of India accounts for over 50% of the country's landslide vulnerabilities due to fragile Himalayan geology, steep slopes, high seismic activity (Zones IV and V), and extreme monsoon precipitation. This project delivers an explainable, real-time early warning and decision-support system to empower State Disaster Management Authorities (SDMAs), NDRF, District Magistrates, and vulnerable citizens.

---

## 🚀 Key Features

### 1. Explainable Composite Landslide Risk Scoring Engine
The system calculates a continuous susceptibility score (0 to 100) per district using weighted geotechnical and meteorological parameters:
$$\text{Composite Score} = W_s \cdot S_{\text{slope}} + W_r \cdot S_{\text{rainfall}} + W_m \cdot S_{\text{soil}} + W_e \cdot S_{\text{seismic}} + W_h \cdot S_{\text{historical}}$$

- **Slope Angle & Terrain Ruggedness ($W_s = 0.25$)**: Topographical gradient analysis (>35° critical).
- **Precipitation Intensity & Antecedent Wetness ($W_r = 0.30$)**: 24h burst intensity (50%), 72h antecedent accumulation (35%), and next 24h IMD/Open-Meteo forecast (15%).
- **Root-Zone Soil Moisture Saturation ($W_m = 0.20$)**: NASA POWER root-zone wetness index.
- **Seismic Activity & Ground Shake Factor ($W_e = 0.15$)**: USGS real-time earthquakes in the Himalayan/NER bounding box (`21.5°-29.5°N, 88.0°-97.5°E`) with distance-magnitude attenuation.
- **Historical Event Density ($W_h = 0.10$)**: Clustering against historical disaster records from the NASA Global Landslide Catalog (COOLR) and Geological Survey of India (GSI).

### 2. 100% Free, Keyless Live Data Ingestion
- **Open-Meteo API**: Live hourly/daily precipitation, humidity, and temperature without API keys.
- **USGS Seismic Hazards API**: Automated 72h earthquake ingestion across the Eastern Himalayas.
- **NASA POWER API**: Agroclimatology root-zone soil wetness data.
- **NASA COOLR Catalog**: Integrated database of historical landslide disasters in Northeast India.
- **CartoDB Dark Matter / OpenStreetMap**: Lightweight, high-performance 2D mapping tiles via Leaflet.

### 3. Dual Persona Architecture
- **Authority / Analyst HUD**:
  - Full factor breakdown radar and contribution bars.
  - Live sensor telemetry (24h/72h rainfall, root-zone wetness, seismic shake factor).
  - DEOC contact directory and population exposure metrics.
  - Printable official **District Landslide Situation Report (PDF)**.
- **Citizen Safety Portal (English & हिन्दी)**:
  - High-contrast, low-bandwidth emergency status (SAFE / WATCH / DANGER).
  - Plain-language Do's and Don'ts for hillside residents.
  - 1-Tap Emergency Speed Dial for **NDRF (1078)**, **SDMA (1070)**, **National Emergency (112)**, and **Ambulance (108)**.

### 4. Local AI Disaster Advisory Engine (Ollama Integration)
- Ingests real-time multi-sensor telemetry to generate concise, professional situational reports and civil defense directives.
- Supports local quantized LLMs (`gemma:2b`, `llama3.2:3b`, `phi3:mini`) with instant deterministic rule-engine fallback.

### 5. Resilient Offline Demo Simulator (Live Presentation Safety)
- 1-click toggle between live API feeds and 3 pre-configured demo scenarios:
  1. **Monsoon Deluge Crisis**: High-intensity cloudbursts in Dima Hasao, Mangan, East Khasi Hills, and Noney.
  2. **Severe Seismic Trigger (Himalayan M5.8)**: Recent tectonic epicenter near Bomdila/Tawang triggering steep-slope shear alerts.
  3. **Normal Baseline**: Safe terrain conditions across all 8 NER states.

---

## 🛠️ Quick Start & Local Run

### Prerequisites
- **Node.js**: v20 or higher
- **npm**: v9 or higher

### Installation & Launch
```bash
# 1. Navigate to project root
cd NextSignal-SIH26001

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

The application will be running at **`http://localhost:3001/`** (or `http://localhost:5173/`).

---

## 🗺️ Monitored NER States & Key Districts

| State | Key Monitored Districts | High-Risk Corridors |
|---|---|---|
| **Assam** | Dima Hasao, Karbi Anglong, Kamrup Metro, Cachar | Haflong Railway, Guwahati Hills |
| **Meghalaya** | East Khasi Hills, SW Khasi Hills, Ri-Bhoi, West Garo Hills | Cherrapunji, Mawsynram, NH-6 |
| **Arunachal Pradesh** | Papum Pare, Tawang, West Kameng, East Siang, Dibang Valley | Bhalukpong-Bomdila, Trans-Arunachal Hwy |
| **Nagaland** | Kohima, Mokokchung, Phek | Dzükou Valley, NH-29 Paglapahar |
| **Manipur** | Noney, Kangpokpi, Tamenglong | Tupul Railway Zone, NH-2 Lifeline |
| **Mizoram** | Aizawl, Lunglei, Champhai | Hunthar Slope, Melthum Corridor |
| **Tripura** | Dhalai, North Tripura | Ambassa-Dharmanagar Ridge |
| **Sikkim** | Mangan, Gangtok, Namchi, Gyalshing | Chungthang, Teesta Valley NH-10 |

---

## 🏛️ Sponsoring Ministry & Hackathon Details

- **Ministry**: Ministry of Development of North Eastern Region (MDoNER), Government of India
- **Problem Statement ID**: SIH26001
- **Team**: NextSignal SIH Team
