# World Monitor: Indian Context OS Roadmap & Architecture

This document serves as the central hub for all architectural changes, executed integrations, and the long-term roadmap tailored for deploying World Monitor as a comprehensive Geopolitical Intelligence OS within the Indian theater.

---

## 1. Strategic Direction & Product Identity
Our objective involves evolving World Monitor from an open civic data visualization tool into a serious **Strategic Geopolitical OS & National Infrastructure Monitor**. 

This transition relies heavily upon:
* **Data Integrity**: Replacing western aggregators with high-fidelity, sovereign data sources (e.g., CPCB APIs, ISRO datasets, OGD India, JNPT port statistics).
* **Real-time Architecture**: Moving from bulky client-side parsing to a mature backend pipeline (Websockets, Redis caching, Node.js gateways).
* **Modular Decoupling**: Abstracting hardcoded regional boundaries, geopolitics, and news APIs into a dynamic `Context Engine` capable of loading distinct geopolitical profiles.

---

## 2. Phase 1 Executions: Context Engine Architecture

### 2.1. The Context Engine Upgrade
To avoid long-term tech debt and geopolitical compliance issues on global app stores (Apple/Google), we deliberately replaced hardcoded boundary tweaks with a modular `Context Engine`. 

The core application now natively supports dynamic context injection:
```ts
// Loading the Indian Profile injects specific sovereign geometry and feeds
loadContext("india"); 
```
* **Geometry**: Replaces the UN Carto basemap with official Survey of India boundary parameters.
* **Label Overrides**: Intercepts MapLibre vector text-fields at runtime, rewriting "Azad Kashmir" to "Pakistan Occupied Kashmir (PoK)" and "Zangnan" to "Arunachal Pradesh" without corrupting the underlying dataset.

### 2.2. Advanced Geocoder Abstraction
Native OSM search routing struggles with Tier-2 and Tier-3 Indian localization. We mapped an `IndiaGeocoder` interface that delegates searches directly to the **MapmyIndia (Mappls)** or **Ola Maps Geocoding APIs**, allowing precise pinpointing of regional landmarks and postal codes.

### 2.3. Domestic News & Intelligence Adapter
Instead of hard-parsing generic global RSS feeds, we implemented a unified `NewsAdapter` factory. Live feed injections are actively sourced from premier domestic entities:
* **News Agencies**: PTI (Press Trust of India) and ANI endpoints.
* **Finance**: LiveMint, Business Standard.
* **Geopolitics**: The Hindu, Indian Express.
* **Think Tanks**: The architecture now natively supports ingesting publication metadata from the Observer Research Foundation (ORF) and Manohar Parrikar Institute for Defence Studies and Analyses (MP-IDSA). Future iterations will introduce local LLM-assisted NLP sentiment scoring mapping directly onto target geographic sectors.

### 2.4. Environmental Risk Modeling & NDMA Integrations
* **Indian AQI Polygons**: Replaced manual city polling with bulk CPCB API fetching. AQI data now scales dynamically via `ScatterplotLayer` rendering, allowing clear heatmap visualization across the subcontinent.
* **UNCLOS Maritime Sovereignty**: We generated a transparent geometric representation of India's robust 2.02 million sq km **Exclusive Economic Zone (EEZ)** tracing the 200 nautical mile ocean boundaries, rendering via Deck.gl `GeoJsonLayers`.

### 2.5. Economic Machinery & Strategic POIs
Instead of displaying global stock indices exclusively, the Map layers are refactored for Indian Economic Indicators:
* The **Bombay Stock Exchange (BSE)** at Dalal Street has been hardcoded alongside the NSE.
* Strategic mapping instances now identify critical technical infrastructure: **ISRO launchpad facilities**, **DRDO Headquarters**, and primary shipping chokepoints/ports including **Jawaharlal Nehru Port Trust (JNPT)** and Mundra.

### 2.6. Dashboard Panel Customization for Indian Context
The Context Engine now supports **panel-level overrides** for a fully localized dashboard experience:
* **Live Webcams**: When the India context is active, the default webcam grid displays four Indian strategic cities — **New Delhi** (India Gate), **Mumbai** (Gateway of India), **Varanasi** (Ganges Ghats), and **Kolkata** (Howrah Bridge) — instead of the default global conflict feeds. A new **"South Asia"** region filter in the toolbar allows users to browse all Indian webcam streams.
* **Panel Name Overrides**: The "Asia-Pacific" panel is relabelled to "India & South Asia" under the India context, reflecting the shifted intelligence focus.
* **Map Layer Auto-Enable**: AQI heatmap stations and the 200nm EEZ boundary overlay are automatically enabled when the India context loads, without requiring manual layer toggles.
* **Think Tank Feeds**: The Think Tanks panel injects feeds from **ORF**, **MP-IDSA**, **Carnegie India**, **Takshashila Institution**, and **CSIS India** alongside global think tank sources.
* **Energy Feeds**: The Energy panel sources from India-specific providers: **ONGC**, **NTPC**, **PowerGrid**, **IOCL**, **NPCIL** nuclear, and India renewables (solar, green hydrogen, IREDA).
* **India News Feeds**: The Asia-Pacific panel injects **NDTV**, **India Today**, **Scroll.in**, **The Wire**, and **Firstpost** as primary sources, with BBC Asia and Reuters South Asia as global fallbacks.

### 2.7. India Boundary Instant Render
The 10MB Survey of India sovereign boundary GeoJSON is **pre-fetched at module load** rather than lazy-loaded on first render. This resolves the visible flicker between the base map tiles loading (with UN disputed borders) and the Indian sovereign overlay painting. The boundary now renders simultaneously with the first map frame.

---

## 3. The 12-Month Execution Roadmap

### Q2: Maritime & NLP Intelligence Integration
* **Maritime Live AIS Architecture**: We will ingest high-volume Live AIS (VesselFinder/AISStream) datasets and visualize shipping density across the Indian Ocean Region (IOR) using DeckGL `GPUGridLayers` to avoid client-side memory exhaustion.
* **NLP Intelligence Tagging**: Automating topic classification (LAC, IOR, BRICS, Quad) from our Think Tank feeds, plotting these insights conditionally over geographic trigger regions.
* **Supply Chain Analytics**: Integrating monthly import/export open APIs from the Ministry of Commerce to track trade flows, semiconductor dependence, and critical mineral restrictions.

### Q3: Heavy Infrastructure & Conflict Tracking
* **Power Grid Tracking**: Mapping the domestic transmission corridors (POSOCO), BharatNet fiber deployments, and critical submarine cable landing sites.
* **ISRO Satellite Tracking**: A live TLE tracking overlay using Celestrak to monitor active satellite passes alongside the launch timeline.
* **UCDP Localized Conflict Filtering**: Tailoring conflict mapping exclusively to South Asian regional disturbances, border skirmishes, and Line of Actual Control (LAC/LoC) escalations overlaying historical timeline progression.

### Q4: AI Predictive Analytics & Hardened Architecture
* **Historical Playback / Replay Mode**: Enabling longitudinal timeline scrolling for past political crises.
* **AI Anomaly Detection**: Real-time correlation between Indian stock market flash-crashes, regional NDMA disaster alerts, and localized social-unrest protest clusters.
* **Mobile / Dedicated Operations Terminal Optimization**.

---

## 4. Compliance & Risk Mitigation Addendum
To maneuver the sensitive domain of international border data safely:
* Keep disputed lines as "claimed by" language when toggling out of the core Indian Context Mode.
* Avoid publishing restricted national defense or nuclear coordinates not currently available on open-access platforms (Native OSM).
* The contextual scaling ensures the architecture can effortlessly spin up localized `neutral`, `global`, or parallel geopolitical instances moving forward without requiring deep logic rewrites.
