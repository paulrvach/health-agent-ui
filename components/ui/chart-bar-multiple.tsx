"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

interface ChartBarMultipleProps {
  data: any[]
  config: ChartConfig
  xAxisKey: string
  bars: Array<{ dataKey: string; fill: string }>
}

export function ChartBarMultiple({ data, config, xAxisKey, bars }: ChartBarMultipleProps) {
  return (
    <ChartContainer config={config} className="h-[250px] w-full">
      <BarChart 
        accessibilityLayer 
        data={data}
        margin={{ left: 0, right: 0, top: 10, bottom: 0 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey={xAxisKey}
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value}
          interval={0}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="dashed" />}
        />
        {bars.map((bar) => (
          <Bar key={bar.dataKey} dataKey={bar.dataKey} fill={bar.fill} radius={4} />
        ))}
      </BarChart>
    </ChartContainer>
  )
}
