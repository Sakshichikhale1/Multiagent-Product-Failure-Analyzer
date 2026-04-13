import { Metrics } from '@/lib/simulator';
import {
  LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid,
} from 'recharts';

interface ChartsPanelProps {
  metricsHistory: Metrics[];
}

interface MiniChartProps {
  data: Array<Record<string, number>>;
  dataKey: string;
  title: string;
  color: string;
  unit?: string;
  domain?: [number, number];
}

function MiniChart({ data, dataKey, title, color, unit = '', domain }: MiniChartProps) {
  return (
    <div className="border border-border rounded-md bg-card p-3 glow-box-green">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">{title}</div>
      <div className="h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 30%, 18%)" strokeOpacity={0.3} />
            <XAxis hide />
            <YAxis
              width={35}
              tick={{ fontSize: 9, fill: 'hsl(220, 10%, 50%)' }}
              domain={domain}
              tickFormatter={(v) => `${v}${unit}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(220, 18%, 9%)',
                border: '1px solid hsl(150, 30%, 18%)',
                borderRadius: '4px',
                fontSize: '10px',
                fontFamily: 'JetBrains Mono',
                color: 'hsl(150, 80%, 75%)',
              }}
              formatter={(value: number) => [`${value.toFixed(1)}${unit}`, dataKey]}
              labelFormatter={() => ''}
            />
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function ChartsPanel({ metricsHistory }: ChartsPanelProps) {
  const data = metricsHistory.map((m, i) => ({
    i,
    cpu: +m.cpu.toFixed(1),
    memory: +m.memory.toFixed(1),
    errorRate: +m.errorRate.toFixed(2),
    avgResponse: +m.avgResponseTime.toFixed(0),
    cacheHit: +m.cacheHitRate.toFixed(1),
    orders: +m.ordersPerMin.toFixed(0),
  }));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
      <MiniChart data={data} dataKey="cpu" title="CPU Usage" color="hsl(150, 100%, 45%)" unit="%" domain={[0, 100]} />
      <MiniChart data={data} dataKey="memory" title="Memory" color="hsl(200, 100%, 50%)" unit="%" domain={[0, 100]} />
      <MiniChart data={data} dataKey="errorRate" title="Error Rate" color="hsl(0, 85%, 55%)" unit="%" />
      <MiniChart data={data} dataKey="avgResponse" title="Avg Response Time" color="hsl(35, 100%, 55%)" unit="ms" />
      <MiniChart data={data} dataKey="cacheHit" title="Cache Hit Rate" color="hsl(280, 80%, 60%)" unit="%" domain={[0, 100]} />
      <MiniChart data={data} dataKey="orders" title="Orders / min" color="hsl(150, 100%, 45%)" />
    </div>
  );
}
