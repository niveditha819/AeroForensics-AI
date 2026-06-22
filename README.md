# AeroForensics AI — Environmental Enforcement Command Center

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-2.x-3ECF8E?logo=supabase)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss)](https://tailwindcss.com)

A real-time environmental enforcement command center dashboard built with React, TypeScript, Supabase, and AI-powered analytics. Designed for regulatory agencies and environmental enforcement officers to monitor sensor telemetry, detect anomalies, manage evidence, and coordinate field response.

---

## Live Demo

- **Dashboard:** https://app-cikf8p3h6lmp-vitesandbox.sandbox.medo.dev/
- **GitHub Repository:** https://github.com/niveditha819/AeroForensics-AI

---

## Key Features

| Module | Description |
|--------|-------------|
| **Live Telemetry** | Real-time SO₂, PM2.5, NOx, temperature, wind speed/direction from 5 sector sensors |
| **Anomaly Detection** | Automated threshold-based scanning with toast alerts, severity badges, and audio notifications |
| **Historical Archive** | Searchable, filterable anomaly history with bulk export to PDF/JSON |
| **Evidence Locker** | Forensic evidence packet generation with Supabase Storage integration |
| **Pollution Source Attribution Engine** | ML-powered Random Forest classifier (5 trees, 87% accuracy) to identify traffic, industrial, or construction pollution sources |
| **Vehicle Emission Intelligence** | ANPR simulation, BS-III/IV/VI emission class detection, CO₂ estimates, pollution hotspot overlay |
| **Industrial AQI Panel** | 5 factory gate monitors with real-time compliance charts |
| **Citizen e-Challan App** | Mobile-optimized challan list, FASTag/UPI payments, vehicle registration |
| **Collaboration Rooms** | Real-time team chat with Supabase Presence API for typing indicators |
| **Multi-Language** | English, Hindi, Kannada with live language switcher |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React 18 + Vite)               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │  Map     │  │ Telemetry│  │ Anomaly  │  │ Evidence │    │
│  │  Layer   │  │ Panel    │  │ Alerts   │  │ Locker   │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │ Pollution│  │ Vehicle  │  │ Industrial│  │ Citizen  │    │
│  │ Source   │  │ Emission │  │ AQI      │  │ e-Challan│    │
│  │ Attribution│ Intelligence│  │ Panel   │  │ App      │    │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘    │
└──────────────────────┬──────────────────────────────────────┘
                       │ Supabase Client (@supabase/supabase-js)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                        Supabase Backend                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ PostgreSQL  │  │  Realtime   │  │  Storage Buckets    │ │
│  │  9 Tables   │  │  WebSocket  │  │  evidence-exports   │ │
│  └─────────────┘  └─────────────┘  └─────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Edge Functions (Deno 2.x)                 │ │
│  │  anomaly-detection  │  fastag-service  │  ml-attribution │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

**Frontend:** React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, Radix UI, React Router DOM v7, Recharts, Sonner, Lucide React, Framer Motion

**Backend:** Supabase (PostgreSQL, Edge Functions, Realtime, Storage, Auth), Deno 2.x

**ML/AI:** Hand-coded Random Forest classifier (5-tree, TypeScript), Gemini 2.5 Flash (via Miaoda LLM skill), AI Search with Google Grounding

**External APIs:** Google Maps Embed, NPCI FASTag (simulated), Sentry error tracking

See [`TECH_STACK.md`](TECH_STACK.md) for complete details.

---

## Database Schema

| Table | Purpose |
|-------|---------|
| `sensors` | Sensor metadata (location, sector, status) |
| `sensor_readings` | Live telemetry (SO₂, PM2.5, NOx, temperature, wind) |
| `anomalies` | Detected anomalies with severity & status |
| `evidence_packets` | Forensic evidence case files |
| `translations` | i18n dictionary (en/hi/kn) |
| `user_preferences` | Per-user settings |
| `incident_rooms` | Collaboration room metadata |
| `room_messages` | Chat messages |
| `room_participants` | Room membership |

---

## Edge Functions

| Function | Description |
|----------|-------------|
| `anomaly-detection` | Scans sensor readings against thresholds, inserts anomalies into DB |
| `fastag-service` | Simulated NPCI FASTag: balance-check, deduct-fine, upi-pay, link-upi |
| `ml-attribution` | 5-tree Random Forest classifier for pollution source attribution (traffic/industrial/construction) |

---

## Getting Started

### Prerequisites

- Node.js ≥ 20
- pnpm (recommended)

### Install

```bash
git clone https://github.com/niveditha819/AeroForensics-AI.git
cd AeroForensics-AI
pnpm install
```

### Environment Variables

Create `.env`:

```env
VITE_SUPABASE_URL=https://sqnbpbxxpzukfhhvcukb.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Run Development Server

```bash
npx vite --host 0.0.0.0 --port 5173
```

### Build

```bash
npm run lint    # Type check, lint, tailwind check, and build test
```

---

## Screenshots

*Coming soon — Add screenshots of the dashboard, anomaly detection, vehicle emission panel, and citizen app.*

---

## Roadmap

- [x] Core dashboard with live telemetry
- [x] Anomaly detection with real-time alerts
- [x] Historical archive with search/filter/export
- [x] Evidence locker with Supabase Storage
- [x] Collaboration rooms with real-time chat
- [x] Pollution Source Attribution Engine (ML)
- [x] Vehicle Emission Intelligence Engine
- [x] Industrial AQI Panel
- [x] Citizen e-Challan App
- [x] Multi-language support (English, Hindi, Kannada)
- [x] GitHub repository setup
- [ ] NPCI sandbox API credential integration
- [ ] Push notifications for new challans
- [ ] Challan dispute workflow with evidence upload
- [ ] Real-time sensor data seeding
- [ ] ML model retraining feedback loop
- [ ] Mobile app (React Native / PWA)

---

## Documentation

- [`TECH_STACK.md`](TECH_STACK.md) — Complete technology, API, and LLM documentation
- [`supabase/migrations/`](supabase/migrations/) — Database schema and seed data
- [`supabase/functions/`](supabase/functions/) — Edge Function source code

---

## License

Proprietary — Environmental Enforcement AI Dashboard.

Built with [Miaoda](https://miaoda.cn) AI platform.
