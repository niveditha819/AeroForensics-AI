import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Fetch latest readings per sensor
    const { data: readings, error: rErr } = await supabase
      .from('sensor_readings')
      .select('id, sensor_id, so2, pm25, nox, wind_dir')
      .order('timestamp', { ascending: false });

    if (rErr) throw rErr;

    const latestBySensor = new Map<string, (typeof readings)[0]>();
    for (const r of readings ?? []) {
      if (!latestBySensor.has(r.sensor_id)) {
        latestBySensor.set(r.sensor_id, r);
      }
    }

    // Thresholds
    const thresholds: Record<string, number> = {
      S01: { so2: 100, pm25: 150, nox: 80 },
      S02: { so2: 120, pm25: 120, nox: 90 },
      S03: { so2: 110, pm25: 140, nox: 85 },
      S04: { so2: 90, pm25: 130, nox: 70 },
      S05: { so2: 130, pm25: 160, nox: 100 },
    } as unknown as Record<string, number>;

    const anomalyTypeMap: Record<string, string> = {
      so2: 'SO2 Plume Spike',
      pm25: 'PM2.5 Burst',
      nox: 'NOx Overflow',
    };

    const sourceMap: Record<string, string> = {
      S01: 'Sector 2 Smelter',
      S02: 'Sector 5 Power Station',
      S03: 'Sector 7 Refinery',
      S04: 'Sector 4 Industrial Plant',
      S05: 'Sector 1 Chemical Depot',
    };

    const created: string[] = [];

    for (const [sensorId, reading] of latestBySensor.entries()) {
      const t = thresholds[sensorId] as unknown as Record<string, number> || { so2: 100, pm25: 150, nox: 80 };
      const metrics: [string, number, number][] = [
        ['so2', reading.so2, t.so2 || 100],
        ['pm25', reading.pm25, t.pm25 || 150],
        ['nox', reading.nox, t.nox || 80],
      ];

      for (const [metric, value, threshold] of metrics) {
        if (value > threshold) {
          const pct = Math.round((value / threshold) * 100);
          const severity = pct > 200 ? 'critical' : 'warning';
          const id = `ANM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 9000 + 1000)}`;

          const { error: iErr } = await supabase.from('anomalies').insert({
            id,
            sensor_id: sensorId,
            anomaly_type: anomalyTypeMap[metric] || 'Unknown Anomaly',
            severity,
            source: sourceMap[sensorId] || 'Unknown Source',
            status: 'active',
            detected_at: new Date().toISOString(),
            so2: reading.so2,
            pm25: reading.pm25,
            nox: reading.nox,
            wind_dir: reading.wind_dir,
          });

          if (!iErr) created.push(id);
          break; // One anomaly per sensor per scan
        }
      }
    }

    return new Response(JSON.stringify({ created, count: created.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
