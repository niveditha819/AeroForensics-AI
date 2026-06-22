import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Car,
  Truck,
  Bus,
  Bike,
  ScanLine,
  CreditCard,
  IndianRupee,
  CheckCircle2,
  X,
  AlertTriangle,
  Gauge,
  Eye,
  FileText,
  Wallet,
  Smartphone,
  Cpu,
  Hash,
  CalendarDays,
  MapPin,
  Flame,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/db/supabase';

interface Vehicle {
  id: string;
  category: string;
  regNo: string;
  pollutionLevel: number;
  fastagStatus: 'linked' | 'missing' | 'sticker';
  status: 'clean' | 'violation';
  fineAmount: number;
  detectedAt: string;
  anprConfidence: number;
  vehicleAge: number;
  emissionClass: 'BS-IV' | 'BS-VI' | 'BS-III' | 'Pre-BS';
  estimatedCo2: number;
}

const MOCK_VEHICLES: Vehicle[] = [
  { id: 'V001', category: 'Private Car', regNo: 'DL04-AB-2847', pollutionLevel: 89, fastagStatus: 'linked', status: 'clean', fineAmount: 0, detectedAt: '10:23:14', anprConfidence: 98, vehicleAge: 3, emissionClass: 'BS-VI', estimatedCo2: 112 },
  { id: 'V002', category: 'M&HCV', regNo: 'HR26-TR-9912', pollutionLevel: 312, fastagStatus: 'linked', status: 'violation', fineAmount: 2500, detectedAt: '10:24:07', anprConfidence: 96, vehicleAge: 8, emissionClass: 'BS-IV', estimatedCo2: 487 },
  { id: 'V003', category: 'Auto Rickshaw', regNo: 'DL01-AR-5531', pollutionLevel: 178, fastagStatus: 'sticker', status: 'violation', fineAmount: 1000, detectedAt: '10:25:33', anprConfidence: 94, vehicleAge: 5, emissionClass: 'BS-IV', estimatedCo2: 89 },
  { id: 'V004', category: 'LCV', regNo: 'UP32-GH-4412', pollutionLevel: 245, fastagStatus: 'linked', status: 'violation', fineAmount: 1500, detectedAt: '10:26:18', anprConfidence: 97, vehicleAge: 6, emissionClass: 'BS-IV', estimatedCo2: 312 },
  { id: 'V005', category: 'Taxi', regNo: 'DL02-TX-8871', pollutionLevel: 95, fastagStatus: 'linked', status: 'clean', fineAmount: 0, detectedAt: '10:27:41', anprConfidence: 99, vehicleAge: 2, emissionClass: 'BS-VI', estimatedCo2: 98 },
  { id: 'V006', category: 'SCV', regNo: 'DL03-SC-1129', pollutionLevel: 201, fastagStatus: 'missing', status: 'violation', fineAmount: 1200, detectedAt: '10:28:55', anprConfidence: 91, vehicleAge: 12, emissionClass: 'BS-III', estimatedCo2: 245 },
  { id: 'V007', category: 'Private Car', regNo: 'HR12-CD-3391', pollutionLevel: 76, fastagStatus: 'linked', status: 'clean', fineAmount: 0, detectedAt: '10:29:22', anprConfidence: 99, vehicleAge: 1, emissionClass: 'BS-VI', estimatedCo2: 95 },
  { id: 'V008', category: 'Auto Rickshaw', regNo: 'DL05-AR-7742', pollutionLevel: 134, fastagStatus: 'sticker', status: 'violation', fineAmount: 1000, detectedAt: '10:30:11', anprConfidence: 93, vehicleAge: 7, emissionClass: 'BS-IV', estimatedCo2: 76 },
];

const CATEGORY_META: Record<string, { icon: React.ReactNode; color: string; label: string }> = {
  'SCV': { icon: <Car className="w-4 h-4" />, color: 'bg-info/10 text-info border-info/30', label: 'Small Commercial' },
  'LCV': { icon: <Truck className="w-4 h-4" />, color: 'bg-warning/10 text-warning border-warning/30', label: 'Light Commercial' },
  'M&HCV': { icon: <Bus className="w-4 h-4" />, color: 'bg-destructive/10 text-destructive border-destructive/30', label: 'Heavy Commercial' },
  'Taxi': { icon: <Car className="w-4 h-4" />, color: 'bg-primary/10 text-primary border-primary/30', label: 'Taxi' },
  'Private Car': { icon: <Car className="w-4 h-4" />, color: 'bg-muted text-muted-foreground border-border', label: 'Private Car' },
  'Auto Rickshaw': { icon: <Bike className="w-4 h-4" />, color: 'bg-accent/10 text-accent border-accent/30', label: 'Auto Rickshaw' },
};

const CCTVFrame: React.FC = () => {
  const [scanLine, setScanLine] = useState(0);
  React.useEffect(() => {
    const interval = setInterval(() => {
      setScanLine((prev) => (prev + 1) % 5);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full aspect-video rounded-md border border-border bg-slate-950 overflow-hidden">
      {/* Grid overlay */}
      <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(34,197,94,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.08) 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      {/* Simulated road */}
      <div className="absolute bottom-0 left-0 right-0 h-[45%] bg-slate-800/60" />
      <div className="absolute bottom-[45%] left-0 right-0 h-[1px] bg-yellow-500/30" />

      {/* Simulated vehicles with bounding boxes */}
      <div className="absolute bottom-[8%] left-[15%] w-[12%] h-[22%] rounded border-2 border-primary/70 bg-primary/5 animate-pulse">
        <div className="absolute -top-4 left-0 bg-primary text-[7px] text-primary-foreground px-1 rounded">CAR — PUC: 89</div>
      </div>
      <div className="absolute bottom-[6%] left-[55%] w-[18%] h-[28%] rounded border-2 border-destructive/70 bg-destructive/5 animate-pulse">
        <div className="absolute -top-4 left-0 bg-destructive text-[7px] text-destructive-foreground px-1 rounded">TRUCK — PUC: 312</div>
      </div>
      <div className="absolute bottom-[10%] left-[78%] w-[8%] h-[16%] rounded border-2 border-warning/70 bg-warning/5 animate-pulse">
        <div className="absolute -top-4 left-0 bg-warning text-[7px] text-warning-foreground px-1 rounded">AUTO — PUC: 178</div>
      </div>

      {/* Scanning lines */}
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="absolute left-0 right-0 h-[1px] bg-primary/20 transition-all duration-500"
          style={{ top: `${20 + i * 15}%`, opacity: scanLine === i ? 1 : 0.2 }}
        />
      ))}

      {/* HUD overlay */}
      <div className="absolute top-2 left-2 flex items-center gap-1.5">
        <ScanLine className="w-3 h-3 text-primary animate-pulse" />
        <span className="text-[8px] text-primary uppercase tracking-wider">AI CCTV — Cam-04</span>
      </div>
      <div className="absolute top-2 right-2 text-[8px] text-muted-foreground">
        {new Date().toLocaleTimeString('en-IN', { hour12: false })}
      </div>
      <div className="absolute bottom-2 left-2 text-[8px] text-muted-foreground">
        Lat: 28.6139° N | Long: 77.2090° E
      </div>
      <div className="absolute bottom-2 right-2 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
        <span className="text-[8px] text-primary">LIVE</span>
      </div>
    </div>
  );
};

const UPIPaymentDialog: React.FC<{ open: boolean; onOpenChange: (v: boolean) => void; vehicle: Vehicle | null }> = ({ open, onOpenChange, vehicle }) => {
  const [step, setStep] = useState<'confirm' | 'processing' | 'done'>('confirm');
  const [method, setMethod] = useState<'fastag' | 'upi'>('fastag');
  const [upiId, setUpiId] = useState('');
  const [txnId, setTxnId] = useState('');
  const [balanceInfo, setBalanceInfo] = useState<string | null>(null);

  React.useEffect(() => {
    if (open) {
      setStep('confirm');
      setMethod('fastag');
      setUpiId('');
      setTxnId('');
      setBalanceInfo(null);
      if (vehicle?.fastagStatus === 'linked') {
        checkBalance();
      }
    }
  }, [open]);

  const checkBalance = async () => {
    if (!vehicle) return;
    try {
      const { data } = await supabase.functions.invoke('fastag-service', {
        body: { action: 'balance-check', vehicleReg: vehicle.regNo, amount: vehicle.fineAmount },
      });
      if (data?.found) {
        setBalanceInfo(`Balance: ₹${data.balance.toLocaleString('en-IN')} | Status: ${data.status}`);
        if (!data.canDeduct) setMethod('upi');
      } else {
        setBalanceInfo('Not registered. Use UPI.');
        setMethod('upi');
      }
    } catch {
      setBalanceInfo(null);
    }
  };

  const handlePay = async () => {
    if (!vehicle) return;
    setStep('processing');
    try {
      const actionType = method === 'fastag' ? 'deduct-fine' : 'upi-pay';
      const { data } = await supabase.functions.invoke('fastag-service', {
        body: {
          action: actionType,
          vehicleReg: vehicle.regNo,
          amount: vehicle.fineAmount,
          upiId: method === 'upi' ? upiId : undefined,
        },
      });

      if (data?.success) {
        setTxnId(data.transactionId);
        setStep('done');
        toast(
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span className="text-sm">Fine paid! {data.transactionId}</span>
          </div>
        );
      } else {
        setStep('confirm');
        toast(
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <span className="text-sm">{data?.message || 'Payment failed. Try UPI.'}</span>
          </div>
        );
      }
    } catch {
      setStep('confirm');
      toast('Payment service unavailable. Try again later.');
    }
  };

  if (!vehicle) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md bg-background border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm">
            <CreditCard className="w-4 h-4 text-primary" />
            Pollution Fine Payment
          </DialogTitle>
        </DialogHeader>
        {step === 'confirm' && (
          <div className="space-y-3">
            <div className="rounded-md border border-border bg-card/40 p-3 space-y-2">
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Vehicle</span>
                <span className="font-medium">{vehicle.regNo}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Category</span>
                <span>{vehicle.category}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Pollution Level</span>
                <Badge variant="outline" className="text-[9px] h-4 border-destructive/60 text-destructive bg-destructive/10">
                  {vehicle.pollutionLevel} ppm
                </Badge>
              </div>
              {balanceInfo && (
                <div className="text-[9px] text-muted-foreground bg-card/60 rounded px-2 py-1">
                  {balanceInfo}
                </div>
              )}
              <div className="border-t border-border/50 pt-2 flex justify-between items-center">
                <span className="text-[11px] text-muted-foreground">Fine Amount</span>
                <span className="text-lg font-semibold flex items-center gap-0.5">
                  <IndianRupee className="w-4 h-4" />
                  {vehicle.fineAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="text-[10px] text-muted-foreground">Select Payment Method</div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="ghost"
                onClick={() => setMethod('fastag')}
                className={`h-12 flex-col gap-1 text-[10px] border ${method === 'fastag' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}
              >
                <ScanLine className="w-3.5 h-3.5" />
                FASTag Auto
              </Button>
              <Button
                variant="ghost"
                onClick={() => setMethod('upi')}
                className={`h-12 flex-col gap-1 text-[10px] border ${method === 'upi' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}
              >
                <Wallet className="w-3.5 h-3.5" />
                UPI / QR
              </Button>
            </div>

            {method === 'upi' && (
              <div className="space-y-1.5">
                <label className="text-[11px] text-muted-foreground">UPI ID</label>
                <Input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="name@upi" className="h-9 text-xs bg-card border-border" />
              </div>
            )}

            <Button onClick={handlePay} className="w-full h-10 bg-primary text-primary-foreground gap-2">
              <IndianRupee className="w-4 h-4" />
              Pay ₹{vehicle.fineAmount.toLocaleString('en-IN')}
            </Button>
          </div>
        )}
        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-xs text-muted-foreground">Processing {method === 'fastag' ? 'FASTag' : 'UPI'} payment...</p>
          </div>
        )}
        {step === 'done' && (
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <CheckCircle2 className="w-10 h-10 text-primary" />
            <div className="text-center">
              <p className="text-sm font-medium">Payment Successful</p>
              <p className="text-[11px] text-muted-foreground">Transaction ID: {txnId}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Challan auto-generated and sent to registered mobile</p>
            </div>
            <Button variant="ghost" size="sm" className="h-8 text-[11px] gap-1" onClick={() => onOpenChange(false)}>
              <FileText className="w-3.5 h-3.5" />
              Download Challan
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const AutoStickerForm: React.FC<{ open: boolean; onOpenChange: (v: boolean) => void }> = ({ open, onOpenChange }) => {
  const [regNo, setRegNo] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [mobile, setMobile] = useState('');
  const [submitted, setSubmitted] = useState(false);

  React.useEffect(() => {
    if (open) { setRegNo(''); setOwnerName(''); setMobile(''); setSubmitted(false); }
  }, [open]);

  const handleSubmit = () => {
    if (!regNo || !ownerName || !mobile) return;
    setSubmitted(true);
    toast(
      <div className="flex items-center gap-2">
        <CheckCircle2 className="w-4 h-4 text-primary" />
        <span className="text-sm">Sticker registered: {regNo}</span>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md bg-background border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm">
            <ScanLine className="w-4 h-4 text-primary" />
            Auto Rickshaw Sticker Registration
          </DialogTitle>
        </DialogHeader>
        {!submitted ? (
          <div className="space-y-3">
            <p className="text-[11px] text-muted-foreground">
              Register your auto-rickshaw with a pollution-monitoring FASTag-style sticker for automatic fine deduction.
            </p>
            <div className="space-y-2">
              <label className="text-[11px] text-muted-foreground">Vehicle Registration Number</label>
              <Input value={regNo} onChange={(e) => setRegNo(e.target.value)} placeholder="DL01-AR-XXXX" className="h-9 text-xs bg-card border-border" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] text-muted-foreground">Owner Name</label>
              <Input value={ownerName} onChange={(e) => setOwnerName(e.target.value)} placeholder="Full name" className="h-9 text-xs bg-card border-border" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] text-muted-foreground">Mobile Number</label>
              <Input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="+91 XXXXX XXXXX" className="h-9 text-xs bg-card border-border" />
            </div>
            <Button onClick={handleSubmit} className="w-full h-9 bg-primary text-primary-foreground gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Register Sticker
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 gap-3">
            <CheckCircle2 className="w-10 h-10 text-primary" />
            <div className="text-center">
              <p className="text-sm font-medium">Registration Successful</p>
              <p className="text-[11px] text-muted-foreground">Sticker ID: STK-{Date.now().toString().slice(-8)}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Link your UPI ID to enable auto-deduction of pollution fines</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const VehicleEnforcementPanel: React.FC = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [stickerOpen, setStickerOpen] = useState(false);

  const violations = MOCK_VEHICLES.filter((v) => v.status === 'violation');
  const clean = MOCK_VEHICLES.filter((v) => v.status === 'clean');

  const categoryCounts = MOCK_VEHICLES.reduce((acc, v) => {
    acc[v.category] = (acc[v.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handlePay = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setPayOpen(true);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Module Title */}
      <div className="flex items-center gap-2">
        <Cpu className="w-3.5 h-3.5 text-primary" />
        <span className="text-[11px] font-medium uppercase tracking-wider">Vehicle Emission Intelligence Engine</span>
      </div>

      {/* CCTV Feed */}
      <div className="rounded-md border border-border bg-card/40 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-medium uppercase tracking-wider">AI CCTV + ANPR Detection Feed</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/citizen"
              className="flex items-center gap-1 text-[9px] text-primary border border-primary/20 bg-primary/10 rounded px-1.5 py-0.5 hover:bg-primary/20 transition-colors"
            >
              <Smartphone className="w-3 h-3" />
              Citizen App
            </Link>
            <Badge variant="secondary" className="text-[9px] h-5">Cam-04 | ITO Crossing</Badge>
          </div>
        </div>
        <CCTVFrame />
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded bg-card/60 border border-border p-2">
            <div className="text-lg font-semibold text-foreground">{violations.length}</div>
            <div className="text-[9px] text-muted-foreground uppercase">Violations</div>
          </div>
          <div className="rounded bg-card/60 border border-border p-2">
            <div className="text-lg font-semibold text-primary">{clean.length}</div>
            <div className="text-[9px] text-muted-foreground uppercase">Clean</div>
          </div>
          <div className="rounded bg-card/60 border border-border p-2">
            <div className="text-lg font-semibold text-destructive">
              <IndianRupee className="w-3.5 h-3.5 inline" />
              {(violations.reduce((s, v) => s + v.fineAmount, 0)).toLocaleString('en-IN')}
            </div>
            <div className="text-[9px] text-muted-foreground uppercase">Total Fines</div>
          </div>
        </div>
      </div>

      {/* Vehicle Categories */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {Object.entries(CATEGORY_META).map(([cat, meta]) => (
          <div key={cat} className={`rounded-md border p-2.5 flex items-center gap-2 ${meta.color}`}>
            {meta.icon}
            <div className="min-w-0">
              <div className="text-[11px] font-medium truncate">{meta.label}</div>
              <div className="text-[10px] opacity-70">{categoryCounts[cat] || 0} detected</div>
            </div>
          </div>
        ))}
      </div>

      {/* Pollution Hotspot Map */}
      <div className="rounded-md border border-border bg-card/40 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Flame className="w-3.5 h-3.5 text-destructive" />
          <span className="text-[11px] font-medium uppercase tracking-wider">Real-Time Pollution Hotspot Map</span>
        </div>
        <div className="relative w-full aspect-[16/10] rounded-md border border-border bg-slate-950 overflow-hidden">
          <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(34,197,94,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.06) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
          <div className="absolute top-[15%] left-[55%] w-[20%] h-[25%] rounded-full bg-destructive/20 blur-md animate-pulse" />
          <div className="absolute top-[25%] left-[58%] w-[8%] h-[10%] rounded-full bg-destructive/40 blur-sm" />
          <div className="absolute top-[45%] left-[30%] w-[12%] h-[15%] rounded-full bg-warning/20 blur-md" />
          <div className="absolute top-[60%] left-[70%] w-[10%] h-[12%] rounded-full bg-warning/15 blur-md" />
          <div className="absolute top-[20%] left-[20%] w-[8%] h-[10%] rounded-full bg-primary/15 blur-sm" />
          <div className="absolute top-[30%] left-0 right-0 h-[2px] bg-slate-700/40" />
          <div className="absolute top-[55%] left-0 right-0 h-[2px] bg-slate-700/40" />
          <div className="absolute top-0 bottom-0 left-[40%] w-[2px] bg-slate-700/40" />
          <div className="absolute top-[12%] left-[56%] text-[8px] text-destructive font-medium bg-background/80 px-1 rounded">High — Ring Road</div>
          <div className="absolute top-[42%] left-[28%] text-[8px] text-warning font-medium bg-background/80 px-1 rounded">Med — Metro Site</div>
          <div className="absolute top-[58%] left-[68%] text-[8px] text-warning font-medium bg-background/80 px-1 rounded">Med — Highway 44</div>
          <div className="absolute top-[18%] left-[18%] text-[8px] text-primary font-medium bg-background/80 px-1 rounded">Low — Zone B</div>
          <div className="absolute bottom-2 left-2 flex items-center gap-2 text-[8px] text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive/60" /> High</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning/60" /> Med</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary/60" /> Low</span>
          </div>
        </div>
      </div>

      {/* Violation Table */}
      <div className="rounded-md border border-border bg-card/40 overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
            <span className="text-[11px] font-medium uppercase tracking-wider">Detected Violations</span>
          </div>
          <Button variant="ghost" size="sm" className="h-7 text-[10px] gap-1 text-primary" onClick={() => setStickerOpen(true)}>
            <ScanLine className="w-3.5 h-3.5" />
            Register Sticker
          </Button>
        </div>
        <div className="divide-y divide-border/50">
          {violations.map((v) => (
            <div key={v.id} className="px-3 py-2.5 hover:bg-card/60 transition-colors">
              <div className="flex items-center gap-3">
                <div className="shrink-0">
                  {CATEGORY_META[v.category]?.icon || <Car className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-medium">{v.regNo}</span>
                    <Badge variant="outline" className="text-[9px] h-4 border-destructive/60 text-destructive bg-destructive/10">
                      {v.pollutionLevel} ppm
                    </Badge>
                    <Badge variant="outline" className="text-[9px] h-4 border-border text-muted-foreground">
                      <Hash className="w-2.5 h-2.5 mr-0.5" />
                      {v.emissionClass}
                    </Badge>
                  </div>
                  <div className="text-[10px] text-muted-foreground">{v.category} | {v.detectedAt}</div>
                </div>
                <div className="shrink-0 flex items-center gap-1.5">
                  {v.fastagStatus === 'linked' ? (
                    <Badge variant="outline" className="text-[9px] h-5 border-primary/60 text-primary bg-primary/10">
                      <CheckCircle2 className="w-3 h-3 mr-0.5" />
                      FASTag
                    </Badge>
                  ) : v.fastagStatus === 'sticker' ? (
                    <Badge variant="outline" className="text-[9px] h-5 border-warning/60 text-warning bg-warning/10">
                      <ScanLine className="w-3 h-3 mr-0.5" />
                      Sticker
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[9px] h-5 border-muted-foreground/40 text-muted-foreground">
                      No Tag
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[10px] gap-1 text-destructive hover:text-destructive/80"
                    onClick={() => handlePay(v)}
                  >
                    <IndianRupee className="w-3 h-3" />
                    {v.fineAmount.toLocaleString('en-IN')}
                  </Button>
                </div>
              </div>
              <div className="mt-1.5 ml-7 grid grid-cols-3 gap-1.5">
                <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                  <ScanLine className="w-3 h-3" />
                  ANPR: {v.anprConfidence}%
                </div>
                <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                  <CalendarDays className="w-3 h-3" />
                  Age: {v.vehicleAge} yrs
                </div>
                <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                  <MapPin className="w-3 h-3" />
                  CO₂ est: {v.estimatedCo2} g/km
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <UPIPaymentDialog open={payOpen} onOpenChange={setPayOpen} vehicle={selectedVehicle} />
      <AutoStickerForm open={stickerOpen} onOpenChange={setStickerOpen} />
    </div>
  );
};

export default VehicleEnforcementPanel;
