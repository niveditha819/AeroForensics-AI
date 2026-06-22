import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simulated NPCI FASTag API data store
const MOCK_FASTAG_DB: Record<string, { balance: number; status: 'active' | 'blocked' | 'low_balance'; lastDeduction: string; upiLinked: boolean }> = {
  'DL04-AB-2847': { balance: 2450, status: 'active', lastDeduction: '2026-06-20', upiLinked: true },
  'HR26-TR-9912': { balance: 3800, status: 'active', lastDeduction: '2026-06-18', upiLinked: true },
  'DL01-AR-5531': { balance: 1200, status: 'low_balance', lastDeduction: '2026-06-15', upiLinked: true },
  'UP32-GH-4412': { balance: 5600, status: 'active', lastDeduction: '2026-06-19', upiLinked: true },
  'DL02-TX-8871': { balance: 8900, status: 'active', lastDeduction: '2026-06-21', upiLinked: true },
  'DL03-SC-1129': { balance: 0, status: 'blocked', lastDeduction: '2026-06-10', upiLinked: false },
  'HR12-CD-3391': { balance: 6700, status: 'active', lastDeduction: '2026-06-20', upiLinked: true },
  'DL05-AR-7742': { balance: 450, status: 'low_balance', lastDeduction: '2026-06-19', upiLinked: true },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, vehicleReg, amount, upiId } = await req.json();
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // --- BALANCE CHECK ---
    if (action === 'balance-check') {
      const record = MOCK_FASTAG_DB[vehicleReg];
      if (!record) {
        return new Response(JSON.stringify({
          found: false,
          message: 'Vehicle not registered with FASTag. Link UPI/FASTag first.',
          balance: 0,
          status: 'not_found',
          upiLinked: false,
        }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({
        found: true,
        balance: record.balance,
        status: record.status,
        upiLinked: record.upiLinked,
        lastDeduction: record.lastDeduction,
        canDeduct: record.status === 'active' && record.balance >= (amount || 0),
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // --- FINE DEDUCTION ---
    if (action === 'deduct-fine') {
      const record = MOCK_FASTAG_DB[vehicleReg];
      if (!record) {
        return new Response(JSON.stringify({ success: false, message: 'Vehicle not registered' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404,
        });
      }
      if (record.status !== 'active') {
        return new Response(JSON.stringify({ success: false, message: `FASTag status: ${record.status}` }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }
      if (record.balance < amount) {
        return new Response(JSON.stringify({ success: false, message: 'Insufficient balance. Use UPI instead.' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      // Simulate deduction
      record.balance -= amount;
      record.lastDeduction = new Date().toISOString().slice(0, 10);
      if (record.balance < 500) {
        record.status = 'low_balance';
      }

      // Log transaction
      await supabase.from('evidence_packets').insert({
        anomaly_id: vehicleReg,
        case_data: {
          type: 'fastag_deduction',
          vehicleReg,
          amount,
          remainingBalance: record.balance,
          upiId: upiId || null,
          timestamp: new Date().toISOString(),
        },
      });

      return new Response(JSON.stringify({
        success: true,
        transactionId: `NPCI-${Date.now()}`,
        deductedAmount: amount,
        remainingBalance: record.balance,
        status: record.status,
        timestamp: new Date().toISOString(),
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // --- UPI PAYMENT (fallback for non-FASTag vehicles) ---
    if (action === 'upi-pay') {
      // Simulate UPI transaction
      const txnId = `UPI${Date.now()}`;

      await supabase.from('evidence_packets').insert({
        anomaly_id: vehicleReg,
        case_data: {
          type: 'upi_payment',
          vehicleReg,
          amount,
          upiId,
          transactionId: txnId,
          timestamp: new Date().toISOString(),
        },
      });

      return new Response(JSON.stringify({
        success: true,
        transactionId: txnId,
        deductedAmount: amount,
        paymentMode: 'UPI',
        timestamp: new Date().toISOString(),
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // --- LINK UPI TO VEHICLE ---
    if (action === 'link-upi') {
      if (!MOCK_FASTAG_DB[vehicleReg]) {
        MOCK_FASTAG_DB[vehicleReg] = { balance: 0, status: 'active', lastDeduction: '-', upiLinked: true };
      } else {
        MOCK_FASTAG_DB[vehicleReg].upiLinked = true;
      }
      return new Response(JSON.stringify({
        success: true,
        vehicleReg,
        upiLinked: true,
        message: 'UPI linked successfully. You can now pay fines automatically.',
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
