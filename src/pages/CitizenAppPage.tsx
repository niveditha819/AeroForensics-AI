import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Car,
  IndianRupee,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  ScanLine,
  FileText,
  ChevronRight,
  Shield,
  QrCode,
  Wallet,
  Ban,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/db/supabase';

interface Challan {
  id: string;
  vehicleReg: string;
  category: string;
  pollutionLevel: number;
  fineAmount: number;
  status: 'unpaid' | 'paid' | 'disputed';
  detectedAt: string;
  location: string;
  paymentMode?: 'fastag' | 'upi';
  transactionId?: string;
}

const MOCK_CHALLANS: Challan[] = [
  { id: 'CH-2026-00421', vehicleReg: 'DL04-AB-2847', category: 'Private Car', pollutionLevel: 89, fineAmount: 0, status: 'paid', detectedAt: '2026-06-20 09:14', location: 'ITO Crossing, Delhi', paymentMode: 'fastag', transactionId: 'NPCI-178291' },
  { id: 'CH-2026-00418', vehicleReg: 'HR26-TR-9912', category: 'M&HCV', pollutionLevel: 312, fineAmount: 2500, status: 'unpaid', detectedAt: '2026-06-19 14:22', location: 'Sector 5 Highway, Haryana' },
  { id: 'CH-2026-00415', vehicleReg: 'DL01-AR-5531', category: 'Auto Rickshaw', pollutionLevel: 178, fineAmount: 1000, status: 'unpaid', detectedAt: '2026-06-18 07:45', location: 'Lajpat Nagar, Delhi' },
  { id: 'CH-2026-00412', vehicleReg: 'UP32-GH-4412', category: 'LCV', pollutionLevel: 245, fineAmount: 1500, status: 'paid', detectedAt: '2026-06-17 18:03', location: 'Noida Sector 62', paymentMode: 'upi', transactionId: 'UPI-892341' },
  { id: 'CH-2026-00409', vehicleReg: 'DL02-TX-8871', category: 'Taxi', pollutionLevel: 95, fineAmount: 0, status: 'paid', detectedAt: '2026-06-16 11:37', location: 'Airport Road, Delhi', paymentMode: 'fastag', transactionId: 'NPCI-178190' },
  { id: 'CH-2026-00405', vehicleReg: 'DL03-SC-1129', category: 'SCV', pollutionLevel: 201, fineAmount: 1200, status: 'disputed', detectedAt: '2026-06-15 23:09', location: 'Okhla Industrial Area' },
];

const PaymentDialog: React.FC<{
  open: boolean;
  onOpenChange: (v: boolean) => void;
  challan: Challan | null;
  onPaid: (challanId: string) => void;
}> = ({ open, onOpenChange, challan, onPaid }) => {
  const [step, setStep] = useState<'choose' | 'processing' | 'done'>('choose');
  const [method, setMethod] = useState<'fastag' | 'upi'>('fastag');
  const [upiId, setUpiId] = useState('');

  useEffect(() => { if (open) { setStep('choose'); setMethod('fastag'); setUpiId(''); } }, [open]);

  const handlePay = async () => {
    if (!challan) return;
    setStep('processing');

    try {
      const { data } = await supabase.functions.invoke('fastag-service', {
        body: {
          action: method,
          vehicleReg: challan.vehicleReg,
          amount: challan.fineAmount,
          upiId: method === 'upi' ? upiId : undefined,
        },
      });

      setTimeout(() => {
        if (data?.success) {
          setStep('done');
          onPaid(challan.id);
          toast(
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span className="text-sm">Fine paid! Txn: {data.transactionId}</span>
            </div>
          );
        } else {
          setStep('choose');
          toast(
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <span className="text-sm">{data?.message || 'Payment failed. Try UPI.'}</span>
            </div>
          );
        }
      }, 1800);
    } catch {
      setStep('choose');
      toast('Payment service unavailable. Please try again.');
    }
  };

  if (!challan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md bg-background border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm">
            <IndianRupee className="w-4 h-4 text-primary" />
            Pay Challan — {challan.vehicleReg}
          </DialogTitle>
        </DialogHeader>

        {step === 'choose' && (
          <div className="space-y-3">
            <div className="rounded-md border border-border bg-card/40 p-3 space-y-2">
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Challan ID</span>
                <span className="font-medium">{challan.id}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Location</span>
                <span>{challan.location}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Pollution Level</span>
                <Badge variant="outline" className="text-[9px] h-4 border-destructive/60 text-destructive bg-destructive/10">
                  {challan.pollutionLevel} ppm
                </Badge>
              </div>
              <div className="border-t border-border/50 pt-2 flex justify-between items-center">
                <span className="text-[11px] text-muted-foreground">Fine Amount</span>
                <span className="text-lg font-semibold flex items-center gap-0.5">
                  <IndianRupee className="w-4 h-4" />
                  {challan.fineAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="text-[10px] text-muted-foreground">Select Payment Method</div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="ghost"
                onClick={() => setMethod('fastag')}
                className={`h-14 flex-col gap-1 text-[11px] border ${method === 'fastag' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}
              >
                <ScanLine className="w-4 h-4" />
                FASTag Auto-Deduct
              </Button>
              <Button
                variant="ghost"
                onClick={() => setMethod('upi')}
                className={`h-14 flex-col gap-1 text-[11px] border ${method === 'upi' ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'}`}
              >
                <QrCode className="w-4 h-4" />
                UPI / QR Code
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
              Pay ₹{challan.fineAmount.toLocaleString('en-IN')}
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
              <p className="text-[11px] text-muted-foreground">Challan marked as paid</p>
            </div>
            <Button variant="ghost" size="sm" className="h-8 text-[11px] gap-1" onClick={() => onOpenChange(false)}>
              <FileText className="w-3.5 h-3.5" />
              Download Receipt
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const LinkFASTagDialog: React.FC<{ open: boolean; onOpenChange: (v: boolean) => void }> = ({ open, onOpenChange }) => {
  const [regNo, setRegNo] = useState('');
  const [upiId, setUpiId] = useState('');
  const [linked, setLinked] = useState(false);

  useEffect(() => { if (open) { setRegNo(''); setUpiId(''); setLinked(false); } }, [open]);

  const handleLink = async () => {
    if (!regNo || !upiId) return;
    try {
      await supabase.functions.invoke('fastag-service', {
        body: { action: 'link-upi', vehicleReg: regNo, upiId },
      });
      setLinked(true);
      toast(
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          <span className="text-sm">FASTag linked to {regNo}</span>
        </div>
      );
    } catch {
      toast('Failed to link. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md bg-background border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm">
            <ScanLine className="w-4 h-4 text-primary" />
            Link FASTag / UPI
          </DialogTitle>
        </DialogHeader>
        {!linked ? (
          <div className="space-y-3">
            <p className="text-[11px] text-muted-foreground">
              Link your vehicle registration with FASTag or UPI for automatic fine payment.
            </p>
            <div className="space-y-1.5">
              <label className="text-[11px] text-muted-foreground">Vehicle Registration</label>
              <Input value={regNo} onChange={(e) => setRegNo(e.target.value)} placeholder="DL04-AB-2847" className="h-9 text-xs bg-card border-border" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] text-muted-foreground">UPI ID</label>
              <Input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="name@upi" className="h-9 text-xs bg-card border-border" />
            </div>
            <Button onClick={handleLink} className="w-full h-9 bg-primary text-primary-foreground gap-2">
              <CreditCard className="w-4 h-4" />
              Link Account
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 gap-3">
            <CheckCircle2 className="w-10 h-10 text-primary" />
            <div className="text-center">
              <p className="text-sm font-medium">Account Linked Successfully</p>
              <p className="text-[11px] text-muted-foreground">{regNo} is now linked to {upiId}</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

const CitizenAppPage: React.FC = () => {
  const [challans, setChallans] = useState<Challan[]>(MOCK_CHALLANS);
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid'>('all');
  const [payOpen, setPayOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [selectedChallan, setSelectedChallan] = useState<Challan | null>(null);

  const filtered = challans.filter((c) => filter === 'all' || c.status === filter);
  const unpaidCount = challans.filter((c) => c.status === 'unpaid').length;
  const totalDue = challans.filter((c) => c.status === 'unpaid').reduce((s, c) => s + c.fineAmount, 0);

  const handlePayClick = (challan: Challan) => {
    setSelectedChallan(challan);
    setPayOpen(true);
  };

  const handlePaid = (challanId: string) => {
    setChallans((prev) => prev.map((c) => c.id === challanId ? { ...c, status: 'paid' as const } : c));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-sm px-4 py-3">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-[11px]">Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">e-Challan</span>
          </div>
          <Button variant="ghost" size="sm" className="h-8 text-[11px] gap-1 text-primary" onClick={() => setLinkOpen(true)}>
            <CreditCard className="w-3.5 h-3.5" />
            Link
          </Button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-4 space-y-4">
        {/* Summary Card */}
        <div className="rounded-xl border border-border bg-card/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-muted-foreground">Total Outstanding</p>
              <p className="text-2xl font-bold flex items-center gap-1">
                <IndianRupee className="w-5 h-5" />
                {totalDue.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center">
              <Bell className="w-4 h-4 text-destructive" />
              {unpaidCount > 0 && (
                <span className="absolute -mt-3 -mr-3 min-w-[16px] h-4 rounded-full bg-destructive text-[9px] text-white flex items-center justify-center px-1">
                  {unpaidCount}
                </span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded bg-card/60 p-2">
              <div className="text-sm font-semibold">{challans.length}</div>
              <div className="text-[9px] text-muted-foreground">Total</div>
            </div>
            <div className="rounded bg-card/60 p-2">
              <div className="text-sm font-semibold text-destructive">{unpaidCount}</div>
              <div className="text-[9px] text-muted-foreground">Unpaid</div>
            </div>
            <div className="rounded bg-card/60 p-2">
              <div className="text-sm font-semibold text-primary">{challans.filter((c) => c.status === 'paid').length}</div>
              <div className="text-[9px] text-muted-foreground">Paid</div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 border-b border-border pb-2">
          {(['all', 'unpaid', 'paid'] as const).map((f) => (
            <Button
              key={f}
              variant="ghost"
              size="sm"
              className={`h-8 text-[11px] px-3 ${filter === f ? 'bg-primary/15 text-primary' : 'text-muted-foreground'}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>

        {/* Challan List */}
        <div className="space-y-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <CheckCircle2 className="w-8 h-8 mb-2 opacity-40" />
              <p className="text-sm">No challans found</p>
            </div>
          ) : (
            filtered.map((challan) => (
              <div key={challan.id} className="rounded-xl border border-border bg-card/40 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Car className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[11px] font-medium">{challan.vehicleReg}</span>
                    <Badge variant="outline" className="text-[9px] h-4 px-1 border-border">
                      {challan.category}
                    </Badge>
                  </div>
                  {challan.status === 'paid' ? (
                    <Badge variant="outline" className="text-[9px] h-5 border-primary/60 text-primary bg-primary/10">
                      <CheckCircle2 className="w-3 h-3 mr-0.5" />
                      Paid
                    </Badge>
                  ) : challan.status === 'disputed' ? (
                    <Badge variant="outline" className="text-[9px] h-5 border-warning/60 text-warning bg-warning/10">
                      <Ban className="w-3 h-3 mr-0.5" />
                      Disputed
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[9px] h-5 border-destructive/60 text-destructive bg-destructive/10">
                      <AlertTriangle className="w-3 h-3 mr-0.5" />
                      Unpaid
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-3 h-3" />
                    {challan.detectedAt}
                  </span>
                  <span className="flex items-center gap-0.5">
                    <MapPin className="w-3 h-3" />
                    {challan.location}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground">Fine:</span>
                    <span className="text-sm font-semibold flex items-center gap-0.5">
                      <IndianRupee className="w-3.5 h-3.5" />
                      {challan.fineAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {challan.status === 'unpaid' && challan.fineAmount > 0 ? (
                    <Button
                      size="sm"
                      className="h-8 text-[11px] bg-primary text-primary-foreground gap-1"
                      onClick={() => handlePayClick(challan)}
                    >
                      <Wallet className="w-3 h-3" />
                      Pay Now
                    </Button>
                  ) : challan.status === 'paid' ? (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {challan.paymentMode?.toUpperCase()} • {challan.transactionId}
                    </span>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      <PaymentDialog open={payOpen} onOpenChange={setPayOpen} challan={selectedChallan} onPaid={handlePaid} />
      <LinkFASTagDialog open={linkOpen} onOpenChange={setLinkOpen} />
    </div>
  );
};

export default CitizenAppPage;
