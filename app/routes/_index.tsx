import { use, useEffect, useMemo, useRef, useState } from "react";
import { MainMenubar } from "~/components/main-menubar";
import Map, { mapStyles, type FogStyle, type MapStyle } from "~/components/map";
import { SelectFilesDialog } from "~/components/select-files-dialog";
import { SelectedTrackSheet } from "~/components/selected-track-sheet";
import { parseActivityFiles } from "~/lib/utils/parsers/unified-parser";
import type { Track } from "~/types";

export function meta() {
  return [
    { title: "Fog of Walk" },
    { name: "description", content: "Multiple fit/gpx files visualizer" },
  ];
}

export default function Home() {
  const [parsedTracks, setParsedTracks] = useState<Track[]>([]);
  const [fogOpacity, setFogOpacity] = useState(0.5);
  const [mapStyle, setMapStyle] = useState<MapStyle>("light");
  const [mapStyleOld, setMapStyleOld] = useState<MapStyle>("light");
  const [fogStyle, setFogStyle] = useState<FogStyle>("inverted");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const selectedTrack = useMemo(() => {
    return parsedTracks.find((track) => track.id === selectedTrackId) || null;
  }, [parsedTracks, selectedTrackId]);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      try {
        console.log(`Processing ${target.files.length} files...`);
        const newTracks = await parseActivityFiles(target.files);
        console.log(`Successfully parsed ${newTracks.length} tracks`);
        setParsedTracks((prevTracks) => [...prevTracks, ...newTracks]);
      } catch (error) {
        console.error("Error parsing files:", error);
      } finally {
        target.value = "";
      }
    }
  };

  const handleSelectFilesClick = () => {
    fileInputRef.current?.click();
  };

  const handleClearTracksClick = () => {
    setParsedTracks([]);
    setSelectedTrackId(null);
  };

  useEffect(() => {
    if (mapStyle === "satelite") {
      setFogStyle("classic");
    } else if (mapStyleOld === "satelite") {
      setFogStyle("inverted");
    }
    setMapStyleOld(mapStyle);
  }, [mapStyle]);

  return (
    <>
      <input
        multiple
        type="file"
        accept=".fit,.gpx,.kml,application/gpx+xml,application/octet-stream,application/vnd.google-earth.kml+xml"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <SelectFilesDialog
        isOpen={parsedTracks.length === 0}
        onSelectFilesCLick={handleSelectFilesClick}
      />

      <div className="relative flex w-full">
        <SelectedTrackSheet
          selectedTrack={selectedTrack}
          onClose={() => setSelectedTrackId(null)}
        />
        <main className="relative h-screen flex-grow flex pointer-events-auto">
          <div className="z-0 w-full">
            <Map
              style={mapStyle}
              tracks={parsedTracks}
              selectedTrack={selectedTrack}
              fogOpacity={fogOpacity}
              fogStyle={fogStyle}
              onTrackClick={(track) => setSelectedTrackId(track.id || null)}
              onMapClick={() => setSelectedTrackId(null)}
            />
          </div>
          <MainMenubar
            fogOpacity={fogOpacity}
            mapStyle={mapStyle}
            fogStyle={fogStyle}
            setFogOpacity={setFogOpacity}
            setMapStyle={setMapStyle}
            setFogStyle={setFogStyle}
            onSelectFilesClick={handleSelectFilesClick}
            onClearTracksClick={handleClearTracksClick}
          />
        </main>
      </div>
    </>
  );
}
