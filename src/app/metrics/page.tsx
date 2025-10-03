
'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { type Alert } from '@/lib/types';
import { initialAlerts } from '@/lib/alerts-data';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { TACTIC_NAMES } from '@/lib/mitre-data';


const CHART_COLORS = {
  primary: 'hsl(var(--primary))',
  destructive: 'hsl(var(--destructive))',
  secondary: 'hsl(var(--secondary-foreground))',
  muted: 'hsl(var(--muted-foreground))',
};

const SEVERITY_COLORS = {
  Low: 'hsl(var(--chart-2))',
  Medium: 'hsl(var(--chart-4))',
  High: 'hsl(var(--chart-1))',
};

export default function MetricsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const eventSource = new EventSource('/api/alerts/stream');
    eventSource.onmessage = (event) => {
      const newAlert = JSON.parse(event.data);
      setAlerts((prevAlerts) => [newAlert, ...prevAlerts]);
    };
    eventSource.onerror = () => {
      eventSource.close();
    };
    return () => {
      eventSource.close();
    };
  }, []);

  const timeData = useMemo(() => {
    const data: { [key: string]: number } = {};
    alerts.forEach((alert) => {
      const hour = new Date(alert.time).toLocaleString(undefined, {
        hour: '2-digit',
        hour12: false,
        minute: '2-digit',
      });
      data[hour] = (data[hour] || 0) + 1;
    });
    return Object.entries(data)
      .map(([name, value]) => ({ name, alerts: value }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [alerts]);

  const tacticData = useMemo(() => {
    const data: { [key: string]: number } = {};
    alerts.forEach((alert) => {
      const tacticName = TACTIC_NAMES[alert.mitreTactic as keyof typeof TACTIC_NAMES] || alert.mitreTactic;
      data[tacticName] = (data[tacticName] || 0) + 1;
    });
    return Object.entries(data)
      .map(([name, value]) => ({ name, alerts: value }))
      .sort((a, b) => b.alerts - a.alerts);
  }, [alerts]);

  const hostData = useMemo(() => {
    const data: { [key: string]: number } = {};
    alerts.forEach((alert) => {
      data[alert.host] = (data[alert.host] || 0) + 1;
    });
    return Object.entries(data)
      .map(([name, value]) => ({ name, alerts: value }))
      .sort((a, b) => b.alerts - a.alerts)
      .slice(0, 10);
  }, [alerts]);

  const severityData = useMemo(() => {
    const data = { Low: 0, Medium: 0, High: 0 };
    alerts.forEach((alert) => {
      if (alert.score > 0.85) data.High++;
      else if (alert.score > 0.6) data.Medium++;
      else data.Low++;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [alerts]);
  
  if (!isClient) {
    return null; // Don't render charts on the server
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="grid gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Security Metrics</h1>
        <p className="text-muted-foreground">
          High-level overview of alert trends and patterns.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Alerts Over Time</CardTitle>
            <CardDescription>
              Frequency of alerts to identify activity spikes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[250px] w-full">
              <LineChart data={timeData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis />
                <Tooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Line
                  dataKey="alerts"
                  type="natural"
                  stroke={CHART_COLORS.primary}
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>MITRE ATT&amp;CK Tactic Breakdown</CardTitle>
            <CardDescription>
              Most common adversary tactics observed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[250px] w-full">
              <BarChart data={tacticData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={4}
                  className="text-xs"
                />
                <Tooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="alerts" fill={CHART_COLORS.primary} radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Alerted Hosts</CardTitle>
            <CardDescription>
              Machines generating the most security alerts.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={{}} className="h-[250px] w-full">
              <BarChart data={hostData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={4}
                  className="text-xs"
                />
                <Tooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="alerts" fill={CHART_COLORS.primary} radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alert Severity Distribution</CardTitle>
            <CardDescription>
              Distribution of alerts by calculated severity.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
             <ChartContainer config={{}} className="h-[200px] w-[200px]">
              <PieChart>
                <Tooltip content={<ChartTooltipContent hideLabel />} />
                <Pie data={severityData} dataKey="value" nameKey="name">
                  {severityData.map((entry) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={SEVERITY_COLORS[entry.name as keyof typeof SEVERITY_COLORS]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

