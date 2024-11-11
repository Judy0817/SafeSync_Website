// src/leaflet-heat.d.ts
import * as L from "leaflet";

declare module "leaflet" {
  namespace leaflet {
    function heatLayer(
      latLngs: L.LatLng[] | L.LatLng[][],
      options?: L.HeatLayerOptions
    ): L.Layer;
  }

  interface HeatLayerOptions {
    radius?: number;
    blur?: number;
    maxZoom?: number;
  }
}
