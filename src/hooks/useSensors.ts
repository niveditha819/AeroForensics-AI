import { useState, useEffect } from 'react';
import { supabase } from '@/db/supabase';

export interface Sensor {
  id: string;
  name: string;
  sector: string;
  location_x: number;
  location_y: number;
  status: string;
}

export interface SensorReading {
  id: string;
  sensor_id: string;
  so2: number;
  pm25: number;
  nox: number;
  temperature: number;
  wind_speed: number;
  wind_dir: string;
  timestamp: string;
}

export function useSensors() {
  const [sensors, setSensors] = useState<Sensor[]>([]);
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSensors = async () => {
      const { data } = await supabase.from('sensors').select('*').order('id');
      setSensors(data ?? []);
    };
    const fetchReadings = async () => {
      const { data } = await supabase.from('sensor_readings').select('*').order('timestamp', { ascending: false }).limit(100);
      setReadings(data ?? []);
      setLoading(false);
    };
    fetchSensors();
    fetchReadings();

    const channel = supabase
      .channel('sensor_readings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sensor_readings' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setReadings((prev) => [payload.new as SensorReading, ...prev].slice(0, 100));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const latestBySensor = (sensorId: string) => {
    return readings.find((r) => r.sensor_id === sensorId);
  };

  const insertReading = async (reading: Omit<SensorReading, 'id' | 'timestamp'>) => {
    await supabase.from('sensor_readings').insert(reading);
  };

  return { sensors, readings, loading, latestBySensor, insertReading };
}
