import { jsx, jsxs } from "react/jsx-runtime";
import { useMap, Pane, Polyline, MapContainer, TileLayer } from "react-leaflet";
import * as d3 from "d3";
import L from "leaflet";
import { useEffect, useState } from "react";
const buffer = 2e3;
const FogOfWar = ({ tracks }) => {
  const map = useMap();
  useEffect(() => {
    const svg = L.svg({ pane: "fogPane", padding: buffer }).addTo(map);
    const container = d3.select(map.getPanes().fogPane).select("svg");
    const renderFog = () => {
      container.selectAll("*").remove();
      const bounds = map.getBounds();
      const topLeft = map.latLngToLayerPoint(bounds.getNorthWest());
      const bottomRight = map.latLngToLayerPoint(bounds.getSouthEast());
      const width = bottomRight.x - topLeft.x;
      const height = bottomRight.y - topLeft.y;
      const fogX = topLeft.x - buffer;
      const fogY = topLeft.y - buffer;
      const fogWidth = width + 2 * buffer;
      const fogHeight = height + 2 * buffer;
      container.append("mask").attr("id", "fog-mask").append("rect").attr("x", fogX).attr("y", fogY).attr("width", fogWidth).attr("height", fogHeight).attr("fill", "white");
      tracks.forEach((track) => {
        track.points.forEach(([lat, lng]) => {
          const latlng = new L.LatLng(lat, lng);
          const point = map.latLngToLayerPoint(latlng);
          const radiusMeters = 100;
          const offsetLatLng = L.latLng(lat + 1e-3, lng);
          const radiusPixels = map.latLngToLayerPoint(latlng).distanceTo(map.latLngToLayerPoint(offsetLatLng)) * (radiusMeters / latlng.distanceTo(offsetLatLng));
          container.select("mask").append("circle").attr("cx", point.x).attr("cy", point.y).attr("r", radiusPixels).attr("fill", "black");
        });
      });
      container.append("rect").attr("x", fogX).attr("y", fogY).attr("width", fogWidth).attr("height", fogHeight).attr("fill", "rgba(0,0,0,0.8)").attr("filter", "blur(10px)").attr("mask", "url(#fog-mask)");
    };
    renderFog();
    map.on("zoomend moveend", renderFog);
    return () => {
      map.off("zoomend moveend", renderFog);
      svg.remove();
    };
  }, [map, tracks]);
  return /* @__PURE__ */ jsx(Pane, { name: "fogPane", style: { filter: "blur(10px)" } });
};
const metersToPixels = (meters, zoom, latitude) => {
  const earthCircumference = 40075016686e-3;
  const pixelsPerTile = 256;
  const tiles = Math.pow(2, zoom);
  const metersPerPixel = earthCircumference * Math.cos(latitude * Math.PI / 180) / (tiles * pixelsPerTile);
  return Math.min(meters / metersPerPixel, 20);
};
const defaultPolylineWeight = 8;
const DynamicPolyline = ({
  track,
  index
}) => {
  const map = useMap();
  const [weight, setWeight] = useState(defaultPolylineWeight);
  useEffect(() => {
    const updateWeight = () => {
      const zoom = map.getZoom();
      const center = map.getCenter();
      const pixelWeight = Math.min(
        metersToPixels(20, zoom, center.lat),
        defaultPolylineWeight
      );
      setWeight(pixelWeight);
    };
    updateWeight();
    map.on("zoomend moveend", updateWeight);
    return () => {
      map.off("zoomend moveend", updateWeight);
    };
  }, [map]);
  return /* @__PURE__ */ jsx(
    Polyline,
    {
      positions: track.points,
      pathOptions: {
        color: "#ff0f00",
        weight,
        opacity: 0.4,
        lineCap: "round",
        lineJoin: "round"
      }
    },
    `polyline-${index}`
  );
};
const Map = ({ tracks }) => {
  const position = { lat: 50.45, lng: 30.5233 };
  return /* @__PURE__ */ jsxs(
    MapContainer,
    {
      center: position,
      zoom: 13,
      className: "relative h-screen w-full z-0",
      children: [
        /* @__PURE__ */ jsx(
          TileLayer,
          {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          }
        ),
        tracks.map((track, trackIndex) => /* @__PURE__ */ jsx(DynamicPolyline, { track, index: trackIndex }, trackIndex)),
        /* @__PURE__ */ jsx(FogOfWar, { tracks })
      ]
    }
  );
};
export {
  Map as default
};
