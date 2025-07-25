import type { Track } from "~/types";
import { getTrackMetrics } from "~/lib/utils/geo/calculations/calculate-track-metrics";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "./ui/sheet";
import { StatsGrid } from "./stats-grid";
import { ElevationChart } from "./elevation-chart";
import { SpeedChart } from "./speed-chart";

type SelectedTrackSheetProps = {
  selectedTrack: Track | null;
  onClose: () => void;
};

export const SelectedTrackSheet = ({
  selectedTrack,
  onClose,
}: SelectedTrackSheetProps) => {
  const metrics = selectedTrack ? getTrackMetrics(selectedTrack) : null;

  return (
    <Sheet
      open={!!selectedTrack}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <SheetContent
        className="p-4 overflow-auto"
        side="left"
        showOverlay={false}
      >
        {!!selectedTrack && metrics && (
          <div className="max-w-full">
            <SheetTitle className="text-base">
              {selectedTrack.filename}
            </SheetTitle>
            <SheetDescription className="text-muted-foreground text-sm">
              {selectedTrack.time?.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              at{" "}
              {selectedTrack.time?.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: false,
              })}
            </SheetDescription>

            <StatsGrid
              items={[
                {
                  label: "Distance",
                  value: `${metrics.distance.kilometers.toFixed(2)}km`,
                },
                {
                  label: "Pace",
                  value: metrics.formattedPace,
                },
                {
                  label: "Time",
                  value: metrics.formattedDuration,
                },
                {
                  label: "Discovered",
                  value: metrics.formattedDiscoveredArea,
                },
                {
                  label: "Avg speed",
                  value: metrics.formattedAvgSpeed,
                },
                {
                  label: "Max speed",
                  value: metrics.formattedMaxSpeed,
                },
                {
                  label: "Min ASML",
                  value: metrics.formattedSmoothedMinAsml,
                },
                {
                  label: "Max ASML",
                  value: metrics.formattedSmoothedMaxAsml,
                },
                {
                  label: "ASML gain",
                  value: metrics.formattedSmoothedAsmlGain,
                },
                {
                  label: "ASML loss",
                  value: metrics.formattedSmoothedAsmlLoss,
                },
              ]}
            />
            <ElevationChart className="mt-10" track={selectedTrack} />
            <SpeedChart className="mt-10" track={selectedTrack} />
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
