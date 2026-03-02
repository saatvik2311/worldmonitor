# Global Features Changelog

This document tracks major features and enhancements added to World Monitor that apply globally, rather than being specific to the Indian Context.

## March 2026

### 🗺️ Enhanced Basemap System
* **Feature**: Replaced the static CARTO vector map with a dynamic, multi-style basemap switcher.
* **Styles Added**:
  * **Satellite**: High-resolution real-world imagery (via Esri World Imagery).
  * **Hybrid**: Satellite imagery overlaid with administrative boundaries and city labels.
  * **Terrain**: Topographical and physical geography maps showing elevation and land features (via OpenTopoMap).
  * **Dark / Light**: Kept the existing sleek vector styles for high-contrast intelligence monitoring.
* **UI**: Added a floating, Google Maps-style layer picker in the bottom right corner with thumbnail previews for instant switching.
* **Tech**: All new map styles use free, public tile endpoints requiring no API keys (xyz raster layers via MapLibre GL). Deck.gl data overlays seamlessly render on top of all basemap styles.
