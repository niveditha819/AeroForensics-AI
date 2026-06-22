import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/db/supabase';

export type Lang = 'en' | 'zh' | 'es';

const FALLBACK: Record<string, Record<Lang, string>> = {
  appTitle: { en: 'AeroForensics AI', zh: 'AeroForensics AI', es: 'AeroForensics AI' },
  liveTelemetry: { en: 'Live Telemetry', zh: 'Live Telemetry', es: 'Telemetría en Vivo' },
  triggerAnomaly: { en: 'Trigger Live Anomaly', zh: 'Trigger Live Anomaly', es: 'Activar Anomalía' },
  historicalArchive: { en: 'Historical Archive', zh: 'Historical Archive', es: 'Archivo Histórico' },
  anomalyAlerts: { en: 'Anomaly Alerts', zh: 'Anomaly Alerts', es: 'Alertas de Anomalía' },
  markAllRead: { en: 'Mark All as Read', zh: 'Mark All as Read', es: 'Marcar Todo como Leído' },
  viewAllArchive: { en: 'View All in Archive', zh: 'View All in Archive', es: 'Ver Todo en Archivo' },
  noAlerts: { en: 'No alerts', zh: 'No alerts', es: 'Sin alertas' },
  critical: { en: 'critical', zh: 'critical', es: 'crítico' },
  warning: { en: 'warning', zh: 'warning', es: 'advertencia' },
  resolved: { en: 'resolved', zh: 'resolved', es: 'resuelto' },
  pending: { en: 'pending', zh: 'pending', es: 'pendiente' },
  active: { en: 'active', zh: 'active', es: 'activo' },
  dispatchUnit: { en: 'Dispatch Unit & Generate Legal Evidence Packet', zh: 'Dispatch Unit & Generate Legal Evidence Packet', es: 'Despachar Unidad y Generar Paquete de Evidencia' },
  unitDispatched: { en: 'Unit Dispatched — Evidence Packet Generated', zh: 'Unit Dispatched — Evidence Packet Generated', es: 'Unidad Despachada — Paquete de Evidencia Generado' },
  downloadEvidence: { en: 'Download Evidence Packet', zh: 'Download Evidence Packet', es: 'Descargar Paquete de Evidencia' },
  export: { en: 'Export', zh: 'Export', es: 'Exportar' },
  exportSelected: { en: 'Export Selected', zh: 'Export Selected', es: 'Exportar Seleccionados' },
  clear: { en: 'Clear', zh: 'Clear', es: 'Limpiar' },
  searchPlaceholder: { en: 'Search by ID, sensor, source, or type...', zh: 'Search by ID, sensor, source, or type...', es: 'Buscar por ID, sensor, fuente o tipo...' },
  filters: { en: 'Filters', zh: 'Filters', es: 'Filtros' },
  allSeverities: { en: 'All Severities', zh: 'All Severities', es: 'Todas las Severidades' },
  allStatuses: { en: 'All Statuses', zh: 'All Statuses', es: 'Todos los Estados' },
  recordsFound: { en: 'records found', zh: 'records found', es: 'registros encontrados' },
  noRecordsFound: { en: 'No Records Found', zh: 'No Records Found', es: 'No se Encontraron Registros' },
  adjustSearch: { en: 'Try adjusting your search or filters.', zh: 'Try adjusting your search or filters.', es: 'Intente ajustar su búsqueda o filtros.' },
  evidenceLocker: { en: 'Evidence Locker', zh: 'Evidence Locker', es: 'Locker de Evidencia' },
  chemicalScan: { en: 'Chemical Scan', zh: 'Chemical Scan', es: 'Escaneo Químico' },
  thermalSignature: { en: 'Thermal Signature', zh: 'Thermal Signature', es: 'Firma Térmica' },
  windHistory: { en: 'Wind History', zh: 'Wind History', es: 'Historial de Viento' },
  stability: { en: 'Stability', zh: 'Stability', es: 'Estabilidad' },
  anomalyShield: { en: 'Anomaly Shield Active', zh: 'Anomaly Shield Active', es: 'Escudo de Anomalía Activo' },
  collaborationRooms: { en: 'Collaboration Rooms', zh: 'Collaboration Rooms', es: 'Salas de Colaboración' },
  createRoom: { en: 'Create Room', zh: 'Create Room', es: 'Crear Sala' },
  send: { en: 'Send', zh: 'Send', es: 'Enviar' },
  typeMessage: { en: 'Type a message...', zh: 'Type a message...', es: 'Escriba un mensaje...' },
  participants: { en: 'Participants', zh: 'Participants', es: 'Participantes' },
  trendTitle: { en: 'Anomaly Trend (Last 14 Days)', zh: 'Anomaly Trend (Last 14 Days)', es: 'Tendencia de Anomalías (Últimos 14 Días)' },
  live: { en: 'Live', zh: 'Live', es: 'En Vivo' },
  so2: { en: 'SO₂', zh: 'SO₂', es: 'SO₂' },
  pm25: { en: 'PM2.5', zh: 'PM2.5', es: 'PM2.5' },
  nox: { en: 'NOx', zh: 'NOx', es: 'NOx' },
  temperature: { en: 'Temperature', zh: 'Temperature', es: 'Temperatura' },
  windSpeed: { en: 'Wind Speed', zh: 'Wind Speed', es: 'Velocidad del Viento' },
  windDir: { en: 'Wind Direction', zh: 'Wind Direction', es: 'Dirección del Viento' },
};

export function useI18n() {
  const [lang, setLang] = useState<Lang>('en');
  const [dict, setDict] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('translations').select('key, value').eq('language', lang);
      const loaded: Record<string, string> = {};
      for (const row of data ?? []) {
        loaded[row.key] = row.value;
      }
      setDict(loaded);
    };
    load();
  }, [lang]);

  const t = useCallback(
    (key: string) => {
      return dict[key] || FALLBACK[key]?.[lang] || key;
    },
    [dict, lang]
  );

  return { lang, setLang, t };
}
