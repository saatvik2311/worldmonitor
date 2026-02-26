# Indian Context Roadmap & Additions

This document serves as the central hub for all modifications, fixes, and planned feature integrations tailored specifically to the geopolitical, demographic, and informational context of India within the World Monitor application.

---

## 1. Modifications & Fixes Implemented

### 1.1. Sovereignty Map Geometry
The default UN/Carto map geometry depicts the borders of India with dashed "disputed" lines masking regions like Pakistan Occupied Kashmir (PoK), Aksai Chin, and Arunachal Pradesh. 
* **Fix**: Implemented a top-level `GeoJsonLayer` using the official Survey of India geographic coordinate boundaries. 
* **Fix**: Muted MapLibre's internal `admin_level` layers and native `disputed` boundary lines via `hideDisputedMapboxBorders()` to provide a clean, unified presentation.

### 1.2. Map Label Engine Overrides
The base vector tiles intrinsically label regions under Chinese or Pakistani vernacular.
* **Fix**: Implemented a dynamic style interception hook (`renameDisputedMapboxLabels()`) that natively rewrites MapLibre `text-field` properties on the client side without breaking the original Carto `{name_en}` string interpolation mappings.
* **Result**: "Azad Kashmir" reads as "Pakistan Occupied Kashmir (PoK)", "Zangnan" reads as "Arunachal Pradesh", etc.

### 1.3. Naming Context Reference
For a comprehensive breakdown of the historical terminology mapped out in our spatial label interceptor, refer to the local taxonomy document:
👉 [Indian Placenames Context](./indian-placenames-context.md)

---

## 2. Proposed Feature Additions (Indian Context)

To decrease reliance on Western news aggregators and focus on authentic domestic reporting and data analysis, the following technical integrations are proposed for the World Monitor system:

### 2.1. Domestic News & RSS Integrations
Instead of piping generic world news, we can ingest real-time RSS feeds from premier Indian journalism and news agency sources into the map's chronological ticker:
* **Press Trust of India (PTI)**: The premier domestic news agency.
* **Asian News International (ANI)**: For video and breaking political multimedia.
* **The Hindu & Hindustan Times**: High-quality geopolitical and domestic reporting feeds.

### 2.2. Indian Think-Tank Geopolitical Feeds
Plugging into leading strategic research platforms opens avenues for mapping deep-dive analytical metrics rather than just breaking news:
* **Observer Research Foundation (ORF)**: One of India's leading think tanks emphasizing foreign policy, diplomacy, and global strategy. We can ingest their publications via feed XMLs.
* **MP-IDSA (Manohar Parrikar Institute for Defence Studies and Analyses)**: Top-tier military, strategic, and border geopolitical research.
* **Centre for Policy Research (CPR)**: Regional socio-economic strategy insights.

### 2.3. Data.gov.in (OGD Platform) & NDMA Live Data APIs
India's Open Government Data (OGD) Platform offers thousands of open REST APIs. We can natively graph:
* **Live Environmental Metrics**: Real-time Air Quality Index (AQI) from the Central Pollution Control Board (CPCB) mapped onto major cities using `ScatterplotLayers`.
* **Disaster Management Alerts**: Integrate the **SACHET National Disaster Alert Portal API** via CAP XML feeds. This system pushes out localized alerts from the National Disaster Management Authority (NDMA) to map exact regions affected by cyclones, monsoons, and droughts.

### 2.4. Indian Financial Markets (BSE/NSE)
Instead of global indices, prioritize India's economic performance on the dashboard:
* **Stock Market APIs**: Utilize platforms like the `IndianAPI.in` REST service or `Breeze Trading API` to pull live NIFTY 50 and Sensex tickers.
* **Financial News**: Anchor the "Business News" section to the `LiveMint API` or `NewsData.io India Business API` instead of generic western Bloomberg feeds.

### 2.5. Real-time Global Flight & Shipping Trackers
To enhance the global monitoring aspect, we can expand from delayed flights to a fully live, sortable global transportation net:
* **Global Flight tracking**: Integrate with the **Aviationstack API** or **AirLabs Flight Radar API** to stream live ADS-B coordinate feeds globally.
   * *Feature*: Add a UI filter panel to sort arrays by `departure_airport` or `destination_airport` (focusing heavily on routing out of BOM/DEL/BLR hubs).
* **Live Maritime & Shipping (AIS) tracking**: Integrate with **VesselFinder AIS API** or **AISStream.io** (free websocket) to plot live maritime global traffic across the oceans.
   * *Feature*: Render different classes of vessels (tankers, cargo, military transit) dynamically on a new `DeckGL` layer.

### 2.6. India's UN-Standard Maritime Boundaries (UNCLOS)
The current UN Carto maps often fail to adequately visualize the total reach of India's sea control. To remedy this, we can draw data from the UN Convention on the Law of the Sea (UNCLOS) datasets:
* **Exclusive Economic Zone (EEZ)**: India commands over 2.02 million sq km of EEZ. We can fetch and draw a transparent `GeoJson Polygon Layer` that outlines the 200 nautical mile boundary tracing India's coastline. 
* **Territorial Waters**: Plot the 12 nautical mile sovereign sea region boundary.

### 2.7. Economic Indicators (Factories, Trade, & Services)
To provide deep insights into India's internal economic engines, we can integrate the dashboard widgets with macro-economic REST APIs:
* **Factories & Manufacturing**: Integrate datasets from the **Ministry of Statistics and Programme Implementation (MoSPI)** to track the Index of Industrial Production (IIP).
* **Trade & Export**: Hook into the Open Government Data (OGD) platform or Ministry of Commerce APIs to populate the "Trade Policy" and "Supply Chain" widgets with India's monthly export/import data.
* **Services Sector**: Integrate the core Indian PMI (Purchasing Managers' Index) services data into the broader Economic Indicators panel.

### 2.8. Advanced Map Search & Geocoding (Tier 2/3 Cities)
The native Mapbox/OSM geocoder occasionally fails to locate specific Tier-2 and Tier-3 Indian cities (e.g., Dehradun) or misinterprets Indian address formatting.
* **Solution**: Replace the native map search bar with the **MapmyIndia (Mappls) Geocoding API** or the **Ola Maps Geocoding API**. These domestic APIs are hyper-specialized for pinpointing Indian house numbers, landmarks, pin-codes, and sub-districts with high precision.

### 2.9. Expanding Map POIs (Points of Interest)
* The map currently plots the National Stock Exchange (NSE) and Reserve Bank of India (RBI) via local configs (e.g., `src/config/finance-geo.ts`).
* **Addition**: We will manually inject the **Bombay Stock Exchange (BSE)** at Dalal Street, Mumbai, ensuring it renders alongside the NSE.
* **Addition**: Expand the local database to map India's vital infrastructure: ISRO launchpads, DRDO headquarters, and strategic maritime ports (JNPT, Mundra, Cochin).

### 2.10. Dashboard Widget Overhaul for India
The overarching World Monitor UI grid can be heavily localized for the Indian theater:
* **Live Webcams**: Render feeds from major Indian highways, metropolitan intersections (Mumbai/Delhi traffic cameras), or key landmarks.
* **Country Instability / Conflict**: Filter the UCDP event overlays to focus specifically on South Asian localized tensions, border skirmishes (LAC/LoC), or regional disturbances.
* **Infrastructure Cascade**: Map India's optical fiber network (BharatNet), major coastal Adani/Government ports, and the national power grid using `GeoJson` LineString layers.
* **Climate Anomalies & Fires**: Directly tap into the Indian Meteorological Department (IMD) to display heatwave warnings, drought indices, and monsoon progression.
