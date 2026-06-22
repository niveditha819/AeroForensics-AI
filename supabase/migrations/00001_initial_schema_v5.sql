
-- Sensors table
CREATE TABLE sensors (
  id text PRIMARY KEY,
  name text NOT NULL,
  sector text NOT NULL,
  location_x integer NOT NULL,
  location_y integer NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Sensor readings table
CREATE TABLE sensor_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id text NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
  so2 integer NOT NULL DEFAULT 0,
  pm25 integer NOT NULL DEFAULT 0,
  nox integer NOT NULL DEFAULT 0,
  temperature real NOT NULL DEFAULT 20,
  wind_speed real NOT NULL DEFAULT 0,
  wind_dir text NOT NULL DEFAULT 'N-000',
  timestamp timestamptz NOT NULL DEFAULT now()
);

-- Anomalies table
CREATE TABLE anomalies (
  id text PRIMARY KEY,
  sensor_id text NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
  anomaly_type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('critical', 'warning')),
  source text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'acknowledged')),
  detected_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz,
  so2 integer NOT NULL DEFAULT 0,
  pm25 integer NOT NULL DEFAULT 0,
  nox integer NOT NULL DEFAULT 0,
  wind_dir text NOT NULL DEFAULT 'N-000',
  unit_dispatched text,
  eta text
);

-- Evidence packets table
CREATE TABLE evidence_packets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anomaly_id text NOT NULL REFERENCES anomalies(id) ON DELETE CASCADE,
  case_data jsonb NOT NULL DEFAULT '{}',
  file_url text,
  exported_at timestamptz NOT NULL DEFAULT now()
);

-- User preferences table
CREATE TABLE user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  language text NOT NULL DEFAULT 'en',
  alert_threshold integer NOT NULL DEFAULT 100,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Incident rooms table
CREATE TABLE incident_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  anomaly_id text REFERENCES anomalies(id) ON DELETE SET NULL,
  title text NOT NULL,
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed'))
);

-- Room messages table
CREATE TABLE room_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES incident_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  message_type text NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'system')),
  timestamp timestamptz NOT NULL DEFAULT now()
);

-- Room participants table
CREATE TABLE room_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES incident_rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(room_id, user_id)
);

-- Translations table
CREATE TABLE translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL,
  language text NOT NULL,
  value text NOT NULL,
  UNIQUE(key, language)
);

-- Enable RLS on all tables
ALTER TABLE sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE anomalies ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_packets ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;

-- RLS Policies: sensors
CREATE POLICY "sensors_select_anon" ON sensors FOR SELECT TO anon USING (true);
CREATE POLICY "sensors_select_auth" ON sensors FOR SELECT TO authenticated USING (true);

-- RLS Policies: sensor_readings
CREATE POLICY "readings_select_anon" ON sensor_readings FOR SELECT TO anon USING (true);
CREATE POLICY "readings_select_auth" ON sensor_readings FOR SELECT TO authenticated USING (true);
CREATE POLICY "readings_insert_auth" ON sensor_readings FOR INSERT TO authenticated WITH CHECK (true);

-- RLS Policies: anomalies
CREATE POLICY "anomalies_select_anon" ON anomalies FOR SELECT TO anon USING (true);
CREATE POLICY "anomalies_select_auth" ON anomalies FOR SELECT TO authenticated USING (true);
CREATE POLICY "anomalies_insert_auth" ON anomalies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "anomalies_update_auth" ON anomalies FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies: evidence_packets
CREATE POLICY "evidence_select_anon" ON evidence_packets FOR SELECT TO anon USING (true);
CREATE POLICY "evidence_select_auth" ON evidence_packets FOR SELECT TO authenticated USING (true);
CREATE POLICY "evidence_insert_auth" ON evidence_packets FOR INSERT TO authenticated WITH CHECK (true);

-- RLS Policies: user_preferences
CREATE POLICY "prefs_select_own" ON user_preferences FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "prefs_insert_own" ON user_preferences FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "prefs_update_own" ON user_preferences FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- RLS Policies: incident_rooms
CREATE POLICY "rooms_select_anon" ON incident_rooms FOR SELECT TO anon USING (true);
CREATE POLICY "rooms_select_auth" ON incident_rooms FOR SELECT TO authenticated USING (true);
CREATE POLICY "rooms_insert_auth" ON incident_rooms FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "rooms_update_auth" ON incident_rooms FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- RLS Policies: room_messages
CREATE POLICY "messages_select_anon" ON room_messages FOR SELECT TO anon USING (true);
CREATE POLICY "messages_select_auth" ON room_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "messages_insert_auth" ON room_messages FOR INSERT TO authenticated WITH CHECK (true);

-- RLS Policies: room_participants
CREATE POLICY "participants_select_anon" ON room_participants FOR SELECT TO anon USING (true);
CREATE POLICY "participants_select_auth" ON room_participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "participants_insert_auth" ON room_participants FOR INSERT TO authenticated WITH CHECK (true);

-- RLS Policies: translations
CREATE POLICY "translations_select_anon" ON translations FOR SELECT TO anon USING (true);
CREATE POLICY "translations_select_auth" ON translations FOR SELECT TO authenticated USING (true);

-- Seed data: sensors
INSERT INTO sensors (id, name, sector, location_x, location_y, status) VALUES
('S01', 'Downtown Outpost', 'Sector 2 Smelter', 20, 30, 'active'),
('S02', 'East River Station', 'Sector 5 Power Station', 60, 50, 'active'),
('S03', 'West Park Hub', 'Sector 7 Refinery', 15, 70, 'active'),
('S04', 'North Bridge Unit', 'Sector 4 Industrial Plant', 80, 20, 'active'),
('S05', 'South Gate Monitor', 'Sector 1 Chemical Depot', 40, 85, 'active');

-- Seed data: initial sensor readings
INSERT INTO sensor_readings (sensor_id, so2, pm25, nox, temperature, wind_speed, wind_dir) VALUES
('S01', 89, 178, 45, 28, 5.2, 'W-260'),
('S02', 487, 156, 89, 32, 6.5, 'NW-280'),
('S03', 512, 98, 76, 30, 4.8, 'NW-275'),
('S04', 245, 55, 34, 29, 3.2, 'S-180'),
('S05', 120, 210, 67, 31, 5.0, 'E-090');

-- Seed data: anomalies
INSERT INTO anomalies (id, sensor_id, anomaly_type, severity, source, status, detected_at, so2, pm25, nox, wind_dir, unit_dispatched, eta) VALUES
('ANM-2026-00142', 'S03', 'SO2 Plume Spike', 'critical', 'Sector 7 Refinery', 'resolved', '2026-06-20 09:14:32+00', 512, 98, 76, 'NW-275', 'Unit 02', '12 min'),
('ANM-2026-00138', 'S01', 'PM2.5 Burst', 'warning', 'Sector 2 Smelter', 'resolved', '2026-06-19 14:22:07+00', 89, 178, 45, 'W-260', 'Unit 01', '6 min'),
('ANM-2026-00135', 'S04', 'NOx Overflow', 'critical', 'Sector 4 Industrial Plant', 'active', '2026-06-18 07:45:18+00', 245, 55, 34, 'S-180', 'Unit 04', '9 min'),
('ANM-2026-00129', 'S02', 'SO2 Plume Spike', 'critical', 'Sector 5 Power Station', 'resolved', '2026-06-17 18:03:55+00', 487, 156, 89, 'NW-280', 'Unit 02', '7 min'),
('ANM-2026-00124', 'S05', 'CO Threshold Exceeded', 'warning', 'Sector 1 Chemical Depot', 'resolved', '2026-06-16 11:37:41+00', 120, 210, 67, 'E-090', 'Unit 05', '10 min'),
('ANM-2026-00120', 'S01', 'PM2.5 Burst', 'warning', 'Sector 2 Smelter', 'resolved', '2026-06-15 23:09:12+00', 78, 165, 42, 'W-260', 'Unit 01', '5 min'),
('ANM-2026-00118', 'S03', 'SO2 Plume Spike', 'critical', 'Sector 7 Refinery', 'resolved', '2026-06-15 01:44:56+00', 480, 145, 89, 'NW-280', 'Unit 02', '7 min'),
('ANM-2026-00115', 'S02', 'NOx Overflow', 'warning', 'Sector 5 Power Station', 'active', '2026-06-14 16:50:03+00', 120, 210, 67, 'E-090', 'Unit 05', '10 min');

-- Seed data: translations
INSERT INTO translations (key, language, value) VALUES
('appTitle', 'en', 'AeroForensics AI'),
('appTitle', 'zh', '航空取证AI'),
('appTitle', 'es', 'AeroForensics AI'),
('liveTelemetry', 'en', 'Live Telemetry'),
('liveTelemetry', 'zh', '实时遥测'),
('liveTelemetry', 'es', 'Telemetría en Vivo'),
('triggerAnomaly', 'en', 'Trigger Live Anomaly'),
('triggerAnomaly', 'zh', '触发实时异常'),
('triggerAnomaly', 'es', 'Activar Anomalía'),
('historicalArchive', 'en', 'Historical Archive'),
('historicalArchive', 'zh', '历史档案'),
('historicalArchive', 'es', 'Archivo Histórico'),
('anomalyAlerts', 'en', 'Anomaly Alerts'),
('anomalyAlerts', 'zh', '异常警报'),
('anomalyAlerts', 'es', 'Alertas de Anomalía'),
('markAllRead', 'en', 'Mark All as Read'),
('markAllRead', 'zh', '全部标记为已读'),
('markAllRead', 'es', 'Marcar Todo como Leído'),
('viewAllArchive', 'en', 'View All in Archive'),
('viewAllArchive', 'zh', '查看全部档案'),
('viewAllArchive', 'es', 'Ver Todo en Archivo'),
('noAlerts', 'en', 'No alerts'),
('noAlerts', 'zh', '无警报'),
('noAlerts', 'es', 'Sin alertas'),
('critical', 'en', 'critical'),
('critical', 'zh', '严重'),
('critical', 'es', 'crítico'),
('warning', 'en', 'warning'),
('warning', 'zh', '警告'),
('warning', 'es', 'advertencia'),
('resolved', 'en', 'resolved'),
('resolved', 'zh', '已解决'),
('resolved', 'es', 'resuelto'),
('pending', 'en', 'pending'),
('pending', 'zh', '待处理'),
('pending', 'es', 'pendiente'),
('active', 'en', 'active'),
('active', 'zh', '活跃'),
('active', 'es', 'activo'),
('dispatchUnit', 'en', 'Dispatch Unit & Generate Legal Evidence Packet'),
('dispatchUnit', 'zh', '派遣单位并生成法律证据包'),
('dispatchUnit', 'es', 'Despachar Unidad y Generar Paquete de Evidencia'),
('unitDispatched', 'en', 'Unit Dispatched — Evidence Packet Generated'),
('unitDispatched', 'zh', '单位已派遣 — 证据包已生成'),
('unitDispatched', 'es', 'Unidad Despachada — Paquete de Evidencia Generado'),
('downloadEvidence', 'en', 'Download Evidence Packet'),
('downloadEvidence', 'zh', '下载证据包'),
('downloadEvidence', 'es', 'Descargar Paquete de Evidencia'),
('export', 'en', 'Export'),
('export', 'zh', '导出'),
('export', 'es', 'Exportar'),
('exportSelected', 'en', 'Export Selected'),
('exportSelected', 'zh', '导出选中项'),
('exportSelected', 'es', 'Exportar Seleccionados'),
('clear', 'en', 'Clear'),
('clear', 'zh', '清除'),
('clear', 'es', 'Limpiar'),
('searchPlaceholder', 'en', 'Search by ID, sensor, source, or type...'),
('searchPlaceholder', 'zh', '按ID、传感器、来源或类型搜索...'),
('searchPlaceholder', 'es', 'Buscar por ID, sensor, fuente o tipo...'),
('filters', 'en', 'Filters'),
('filters', 'zh', '筛选'),
('filters', 'es', 'Filtros'),
('allSeverities', 'en', 'All Severities'),
('allSeverities', 'zh', '所有严重度'),
('allSeverities', 'es', 'Todas las Severidades'),
('allStatuses', 'en', 'All Statuses'),
('allStatuses', 'zh', '所有状态'),
('allStatuses', 'es', 'Todos los Estados'),
('recordsFound', 'en', 'records found'),
('recordsFound', 'zh', '条记录找到'),
('recordsFound', 'es', 'registros encontrados'),
('noRecordsFound', 'en', 'No Records Found'),
('noRecordsFound', 'zh', '未找到记录'),
('noRecordsFound', 'es', 'No se Encontraron Registros'),
('adjustSearch', 'en', 'Try adjusting your search or filters.'),
('adjustSearch', 'zh', '尝试调整搜索或筛选条件。'),
('adjustSearch', 'es', 'Intente ajustar su búsqueda o filtros.'),
('evidenceLocker', 'en', 'Evidence Locker'),
('evidenceLocker', 'zh', '证据柜'),
('evidenceLocker', 'es', 'Locker de Evidencia'),
('chemicalScan', 'en', 'Chemical Scan'),
('chemicalScan', 'zh', '化学扫描'),
('chemicalScan', 'es', 'Escaneo Químico'),
('thermalSignature', 'en', 'Thermal Signature'),
('thermalSignature', 'zh', '热特征'),
('thermalSignature', 'es', 'Firma Térmica'),
('windHistory', 'en', 'Wind History'),
('windHistory', 'zh', '风向历史'),
('windHistory', 'es', 'Historial de Viento'),
('stability', 'en', 'Stability'),
('stability', 'zh', '稳定性'),
('stability', 'es', 'Estabilidad'),
('anomalyShield', 'en', 'Anomaly Shield Active'),
('anomalyShield', 'zh', '异常护盾已激活'),
('anomalyShield', 'es', 'Escudo de Anomalía Activo'),
('collaborationRooms', 'en', 'Collaboration Rooms'),
('collaborationRooms', 'zh', '协作房间'),
('collaborationRooms', 'es', 'Salas de Colaboración'),
('createRoom', 'en', 'Create Room'),
('createRoom', 'zh', '创建房间'),
('createRoom', 'es', 'Crear Sala'),
('send', 'en', 'Send'),
('send', 'zh', '发送'),
('send', 'es', 'Enviar'),
('typeMessage', 'en', 'Type a message...'),
('typeMessage', 'zh', '输入消息...'),
('typeMessage', 'es', 'Escriba un mensaje...'),
('participants', 'en', 'Participants'),
('participants', 'zh', '参与者'),
('participants', 'es', 'Participantes'),
('trendTitle', 'en', 'Anomaly Trend (Last 14 Days)'),
('trendTitle', 'zh', '异常趋势（最近14天）'),
('trendTitle', 'es', 'Tendencia de Anomalías (Últimos 14 Días)'),
('live', 'en', 'Live'),
('live', 'zh', '实时'),
('live', 'es', 'En Vivo'),
('so2', 'en', 'SO₂'),
('so2', 'zh', '二氧化硫'),
('so2', 'es', 'SO₂'),
('pm25', 'en', 'PM2.5'),
('pm25', 'zh', 'PM2.5'),
('pm25', 'es', 'PM2.5'),
('nox', 'en', 'NOx'),
('nox', 'zh', '氮氧化物'),
('nox', 'es', 'NOx'),
('temperature', 'en', 'Temperature'),
('temperature', 'zh', '温度'),
('temperature', 'es', 'Temperatura'),
('windSpeed', 'en', 'Wind Speed'),
('windSpeed', 'zh', '风速'),
('windSpeed', 'es', 'Velocidad del Viento'),
('windDir', 'en', 'Wind Direction'),
('windDir', 'zh', '风向'),
('windDir', 'es', 'Dirección del Viento');
