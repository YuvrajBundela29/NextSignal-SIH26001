# ROADMAP.md — NextSignal SIH 26001

## Scalability: Beyond the Current NER District Set

The current deployment covers **28 high-risk districts across 8 NER states**. The architecture is designed to generalize to any Indian region:

### Grid-Based Generalization

| Input Layer | Current Source | Production Upgrade |
|---|---|---|
| Slope DEM | District-averaged constants (NER ground survey) | SRTM 30m / Bhuvan DEM API per 1km² cell |
| Rainfall 24h / 72h | Open-Meteo free API (0.25° grid) | IMD GRIDDED Rainfall real-time (~0.1° resolution) |
| Soil Moisture | NASA POWER 0.5° grid | ISRO-SAC RISAT-derived Soil Moisture Product |
| Seismic | USGS FDSN free API | NCS (National Centre for Seismology) real-time WebSocket |
| Historical Events | 10 COOLR + GSI events (2020–2024) | Full IMD LANDSLIDE ATLAS (5,000+ events since 1988) |

To extend to a new region: supply a bounding box + DEM raster + IMD station codes. The weighted risk engine runs entirely client-side or as a Cloudflare Worker — no infrastructure changes required.

---

## Phase 2 — Production Data Partnership (IMD / GSI / NDMA)

1. **IMD SIWAA Integration**: Subscribe to IMD's Storm and Weather Alert for Actionable Warnings API (planned public rollout) for sub-district rainfall nowcasts.
2. **GSI National Landslide Susceptibility Map Overlay**: Ingest the GSI 1:50,000 susceptibility GeoTIFF as a dynamic WMS layer to cross-validate model output with geological field survey data.
3. **NDMA IDRN Integration**: Pipe alert outputs into India's Integrated Disaster Resource Network for automatic DEOC dashboard propagation.

---

## Phase 3 — Next-Phase Features (12-Month)

| Feature | Description | Priority |
|---|---|---|
| **LISS-IV Satellite Change Detection** | Ingest ISRO Resourcesat-2A LISS-IV imagery for pre/post event slope-change detection | High |
| **InSAR Ground Deformation Feed** | Sentinel-1 coherence-map based slow-slip creep detection (72h latency) | High |
| **IoT Sensor Network Adapter** | Accept real-time slope inclinometer + piezometer readings from NDMA pilot IoT deployments in Sikkim / Manipur | Medium |
| **SMS Early Warning Broadcast** | Trigger NDMA Common Alerting Protocol (CAP) XML → BSNL Emergency SMS gateway when composite score exceeds configurable threshold | High |
| **Logistic Regression Cross-Check** | Pre-trained LR model (scikit-learn → ONNX → Wasm) as secondary score validator alongside the explainable rule-based primary | Medium |

---

## Impact Statement

- **Immediate**: Provides free, real-time risk situational awareness to 28 NER districts covering ~10 million people in seismically and meteorologically active terrain.
- **Short-term**: Enables DEOC/SDMA dispatchers to act on data-driven recommendations rather than reactive reports.
- **Long-term**: Framework generalizes to any Indian state; partnered with GSI / NDMA data, could serve as the national early warning backbone that currently does not exist at sub-district granularity.