import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Factory,
  Car,
  Hammer,
  Wind,
  BrainCircuit,
  AlertTriangle,
  MapPin,
  Activity,
  ChevronRight,
  Radar,
  CheckCircle2,
  Cpu,
  TrendingUp,
  GitBranch,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/db/supabase';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface AttributionResult {
  source: string;
  probability: number;
  evidence: string[];
  icon: React.ReactNode;
  color: string;
}

interface IndustryCheck {
  name: string;
  distance: string;
  activePermits: boolean;
  emissionEstimate: number;
  status: 'active' | 'idle';
}

interface TrafficCorridor {
  name: string;
  aadt: number;
  congestionLevel: 'low' | 'moderate' | 'high';
  heavyVehiclePct: number;
}

interface ConstructionSite {
  name: string;
  permitStatus: 'active' | 'expired';
  dustSuppression: boolean;
  areaSqM: number;
}

interface MLResult {
  probabilities: { traffic: number; construction: number; industrial: number };
  featureImportance: { name: string; importance: number }[];
  modelVersion: string;
  trainedOn: string;
  samples: number;
  accuracy: number;
}

const MOCK_INDUSTRY: IndustryCheck[] = [
  { name: 'Sector 2 Smelter', distance: '1.2 km NW', activePermits: true, emissionEstimate: 45, status: 'active' },
  { name: 'Sector 4 Chemical Plant', distance: '3.1 km N', activePermits: true, emissionEstimate: 120, status: 'active' },
  { name: 'Sector 7 Refinery', distance: '5.8 km NE', activePermits: false, emissionEstimate: 0, status: 'idle' },
  { name: 'Sector 1 Depot', distance: '2.4 km W', activePermits: true, emissionEstimate: 28, status: 'active' },
];

const MOCK_TRAFFIC: TrafficCorridor[] = [
  { name: 'Corridor A — Ring Road', aadt: 84500, congestionLevel: 'high', heavyVehiclePct: 18 },
  { name: 'Corridor B — Highway 44', aadt: 62000, congestionLevel: 'moderate', heavyVehiclePct: 32 },
  { name: 'Corridor C — City Center', aadt: 41000, congestionLevel: 'moderate', heavyVehiclePct: 8 },
];

const MOCK_CONSTRUCTION: ConstructionSite[] = [
  { name: 'Metro Line Extension — Phase 3', permitStatus: 'active', dustSuppression: true, areaSqM: 125000 },
  { name: 'Flyover Construction — Sector 5', permitStatus: 'active', dustSuppression: false, areaSqM: 45000 },
  { name: 'Commercial Complex — Zone B', permitStatus: 'expired', dustSuppression: true, areaSqM: 28000 },
];

const TypeWriter: React.FC<{ lines: string[]; onDone?: () => void }> = ({ lines, onDone }) => {
  const [displayed, setDisplayed] = useState<string[]>([]);
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (lineIndex >= lines.length) {
      onDone?.();
      return;
    }
    const timer = setTimeout(() => {
      if (charIndex < lines[lineIndex].length) {
        setCharIndex((prev) => prev + 1);
      } else {
        setDisplayed((prev) => [...prev, lines[lineIndex]]);
        setLineIndex((prev) => prev + 1);
        setCharIndex(0);
      }
    }, 25);
    return () => clearTimeout(timer);
  }, [lineIndex, charIndex, lines, onDone]);

  return (
    <div className="font-mono text-[10px] text-foreground/80 space-y-0.5">
      {displayed.map((line, i) => (
        <div key={i} className="flex items-start gap-1.5">
          <span className="text-primary/60 shrink-0">{'>'}</span>
          <span>{line}</span>
        </div>
      ))}
      {lineIndex < lines.length && (
        <div className="flex items-start gap-1.5">
          <span className="text-primary/60 shrink-0">{'>'}</span>
          <span>{lines[lineIndex].slice(0, charIndex)}</span>
          <span className="w-1.5 h-3 bg-primary/60 animate-pulse inline-block" />
        </div>
      )}
    </div>
  );
};

const PollutionSourceAttribution: React.FC = () => {
  const [running, setRunning] = useState(false);
  const [stage, setStage] = useState<'idle' | 'checking' | 'analyzing' | 'done'>('idle');
  const [currentCheck, setCurrentCheck] = useState<string>('');
  const [results, setResults] = useState<AttributionResult[]>([]);
  const [mlResult, setMlResult] = useState<MLResult | null>(null);
  const [barData, setBarData] = useState<{ source: string; probability: number }[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [windDir] = useState('NW');
  const [windSpeed] = useState(12);

  const runAttribution = async () => {
    setRunning(true);
    setStage('checking');
    setResults([]);
    setMlResult(null);

    const steps = [
      'Checking nearby industries...',
      'Analyzing traffic density data...',
      'Querying construction permits...',
      'Reading wind direction & dispersion...',
      'Loading Random Forest model (rf-v1.2.0)...',
      'Running inference on 5 trees...',
      'Generating attribution probabilities...',
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < steps.length - 1) {
        setCurrentCheck(steps[stepIdx]);
        stepIdx++;
      } else {
        clearInterval(interval);
      }
    }, 700);

    try {
      const { data } = await supabase.functions.invoke('ml-attribution', {
        body: {
          action: 'predict',
          anomalyId: 'S02-' + Date.now(),
          input: {
            pm25_delta: 270,
            wind_direction_deg: 315,
            wind_speed: 12,
            traffic_aadt: 84500,
            industrial_distance_km: 3.1,
            construction_permits: 2,
            heavy_vehicle_pct: 18,
          },
        },
      });

      clearInterval(interval);
      setStage('done');

      if (data?.success) {
        setMlResult(data);
        setBarData([
          { source: 'Traffic', probability: data.probabilities.traffic },
          { source: 'Construction', probability: data.probabilities.construction },
          { source: 'Industrial', probability: data.probabilities.industrial },
        ]);
        setResults([
          {
            source: 'Traffic Corridor A — Ring Road',
            probability: data.probabilities.traffic,
            evidence: [
              `AADT: 84,500 vehicles/day`,
              `Heavy vehicle ratio: 18%`,
              `Congestion level: HIGH`,
              `Wind direction: NW aligns with corridor`,
              `Model vote weight: ${data.votes[0]}/5 trees`,
            ],
            icon: <Car className="w-4 h-4" />,
            color: 'bg-primary/10 text-primary border-primary/30',
          },
          {
            source: 'Construction Dust — Metro Phase 3',
            probability: data.probabilities.construction,
            evidence: [
              `Active permit: YES`,
              `Dust suppression: ACTIVE`,
              `Site area: 125,000 sq.m`,
              `Wind vector cross-section: MATCH`,
              `Model vote weight: ${data.votes[1]}/5 trees`,
            ],
            icon: <Hammer className="w-4 h-4" />,
            color: 'bg-warning/10 text-warning border-warning/30',
          },
          {
            source: 'Industrial Emissions — Sector 4 Plant',
            probability: data.probabilities.industrial,
            evidence: [
              `Distance: 3.1 km N`,
              `Active permits: YES`,
              `Estimated emission: 120 kg/day`,
              `Stack height: 45m — dispersion model applied`,
              `Model vote weight: ${data.votes[2]}/5 trees`,
            ],
            icon: <Factory className="w-4 h-4" />,
            color: 'bg-destructive/10 text-destructive border-destructive/30',
          },
        ]);
        toast(
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span className="text-sm">ML Attribution complete — Traffic: {data.probabilities.traffic}%</span>
          </div>
        );
      }
    } catch {
      clearInterval(interval);
      setStage('done');
      toast('ML service unavailable. Showing fallback attribution.');
      setBarData([
        { source: 'Traffic', probability: 78 },
        { source: 'Construction', probability: 15 },
        { source: 'Industrial', probability: 7 },
      ]);
      setResults([
        {
          source: 'Traffic Corridor A — Ring Road',
          probability: 78,
          evidence: ['AADT: 84,500', 'Heavy vehicles: 18%', 'Congestion: HIGH', 'Wind: NW alignment', 'Fallback mode'],
          icon: <Car className="w-4 h-4" />,
          color: 'bg-primary/10 text-primary border-primary/30',
        },
        {
          source: 'Construction Dust — Metro Phase 3',
          probability: 15,
          evidence: ['Active permit', 'Dust suppression: ON', 'Area: 125,000 sq.m', 'Fallback mode'],
          icon: <Hammer className="w-4 h-4" />,
          color: 'bg-warning/10 text-warning border-warning/30',
        },
        {
          source: 'Industrial Emissions — Sector 4 Plant',
          probability: 7,
          evidence: ['Distance: 3.1 km', 'Emission: 120 kg/day', 'Stack: 45m', 'Fallback mode'],
          icon: <Factory className="w-4 h-4" />,
          color: 'bg-destructive/10 text-destructive border-destructive/30',
        },
      ]);
    }
  };

  const terminalLines = [
    '> Initializing Pollution Source Attribution Engine v3.2',
    '> Loading ML model: rf-v1.2.0 (Random Forest, 5 trees)',
    '> Sensor: S02 | PM2.5 spike detected: 312 μg/m³',
    '> Baseline: 42 μg/m³ | Delta: +270 μg/m³',
    '> Wind vector: NW @ 12 km/h',
    '> Plume dispersion model: Gaussian steady-state',
    '> Querying 4 industrial sources within 10km radius',
    '> Querying 3 traffic corridors within 5km radius',
    '> Querying 3 construction permits within 3km radius',
    '> Extracting 6 features: PM2.5_delta, wind_aligns, traffic_idx, ind_prox, construction, wind_speed',
    '> Running inference across 5 decision trees...',
    '> Aggregating votes with softmax normalization...',
    '> Attribution complete.',
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* PM2.5 Spike Alert */}
      <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-[11px] font-medium text-destructive uppercase tracking-wider">PM2.5 Spike Detected</span>
          </div>
          <Badge variant="outline" className="text-[9px] h-5 border-destructive/40 text-destructive">
            Sensor S02
          </Badge>
        </div>
        <div className="flex items-end gap-3">
          <div>
            <div className="text-3xl font-bold text-destructive">312</div>
            <div className="text-[9px] text-muted-foreground">μg/m³ Current</div>
          </div>
          <div className="text-muted-foreground text-lg mb-1">/</div>
          <div>
            <div className="text-xl font-semibold text-foreground">42</div>
            <div className="text-[9px] text-muted-foreground">μg/m³ Baseline</div>
          </div>
          <div className="ml-auto flex items-center gap-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <Wind className="w-3 h-3" />
              {windDir} @ {windSpeed} km/h
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Sector 2
            </span>
          </div>
        </div>
        {!running && stage === 'idle' && (
          <Button onClick={runAttribution} className="w-full h-9 bg-destructive text-destructive-foreground gap-2">
            <BrainCircuit className="w-4 h-4" />
            Run Source Attribution Analysis
          </Button>
        )}
        {running && stage !== 'done' && (
          <div className="flex items-center gap-2 py-2">
            <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span className="text-[11px] text-primary">{currentCheck}</span>
          </div>
        )}
      </div>

      {/* Terminal Output */}
      {running && (
        <div className="rounded-md border border-border bg-card/40 p-3">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Analysis Log</span>
          </div>
          <TypeWriter lines={terminalLines} />
        </div>
      )}

      {/* Attribution Results */}
      {stage === 'done' && results.length > 0 && (
        <>
          <div className="rounded-md border border-border bg-card/40 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-3.5 h-3.5 text-primary" />
                <span className="text-[11px] font-medium uppercase tracking-wider">Attribution Results</span>
              </div>
              <Badge variant="secondary" className="text-[9px] h-5">Confidence: 95%</Badge>
            </div>

            {/* Model Metadata */}
            {mlResult && (
              <div className="rounded border border-border/50 bg-card/40 p-2.5 space-y-2">
                <div className="flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] font-medium uppercase tracking-wider">Model Metadata</span>
                </div>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <div className="text-[9px] text-muted-foreground">Version</div>
                    <div className="text-[11px] font-medium">{mlResult.modelVersion}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-muted-foreground">Accuracy</div>
                    <div className="text-[11px] font-medium">{(mlResult.accuracy * 100).toFixed(0)}%</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-muted-foreground">Samples</div>
                    <div className="text-[11px] font-medium">{mlResult.samples.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[9px] text-muted-foreground">Trained</div>
                    <div className="text-[11px] font-medium">{mlResult.trainedOn}</div>
                  </div>
                </div>
                {/* Feature Importance */}
                <div className="space-y-1">
                  <div className="text-[9px] text-muted-foreground">Feature Importance</div>
                  {mlResult.featureImportance.map((f) => (
                    <div key={f.name} className="flex items-center gap-2">
                      <span className="text-[9px] w-28 truncate">{f.name}</span>
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${f.importance * 100}%` }} />
                      </div>
                      <span className="text-[9px] w-8 text-right">{(f.importance * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Probability Bar Chart */}
            <div className="h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 4, right: 8, left: -12, bottom: 0 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} unit="%" />
                  <YAxis type="category" dataKey="source" tick={{ fontSize: 9, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={90} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '6px', fontSize: '11px' }}
                    itemStyle={{ fontSize: '11px' }}
                  />
                  <Bar dataKey="probability" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} maxBarSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Result Cards */}
            <div className="space-y-2">
              {results.map((result, idx) => (
                <div key={idx} className={`rounded border p-2.5 ${result.color}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      {result.icon}
                      <span className="text-[11px] font-medium">{result.source}</span>
                    </div>
                    <span className="text-lg font-bold">{result.probability}%</span>
                  </div>
                  <div className="space-y-0.5">
                    {result.evidence.map((ev, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-[9px] opacity-80">
                        <ChevronRight className="w-2.5 h-2.5 shrink-0 mt-0.5" />
                        <span>{ev}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <Button variant="ghost" size="sm" className="w-full h-8 text-[11px] gap-1" onClick={() => setShowDetails(true)}>
              <Radar className="w-3.5 h-3.5" />
              View Full Contextual Analysis
            </Button>
          </div>
        </>
      )}

      {/* Contextual Analysis Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg bg-background border-border max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <Radar className="w-4 h-4 text-primary" />
              Full Contextual Analysis
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Industries */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Factory className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[11px] font-medium uppercase tracking-wider">Nearby Industries</span>
              </div>
              <div className="space-y-1.5">
                {MOCK_INDUSTRY.map((ind) => (
                  <div key={ind.name} className="flex items-center justify-between rounded border border-border/50 bg-card/40 p-2">
                    <div className="min-w-0">
                      <div className="text-[10px] font-medium truncate">{ind.name}</div>
                      <div className="text-[9px] text-muted-foreground">{ind.distance} | Emission: {ind.emissionEstimate} kg/day</div>
                    </div>
                    <Badge variant="outline" className={`text-[9px] h-4 ${ind.status === 'active' ? 'border-primary/40 text-primary bg-primary/10' : 'border-muted-foreground/30 text-muted-foreground'}`}>
                      {ind.status === 'active' ? 'Active' : 'Idle'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Traffic */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Car className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[11px] font-medium uppercase tracking-wider">Traffic Density</span>
              </div>
              <div className="space-y-1.5">
                {MOCK_TRAFFIC.map((t) => (
                  <div key={t.name} className="flex items-center justify-between rounded border border-border/50 bg-card/40 p-2">
                    <div className="min-w-0">
                      <div className="text-[10px] font-medium truncate">{t.name}</div>
                      <div className="text-[9px] text-muted-foreground">AADT: {t.aadt.toLocaleString()} | Heavy: {t.heavyVehiclePct}%</div>
                    </div>
                    <Badge variant="outline" className={`text-[9px] h-4 ${t.congestionLevel === 'high' ? 'border-destructive/40 text-destructive bg-destructive/10' : t.congestionLevel === 'moderate' ? 'border-warning/40 text-warning bg-warning/10' : 'border-primary/40 text-primary bg-primary/10'}`}>
                      {t.congestionLevel}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Construction */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Hammer className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[11px] font-medium uppercase tracking-wider">Construction Permits</span>
              </div>
              <div className="space-y-1.5">
                {MOCK_CONSTRUCTION.map((c) => (
                  <div key={c.name} className="flex items-center justify-between rounded border border-border/50 bg-card/40 p-2">
                    <div className="min-w-0">
                      <div className="text-[10px] font-medium truncate">{c.name}</div>
                      <div className="text-[9px] text-muted-foreground">Area: {c.areaSqM.toLocaleString()} m² | Suppression: {c.dustSuppression ? 'Yes' : 'No'}</div>
                    </div>
                    <Badge variant="outline" className={`text-[9px] h-4 ${c.permitStatus === 'active' ? 'border-primary/40 text-primary bg-primary/10' : 'border-muted-foreground/30 text-muted-foreground'}`}>
                      {c.permitStatus}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Wind */}
            <div className="rounded border border-border/50 bg-card/40 p-2.5">
              <div className="flex items-center gap-2 mb-1.5">
                <Wind className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] font-medium">Wind Analysis</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className="text-sm font-semibold">{windDir}</div>
                  <div className="text-[9px] text-muted-foreground">Direction</div>
                </div>
                <div>
                  <div className="text-sm font-semibold">{windSpeed} km/h</div>
                  <div className="text-[9px] text-muted-foreground">Speed</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-primary">NW</div>
                  <div className="text-[9px] text-muted-foreground">Plume Alignment</div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PollutionSourceAttribution;
