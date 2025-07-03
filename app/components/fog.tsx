import { Pane, useMap } from "react-leaflet";
import * as d3 from "d3";
import L from "leaflet";
import { useEffect, useRef } from "react";
import type { Track } from "~/types";
import { discoveryRadiusMeters } from "~/lib/constants";

const buffer = 2000;

interface FogOfWarProps {
  tracks: Array<Track>;
  visiblePointsMap: Map<number, Set<number>>;
  currentZoom: number;
  fogOpacity?: number;
  tileUrl: string;
  mapStyle?: string;
  fogStyle?: string;
}

export const Fog = ({
  tracks,
  visiblePointsMap,
  currentZoom,
  fogOpacity,
  tileUrl,
  mapStyle,
  fogStyle = "inverted",
}: FogOfWarProps) => {
  const map = useMap();
  const invertedLayerRef = useRef<L.TileLayer | null>(null);

  useEffect(() => {
    console.log('Fog effect initialized with style:', fogStyle);
    if (mapStyle === "satelite" || fogStyle !== "inverted") {
      // If the map style is satelite, we don't need the inverted layer
      return;
    }

    // Create a new pane for the inverted map layer
    map.createPane("invertedPane");
    const invertedPane = map.getPanes().invertedPane;

    // Add the inverted tile layer to the map
    invertedLayerRef.current = L.tileLayer(tileUrl, {
      pane: "invertedPane",
    }).addTo(map);

    // Apply the inversion filter and a clip-path to the pane
    d3.select(invertedPane)
      .style("filter", "invert(100%)")
      .style("mix-blend-mode", "overlay")
      .style("clip-path", "url(#fog-clip-path)");

    return () => {
      if (invertedLayerRef.current) {
        invertedLayerRef.current.remove();
      }
      if (map.getPane("invertedPane")) {
        map.getPane("invertedPane")!.remove();
      }
    };
  }, [map, tileUrl, mapStyle, fogStyle]);

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

      const mask = container.append("mask").attr("id", "fog-mask");

      mask
        .append("rect")
        .attr("x", fogX)
        .attr("y", fogY)
        .attr("width", fogWidth)
        .attr("height", fogHeight)
        .attr("fill", "white");

      // Only process tracks that have visible points
      tracks.forEach((track, trackIndex) => {
        const trackVisiblePoints = visiblePointsMap.get(trackIndex);
        if (
          !trackVisiblePoints ||
          trackVisiblePoints.size === 0 ||
          track.points.length === 0
        ) {
          return;
        }

        const firstPoint = track.points[0];
        const latlng = new L.LatLng(firstPoint.lat, firstPoint.lon);
        const offsetLatLng = L.latLng(firstPoint.lat + 0.001, firstPoint.lon);
        const radiusPixels = Math.max(
          2,
          map
            .latLngToLayerPoint(latlng)
            .distanceTo(map.latLngToLayerPoint(offsetLatLng)) *
            (discoveryRadiusMeters / latlng.distanceTo(offsetLatLng))
        );

        const visibleIndices = Array.from(trackVisiblePoints).sort(
          (a, b) => a - b
        );
        if (visibleIndices.length === 0) {
          return;
        }

        const minIndex = Math.max(0, Math.min(...visibleIndices) - 3);
        const maxIndex = Math.min(
          track.points.length - 1,
          Math.max(...visibleIndices) + 3
        );

        // Create optimized path with only visible + context points
        const visiblePoints: Array<{
          lat: number;
          lng: number;
          index: number;
        }> = [];
        for (let i = minIndex; i <= maxIndex; i++) {
          const point = track.points[i];
          if (point) {
            visiblePoints.push({ lat: point.lat, lng: point.lon, index: i });
          }
        }

        if (visiblePoints.length < 2) return;

        const pathData = visiblePoints
          .map((point, index) => {
            const layerPoint = map.latLngToLayerPoint(
              new L.LatLng(point.lat, point.lng)
            );
            return `${index === 0 ? "M" : "L"} ${layerPoint.x} ${layerPoint.y}`;
          })
          .join(" ");

        if (pathData && visiblePoints.length > 1) {
          mask
            .append("path")
            .attr("d", pathData)
            .attr("stroke", "black")
            .attr("stroke-width", radiusPixels * 2)
            .attr("stroke-linecap", "round")
            .attr("stroke-linejoin", "round")
            .attr("fill", "none");
        }

        // Add circles at key points (fewer circles at lower zoom)
        const circleStep = Math.max(1, Math.floor(12 - currentZoom));
        visiblePoints.forEach((point, index) => {
          if (index % circleStep === 0) {
            const layerPoint = map.latLngToLayerPoint(
              new L.LatLng(point.lat, point.lng)
            );
            mask
              .append("circle")
              .attr("cx", layerPoint.x)
              .attr("cy", layerPoint.y)
              .attr("r", radiusPixels)
              .attr("fill", "black");
          }
        });
      });

      // Add the fog overlay
      container
        .append("rect")
        .attr("x", fogX)
        .attr("y", fogY)
        .attr("width", fogWidth)
        .attr("height", fogHeight)
        .attr("fill", `rgba(0,0,0,${fogOpacity ?? 0.8})`)
        .attr("mask", "url(#fog-mask)");
    };

    renderFog();
    map.on("zoomend moveend", renderFog);

    return () => {
      map.off("zoomend moveend", renderFog);
      svg.remove();
    };
  }, [map, tracks, visiblePointsMap, currentZoom, fogOpacity, fogStyle]);

  return <Pane name="fogPane" />;
};
