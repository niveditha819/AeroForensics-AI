import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';

export interface AnomalyRecord {
  id: string;
  sensor_id: string;
  anomaly_type: string;
  severity: 'critical' | 'warning';
  source: string;
  status: string;
  detected_at: string;
  resolved_at: string | null;
  so2: number;
  pm25: number;
  nox: number;
  wind_dir: string;
  unit_dispatched: string | null;
  eta: string | null;
}

export function useAnomalies() {
  const [anomalies, setAnomalies] = useState<AnomalyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('anomalies').select('*').order('detected_at', { ascending: false });
      setAnomalies(data ?? []);
      setLoading(false);
    };
    fetch();

    const channel = supabase
      .channel('anomalies')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'anomalies' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setAnomalies((prev) => [payload.new as AnomalyRecord, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setAnomalies((prev) => prev.map((a) => (a.id === payload.new.id ? payload.new as AnomalyRecord : a)));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const acknowledge = async (id: string) => {
    await supabase.from('anomalies').update({ status: 'acknowledged' }).eq('id', id);
    setAnomalies((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'acknowledged' } : a)));
  };

  const markAllAcknowledged = async () => {
    const active = anomalies.filter((a) => a.status === 'active');
    for (const a of active) {
      await supabase.from('anomalies').update({ status: 'acknowledged' }).eq('id', a.id);
    }
    setAnomalies((prev) => prev.map((a) => (a.status === 'active' ? { ...a, status: 'acknowledged' } : a)));
  };

  const insertAnomaly = async (anomaly: Omit<AnomalyRecord, 'detected_at' | 'resolved_at'>) => {
    await supabase.from('anomalies').insert(anomaly);
  };

  return { anomalies, loading, acknowledge, markAllAcknowledged, insertAnomaly };
}
