import type { Track } from "~/types";

export const calculateCenter = (tracks: Array<Track>) => {
  let totalLat = 0;
  let totalLng = 0;
  let pointCount = 0;

  tracks.forEach((track) => {
    track.points.forEach((point) => {
      totalLat += point.lat;
      totalLng += point.lon;
      pointCount++;
    });
  });

  if (pointCount === 0) {
    return { lat: 50.45, lng: 30.5233 }; // Default position (Kyiv)
  }

  return { lat: totalLat / pointCount, lng: totalLng / pointCount };
};
