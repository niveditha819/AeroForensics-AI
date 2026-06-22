import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  AlertTriangle,
  Radar,
  Wind,
  Thermometer,
  Activity,
  Send,
  FileText,
  Crosshair,
  Radio,
  Clock,
  MapPin,
  Eye,
  Zap,
  BarChart3,
  Archive,
  Search,
  X,
  Calendar,
  Filter,
  ChevronDown,
  ChevronUp,
  Bell,
  Car,
  Truck,
  Bus,
  Bike,
  CreditCard,
  ScanLine,
  Factory,
  Gauge,
  Megaphone,
  CheckCircle2,
  IndianRupee,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import VehicleEnforcementPanel from '@/components/VehicleEnforcementPanel';
import IndustrialAQIPanel from '@/components/IndustrialAQIPanel';
import PollutionSourceAttribution from '@/components/PollutionSourceAttribution';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */
interface SensorNode {
  id: string;
  x: number;
  y: number;
  label: string;
  status: 'normal' | 'warning' | 'critical';
}

interface TelemetryEntry {
  id: number;
  timestamp: string;
  sensor: string;
  reading: string;
  status: 'normal' | 'warning' | 'critical';
}

/* ------------------------------------------------------------------ */
/*  Mock Data                                                         */
/* ------------------------------------------------------------------ */
const SENSORS: SensorNode[] = [
  { id: 'S01', x: 18, y: 22, label: 'S01', status: 'normal' },
  { id: 'S02', x: 45, y: 35, label: 'S02', status: 'normal' },
  { id: 'S03', x: 72, y: 28, label: 'S03', status: 'normal' },
  { id: 'S04', x: 55, y: 60, label: 'S04', status: 'normal' },
  { id: 'S05', x: 30, y: 75, label: 'S05', status: 'normal' },
];

const FACTORY = { x: 75, y: 55, label: 'Sector 4 Plant' };

const TELEMETRY_FEED: TelemetryEntry[] = [
  { id: 1, timestamp: '14:32:01', sensor: 'S01', reading: 'PM2.5: 12 µg/m³', status: 'normal' },
  { id: 2, timestamp: '14:32:04', sensor: 'S02', reading: 'SO2: 8 ppb', status: 'normal' },
  { id: 3, timestamp: '14:32:07', sensor: 'S03', reading: 'NO2: 22 ppb', status: 'normal' },
  { id: 4, timestamp: '14:32:10', sensor: 'S04', reading: 'O3: 35 ppb', status: 'normal' },
  { id: 5, timestamp: '14:32:13', sensor: 'S05', reading: 'PM10: 18 µg/m³', status: 'normal' },
  { id: 6, timestamp: '14:32:16', sensor: 'S01', reading: 'CO: 0.4 ppm', status: 'normal' },
  { id: 7, timestamp: '14:32:19', sensor: 'S02', reading: 'PM2.5: 15 µg/m³', status: 'normal' },
  { id: 8, timestamp: '14:32:22', sensor: 'S03', reading: 'SO2: 9 ppb', status: 'normal' },
  { id: 9, timestamp: '14:32:25', sensor: 'S04', reading: 'NO2: 24 ppb', status: 'normal' },
  { id: 10, timestamp: '14:32:28', sensor: 'S05', reading: 'PM2.5: 11 µg/m³', status: 'normal' },
];

const TERMINAL_LINES = [
  'Correlating SO2 plumes with wind vector NW-280...',
  'Cross-referencing industrial registry...',
  'Eliminating false positives based on chemical fingerprint...',
  'Source matched: 94% confidence.',
];

/* ------------------------------------------------------------------ */
/*  Historical Anomaly Data                                           */
/* ------------------------------------------------------------------ */
interface HistoricalAnomaly {
  id: string;
  timestamp: string;
  date: string;
  sensorId: string;
  anomalyType: string;
  severity: 'critical' | 'warning';
  source: string;
  status: 'resolved' | 'pending';
  so2: number;
  pm25: number;
  nox: number;
  windDir: string;
  unitDispatched: string;
  eta: string;
  resolutionTime?: string;
}

const HISTORICAL_ANOMALIES: HistoricalAnomaly[] = [
  {
    id: 'ANM-2026-00142',
    timestamp: '2026-06-20 09:14:32',
    date: '2026-06-20',
    sensorId: 'S03',
    anomalyType: 'SO2 Plume Spike',
    severity: 'critical',
    source: 'Sector 7 Refinery',
    status: 'resolved',
    so2: 512,
    pm25: 98,
    nox: 76,
    windDir: 'NW-275',
    unitDispatched: 'Unit 02',
    eta: '12 min',
    resolutionTime: '2026-06-20 10:45:00',
  },
  {
    id: 'ANM-2026-00138',
    timestamp: '2026-06-19 14:22:07',
    date: '2026-06-19',
    sensorId: 'S01',
    anomalyType: 'PM2.5 Burst',
    severity: 'warning',
    source: 'Sector 2 Smelter',
    status: 'resolved',
    so2: 89,
    pm25: 178,
    nox: 45,
    windDir: 'W-260',
    unitDispatched: 'Unit 01',
    eta: '6 min',
    resolutionTime: '2026-06-19 15:30:00',
  },
  {
    id: 'ANM-2026-00135',
    timestamp: '2026-06-18 07:45:18',
    date: '2026-06-18',
    sensorId: 'S04',
    anomalyType: 'NOx Overflow',
    severity: 'critical',
    source: 'Sector 4 Industrial Plant',
    status: 'pending',
    so2: 320,
    pm25: 134,
    nox: 245,
    windDir: 'N-340',
    unitDispatched: 'Unit 04',
    eta: '8 min',
  },
  {
    id: 'ANM-2026-00129',
    timestamp: '2026-06-17 18:03:55',
    date: '2026-06-17',
    sensorId: 'S02',
    anomalyType: 'SO2 Plume Spike',
    severity: 'critical',
    source: 'Sector 5 Power Station',
    status: 'resolved',
    so2: 620,
    pm25: 156,
    nox: 112,
    windDir: 'NE-045',
    unitDispatched: 'Unit 03',
    eta: '15 min',
    resolutionTime: '2026-06-17 20:10:00',
  },
  {
    id: 'ANM-2026-00124',
    timestamp: '2026-06-16 11:37:41',
    date: '2026-06-16',
    sensorId: 'S05',
    anomalyType: 'CO Threshold',
    severity: 'warning',
    source: 'Sector 1 Chemical Depot',
    status: 'resolved',
    so2: 45,
    pm25: 62,
    nox: 38,
    windDir: 'SW-220',
    unitDispatched: 'Unit 01',
    eta: '4 min',
    resolutionTime: '2026-06-16 12:15:00',
  },
  {
    id: 'ANM-2026-00118',
    timestamp: '2026-06-15 03:22:19',
    date: '2026-06-15',
    sensorId: 'S03',
    anomalyType: 'PM10 Surge',
    severity: 'warning',
    source: 'Sector 6 Cement Mill',
    status: 'resolved',
    so2: 120,
    pm25: 210,
    nox: 67,
    windDir: 'E-090',
    unitDispatched: 'Unit 05',
    eta: '10 min',
    resolutionTime: '2026-06-15 05:00:00',
  },
  {
    id: 'ANM-2026-00112',
    timestamp: '2026-06-14 16:50:03',
    date: '2026-06-14',
    sensorId: 'S01',
    anomalyType: 'SO2 Plume Spike',
    severity: 'critical',
    source: 'Sector 2 Smelter',
    status: 'resolved',
    so2: 480,
    pm25: 145,
    nox: 89,
    windDir: 'NW-280',
    unitDispatched: 'Unit 02',
    eta: '7 min',
    resolutionTime: '2026-06-14 18:20:00',
  },
  {
    id: 'ANM-2026-00105',
    timestamp: '2026-06-13 08:11:27',
    date: '2026-06-13',
    sensorId: 'S04',
    anomalyType: 'O3 Anomaly',
    severity: 'warning',
    source: 'Sector 4 Industrial Plant',
    status: 'pending',
    so2: 78,
    pm25: 55,
    nox: 34,
    windDir: 'S-180',
    unitDispatched: 'Unit 04',
    eta: '9 min',
  },
];

/* ------------------------------------------------------------------ */
/*  Alert System Types & Data                                         */
/* ------------------------------------------------------------------ */
interface AnomalyAlert {
  id: string;
  timestamp: string;
  severity: 'critical' | 'warning';
  sensorId: string;
  message: string;
  read: boolean;
}

const INITIAL_ALERTS: AnomalyAlert[] = [
  {
    id: 'ALT-2026-00142',
    timestamp: '2026-06-20 09:14:32',
    severity: 'critical',
    sensorId: 'S03',
    message: 'SO2 spike detected — 487% above threshold at Sector 7 Refinery',
    read: true,
  },
  {
    id: 'ALT-2026-00138',
    timestamp: '2026-06-19 14:22:07',
    severity: 'warning',
    sensorId: 'S01',
    message: 'PM2.5 burst — 156 µg/m³ recorded at Sector 2 Smelter',
    read: true,
  },
  {
    id: 'ALT-2026-00135',
    timestamp: '2026-06-18 07:45:18',
    severity: 'critical',
    sensorId: 'S04',
    message: 'NOx overflow — 245 ppb at Sector 4 Industrial Plant',
    read: false,
  },
  {
    id: 'ALT-2026-00129',
    timestamp: '2026-06-17 18:03:55',
    severity: 'critical',
    sensorId: 'S02',
    message: 'SO2 plume spike — 620 ppb at Sector 5 Power Station',
    read: true,
  },
  {
    id: 'ALT-2026-00124',
    timestamp: '2026-06-16 11:37:41',
    severity: 'warning',
    sensorId: 'S05',
    message: 'CO threshold exceeded at Sector 1 Chemical Depot',
    read: true,
  },
];

/* ------------------------------------------------------------------ */
/*  Utilities                                                         */
/* ------------------------------------------------------------------ */
const playAlertBeep = () => {
  try {
    const AudioCtx = (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).AudioContext
      || (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'square';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    // Audio not supported, silently fail
  }
};

const downloadEvidencePacket = (data: Record<string, unknown>, filename: string) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                    */
/* ------------------------------------------------------------------ */

const TelemetryFeed: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 mb-3 px-1">
        <Radio className="w-4 h-4 text-primary" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Live Telemetry
        </span>
        <span className="ml-auto flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] text-primary uppercase">Live</span>
        </span>
      </div>
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-1 pr-1"
      >
        {TELEMETRY_FEED.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center gap-2 py-1.5 px-2 rounded border border-border/40 bg-card/40 text-[11px]"
          >
            <span className="text-muted-foreground w-16 shrink-0">{entry.timestamp}</span>
            <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-border/60">
              {entry.sensor}
            </Badge>
            <span className="text-foreground/80 truncate">{entry.reading}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const Terminal: React.FC = () => {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [typedTexts, setTypedTexts] = useState<string[]>(Array(TERMINAL_LINES.length).fill(''));
  const [currentLine, setCurrentLine] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (visibleLines >= TERMINAL_LINES.length) return;

    const line = TERMINAL_LINES[visibleLines];
    if (charIndex < line.length) {
      const timeout = setTimeout(() => {
        setTypedTexts((prev) => {
          const next = [...prev];
          next[visibleLines] = line.slice(0, charIndex + 1);
          return next;
        });
        setCharIndex(charIndex + 1);
      }, 30);
      return () => clearTimeout(timeout);
    }

    const nextLineTimeout = setTimeout(() => {
      setVisibleLines(visibleLines + 1);
      setCurrentLine(visibleLines + 1);
      setCharIndex(0);
    }, 600);
    return () => clearTimeout(nextLineTimeout);
  }, [visibleLines, charIndex]);

  return (
    <div className="rounded-md border border-border bg-black/80 p-3 font-mono text-[11px] leading-relaxed">
      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border/30">
        <Crosshair className="w-3.5 h-3.5 text-primary" />
        <span className="text-muted-foreground uppercase tracking-wider text-[10px]">
          Explainable AI Terminal
        </span>
        <span className="ml-auto text-[10px] text-primary/70">v2.4.1</span>
      </div>
      <div className="space-y-1.5 min-h-[80px]">
        {TERMINAL_LINES.map((line, idx) => {
          const isVisible = idx <= visibleLines;
          if (!isVisible) return null;
          const isTyping = idx === visibleLines && charIndex < line.length;
          return (
            <div key={idx} className="flex gap-2">
              <span className="text-primary/60 shrink-0">{'>'}</span>
              <span className="text-primary/90">
                {typedTexts[idx]}
                {isTyping && <span className="animate-typing-cursor" />}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ChemicalScanCard: React.FC = () => {
  return (
    <div className="rounded-md border border-border bg-card/60 p-3 flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <BarChart3 className="w-3.5 h-3.5 text-info" />
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Chemical Scan</span>
      </div>
      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-[10px] mb-1">
            <span className="text-muted-foreground">SO2</span>
            <span className="text-destructive font-medium">487 ppb</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-destructive rounded-full w-[92%]" />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] mb-1">
            <span className="text-muted-foreground">PM2.5</span>
            <span className="text-warning font-medium">156 µg/m³</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-warning rounded-full w-[78%]" />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] mb-1">
            <span className="text-muted-foreground">NOx</span>
            <span className="text-info font-medium">89 ppb</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-info rounded-full w-[45%]" />
          </div>
        </div>
      </div>
      <div className="mt-1 flex items-center gap-1 text-[9px] text-destructive">
        <AlertTriangle className="w-3 h-3" />
        <span>Threshold exceeded</span>
      </div>
    </div>
  );
};

const ThermalCard: React.FC = () => {
  return (
    <div className="rounded-md border border-border bg-card/60 p-3 flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <Thermometer className="w-3.5 h-3.5 text-destructive" />
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Thermal / Satellite</span>
      </div>
      <div className="relative aspect-[4/3] rounded overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/80 via-orange-600/70 to-red-700/90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(255,100,50,0.5)_0%,transparent_60%)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-white/60 rounded-full flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-white rounded-full" />
        </div>
        <div className="absolute bottom-1.5 left-1.5 text-[8px] text-white/80 font-mono">
          T: 342°C
        </div>
        <div className="absolute top-1.5 right-1.5 text-[8px] text-white/60 font-mono">
          DRONE-CAM-04
        </div>
      </div>
      <div className="text-[9px] text-muted-foreground">Hot stack detected — Sector 4</div>
    </div>
  );
};

const WindHistoryCard: React.FC = () => {
  const points = [30, 35, 32, 38, 40, 42, 38, 45, 48, 50, 47, 52, 55, 50, 48, 52, 55, 58, 60, 62, 58, 55, 52, 50];
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const w = 100;
  const h = 40;
  const step = w / (points.length - 1);
  const path = points
    .map((p, i) => {
      const x = i * step;
      const y = h - ((p - min) / range) * h;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <div className="rounded-md border border-border bg-card/60 p-3 flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <Wind className="w-3.5 h-3.5 text-info" />
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Wind History</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-10" preserveAspectRatio="none">
        <path d={path} fill="none" stroke="hsl(var(--info))" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        <circle cx={w} cy={h - ((points[points.length - 1] - min) / range) * h} r="2" fill="hsl(var(--info))" />
      </svg>
      <div className="flex justify-between text-[9px] text-muted-foreground">
        <span>NW-280</span>
        <span className="text-info">Stability: 94%</span>
      </div>
    </div>
  );
};

const EvidenceLocker: React.FC = () => {
  const [showCards, setShowCards] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setShowCards(1), 0);
    const t2 = setTimeout(() => setShowCards(2), 350);
    const t3 = setTimeout(() => setShowCards(3), 700);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Eye className="w-4 h-4 text-primary" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Multi-Modal Evidence Locker
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className={showCards >= 1 ? 'animate-fade-in-up' : 'opacity-0'} style={{ animationDelay: '0ms' }}>
          <ChemicalScanCard />
        </div>
        <div className={showCards >= 2 ? 'animate-fade-in-up' : 'opacity-0'} style={{ animationDelay: '150ms' }}>
          <ThermalCard />
        </div>
        <div className={showCards >= 3 ? 'animate-fade-in-up' : 'opacity-0'} style={{ animationDelay: '300ms' }}>
          <WindHistoryCard />
        </div>
      </div>
    </div>
  );
};

const DispatchLogistics: React.FC = () => {
  const [dispatched, setDispatched] = useState(false);

  return (
    <div className="animate-slide-in-bottom">
      <div className="flex items-center gap-2 mb-3">
        <Send className="w-4 h-4 text-primary" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Impact & Dispatch Logistics
        </span>
      </div>
      <div className="rounded-md border border-border bg-card/60 p-4 space-y-3">
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <div>
            <div className="text-[10px] text-muted-foreground uppercase">Source</div>
            <div className="text-sm font-medium text-foreground">Sector 4 Industrial Plant</div>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <FileText className="w-4 h-4 text-warning shrink-0 mt-0.5" />
          <div>
            <div className="text-[10px] text-muted-foreground uppercase">Legal Status</div>
            <div className="text-sm font-medium text-warning">Active Permit Violation (Sec 12.B)</div>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Radar className="w-4 h-4 text-info shrink-0 mt-0.5" />
          <div>
            <div className="text-[10px] text-muted-foreground uppercase">Proximity Alert</div>
            <div className="text-sm font-medium text-foreground">
              Enforcement Unit 04 is <span className="text-info">4.2km</span> away. ETA: <span className="text-info">8 minutes</span>
            </div>
          </div>
        </div>
        <Button
          onClick={() => setDispatched(true)}
          disabled={dispatched}
          className="w-full h-10 mt-2 gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {dispatched ? (
            <>
              <Activity className="w-4 h-4" />
              Unit Dispatched — Evidence Packet Generated
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Dispatch Unit & Generate Legal Evidence Packet
            </>
          )}
        </Button>
        {dispatched && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 mt-1 gap-2 text-[11px] text-muted-foreground hover:text-foreground border border-border"
            onClick={() =>
              downloadEvidencePacket(
                {
                  caseId: 'LIVE-ANOMALY-' + new Date().toISOString().slice(0, 10),
                  timestamp: new Date().toISOString(),
                  source: 'Sector 4 Industrial Plant',
                  legalStatus: 'Active Permit Violation (Sec 12.B)',
                  sensor: 'S02',
                  so2: 487,
                  pm25: 156,
                  nox: 89,
                  windDir: 'NW-280',
                  unitDispatched: 'Unit 04',
                  eta: '8 minutes',
                },
                `evidence-packet-${Date.now()}.json`
              )
            }
          >
            <FileText className="w-3.5 h-3.5" />
            Download Evidence Packet (.json)
          </Button>
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Historical Evidence Locker (for archive detail view)              */
/* ------------------------------------------------------------------ */
const HistoricalChemicalScan: React.FC<{ so2: number; pm25: number; nox: number }> = ({ so2, pm25, nox }) => {
  const so2Pct = Math.min((so2 / 650) * 100, 100);
  const pm25Pct = Math.min((pm25 / 250) * 100, 100);
  const noxPct = Math.min((nox / 260) * 100, 100);
  return (
    <div className="rounded-md border border-border bg-card/60 p-3 flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <BarChart3 className="w-3.5 h-3.5 text-info" />
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Chemical Scan</span>
      </div>
      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-[10px] mb-1">
            <span className="text-muted-foreground">SO2</span>
            <span className={`font-medium ${so2 > 400 ? 'text-destructive' : 'text-info'}`}>{so2} ppb</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-destructive rounded-full" style={{ width: `${so2Pct}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] mb-1">
            <span className="text-muted-foreground">PM2.5</span>
            <span className={`font-medium ${pm25 > 150 ? 'text-warning' : 'text-info'}`}>{pm25} µg/m³</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-warning rounded-full" style={{ width: `${pm25Pct}%` }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-[10px] mb-1">
            <span className="text-muted-foreground">NOx</span>
            <span className={`font-medium ${nox > 200 ? 'text-destructive' : 'text-info'}`}>{nox} ppb</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-info rounded-full" style={{ width: `${noxPct}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

const HistoricalThermalCard: React.FC<{ source: string }> = ({ source }) => (
  <div className="rounded-md border border-border bg-card/60 p-3 flex flex-col gap-2">
    <div className="flex items-center gap-1.5">
      <Thermometer className="w-3.5 h-3.5 text-destructive" />
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Thermal / Satellite</span>
    </div>
    <div className="relative aspect-[4/3] rounded overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/80 via-orange-600/70 to-red-700/90" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(255,100,50,0.5)_0%,transparent_60%)]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 border-2 border-white/60 rounded-full flex items-center justify-center">
        <div className="w-1.5 h-1.5 bg-white rounded-full" />
      </div>
      <div className="absolute bottom-1.5 left-1.5 text-[8px] text-white/80 font-mono">T: 312°C</div>
      <div className="absolute top-1.5 right-1.5 text-[8px] text-white/60 font-mono">DRONE-CAM-02</div>
    </div>
    <div className="text-[9px] text-muted-foreground">Hot stack detected — {source}</div>
  </div>
);

const HistoricalWindCard: React.FC<{ windDir: string }> = ({ windDir }) => {
  const points = [30, 35, 32, 38, 40, 42, 38, 45, 48, 50, 47, 52, 55, 50, 48, 52, 55, 58, 60, 62, 58, 55, 52, 50];
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const w = 100;
  const h = 40;
  const step = w / (points.length - 1);
  const path = points
    .map((p, i) => {
      const x = i * step;
      const y = h - ((p - min) / range) * h;
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');

  return (
    <div className="rounded-md border border-border bg-card/60 p-3 flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <Wind className="w-3.5 h-3.5 text-info" />
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Wind History</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-10" preserveAspectRatio="none">
        <path d={path} fill="none" stroke="hsl(var(--info))" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        <circle cx={w} cy={h - ((points[points.length - 1] - min) / range) * h} r="2" fill="hsl(var(--info))" />
      </svg>
      <div className="flex justify-between text-[9px] text-muted-foreground">
        <span>{windDir}</span>
        <span className="text-info">Stability: 91%</span>
      </div>
    </div>
  );
};

const HistoricalEvidenceLocker: React.FC<{ anomaly: HistoricalAnomaly }> = ({ anomaly }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
    <HistoricalChemicalScan so2={anomaly.so2} pm25={anomaly.pm25} nox={anomaly.nox} />
    <HistoricalThermalCard source={anomaly.source} />
    <HistoricalWindCard windDir={anomaly.windDir} />
  </div>
);

/* ------------------------------------------------------------------ */
/*  Historical Anomaly Archive Overlay                                */
/* ------------------------------------------------------------------ */
const HistoricalArchiveSheet: React.FC<{ open: boolean; onOpenChange: (v: boolean) => void }> = ({
  open,
  onOpenChange,
}) => {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'resolved' | 'pending'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    return HISTORICAL_ANOMALIES.filter((a) => {
      const matchesSearch =
        search.trim() === '' ||
        a.sensorId.toLowerCase().includes(search.toLowerCase()) ||
        a.source.toLowerCase().includes(search.toLowerCase()) ||
        a.anomalyType.toLowerCase().includes(search.toLowerCase()) ||
        a.id.toLowerCase().includes(search.toLowerCase());
      const matchesSeverity = severityFilter === 'all' || a.severity === severityFilter;
      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      const matchesDateFrom = !dateFrom || a.date >= dateFrom;
      const matchesDateTo = !dateTo || a.date <= dateTo;
      return matchesSearch && matchesSeverity && matchesStatus && matchesDateFrom && matchesDateTo;
    });
  }, [search, severityFilter, statusFilter, dateFrom, dateTo]);

  const activeFiltersCount = [severityFilter !== 'all', statusFilter !== 'all', dateFrom, dateTo].filter(Boolean).length;
  const allFilteredSelected = filtered.length > 0 && filtered.every((a) => selectedIds.has(a.id));

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filtered.forEach((a) => next.delete(a.id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        filtered.forEach((a) => next.add(a.id));
        return next;
      });
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkExport = () => {
    const selected = HISTORICAL_ANOMALIES.filter((a) => selectedIds.has(a.id));
    downloadEvidencePacket(
      { exportedRecords: selected, exportedAt: new Date().toISOString() },
      `archive-export-${Date.now()}.json`
    );
    clearSelection();
  };

  return (
    <Sheet open={open} onOpenChange={(v) => { if (!v) clearSelection(); onOpenChange(v); }}>
      <SheetContent
        side="right"
        className="w-full sm:w-[640px] md:w-[720px] bg-background border-border overflow-y-auto"
      >
        <SheetHeader className="mb-4">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Archive className="w-5 h-5 text-primary" />
            Historical Anomaly Archive
          </SheetTitle>
          <SheetDescription className="text-[11px]">
            Review past pollution anomalies, evidence records, and enforcement outcomes.
          </SheetDescription>
        </SheetHeader>

        {/* Trend Chart */}
        <div className="mb-4">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Anomaly Trend (Last 14 Days)</div>
          <div className="h-28 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { date: '06/08', critical: 0, warning: 1 },
                  { date: '06/09', critical: 1, warning: 0 },
                  { date: '06/10', critical: 0, warning: 2 },
                  { date: '06/11', critical: 1, warning: 1 },
                  { date: '06/12', critical: 0, warning: 0 },
                  { date: '06/13', critical: 0, warning: 1 },
                  { date: '06/14', critical: 1, warning: 0 },
                  { date: '06/15', critical: 0, warning: 1 },
                  { date: '06/16', critical: 0, warning: 1 },
                  { date: '06/17', critical: 1, warning: 0 },
                  { date: '06/18', critical: 1, warning: 0 },
                  { date: '06/19', critical: 0, warning: 1 },
                  { date: '06/20', critical: 1, warning: 0 },
                  { date: '06/21', critical: 0, warning: 0 },
                ]}
                margin={{ top: 4, right: 8, left: -12, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    fontSize: '11px',
                  }}
                  itemStyle={{ fontSize: '11px' }}
                />
                <Bar dataKey="critical" fill="hsl(var(--destructive))" radius={[2, 2, 0, 0]} maxBarSize={12} />
                <Bar dataKey="warning" fill="hsl(var(--warning))" radius={[2, 2, 0, 0]} maxBarSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="space-y-3 mb-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID, sensor, source, or type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs h-9 bg-card border-border"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground shrink-0">
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="text-[9px] h-4 px-1.5">
                  {activeFiltersCount}
                </Badge>
              )}
            </div>
            <Select
              value={severityFilter}
              onValueChange={(v) => setSeverityFilter(v as 'all' | 'critical' | 'warning')}
            >
              <SelectTrigger className="h-8 text-[11px] w-[110px] bg-card border-border">
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as 'all' | 'resolved' | 'pending')}
            >
              <SelectTrigger className="h-8 text-[11px] w-[110px] bg-card border-border">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-8 text-[11px] w-[130px] bg-card border-border px-2"
              />
              <span className="text-muted-foreground text-[10px]">to</span>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-8 text-[11px] w-[130px] bg-card border-border px-2"
              />
            </div>
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setSeverityFilter('all');
                  setStatusFilter('all');
                  setDateFrom('');
                  setDateTo('');
                }}
              >
                <X className="w-3 h-3" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Results count + Bulk bar */}
        <div className="flex items-center justify-between mb-2">
          <div className="text-[11px] text-muted-foreground">
            {filtered.length} record{filtered.length !== 1 ? 's' : ''} found
          </div>
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground">{selectedIds.size} selected</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[11px] gap-1 text-primary hover:text-primary/80"
                onClick={handleBulkExport}
              >
                <FileText className="w-3.5 h-3.5" />
                Export Selected
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
                onClick={clearSelection}
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </Button>
            </div>
          )}
        </div>

        {/* Anomaly Table */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Search className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">No Records Found</p>
            <p className="text-[11px]">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Table header */}
            <div className="grid grid-cols-[28px_1fr_70px_80px_90px_70px] md:grid-cols-[28px_1fr_80px_100px_120px_80px] gap-2 items-center px-3 py-1 text-[10px] text-muted-foreground uppercase tracking-wider border-b border-border/50">
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={toggleSelectAll}
                  className="w-3.5 h-3.5 rounded border-border accent-primary cursor-pointer"
                />
              </div>
              <div>Anomaly</div>
              <div>Severity</div>
              <div>Sensor</div>
              <div className="hidden md:block">Source</div>
              <div className="text-right">Status</div>
            </div>
            {filtered.map((anomaly) => {
              const isExpanded = expandedId === anomaly.id;
              const isSelected = selectedIds.has(anomaly.id);
              return (
                <div
                  key={anomaly.id}
                  className={`rounded-md border border-border bg-card/40 overflow-hidden ${isSelected ? 'ring-1 ring-primary/30' : ''}`}
                >
                  {/* Table row */}
                  <div className="grid grid-cols-[28px_1fr_70px_80px_90px_70px] md:grid-cols-[28px_1fr_80px_100px_120px_80px] gap-2 items-center px-3 py-2.5 hover:bg-card/60 transition-colors">
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(anomaly.id)}
                        className="w-3.5 h-3.5 rounded border-border accent-primary cursor-pointer"
                      />
                    </div>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : anomaly.id)}
                      className="min-w-0 text-left"
                    >
                      <div className="text-[11px] font-medium text-foreground truncate">{anomaly.id}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{anomaly.timestamp}</div>
                    </button>
                    <div className="shrink-0">
                      <Badge
                        variant="outline"
                        className={`text-[9px] h-5 px-1.5 border ${
                          anomaly.severity === 'critical'
                            ? 'border-destructive/60 text-destructive bg-destructive/10'
                            : 'border-warning/60 text-warning bg-warning/10'
                        }`}
                      >
                        {anomaly.severity}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-foreground truncate shrink-0">{anomaly.sensorId}</div>
                    <div className="text-[10px] text-muted-foreground truncate shrink-0 hidden md:block">{anomaly.source}</div>
                    <div className="flex items-center justify-end gap-1 shrink-0">
                      <Badge
                        variant="outline"
                        className={`text-[9px] h-5 px-1.5 border ${
                          anomaly.status === 'resolved'
                            ? 'border-primary/60 text-primary bg-primary/10'
                            : 'border-info/60 text-info bg-info/10'
                        }`}
                      >
                        {anomaly.status}
                      </Badge>
                      <button onClick={() => setExpandedId(isExpanded ? null : anomaly.id)}>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-border px-3 py-3 animate-fade-in">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                        <div>
                          <div className="text-[10px] text-muted-foreground uppercase">Anomaly Type</div>
                          <div className="text-[11px] text-foreground">{anomaly.anomalyType}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-muted-foreground uppercase">Unit Dispatched</div>
                          <div className="text-[11px] text-foreground">{anomaly.unitDispatched}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-muted-foreground uppercase">ETA</div>
                          <div className="text-[11px] text-info">{anomaly.eta}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-muted-foreground uppercase">Wind</div>
                          <div className="text-[11px] text-foreground">{anomaly.windDir}</div>
                        </div>
                        {anomaly.resolutionTime && (
                          <div>
                            <div className="text-[10px] text-muted-foreground uppercase">Resolved</div>
                            <div className="text-[11px] text-primary">{anomaly.resolutionTime}</div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-[10px] text-muted-foreground uppercase">Evidence Locker</div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-[10px] gap-1 text-muted-foreground hover:text-foreground"
                          onClick={() =>
                            downloadEvidencePacket(
                              {
                                caseId: anomaly.id,
                                timestamp: anomaly.timestamp,
                                source: anomaly.source,
                                anomalyType: anomaly.anomalyType,
                                severity: anomaly.severity,
                                status: anomaly.status,
                                sensor: anomaly.sensorId,
                                so2: anomaly.so2,
                                pm25: anomaly.pm25,
                                nox: anomaly.nox,
                                windDir: anomaly.windDir,
                                unitDispatched: anomaly.unitDispatched,
                                eta: anomaly.eta,
                                resolutionTime: anomaly.resolutionTime,
                              },
                              `${anomaly.id}-evidence.json`
                            )
                          }
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Export
                        </Button>
                      </div>
                      <HistoricalEvidenceLocker anomaly={anomaly} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

/* ------------------------------------------------------------------ */
/*  City Map                                                          */
/* ------------------------------------------------------------------ */
const CityMap: React.FC<{
  anomalyActive: boolean;
  shieldEnabled: boolean;
  showLine: boolean;
  triggeredSensor: string | null;
}> = ({ anomalyActive, shieldEnabled, showLine, triggeredSensor }) => {
  const gridSize = 12;
  const blocks: { x: number; y: number; w: number; h: number; type: 'building' | 'park' | 'water' }[] = [
    { x: 1, y: 1, w: 2, h: 2, type: 'building' },
    { x: 4, y: 1, w: 3, h: 2, type: 'building' },
    { x: 8, y: 1, w: 2, h: 3, type: 'building' },
    { x: 1, y: 4, w: 2, h: 3, type: 'building' },
    { x: 5, y: 5, w: 2, h: 2, type: 'park' },
    { x: 9, y: 5, w: 1, h: 2, type: 'building' },
    { x: 2, y: 8, w: 3, h: 2, type: 'building' },
    { x: 7, y: 8, w: 2, h: 2, type: 'building' },
    { x: 10, y: 9, w: 1, h: 2, type: 'building' },
    { x: 4, y: 10, w: 2, h: 1, type: 'park' },
  ];

  const cellW = 100 / gridSize;
  const cellH = 100 / gridSize;

  const sensorPos = SENSORS.find((s) => s.id === triggeredSensor) || SENSORS[1];

  return (
    <div className="relative w-full h-full overflow-hidden rounded-md border border-border bg-slate-950">
      {/* Grid lines */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <defs>
          <pattern id="grid" width={`${cellW}%`} height={`${cellH}%`} patternUnits="userSpaceOnUse">
            <path d={`M ${cellW} 0 L 0 0 0 ${cellH}`} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* City blocks */}
      {blocks.map((b, i) => (
        <div
          key={i}
          className={`absolute rounded-sm ${
            b.type === 'building'
              ? 'bg-slate-800/40 border border-slate-700/30'
              : b.type === 'park'
                ? 'bg-emerald-900/15 border border-emerald-800/20'
                : 'bg-sky-900/15 border border-sky-800/20'
          }`}
          style={{
            left: `${b.x * cellW}%`,
            top: `${b.y * cellH}%`,
            width: `${b.w * cellW}%`,
            height: `${b.h * cellH}%`,
          }}
        />
      ))}

      {/* Factory */}
      <div
        className="absolute flex flex-col items-center"
        style={{ left: `${FACTORY.x}%`, top: `${FACTORY.y}%`, transform: 'translate(-50%, -50%)' }}
      >
        <div className="w-5 h-5 rounded-sm bg-slate-700/60 border border-slate-600/50 flex items-center justify-center">
          <span className="text-[6px] text-slate-400">F4</span>
        </div>
        <span className="text-[7px] text-slate-500 mt-0.5 whitespace-nowrap">Sector 4</span>
      </div>

      {/* Anomaly Shield overlay */}
      {shieldEnabled && (
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute rounded-full animate-pulse-glow"
            style={{
              left: '35%',
              top: '25%',
              width: '40%',
              height: '40%',
              background: 'radial-gradient(circle, rgba(34,197,94,0.12) 0%, rgba(34,197,94,0.04) 50%, transparent 70%)',
            }}
          />
          <div className="absolute top-2 left-2 text-[9px] text-primary/60 uppercase tracking-wider">
            Anomaly Shield Active
          </div>
        </div>
      )}

      {/* Dashed line from sensor to factory */}
      {showLine && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          <line
            x1={sensorPos.x}
            y1={sensorPos.y}
            x2={FACTORY.x}
            y2={FACTORY.y}
            stroke="hsl(var(--destructive))"
            strokeWidth="0.4"
            strokeDasharray="2 1"
            className="animate-dash-draw"
            opacity="0.8"
          />
        </svg>
      )}

      {/* Sensor nodes */}
      {SENSORS.map((sensor) => {
        const isTriggered = sensor.id === triggeredSensor && anomalyActive;
        return (
          <div
            key={sensor.id}
            className="absolute flex flex-col items-center"
            style={{ left: `${sensor.x}%`, top: `${sensor.y}%`, transform: 'translate(-50%, -50%)' }}
          >
            <div
              className={`relative w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                isTriggered
                  ? 'bg-destructive/30 border-destructive shadow-[0_0_12px_rgba(239,68,68,0.6)]'
                  : 'bg-primary/20 border-primary/50'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${isTriggered ? 'bg-destructive animate-pulse' : 'bg-primary/60'}`} />
              {isTriggered && (
                <div className="absolute inset-0 rounded-full bg-destructive/20 animate-ping" />
              )}
            </div>
            <span className={`text-[7px] mt-0.5 whitespace-nowrap ${isTriggered ? 'text-destructive font-medium' : 'text-slate-500'}`}>
              {sensor.label}
            </span>
          </div>
        );
      })}

      {/* Map legend */}
      <div className="absolute bottom-2 left-2 flex items-center gap-3 text-[8px] text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-primary/60" /> Sensor
        </span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-sm bg-slate-700/60" /> Facility
        </span>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Notification Popover                                               */
/* ------------------------------------------------------------------ */
const NotificationPopover: React.FC<{
  alerts: AnomalyAlert[];
  onDismiss: (id: string) => void;
  onMarkAllRead: () => void;
  onOpenArchive: () => void;
}> = ({ alerts, onDismiss, onMarkAllRead, onOpenArchive }) => {
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'warning'>('all');
  const unreadCount = alerts.filter((a) => !a.read).length;
  const sorted = [...alerts]
    .filter((a) => severityFilter === 'all' || a.severity === severityFilter)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-9 w-9 p-0 border border-border bg-card/60 hover:bg-card"
        >
          <Bell className="w-4 h-4 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-destructive text-[9px] font-semibold text-white flex items-center justify-center px-1">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[380px] max-h-[520px] p-0 bg-background border-border overflow-hidden flex flex-col"
        align="end"
        sideOffset={8}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Anomaly Alerts</span>
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
              {alerts.length}
            </Badge>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-[11px] text-muted-foreground hover:text-foreground"
              onClick={onMarkAllRead}
            >
              Mark All as Read
            </Button>
          )}
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-border/50 shrink-0">
          <Filter className="w-3 h-3 text-muted-foreground" />
          {(['all', 'critical', 'warning'] as const).map((f) => (
            <Button
              key={f}
              variant="ghost"
              size="sm"
              className={`h-6 text-[10px] px-2 py-0 ${
                severityFilter === f
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setSeverityFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>

        {/* Alert list */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {sorted.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="w-6 h-6 mb-2 opacity-40" />
              <p className="text-xs">No alerts</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {sorted.map((alert) => (
                <div
                  key={alert.id}
                  className={`px-3 py-2.5 flex items-start gap-2.5 transition-opacity ${
                    alert.read ? 'opacity-50' : 'opacity-100'
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {alert.severity === 'critical' ? (
                      <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-warning" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <Badge
                        variant="outline"
                        className={`text-[9px] h-4 px-1 border ${
                          alert.severity === 'critical'
                            ? 'border-destructive/60 text-destructive bg-destructive/10'
                            : 'border-warning/60 text-warning bg-warning/10'
                        }`}
                      >
                        {alert.severity}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">{alert.sensorId}</span>
                    </div>
                    <p className="text-[11px] text-foreground leading-snug">{alert.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{alert.timestamp}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 shrink-0 text-muted-foreground hover:text-foreground"
                    onClick={() => onDismiss(alert.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border px-3 py-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 text-[11px] text-muted-foreground hover:text-foreground gap-1"
            onClick={onOpenArchive}
          >
            <Archive className="w-3.5 h-3.5" />
            View All in Archive
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

/* ------------------------------------------------------------------ */
/*  Main Page                                                         */
/* ------------------------------------------------------------------ */
const AeroForensicsPage: React.FC = () => {
  const [timeValue, setTimeValue] = useState(24);
  const [anomalyActive, setAnomalyActive] = useState(false);
  const [shieldEnabled, setShieldEnabled] = useState(false);
  const [showTerminal, setShowTerminal] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);
  const [showLine, setShowLine] = useState(false);
  const [showDispatch, setShowDispatch] = useState(false);
  const [triggeredSensor, setTriggeredSensor] = useState<string | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);
  const [alerts, setAlerts] = useState<AnomalyAlert[]>(INITIAL_ALERTS);
  const [rightTab, setRightTab] = useState<'forensics' | 'vehicle' | 'industrial' | 'attribution'>('forensics');
  const timeoutRefs = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearAllTimeouts = useCallback(() => {
    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
  }, []);

  useEffect(() => {
    return () => clearAllTimeouts();
  }, [clearAllTimeouts]);

  const handleDismissAlert = useCallback((id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, read: true } : a))
    );
  }, []);

  const handleMarkAllRead = useCallback(() => {
    setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
  }, []);

  const handleTrigger = useCallback(() => {
    if (simulating) return;
    clearAllTimeouts();
    setSimulating(true);
    setAnomalyActive(true);
    setTriggeredSensor('S02');
    setShowTerminal(true);
    setShowEvidence(false);
    setShowLine(false);
    setShowDispatch(false);

    // Audio alert + new alert + toast
    playAlertBeep();
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace('T', ' ');
    const newAlert: AnomalyAlert = {
      id: `ALT-${timestamp.replace(/[-: ]/g, '')}`,
      timestamp,
      severity: 'critical',
      sensorId: 'S02',
      message: 'SO2 plume spike detected — 487% above threshold. Source: Sector 4 Industrial Plant.',
      read: false,
    };
    setAlerts((prev) => [newAlert, ...prev]);
    toast(
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium">Critical Anomaly Detected — S02</p>
          <p className="text-xs text-muted-foreground">SO2 spike at Sector 4 Industrial Plant</p>
        </div>
      </div>,
      { duration: 6000 }
    );

    timeoutRefs.current = [
      setTimeout(() => setShowEvidence(true), 2500),
      setTimeout(() => setShowLine(true), 4000),
      setTimeout(() => setShowDispatch(true), 4500),
      setTimeout(() => setSimulating(false), 12000),
    ];
  }, [simulating, clearAllTimeouts]);

  const timeLabel =
    timeValue < 24
      ? `-${24 - timeValue}h History`
      : timeValue === 24
        ? 'LIVE'
        : `+${timeValue - 24}h Predictive`;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="shrink-0 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-4 px-4 py-3">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-md bg-primary/20 border border-primary/30 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground tracking-tight">AeroForensics AI</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Urban Air Quality Command Center
              </p>
            </div>
          </div>

          {/* Time Scrubber */}
          <div className="flex-1 min-w-0 flex items-center gap-3 px-4">
            <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">-24h</span>
            <div className="flex-1 min-w-0 relative">
              <Slider
                value={[timeValue]}
                min={0}
                max={36}
                step={1}
                onValueChange={(v) => setTimeValue(v[0])}
                className="w-full"
              />
              <div className="flex justify-between mt-1">
                <span className="text-[9px] text-muted-foreground/60">History</span>
                <span
                  className={`text-[10px] font-medium ${
                    timeValue === 24 ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {timeLabel}
                </span>
                <span className="text-[9px] text-muted-foreground/60">Predictive</span>
              </div>
            </div>
            <span className="text-[10px] text-muted-foreground shrink-0 whitespace-nowrap">+12h</span>
          </div>

          <Button
            variant="ghost"
            onClick={() => setArchiveOpen(true)}
            className="shrink-0 h-9 gap-2 border border-border bg-card/60 text-primary-foreground hover:bg-card"
          >
            <Archive className="w-4 h-4 text-muted-foreground" />
            <span className="hidden sm:inline">Historical Archive</span>
            <span className="sm:hidden">Archive</span>
          </Button>

          <NotificationPopover
            alerts={alerts}
            onDismiss={handleDismissAlert}
            onMarkAllRead={handleMarkAllRead}
            onOpenArchive={() => setArchiveOpen(true)}
          />

          <Button
            onClick={handleTrigger}
            disabled={simulating}
            className="shrink-0 h-9 gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
          >
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">Trigger Live Anomaly</span>
            <span className="sm:hidden">Trigger</span>
          </Button>

          <Link
            to="/citizen"
            className="shrink-0 h-9 px-3 flex items-center gap-2 text-[11px] text-primary border border-primary/30 bg-primary/10 rounded-md hover:bg-primary/20 transition-colors"
          >
            <Car className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Citizen App</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden overflow-y-auto md:overflow-y-hidden">
        {/* Left Column — Map & Visual Layer */}
        <section className="w-full md:w-[55%] flex flex-col md:border-r border-b md:border-b-0 border-border p-4 gap-3 min-h-[400px] md:min-h-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                City Sensor Grid
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground uppercase">Anomaly Shield</span>
              <Switch
                checked={shieldEnabled}
                onCheckedChange={setShieldEnabled}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </div>

          <div className="flex-1 min-h-0 relative">
            <CityMap
              anomalyActive={anomalyActive}
              shieldEnabled={shieldEnabled}
              showLine={showLine}
              triggeredSensor={triggeredSensor}
            />
          </div>

          {/* Quick stats row */}
          <div className="grid grid-cols-4 gap-2 shrink-0">
            {[
              { label: 'Active Sensors', value: '5/5', icon: Radar, color: 'text-primary' },
              { label: 'Avg AQI', value: anomalyActive ? '187' : '42', icon: Activity, color: anomalyActive ? 'text-destructive' : 'text-primary' },
              { label: 'Wind Dir', value: 'NW-280', icon: Wind, color: 'text-info' },
              { label: 'Alerts', value: anomalyActive ? '1 Active' : '0', icon: AlertTriangle, color: anomalyActive ? 'text-destructive' : 'text-muted-foreground' },
            ].map((stat, i) => (
              <div key={i} className="rounded border border-border bg-card/40 p-2 flex flex-col items-center gap-1">
                <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                <span className="text-[10px] text-muted-foreground uppercase">{stat.label}</span>
                <span className={`text-sm font-semibold ${stat.color}`}>{stat.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Right Column — Intelligence & Operations */}
        <section className="w-full md:w-[45%] flex flex-col p-4 gap-3 overflow-y-auto min-h-[300px] md:min-h-0">
          {/* Tab Switcher */}
          <div className="flex items-center gap-1 border-b border-border pb-2 shrink-0">
            {([
              { key: 'forensics' as const, label: 'Forensics', icon: <Crosshair className="w-3 h-3" /> },
              { key: 'attribution' as const, label: 'Source Attribution', icon: <BarChart3 className="w-3 h-3" /> },
              { key: 'vehicle' as const, label: 'Vehicle Emission', icon: <Car className="w-3 h-3" /> },
              { key: 'industrial' as const, label: 'Industrial AQI', icon: <Factory className="w-3 h-3" /> },
            ]).map((tab) => (
              <Button
                key={tab.key}
                variant="ghost"
                size="sm"
                className={`h-8 text-[11px] gap-1.5 px-2.5 ${
                  rightTab === tab.key
                    ? 'bg-primary/15 text-primary border border-primary/20'
                    : 'text-muted-foreground hover:text-foreground border border-transparent'
                }`}
                onClick={() => setRightTab(tab.key)}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </Button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 min-h-0">
            {rightTab === 'forensics' && (
              !anomalyActive ? (
                <TelemetryFeed />
              ) : (
                <div className="flex flex-col gap-4">
                  {showTerminal && <Terminal />}
                  {showEvidence && <EvidenceLocker />}
                  {showDispatch && <DispatchLogistics />}
                </div>
              )
            )}
            {rightTab === 'attribution' && <PollutionSourceAttribution />}
            {rightTab === 'vehicle' && <VehicleEnforcementPanel />}
            {rightTab === 'industrial' && <IndustrialAQIPanel />}
          </div>
        </section>
      </main>

      {/* Historical Anomaly Archive Overlay */}
      <HistoricalArchiveSheet open={archiveOpen} onOpenChange={setArchiveOpen} />

      {/* Footer Status Bar */}
      <footer className="shrink-0 border-t border-border bg-card/50 px-4 py-1.5 flex items-center justify-between text-[10px] text-muted-foreground">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            System Online
          </span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">v2.4.1-stable</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline">AI Model: Gemini-2.5-Flash</span>
          <span className="hidden sm:inline">|</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date().toLocaleTimeString('en-US', { hour12: false })}
          </span>
        </div>
      </footer>
    </div>
  );
};

export default AeroForensicsPage;
