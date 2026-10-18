# STUDY OS — Gamified Learning & Placement Preparation Command Center

A high-performance, futuristic learning operating system built with Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, and Prisma ORM. Designed specifically for engineering students and developers preparing for tier-1 software engineering placements and technical interviews.

STUDY OS combines a restrained 3D holographic command center, a server-authoritative gamification engine, automated YouTube course roadmap tracking with video ID synchronization, LeetCode problem logging, 20-topic DSA mastery, an Ebbinghaus spaced repetition memory engine, an offline rule-based AI planner, and complete placement pipeline tracking.

---

## 🚀 Key Highlights & Architectural Pillars

### 1. Streamlined 6-Destination Navigation Hierarchy
To reduce cognitive overload and maximize daily focus, STUDY OS organizes all learning workflows into **6 primary top-level destinations**:
1. **Command Center (`/` or `/dashboard`)** — Interactive 3D Holographic Core, daily priority action queue, 7-day study velocity review, live daily quests, and rank progression.
2. **Learn (`/playlists`)** — Structured YouTube course roadmaps, video ID completion tracking, content duration calculations, and offline development fallback.
3. **Practice (`/practice`)** — Unified technical prep environment integrating:
   - **LeetCode Problem Tracker**: Easy/Medium/Hard logging with solution links and XP rewards.
   - **20-Topic DSA Roadmap**: Self-confidence scoring (0–100%) across Arrays, DP, Graphs, Trees, etc.
   - **Spaced Repetition Queue**: Ebbinghaus retention curve (1d, 3d, 7d, 14d, 30d).
   - **Cheat Sheets & Notes**: Algorithmic templates and complexity notes.
4. **Focus (`/timer`)** — Pomodoro & deep-work stopwatch with wall-clock drift compensation, session persistence, and XP rewards.
5. **Tasks (`/tasks`)** — Unified Action Center consolidating task priority backlogs, 30-day atomic habit consistency matrix, and long-term placement goals.
6. **Placement HQ (`/placement`)** — Dream company pipeline, application status tracking, assessment calendar, and core CS interview readiness.

*(Secondary utilities including Analytics, Settings, Hydration, and AI Planner are accessible via contextual drawers and sub-navigation).*

---

### 2. Restrained 3D Holographic Visual Identity
- **CSS 3D Engine**: Uses hardware-accelerated CSS 3D transforms (`perspective: 1200px`, `transform-style: preserve-3d`, `rotateX/Y`, `translateZ`) for 60+ FPS performance without bloated WebGL bundle overhead.
- **Mouse Parallax**: Reacts smoothly to cursor position with dampening.
- **Orbital Telemetry**: Four dynamic orbiting telemetry nodes track **Daily Study Velocity**, **Active Streak**, **Daily Quests**, and **Next Rank XP**.
- **Accessibility & Fallback**: Full support for `prefers-reduced-motion` (locks to a calm ambient state) and responsive 2D fallback for mobile and low-power devices.

---

### 3. Server-Authoritative Gamification Engine
Gamification in STUDY OS rewards **real learning events** rather than superficial clicks:
- **Server XP Ledger (`XpLedger`)**: All XP grants are executed server-side via atomic database transactions.
- **Anti-Double-Claim Idempotency**: Each reward event has a unique composite key (`userId_eventKey`), strictly enforced at the database level:
  - Video completion: `video:${youtubeVideoId}` (completing the same video multiple times cannot award XP twice).
  - Study sessions: `session:${sessionId}` (10 XP per 25 min of validated focused work; paused time excluded).
  - LeetCode problems: `problem:${id}` (Easy: 10 XP, Medium: 20 XP, Hard: 35 XP).
  - Habit completion: `habit:${id}:${date}` (toggling a habit off and on cannot grant infinite XP).
  - Tasks: `task:${id}` (15 XP for validated task completion).
  - Revisions: `revision:${id}:${repetition}` (15 XP per spaced repetition).
- **Ranks & Progression (Levels 1–10+)**:
  - Level 1: *Novice* (0 XP)
  - Level 2: *Apprentice* (250 XP)
  - Level 3: *Explorer* (600 XP)
  - Level 4: *Builder* (1,100 XP)
  - Level 5: *Problem Solver* (1,800 XP)
  - Level 6: *Specialist* (2,700 XP)
  - Level 7: *Strategist* (3,800 XP)
  - Level 8: *Expert* (5,100 XP)
  - Level 9: *Elite* (6,600 XP)
  - Level 10: *Master* (8,400 XP)
  - *Dynamic progression continues seamlessly beyond Level 10 (+1,000 XP/level).*
- **Dynamic Daily Quests**: Generated automatically from real user goals, tasks, and revision schedules.
- **Achievement Showcase**: Idempotently unlocks badges for milestones like First Deep Work Session, Algorithm Explorer (25 DSA), Week of Iron Will (7-day streak), etc.

---

### 4. Dual Database Architecture
- **Local Development**: SQLite (`prisma/dev.db`) for rapid offline development with zero external dependencies.
- **Production Ready**: Neon Serverless PostgreSQL (`prisma/schema.postgresql.prisma` and `prisma/neon_init.sql`).
- **Dynamic Builder (`scripts/prepare-prisma.js`)**: Automatically detects the environment and switches the Prisma schema during build and deployment.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14.2 (App Router)
- **UI Library**: React 18, Tailwind CSS, Lucide React
- **ORM**: Prisma ORM 5.22 (Dual SQLite / PostgreSQL schemas)
- **Database**: SQLite (Local) / Neon PostgreSQL (Production)
- **Charts & Visuals**: Recharts, Canvas Confetti, Pure CSS 3D
- **Language**: TypeScript (Strict mode)

---

## 📁 Repository Structure

```
study-os/
├── prisma/
│   ├── schema.prisma             # Active schema (auto-synchronized)
│   ├── schema.sqlite.prisma      # Local SQLite schema
│   ├── schema.postgresql.prisma  # Production Neon PostgreSQL schema
│   └── neon_init.sql             # Idempotent PostgreSQL DDL script
├── scripts/
│   ├── prepare-prisma.js         # Schema switcher for SQLite vs PostgreSQL
│   ├── seed.ts                   # Realistic demo dataset seeder
│   ├── test-sync.ts              # Automated YouTube 20->27 video sync verification
│   ├── test-regression.ts        # 23-assertion regression & XP idempotency test suite
│   └── verify-live.ts            # Live end-to-end HTTP integration suite
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/        # Command Center with 3D Holographic Core
│   │   │   ├── playlists/        # Learn (YouTube course roadmaps)
│   │   │   ├── practice/         # Practice Hub (LeetCode, DSA, Revisions, Notes)
│   │   │   ├── timer/            # Focus (Pomodoro & Stopwatch)
│   │   │   ├── tasks/            # Action Center (Tasks, Habits Matrix, Goals)
│   │   │   ├── placement/        # Placement HQ (Company pipeline)
│   │   │   ├── analytics/        # Deep-work velocity & export
│   │   │   └── settings/         # Scoring weights & profile settings
│   │   ├── api/
│   │   │   ├── gamification/     # Ranks, quests, achievements, and XP history
│   │   │   ├── leetcode/         # Algorithmic problem tracker
│   │   │   ├── dsa/              # 20-topic mastery confidence
│   │   │   ├── study-sessions/   # Validated focus session persistence
│   │   │   ├── playlists/        # Playlist management & synchronization
│   │   │   ├── tasks/            # Task CRUD
│   │   │   ├── habits/           # Habit matrix & toggle
│   │   │   ├── revisions/        # Spaced repetition engine
│   │   │   └── export/           # CSV / JSON data export
│   │   └── layout.tsx
│   ├── components/
│   │   ├── dashboard/            # HolographicCore, DailyQuests, StrategicPlan
│   │   ├── layout/               # Sidebar (6 destinations), Navbar, Shell
│   │   ├── practice/             # Practice hub components
│   │   ├── tasks/                # TasksHubClient, TaskBoard
│   │   ├── habits/               # HabitGrid
│   │   └── ui/                   # Card, Button, Badge, Modal, Progress
│   └── lib/
│       ├── db.ts                 # Prisma client instance
│       ├── gamification.ts       # Server-authoritative XP & quest engine
│       ├── user.ts               # Authenticated user resolution
│       ├── youtube.ts            # YouTube Data API v3 & resilient extractor
│       └── planner.ts            # Study hour pacing calculations
└── README.md
```

---

## ⚡ Getting Started (Local Development)

### 1. Prerequisites
- Node.js 18.x or 20.x
- npm 9+ or 10+

### 2. Installation
```bash
git clone https://github.com/sumanthr2005/study-os.git
cd study-os
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env`:
```bash
# Local SQLite database
DATABASE_URL="file:./dev.db"

# Optional: Official YouTube Data API v3 key (offline fallback active if omitted)
YOUTUBE_API_KEY=""

# Optional: AI Provider (offline rule-based planner active if omitted)
OPENAI_API_KEY=""
```

### 4. Database Setup & Seeding
```bash
# Push SQLite schema to local database
npm run db:push:sqlite

# Seed realistic demo data (courses, LeetCode problems, habits, tasks)
npm run db:seed
```

### 5. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Verification & Testing

STUDY OS includes comprehensive test suites exercising real application behavior:

```bash
# 1. TypeScript Static Analysis (Zero type errors)
npx tsc --noEmit

# 2. Database Schema Validation
npm run db:prepare
npx prisma validate

# 3. Regression & XP Idempotency Test Suite (23 assertions)
npm run test:regression

# 4. YouTube Video ID Synchronization Test (20 -> 27 video workflow)
npm run test:sync

# 5. Live Application Integration Suite (Requires running server on :3000)
npm run test:live

# 6. Production Build
npm run build
```

---

## 🌐 Production Deployment (Neon PostgreSQL & Vercel)

### 1. Neon PostgreSQL Setup
1. Create a project on [Neon](https://neon.tech).
2. Copy your pooled connection string:
   ```
   postgresql://user:password@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. Initialize the schema using the provided DDL script or Prisma:
   ```bash
   # Method A: Execute prisma/neon_init.sql in the Neon SQL Console
   # Method B: Push schema using Prisma
   DATABASE_URL="your-neon-connection-string" npm run db:push:pg
   ```

### 2. Vercel Deployment
1. Connect your GitHub repository `sumanthr2005/study-os` on [Vercel](https://vercel.com).
2. Configure Environment Variables in the Vercel Project Settings:
   - `DATABASE_URL`: Your Neon PostgreSQL connection string.
   - `NODE_ENV`: `production`
   - `YOUTUBE_API_KEY`: *(Optional)* Your YouTube Data API v3 key.
3. Deploy! The custom build command automatically detects PostgreSQL and generates the production client.

---

## 🔒 Security & Data Integrity Guarantees

1. **Server-Authoritative Ledger**: XP is never accepted from client-side state. Every reward requires server-side validation against `XpLedger`.
2. **User-Scoped Queries**: All database queries are scoped to the authenticated user ID.
3. **Protected Seed Endpoint**: The `/api/seed` database reset endpoint is blocked in production (`NODE_ENV === 'production'`).
4. **Stable Video ID Preservation**: Playlist synchronization never deletes completed video progress; completion is anchored to `youtubeVideoId`.
5. **No Tracked Secrets**: Local SQLite databases and environment variables are excluded via `.gitignore`.

---

## 📄 License

MIT License. Designed and maintained for technical excellence.
