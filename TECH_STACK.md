# AeroForensics AI — Technology Stack & Architecture

## Project Overview

**AeroForensics AI** is a real-time environmental enforcement command center dashboard. It integrates live sensor telemetry, AI-powered anomaly detection, forensic evidence management, vehicle emission intelligence, pollution source attribution, and multi-language citizen-facing e-Challan services.

---

## Frontend Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.x | UI framework |
| TypeScript | ~5.9.3 | Type-safe development |
| Vite (rolldown-vite) | 7.3.1 | Build tool & dev server |
| Tailwind CSS | 3.4.11 | Utility-first CSS |
| shadcn/ui | latest | Component library (Radix UI + Tailwind) |
| Radix UI | various | Headless accessible UI primitives |
| React Router DOM | 7.9.5 | Client-side routing |
| Recharts | 2.15.4 | Data visualization (line/bar charts) |
| Sonner | 2.0.7 | Toast notifications |
| Lucide React | 0.576.0 | Icon library |
| Framer Motion (via `motion`) | 12.23.25 | Animation library |
| React Hook Form | 7.66.0 | Form state management |
| Zod | 3.25.76 | Schema validation |
| date-fns | 3.6.0 | Date formatting & manipulation |
| axios | 1.13.1 | HTTP client |
| ky | 1.13.0 | Modern HTTP client |
| React Helmet Async | 2.0.5 | Document head management |
| React Dropzone | 14.3.8 | File drag-and-drop |
| QRCode | 1.5.4 | QR code generation |
| Embla Carousel | 8.6.0 | Carousel/slider component |
| Sentry React | 9.47.1 | Error monitoring & tracking |
| Miaoda React DevKit | 0.1.1-beta.14 | Platform integration SDK |
| Miaoda SC Plugin | 1.0.62 | Platform service client |

### Dev Tools

| Tool | Purpose |
|------|---------|
| Biome | Linting & formatting |
| TypeScript (`tsgo`) | Type checking |
| ast-grep | Custom rule checking |
| PostCSS | CSS processing |
| Autoprefixer | CSS vendor prefixes |
| Vite Plugin SVGR | SVG as React components |
| Tailwind Container Queries | CSS container query support |

---

## Backend Technologies

| Technology | Version | Purpose |
|-----------|---------|---------|
| Supabase | 2.x | Backend-as-a-Service (BaaS) |
| PostgreSQL | 15+ | Primary database |
| Supabase Edge Functions | Deno 2.x | Serverless TypeScript functions |
| Supabase Realtime | — | Live WebSocket subscriptions |
| Supabase Storage | — | File/blob storage |
| Supabase Auth | — | Authentication & authorization |
| Row Level Security (RLS) | — | Database-level access control |

### Edge Functions Deployed

| Function | Purpose | Tech |
|----------|---------|------|
| `anomaly-detection` | Automated sensor threshold scanning & anomaly insertion | Deno + Supabase JS client |
| `fastag-service` | NPCI FASTag balance checks, fine deduction, UPI linking | Deno + mock NPCI DB |
| `ml-attribution` | Random Forest pollution source classifier | Deno + hand-coded ML (5-tree RF) |

---

## Database Schema (Supabase PostgreSQL)

### Tables

1. **sensors** — Sensor metadata (location, sector, status)
2. **sensor_readings** — Live telemetry (SO₂, PM2.5, NOx, temperature, wind)
3. **anomalies** — Detected environmental anomalies with severity & status
4. **evidence_packets** — Generated forensic evidence case files
5. **translations** — Multi-language UI string dictionary (en/hi/kn)
6. **user_preferences** — Per-user language & alert threshold settings
7. **incident_rooms** — Collaboration room metadata
8. **room_messages** — Chat messages per room
9. **room_participants** — Room membership & presence

### Storage Buckets

- `evidence-exports` — PDF/JSON evidence packet files
- `public` — Public assets

---

## APIs & External Services

### Supabase APIs (Frontend → Backend)

| API | Usage |
|-----|-------|
| `supabase.from('sensor_readings').select(...)` | Live telemetry queries |
| `supabase.from('anomalies').select(...)` | Anomaly data fetch |
| `supabase.from('translations').select(...)` | i18n dictionary loading |
| `supabase.functions.invoke('anomaly-detection')` | Trigger anomaly scan |
| `supabase.functions.invoke('fastag-service')` | FASTag balance & payments |
| `supabase.functions.invoke('ml-attribution')` | ML pollution source inference |
| `supabase.storage.from('evidence-exports').upload(...)` | Evidence file upload |
| `supabase.storage.from('evidence-exports').download(...)` | Evidence file download |
| `supabase.channel('...').on('postgres_changes', ...).subscribe()` | Real-time data streams |

### External APIs

| Service | Integration | Purpose |
|---------|-------------|---------|
| Google Maps Embed API | iframe embed | Map visualization (place mode) |
| NPCI FASTag (simulated) | Edge Function mock | Vehicle toll balance & fine deduction |
| Sentry | Error tracking SDK | Production error monitoring |

---

## AI / ML Technologies

### Machine Learning Model

| Model | Type | Details |
|-------|------|---------|
| Random Forest Classifier | Hand-coded TypeScript | 5 decision trees, 4 features |
| Accuracy | 87% | On 2,400 synthetic training samples |
| Version | rf-v1.2.0 | Deployed in `ml-attribution` Edge Function |
| Features | PM2.5 delta, wind corridor alignment, traffic density, industrial proximity, construction activity, wind speed |
| Outputs | Traffic (0), Construction (1), Industrial (2) — softmax probabilities |
| Feature Importance | Tracked per-tree | Returned in API response |

### AI / LLM Integrations

| LLM / AI Service | Integration | Purpose |
|-----------------|-------------|---------|
| Gemini 2.5 Flash | Miaoda LLM skill (`large-language-model`) | Content generation, text understanding |
| AI Search (Gemini + Google Grounding) | Miaoda skill (`ai-search`) | Web-aware intelligent search with citations |
| Image Generation | Miaoda skill (`image-generation`) | AI image creation from text prompts |
| OCR (OCR.space) | Miaoda skill (`ocr-space`) | Text extraction from images/PDFs |
| Text-to-Speech (LemonFox) | Miaoda skill (`text-to-speech`) | Audio narration generation |
| Speech-to-Text (Whisper v3) | Miaoda skill (`speech-to-text`) | Audio transcription |

> **Note:** LLM integrations are available via the Miaoda platform skill system. They are wired through Supabase Edge Functions or direct frontend hooks and can be invoked on demand.

---

## Multi-Language Support (i18n)

| Language | Code | Coverage |
|----------|------|----------|
| English | `en` | Full |
| Hindi | `hi` | Full (40+ keys) |
| Kannada | `kn` | Full (40+ keys) |

- Dictionary stored in Supabase `translations` table
- Fallback dictionary in `src/hooks/useI18n.ts`
- Language switcher UI in dashboard header

---

## Application Features

1. **Live Telemetry Dashboard** — Real-time sensor readings with Supabase subscriptions
2. **Anomaly Detection** — Automated threshold-based anomaly scanning with toast alerts
3. **Historical Anomaly Archive** — Searchable, filterable, exportable anomaly history
4. **Evidence Locker** — Forensic evidence packet generation & Supabase Storage upload
5. **Dispatch Logistics** — Unit dispatch simulation with ETA tracking
6. **Notification System** — Bell icon with badge, popover panel, severity filtering, bulk actions
7. **Collaboration Rooms** — Real-time chat with presence indicators
8. **Pollution Source Attribution Engine** — ML-powered traffic/industrial/construction classification
9. **Vehicle Emission Intelligence Engine** — ANPR simulation, emission class detection (BS-III/IV/VI), CO₂ estimates, pollution hotspot map
10. **Industrial AQI Panel** — Factory gate monitors with compliance charts
11. **Citizen e-Challan App** — Mobile-optimized challan list, FASTag/UPI payments, vehicle registration
12. **Multi-Language Support** — English, Hindi, Kannada with live switching

---

## Development & Deployment

| Aspect | Details |
|--------|---------|
| Package Manager | pnpm |
| Node Version | 20+ |
| Lint Command | `npm run lint` (tsgo + biome + ast-grep + tailwind check + vite build test) |
| Dev Server | `npx vite --host 0.0.0.0 --port 5173` |
| Build Output | `/workspace/.dist` |
| PM2 Process | `vite-sandbox` |
| Git Remote | https://github.com/niveditha819/AeroForensics-AI |
| CI/CD | Manual push to GitHub |

---

## File Structure

```
aero-forensics-ai/
├── src/
│   ├── pages/
│   │   ├── AeroForensicsPage.tsx     # Main dashboard (~1800 lines)
│   │   └── CitizenAppPage.tsx        # Citizen e-Challan app
│   ├── components/
│   │   ├── PollutionSourceAttribution.tsx   # ML attribution engine
│   │   ├── VehicleEnforcementPanel.tsx      # Vehicle emission intelligence
│   │   ├── IndustrialAQIPanel.tsx           # Factory AQI monitors
│   │   └── ui/                             # shadcn/ui components
│   ├── hooks/
│   │   ├── useI18n.ts                # i18n hook (en/hi/kn)
│   │   ├── useSensors.ts             # Sensor real-time subscriptions
│   │   ├── useAnomalies.ts           # Anomaly real-time subscriptions
│   │   ├── useRooms.ts               # Collaboration room hooks
│   │   └── useEvidence.ts            # Evidence export utilities
│   ├── db/
│   │   └── supabase.ts               # Supabase client init
│   ├── routes.tsx                    # React Router config
│   └── main.tsx                      # App entry point
├── supabase/
│   ├── migrations/                   # Database schema & seed SQL
│   └── functions/                    # Edge Functions (Deno)
│       ├── anomaly-detection/        # Threshold-based anomaly scanner
│       ├── fastag-service/           # FASTag balance & payments
│       └── ml-attribution/           # Random Forest classifier
├── public/                           # Static assets
├── index.html                        # HTML entry
├── package.json                      # Dependencies
├── tailwind.config.js                # Tailwind configuration
└── README.md                         # Project overview
```

---

## License

Proprietary — Environmental Enforcement AI Dashboard by Miaoda Platform.
