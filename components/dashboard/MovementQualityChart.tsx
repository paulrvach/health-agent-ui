"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartConfig } from "@/components/ui/chart";
import { useWorkout } from "@/context/WorkoutContext";
import { TrendingUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ChartBarMultiple } from "@/components/ui/chart-bar-multiple";
const chartConfig = {
  training_intensity: {
    label: "Training Intensity",
    color: "var(--chart-1)",
  },
  recovery_time: {
    label: "Recovery Time",
    color: "var(--chart-2)",
  },
  confidence: {
    label: "Injury Risk",
    color: "var(--destructive)",
  },
  label: {
    color: "var(--background)",
  },
} satisfies ChartConfig;

export function MovementQualityChart() {
  const { movementQuality } = useWorkout();
  const [timeRange, setTimeRange] = React.useState("7d");
  const [mounted] = React.useState(() => typeof window !== 'undefined');

  React.useEffect(() => {
    console.log('[MovementQualityChart] Raw data:', movementQuality.length, 'entries')
    console.log('[MovementQualityChart] Sample data:', movementQuality.slice(0, 3))
  }, [movementQuality])

  // Get days based on time range
  const getDays = () => {
    switch (timeRange) {
      case "7d":
        return 7;
      case "14d":
        return 14;
      case "30d":
        return 30;
      default:
        return 14;
    }
  };

  const days = getDays();

  // Get last N days of data (only on client to avoid hydration issues)
  const chartData = React.useMemo(() => {
    if (!mounted) return []
    return movementQuality.slice(-days).map((mq) => ({
      date: new Date(mq.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      training_intensity: parseFloat((mq.training_intensity * 100).toFixed(1)),
      recovery_time: mq.recovery_time,
      confidence: parseFloat((mq.confidence * 100).toFixed(1)),
    }))
  }, [mounted, movementQuality, days])

  React.useEffect(() => {
    if (mounted && chartData.length > 0) {
      console.log('[MovementQualityChart] Chart data:', chartData.length, 'points')
      console.log('[MovementQualityChart] Sample chart data:', chartData.slice(0, 3))
    }
  }, [mounted, chartData])

  // Calculate trend (only on client)
  const calculateTrend = () => {
    if (!mounted || movementQuality.length < 7) return "0";

    const recent = movementQuality.slice(-7);
    const previous = movementQuality.slice(-14, -7);

    const recentAvg =
      recent.reduce(
        (acc, mq) => acc + (mq.training_intensity + mq.confidence) / 2,
        0
      ) / recent.length;

    const previousAvg =
      previous.reduce(
        (acc, mq) => acc + (mq.training_intensity + mq.confidence) / 2,
        0
      ) / previous.length;

    return (((recentAvg - previousAvg) / previousAvg) * 100).toFixed(1);
  };

  const trend = calculateTrend();

  return (
    <Card className="@container/card">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <CardTitle>Training & Recovery Metrics</CardTitle>
            <CardDescription>
              <span className="hidden @[540px]/card:inline">
                Tracking training intensity, recovery time, and injury risk over the last{" "}
                {days} days
              </span>
              <span className="@[540px]/card:hidden">Last {days} days</span>
            </CardDescription>
          </div>
          <div className="flex-shrink-0">
            <ToggleGroup
              type="single"
              value={timeRange}
              onValueChange={(value) => value && setTimeRange(value)}
              variant="outline"
              className="hidden @[767px]/card:flex"
            >
              <ToggleGroupItem value="7d" className="px-3">
                7d
              </ToggleGroupItem>
              <ToggleGroupItem value="14d" className="px-3">
                14d
              </ToggleGroupItem>
              <ToggleGroupItem value="30d" className="px-3">
                30d
              </ToggleGroupItem>
            </ToggleGroup>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger
                className="w-[100px] @[767px]/card:hidden"
                aria-label="Select time range"
              >
                <SelectValue placeholder="Last 7 days" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="7d" className="rounded-lg">
                  Last 7 days
                </SelectItem>
                <SelectItem value="14d" className="rounded-lg">
                  Last 14 days
                </SelectItem>
                <SelectItem value="30d" className="rounded-lg">
                  Last 30 days
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartBarMultiple
          data={chartData}
          config={chartConfig}
          xAxisKey="date"
          bars={[
            { dataKey: "training_intensity", fill: "var(--color-training_intensity)" },
            { dataKey: "recovery_time", fill: "var(--color-recovery_time)" },
            { dataKey: "confidence", fill: "var(--color-confidence)" },
          ]}
        />
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 leading-none font-medium">
          {parseFloat(trend) >= 0 ? "Trending up" : "Trending down"} by{" "}
          {Math.abs(parseFloat(trend))}% this week{" "}
          <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Training intensity and injury risk metrics over the last {days} days
        </div>
      </CardFooter>
    </Card>
  );
}
