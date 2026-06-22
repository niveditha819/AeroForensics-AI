# Requirements Document

## 1. Application Overview

**Application Name**: AeroForensics AI

**Description**: AeroForensics AI is a real-time environmental monitoring and forensic analysis dashboard for enforcement officers. The system integrates live sensor data, anomaly detection, evidence management, dispatch logistics, historical analysis, alert notifications, team collaboration, and multi-language support. All data is managed through Supabase backend with real-time synchronization.

---

## 2. Users and Usage Scenarios

**Target Users**: Environmental enforcement officers, investigation teams, regulatory agencies

**Core Usage Scenarios**:
- Monitor real-time sensor readings across multiple sectors
- Detect and respond to environmental anomalies
- Generate and export forensic evidence packets
- Coordinate team response through collaboration rooms
- Review historical anomaly patterns and trends
- Receive and manage alert notifications
- Access system in preferred language

---

## 3. Page Structure and Functional Description

### Page Structure

```
AeroForensics AI Dashboard (Single Page)
├── Top Header
│   ├── Application Title
│   ├── Language Switcher
│   ├── Time Scrubber Control
│   ├── Trigger Live Anomaly Button
│   ├── Navigation: Archive Access Button
│   └── Alert Notification Bell Icon with Badge
├── Notification Dropdown Panel (Popover)
├── Toast Notification (Sonner)
├── Collaboration Rooms Sidebar
│   ├── Room List
│   └── Active Room Panel
├── Left Column (Map & Visual Layer)
│   ├── Sector Map with Sensor Markers
│   ├── Wind Vector Overlay
│   └── Anomaly Highlight Animation
├── Right Column (Intelligence & Operations Layer)
│   ├── Live Sensor Readings Panel
│   ├── Anomaly Detection Panel
│   ├── Evidence Locker Panel
│   ├── Dispatch Logistics Panel
│   └── Trend Chart Panel
└── Historical Anomaly Archive Overlay
    ├── Search and Filter Controls
    ├── Anomaly List Table
    └── Bulk Export Controls
```

### 3.1 Top Header

**Application Title**
- Display「AeroForensics AI」in localized language

**Language Switcher**
- Dropdown selector showing current language
- Options: English (en), Chinese (zh), Spanish (es)
- Clicking option switches entire UI to selected language
- Selection persisted to user_preferences table in Supabase

**Time Scrubber Control**
- Slider for reviewing historical sensor data timeline
- Displays current timestamp

**Trigger Live Anomaly Button**
- Manually triggers anomaly detection simulation
- Generates new anomaly record in Supabase anomalies table
- Fires toast notification and updates badge count

**Archive Access Button**
- Opens Historical Anomaly Archive overlay

**Alert Notification Bell Icon**
- Displays unread anomaly alert count badge
- Opens Notification Dropdown Panel on click
- Badge count sourced from unread anomalies in Supabase

### 3.2 Notification Dropdown Panel

**Panel Header**
- Title:「Anomaly Alerts」(localized)
- Mark All as Read button
- Total alert count display

**Alert List**
- Fetches anomalies from Supabase anomalies table ordered by detected_at DESC
- Each alert item shows: timestamp, severity badge (Critical/Warning), sensor name, brief message, dismiss button
- Unread alerts highlighted with accent border
- Clicking dismiss updates anomaly status to acknowledged in Supabase
- Real-time updates via Supabase realtime subscription

**Panel Footer**
- View All in Archive link

**Scrolling**
- Displays most recent 50 alerts with vertical scroll

### 3.3 Toast Notification

**Trigger**
- Fires when new anomaly inserted into Supabase anomalies table
- Appears immediately upon Trigger Live Anomaly button click

**Content**
- Severity icon, alert message (localized), timestamp
- Auto-dismiss after 5 seconds

**Styling**
- Dark theme, top-right position, slide-in animation

### 3.4 Collaboration Rooms Sidebar

**Room List**
- Displays active incident rooms from incident_rooms table
- Each room item shows: room title, anomaly reference, participant count, unread message indicator
- Clicking room opens Active Room Panel
- Create New Room button (creates new incident_rooms record linked to selected anomaly)

**Active Room Panel**
- Room header: title, participant avatars (from room_participants), close button
- Message thread: displays messages from room_messages table ordered by timestamp ASC
- Each message shows: sender name, content, timestamp (localized format)
- Typing indicators via Supabase Presence API
- Message input field with send button
- Sending message inserts record into room_messages table
- Real-time message updates via Supabase realtime subscription to room_messages
- Participant presence status updated via Presence API

### 3.5 Left Column - Map & Visual Layer

**Sector Map**
- Displays sensor markers from sensors table (location_x, location_y)
- Marker color indicates sensor status (active/inactive)
- Clicking marker shows sensor details popup

**Wind Vector Overlay**
- Displays wind direction arrows based on latest sensor_readings wind_dir values

**Anomaly Highlight Animation**
- When anomaly detected, highlights affected sensor with pulsing red circle
- Animation triggered by realtime subscription to anomalies table

### 3.6 Right Column - Intelligence & Operations Layer

**Live Sensor Readings Panel**
- Displays real-time readings from sensor_readings table
- Shows: sensor name, SO2, PM2.5, NOx, temperature, wind speed, wind direction
- Updates via Supabase realtime subscription to sensor_readings table
- All labels and units localized

**Anomaly Detection Panel**
- Displays current anomaly details from anomalies table
- Shows: anomaly type, severity, source, detected timestamp, pollutant values
- Status indicator (active/resolved)
- All text localized

**Evidence Locker Panel**
- Lists evidence packets from evidence_packets table
- Each packet shows: case ID, anomaly reference, export timestamp
- Generate Evidence Packet button creates new evidence_packets record
- Download button retrieves file from Supabase Storage evidence-exports bucket

**Dispatch Logistics Panel**
- Displays unit_dispatched and eta from current anomaly record
- Shows dispatch status and estimated arrival time
- Labels localized

**Trend Chart Panel**
- Line chart showing pollutant concentration trends over time
- Data sourced from sensor_readings table aggregated by timestamp
- Chart labels and tooltips localized

### 3.7 Historical Anomaly Archive Overlay

**Search and Filter Controls**
- Date range picker (localized date format)
- Severity filter dropdown (Critical/Warning)
- Sensor filter dropdown (populated from sensors table)
- Search input for keyword search
- Filters query anomalies table with WHERE conditions

**Anomaly List Table**
- Displays filtered anomalies from Supabase
- Columns: timestamp (localized), sensor name, anomaly type, severity, status, actions
- Pagination controls
- Clicking row opens anomaly detail view

**Bulk Export Controls**
- Select multiple anomalies via checkboxes
- Export Selected button generates combined evidence packet
- File stored in Supabase Storage evidence-exports bucket

---

## 4. Business Rules and Logic

### Backend Data Flow

**Sensor Data Ingestion**
- Sensor readings continuously inserted into sensor_readings table
- Realtime subscription broadcasts updates to connected dashboard clients

**Anomaly Detection**
- Supabase Edge Function anomaly-detection runs periodically
- Function queries recent sensor_readings, calculates severity scores
- When threshold exceeded, inserts record into anomalies table with severity (Critical if >200% threshold, Warning if 100-200%)
- Anomaly insertion triggers realtime broadcast to dashboard

**Alert Generation**
- New anomaly record triggers toast notification on dashboard
- Unread anomaly count badge updates automatically
- Notification panel list refreshes via realtime subscription

**Alert Acknowledgment**
- Dismissing alert updates anomaly status field to acknowledged
- Badge count recalculated from unread anomalies
- Mark All as Read updates all unread anomalies to acknowledged status

**Evidence Packet Generation**
- Clicking Generate Evidence Packet creates evidence_packets record with anomaly_id and case_data JSON
- System generates PDF/JSON file and uploads to evidence-exports Storage bucket
- File URL stored in evidence_packets record

**Collaboration Rooms**
- Creating room inserts incident_rooms record linked to anomaly_id
- Sending message inserts room_messages record with room_id, user_id, content, timestamp
- Realtime subscription to room_messages broadcasts new messages to all room participants
- Presence API tracks active participants, updates typing indicators

**Language Preference**
- Selecting language updates user_preferences.language field
- All UI strings, date formats, number formats switch to selected locale
- Preference persists across sessions

### Data Persistence

**Supabase Tables**
- sensors: id, name, sector, location_x, location_y, status
- sensor_readings: sensor_id, so2, pm25, nox, temperature, wind_speed, wind_dir, timestamp
- anomalies: id, sensor_id, anomaly_type, severity, source, status, detected_at, resolved_at, so2, pm25, nox, wind_dir, unit_dispatched, eta
- evidence_packets: anomaly_id, case_data, exported_at
- user_preferences: user_id, language, alert_threshold
- incident_rooms: id, anomaly_id, title, created_by, created_at, status
- room_messages: room_id, user_id, content, timestamp, message_type
- room_participants: room_id, user_id, joined_at

**Supabase Storage**
- Bucket: evidence-exports
- Stores generated evidence packet files (PDF/JSON)

**Supabase Realtime**
- Subscriptions: sensor_readings, anomalies, room_messages
- Broadcasts: INSERT/UPDATE events to connected clients

**Supabase Presence**
- Tracks active users in collaboration rooms
- Updates typing indicators and participant status

### Row Level Security

**RLS Policies**
- Authenticated users: read access to sensors, sensor_readings, anomalies, evidence_packets
- Authenticated users: write access to anomalies (status updates), evidence_packets (insert), room_messages (insert), room_participants (insert)
- User-specific: read/write access to own user_preferences record

---

## 5. Exceptions and Edge Cases

| Scenario | Handling |
|----------|----------|
| Supabase connection lost | Display connection error banner; retry connection automatically |
| Realtime subscription fails | Fall back to polling mode; notify user of degraded performance |
| Edge Function anomaly-detection timeout | Log error; retry on next scheduled run |
| Evidence packet generation fails | Display error toast; allow retry |
| Storage bucket upload fails | Display error message; save evidence_packets record without file URL |
| User switches language mid-session | Reload all UI strings immediately; preserve current data state |
| Unsupported language requested | Default to English; log warning |
| Collaboration room message send fails | Display retry button; queue message locally |
| Presence API disconnects | Remove typing indicators; show participant as offline |
| Badge count exceeds 99 | Display 99+ |
| No unread alerts | Badge hidden; panel shows No Unread Alerts message |
| Archive query returns no results | Display No Anomalies Found message |
| Bulk export with no selections | Disable Export Selected button |
| Date range picker invalid range | Display validation error; prevent query |
| RLS policy denies access | Display permission error; redirect to login |

---

## 6. Acceptance Criteria

1. User opens dashboard and sees sensor markers on map populated from Supabase sensors table
2. User observes live sensor readings panel updating in real-time via Supabase realtime subscription
3. User clicks Trigger Live Anomaly button
4. User sees new anomaly record inserted into Supabase anomalies table and toast notification appears
5. User observes badge count on bell icon increment to 1
6. User clicks bell icon and sees anomaly in notification panel list
7. User clicks dismiss button and anomaly status updates to acknowledged in Supabase
8. User clicks language switcher and selects Chinese
9. User sees all UI strings, date formats, and labels switch to Chinese
10. User opens collaboration rooms sidebar and clicks Create New Room
11. User sees new incident_rooms record created in Supabase linked to current anomaly
12. User types message in room input and clicks send
13. User sees message inserted into room_messages table and appear in message thread
14. User observes other participant typing indicator via Presence API
15. User opens Historical Anomaly Archive overlay
16. User applies date range filter and severity filter
17. User sees filtered anomaly list queried from Supabase anomalies table
18. User selects multiple anomalies and clicks Export Selected
19. User sees evidence packet generated and file uploaded to Supabase Storage evidence-exports bucket
20. User downloads evidence packet file successfully

---

## 7. Features Not Included in This Release

- Customizable alert sound or audio notifications
- Alert priority levels beyond Critical/Warning
- Scheduled alert digest or summary reports
- Alert forwarding to external systems or email
- User-configurable alert thresholds beyond user_preferences.alert_threshold
- Alert snooze or reminder functionality
- Push notifications to mobile devices or browsers when dashboard is not active
- Alert categorization or tagging system
- Alert search functionality within notification panel
- Right-to-left (RTL) layout support for Arabic/Hebrew languages
- Additional language support beyond English/Chinese/Spanish
- Voice input for collaboration room messages
- File attachment support in collaboration rooms
- Video/audio call integration in collaboration rooms
- Advanced chart types beyond line chart in Trend Chart Panel
- Predictive anomaly detection using machine learning models
- Automated unit dispatch integration with external systems
- Mobile-responsive layout optimization
- Offline mode with local data caching
- User role-based access control beyond RLS policies
- Audit log for user actions
- Custom dashboard layout configuration
- Sensor calibration and maintenance tracking
- Integration with third-party GIS systems
- Automated report generation and scheduling