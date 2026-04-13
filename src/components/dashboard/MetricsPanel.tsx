import { Metrics } from '@/lib/simulator';
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Area, AreaChart
} from 'recharts';
import { useMemo } from 'react';

interface MetricsPanelProps {
  metricsHistory: Metrics[];
  currentMetrics: Metrics | null;
}

interface MetricCardProps {
  label: string;
  value: string;
  unit?: string;
  status: 'healthy' | 'warning' | 'critical';
  sparkData?: number[];
}

function MetricCard({ label, value, unit, status, sparkData }: MetricCardProps) {
  const statusClasses = {
    healthy: 'border-primary/30 glow-box-green',
    warning: 'border-warning/30 glow-box-amber',
    critical: 'border-critical/30 glow-box-red',
  };
  const valueClasses = {
    healthy: 'text-primary glow-green',
    warning: 'text-warning glow-amber',
    critical: 'text-critical glow-red',
  };
  const sparkColor = {
    healthy: 'hsl(150, 100%, 45%)',
    warning: 'hsl(35, 100%, 55%)',
    critical: 'hsl(0, 85%, 55%)',
  };

  return (
    <div className={`rounded-md border bg-card p-3 ${statusClasses[status]} transition-all duration-500`}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      <div className={`text-xl font-bold font-mono ${valueClasses[status]} transition-colors duration-500`}>
        {value}
        {unit && <span className="text-xs ml-0.5 opacity-70">{unit}</span>}
      </div>
      {sparkData && sparkData.length > 1 && (
        <div className="mt-2 h-8">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData.map((v, i) => ({ v, i }))}>
              <defs>
                <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={sparkColor[status]} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={sparkColor[status]} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke={sparkColor[status]} strokeWidth={1.5} fill={`url(#grad-${label})`} dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

function getStatus(value: number, warnThreshold: number, critThreshold: number, invert = false): 'healthy' | 'warning' | 'critical' {
  if (invert) {
    if (value < critThreshold) return 'critical';
    if (value < warnThreshold) return 'warning';
    return 'healthy';
  }
  if (value > critThreshold) return 'critical';
  if (value > warnThreshold) return 'warning';
  return 'healthy';
}

export default function MetricsPanel({ metricsHistory, currentMetrics }: MetricsPanelProps) {
  const m = currentMetrics;
  if (!m) return null;

  const extract = (key: keyof Metrics) => metricsHistory.map(h => h[key] as number);

  const cards: MetricCardProps[] = [
    { label: 'CPU', value: m.cpu.toFixed(1), unit: '%', status: getStatus(m.cpu, 70, 85), sparkData: extract('cpu') },
    { label: 'Memory', value: m.memory.toFixed(1), unit: '%', status: getStatus(m.memory, 75, 90), sparkData: extract('memory') },
    { label: 'Disk', value: m.diskUsage.toFixed(1), unit: '%', status: getStatus(m.diskUsage, 80, 92), sparkData: extract('diskUsage') },
    { label: 'Error Rate', value: m.errorRate.toFixed(2), unit: '%', status: getStatus(m.errorRate, 2, 5), sparkData: extract('errorRate') },
    { label: 'Avg Response', value: m.avgResponseTime.toFixed(0), unit: 'ms', status: getStatus(m.avgResponseTime, 500, 2000), sparkData: extract('avgResponseTime') },
    { label: 'Req/sec', value: m.requestsPerSec.toFixed(0), status: getStatus(m.requestsPerSec, 5000, 10000), sparkData: extract('requestsPerSec') },
    { label: 'DB Pool', value: `${m.dbPoolUsed}/${m.dbPoolMax}`, status: getStatus(m.dbPoolUsed / m.dbPoolMax * 100, 75, 90), sparkData: extract('dbPoolUsed') },
    { label: 'Cache Hit', value: m.cacheHitRate.toFixed(1), unit: '%', status: getStatus(m.cacheHitRate, 70, 40, true), sparkData: extract('cacheHitRate') },
    { label: 'Orders/min', value: m.ordersPerMin.toFixed(0), status: getStatus(m.ordersPerMin, 20, 10, true), sparkData: extract('ordersPerMin') },
    { label: 'P99 Latency', value: m.p99Latency.toFixed(0), unit: 'ms', status: getStatus(m.p99Latency, 500, 2000), sparkData: extract('p99Latency') },
    { label: 'Heap', value: `${(m.heapUsed / 1024).toFixed(1)}`, unit: 'GB', status: getStatus(m.heapUsed / m.heapTotal * 100, 75, 90), sparkData: extract('heapUsed') },
    { label: 'GC Pause', value: m.gcPauseMs.toFixed(0), unit: 'ms', status: getStatus(m.gcPauseMs, 100, 300), sparkData: extract('gcPauseMs') },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
      {cards.map(card => (
        <MetricCard key={card.label} {...card} />
      ))}
    </div>
  );
}
