import React from 'react';
import { Factory, Gauge, Megaphone, Wind, Thermometer, Droplets, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface AQIMeter {
  id: string;
  location: string;
  aqi: number;
  pm25: number;
  pm10: number;
  so2: number;
  no2: number;
  status: 'good' | 'moderate' | 'poor' | 'severe';
  lastUpdated: string;
}

const MOCK_AQI: AQIMeter[] = [
  { id: 'AQI-01', location: 'Sector 2 Smelter — Gate A', aqi: 87, pm25: 42, pm10: 68, so2: 12, no2: 28, status: 'moderate', lastUpdated: '2 min ago' },
  { id: 'AQI-02', location: 'Sector 4 Industrial Plant — Main Gate', aqi: 156, pm25: 89, pm10: 112, so2: 34, no2: 56, status: 'poor', lastUpdated: '1 min ago' },
  { id: 'AQI-03', location: 'Sector 7 Refinery — South Gate', aqi: 198, pm25: 112, pm10: 145, so2: 48, no2: 67, status: 'severe', lastUpdated: '3 min ago' },
  { id: 'AQI-04', location: 'Sector 1 Chemical Depot — Entry', aqi: 54, pm25: 22, pm10: 41, so2: 8, no2: 18, status: 'good', lastUpdated: '5 min ago' },
  { id: 'AQI-05', location: 'Sector 5 Power Station — West Gate', aqi: 124, pm25: 67, pm10: 89, so2: 25, no2: 42, status: 'poor', lastUpdated: '1 min ago' },
];

const AWARENESS_METRICS = [
  { label: 'Industries with AQI meters installed', value: 42, total: 68, color: '#22c55e' },
  { label: 'Compliance rate (weekly avg)', value: 78, total: 100, color: '#3b82f6' },
  { label: 'Awareness workshops conducted', value: 156, total: 200, color: '#f59e0b' },
  { label: 'Penalty notices issued this month', value: 34, total: 50, color: '#ef4444' },
];

const COMPLIANCE_DATA = [
  { day: 'Mon', compliant: 12, nonCompliant: 3 },
  { day: 'Tue', compliant: 14, nonCompliant: 2 },
  { day: 'Wed', compliant: 11, nonCompliant: 5 },
  { day: 'Thu', compliant: 15, nonCompliant: 1 },
  { day: 'Fri', compliant: 13, nonCompliant: 3 },
  { day: 'Sat', compliant: 10, nonCompliant: 4 },
  { day: 'Sun', compliant: 8, nonCompliant: 2 },
];

const SECTOR_PIE = [
  { name: 'Compliant', value: 78, color: 'hsl(var(--primary))' },
  { name: 'Non-Compliant', value: 22, color: 'hsl(var(--destructive))' },
];

const getAQIColor = (status: string) => {
  switch (status) {
    case 'good': return 'text-primary bg-primary/10 border-primary/30';
    case 'moderate': return 'text-warning bg-warning/10 border-warning/30';
    case 'poor': return 'text-destructive bg-destructive/10 border-destructive/30';
    case 'severe': return 'text-destructive bg-destructive/20 border-destructive/50';
    default: return 'text-muted-foreground bg-muted border-border';
  }
};

const AQIGauge: React.FC<{ value: number; status: string }> = ({ value, status }) => {
  const pct = Math.min(value, 300) / 3;
  const barColor = status === 'good' ? 'bg-primary' : status === 'moderate' ? 'bg-warning' : 'bg-destructive';
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-lg font-semibold">{value}</span>
        <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded border ${getAQIColor(status)}`}>{status}</span>
      </div>
      <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
        <div className={`h-full rounded-full ${barColor} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-[8px] text-muted-foreground mt-0.5">
        <span>0</span>
        <span>150</span>
        <span>300+</span>
      </div>
    </div>
  );
};

const IndustrialAQIPanel: React.FC = () => {
  return (
    <div className="flex flex-col gap-4">
      {/* AQI Meters */}
      <div className="rounded-md border border-border bg-card/40 p-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-medium uppercase tracking-wider">Industrial Gate AQI Monitors</span>
          </div>
          <Badge variant="secondary" className="text-[9px] h-5">5 Active</Badge>
        </div>
        <div className="space-y-3">
          {MOCK_AQI.map((meter) => (
            <div key={meter.id} className="rounded border border-border/50 bg-card/40 p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Factory className="w-3 h-3 text-muted-foreground shrink-0" />
                  <span className="text-[10px] text-foreground truncate">{meter.location}</span>
                </div>
                <span className="text-[9px] text-muted-foreground shrink-0">{meter.lastUpdated}</span>
              </div>
              <AQIGauge value={meter.aqi} status={meter.status} />
              <div className="grid grid-cols-4 gap-1.5">
                <div className="text-center rounded bg-card/60 p-1">
                  <div className="text-[9px] text-muted-foreground">PM2.5</div>
                  <div className="text-[11px] font-medium">{meter.pm25}</div>
                </div>
                <div className="text-center rounded bg-card/60 p-1">
                  <div className="text-[9px] text-muted-foreground">PM10</div>
                  <div className="text-[11px] font-medium">{meter.pm10}</div>
                </div>
                <div className="text-center rounded bg-card/60 p-1">
                  <div className="text-[9px] text-muted-foreground">SO₂</div>
                  <div className="text-[11px] font-medium">{meter.so2}</div>
                </div>
                <div className="text-center rounded bg-card/60 p-1">
                  <div className="text-[9px] text-muted-foreground">NO₂</div>
                  <div className="text-[11px] font-medium">{meter.no2}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Awareness Metrics */}
      <div className="rounded-md border border-border bg-card/40 p-3 space-y-3">
        <div className="flex items-center gap-2">
          <Megaphone className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] font-medium uppercase tracking-wider">Awareness & Enforcement Index</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {AWARENESS_METRICS.map((m) => (
            <div key={m.label} className="rounded border border-border/50 bg-card/40 p-2.5">
              <div className="text-[9px] text-muted-foreground mb-1 leading-tight">{m.label}</div>
              <div className="flex items-end gap-1.5">
                <span className="text-lg font-semibold" style={{ color: m.color }}>{m.value}</span>
                <span className="text-[10px] text-muted-foreground mb-0.5">/ {m.total}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-muted mt-1 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(m.value / m.total) * 100}%`, backgroundColor: m.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compliance Chart */}
      <div className="rounded-md border border-border bg-card/40 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] font-medium uppercase tracking-wider">Weekly Compliance Trend</span>
        </div>
        <div className="h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={COMPLIANCE_DATA} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '11px' }}
                itemStyle={{ fontSize: '11px' }}
              />
              <Bar dataKey="compliant" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} maxBarSize={14} />
              <Bar dataKey="nonCompliant" fill="hsl(var(--destructive))" radius={[2, 2, 0, 0]} maxBarSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sector Compliance Pie */}
      <div className="rounded-md border border-border bg-card/40 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Factory className="w-3.5 h-3.5 text-primary" />
          <span className="text-[11px] font-medium uppercase tracking-wider">Sector-Wise Compliance</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-24 h-24 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SECTOR_PIE}
                  cx="50%"
                  cy="50%"
                  innerRadius={28}
                  outerRadius={40}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {SECTOR_PIE.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex-1 space-y-1.5">
            {SECTOR_PIE.map((entry) => (
              <div key={entry.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-[10px] text-foreground">{entry.name}</span>
                </div>
                <span className="text-[10px] font-medium">{entry.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndustrialAQIPanel;
