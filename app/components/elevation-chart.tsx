import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import type { Track } from "~/types";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "./ui/chart";
import { cn } from "~/lib/utils/ui/classnames";
import { haversineDistance } from "~/lib/utils/geo/calculations/haversine-distance";
import { removeOutliersAndSmooth } from "~/lib/utils/geo/processing/smooth-elevation";

type ElevationChartProps = {
  track: Track;
  className?: string;
};

const formatDistance = (distance: number): string => {
  if (distance < 1) {
    return `${Math.round(distance)}m`;
  }
  return `${(distance / 1000).toFixed(1)}km`;
};

const formatElevation = (elevation: number): string => {
  return `${Math.round(elevation)}m`;
};

export const ElevationChart: React.FC<ElevationChartProps> = ({
  track,
  className,
}) => {
  const chartData = React.useMemo(() => {
    if (!track.points || track.points.length === 0) {
      return [];
    }

    const rawData = [];
    let cumulativeDistance = 0;

    for (let i = 0; i < track.points.length; i++) {
      const point = track.points[i];

      if (i > 0) {
        const prevPoint = track.points[i - 1];
        const distance = haversineDistance(prevPoint, point);
        cumulativeDistance += distance;
      }

      if (point.asml !== undefined) {
        rawData.push({
          distance: cumulativeDistance,
          elevation: point.asml,
          index: i,
        });
      }
    }

    if (rawData.length === 0) {
      return [];
    }

    const elevations = rawData.map((d) => d.elevation);

    let smoothedElevations: number[];

    smoothedElevations = removeOutliersAndSmooth(elevations);

    return rawData.map((point, i) => ({
      ...point,
      smoothedElevation: smoothedElevations[i],
      originalElevation: point.elevation,
    }));
  }, [track.points]);

  const yAxisDomain = React.useMemo(() => {
    if (chartData.length === 0) {
      return undefined;
    }

    const elevations = chartData.map((d) => d.smoothedElevation);
    const minElevation = Math.min(...elevations);
    const maxElevation = Math.max(...elevations);

    return [minElevation - 100, maxElevation + 100];
  }, [chartData]);

  const chartConfig: ChartConfig = {
    elevation: {
      label: "Elevation",
      color: "hsl(var(--chart-1))",
    },
  };

  if (chartData.length === 0) {
    return (
      <div className={className}>
        <div className="text-center text-muted-foreground py-8">
          No elevation data available for this track
        </div>
      </div>
    );
  }

  return (
    <ChartContainer
      config={chartConfig}
      className={cn("h-64 w-full", className)}
    >
      <LineChart
        data={chartData}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 20,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="distance" tickFormatter={formatDistance} />
        <YAxis tickFormatter={formatElevation} domain={yAxisDomain} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={() => "Elevation"}
              formatter={(value) =>
                formatElevation(typeof value === "number" ? value : 0)
              }
            />
          }
        />
        <Line
          type="monotone"
          dataKey="smoothedElevation"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
        />
      </LineChart>
    </ChartContainer>
  );
};
