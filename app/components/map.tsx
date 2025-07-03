import { MapContainer, Polyline, TileLayer } from "react-leaflet";
import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import type { Map as MapType } from "leaflet";
import type { Track } from "~/types";
import { Fog } from "./fog";
import { ViewportTracker } from "./viewport-tracker";
import { useTileManager } from "~/hooks/use-tile-manager";
import { useTracksFitBounds } from "~/hooks/use-tracks-fit-bounds";
import { calculateCenter } from "~/lib/utils/geo/calculations/calculate-center";
import type { ViewportBounds } from "~/lib/utils/map/tile-system";
import { OptimizedPolyline } from "./optimised-polyline";
import { getDistanceFilteredTracks } from "~/lib/utils/geo/processing/distance-track-filtering";
import { deduplicateByTilesMap } from "~/lib/utils/geo/processing/track-deduplication";
import type { Polyline as PolylineType } from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapProps = {
  tracks: Array<Track>;
  selectedTrack: Track | null;
  fogOpacity?: number;
  style?: MapStyle;
  fogStyle?: FogStyle;
  onTrackClick?: (targetTrack: Track) => void;
  onMapClick?: () => void;
};

export const mapStyles = ["satelite", "light", "color"] as const;

export type MapStyle = (typeof mapStyles)[number];

export const fogStyles = ["classic", "inverted"] as const;

export type FogStyle = (typeof fogStyles)[number];

const mapUrls: Record<MapStyle, string> = {
  color:
    "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
  satelite:
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  light: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
};

const Map = ({
  tracks,
  selectedTrack,
  fogOpacity,
  style = "light",
  fogStyle = "inverted",
  onTrackClick,
  onMapClick,
}: MapProps) => {
  const [currentZoom, setCurrentZoom] = useState(13);
  const mapRef = useRef<MapType>(null);
  const selectedTrackPathRef = useRef<PolylineType>(null);

  useTracksFitBounds(tracks, mapRef.current);

  const distanceFilteredTracks = useMemo(() => {
    const filteredTracks = getDistanceFilteredTracks(tracks, currentZoom);
    return deduplicateByTilesMap(filteredTracks, 50);
  }, [currentZoom, tracks]);

  const dedupedTracks = useMemo(() => {
    return deduplicateByTilesMap(distanceFilteredTracks, 70);
  }, [distanceFilteredTracks]);

  const position = useMemo(() => calculateCenter(tracks), [tracks]);

  useEffect(() => {
    const path = selectedTrackPathRef.current;
    if (path) {
      setTimeout(() => path.bringToFront(), 0);
    }
  }, [selectedTrack, currentZoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleMapClick = () => {
      // Only trigger map click if no track was clicked
      // stopPropagination didn't work, so I decided to leave it like this
      if (!trackClickedRef.current) {
        onMapClick?.();
      }
    };

    map.on("click", handleMapClick);

    return () => {
      map.off("click", handleMapClick);
    };
  }, [onMapClick]);

  const { updateVisibleTiles, getVisiblePoints, visibleTileCount } =
    useTileManager(dedupedTracks);

  const handleViewportChange = useCallback(
    (bounds: ViewportBounds) => {
      updateVisibleTiles(bounds);
      setCurrentZoom(bounds.zoom);
    },
    [updateVisibleTiles]
  );

  const trackClickedRef = useRef(false);

  const handleTrackClick = useCallback(
    (track: Track) => {
      trackClickedRef.current = true;
      // Reset the flag after a short delay to allow map click to check it
      setTimeout(() => {
        trackClickedRef.current = false;
      }, 0);
      onTrackClick?.(track);
    },
    [onTrackClick]
  );

  const visiblePoints = getVisiblePoints(currentZoom);

  return (
    <MapContainer
      ref={mapRef}
      center={[position.lat, position.lng]}
      zoom={13}
      className="relative h-screen w-full"
      zoomControl={false}
    >
      <TileLayer
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url={mapUrls[style]}
      />

      <ViewportTracker onViewportChange={handleViewportChange} />

      {dedupedTracks.map((track, trackIndex) => {
        const visiblePointIndices = visiblePoints.get(trackIndex) || new Set();
        if (visiblePointIndices.size === 0) {
          return null;
        }

        return (
          <OptimizedPolyline
            key={trackIndex}
            muted={!!selectedTrack}
            track={track}
            visiblePointIndices={visiblePointIndices}
            onClick={() => handleTrackClick(track)}
          />
        );
      })}

      {!!selectedTrack && (
        <Polyline
          ref={selectedTrackPathRef}
          positions={selectedTrack.points.map((point) => [
            point.lat,
            point.lon,
          ])}
          className="z-100"
          pathOptions={{
            color: "red",
            weight: 3,
            opacity: 0.8,
          }}
          eventHandlers={{
            click: () => {
              trackClickedRef.current = true;
              setTimeout(() => {
                trackClickedRef.current = false;
              }, 0);
            },
          }}
        />
      )}

      <Fog
        fogOpacity={fogOpacity}
        tracks={dedupedTracks}
        visiblePointsMap={visiblePoints}
        currentZoom={currentZoom}
        tileUrl={mapUrls[style]}
        mapStyle={style}
        fogStyle={fogStyle}
      />

      <div
        style={{
          position: "absolute",
          left: 10,
          bottom: 10,
          background: "rgba(255,255,255,0.9)",
          padding: "10px",
          borderRadius: "5px",
          fontSize: "12px",
          zIndex: 1000,
        }}
      >
        Visible tiles: {visibleTileCount}
        <br />
        Zoom: {currentZoom.toFixed(1)}
        <br />
        Visible tracks: {visiblePoints.size}
        <br />
        Deduped points:{" "}
        {dedupedTracks.reduce((sum, track) => sum + track.points.length, 0)}
        <br />
        Rendered points:{" "}
        {[...visiblePoints.values()].reduce(
          (total, set) => total + set.size,
          0
        )}
      </div>
    </MapContainer>
  );
};

export default Map;
