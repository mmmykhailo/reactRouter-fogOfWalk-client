import type { Map } from "leaflet";
import { useEffect } from "react";
import type { Track } from "~/types";

export function useTracksFitBounds(tracks: Array<Track>, map: Map | null) {
  useEffect(() => {
    if (tracks.length === 0 || !map) {
      return;
    }

    const bounds: [number, number][] = [];
    tracks.forEach((track) => {
      track.points.forEach((point) => {
        bounds.push([point.lat, point.lon]);
      });
    });

    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [tracks, map]);
}
