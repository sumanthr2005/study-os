# STUDY OS — Personal Learning & Productivity Platform

A Next.js full-stack platform designed for computer science students and engineers preparing for technical placements. It combines live YouTube course roadmap tracking, Pomodoro study timers with XP gamification, LeetCode problem trackers, DSA topic mastery, habits, task boards, hydration tracking, and spaced repetition.

## Architecture

```
study-os/
├── prisma/
│   └── schema.prisma         # SQLite database schema with User, Playlist, Video, Session, Task, Habit, etc.
├── scripts/
│   ├── seed.ts               # Seeds realistic demo environment with courses & history
│   └── test-sync.ts          # Automated verification suite for 20 -> 27 video synchronization
├── src/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/    # Live overview dashboard with persisted metrics
│   │   │   ├── playlists/    # YouTube course roadmaps with sync engine
│   │   │   ├── timer/        # Deep Work study timer with XP gamification
│   │   │   ├── tasks/        # High-leverage task backlog
│   │   │   ├── habits/       # Atomic habit consistency matrix
│   │   │   ├── water/        # Hydration tracking & quick logging
│   │   │   ├── leetcode/     # LeetCode problem logging & difficulty distribution
│   │   │   ├── dsa/          # 20-topic DSA roadmap with confidence rating
│   │   │   ├── goals/        # Placement milestones & targets
│   │   │   ├── revision/     # Spaced Repetition engine (Ebbinghaus curve)
│   │   │   ├── analytics/    # Study session analytics and CSV/JSON export
│   │   │   ├── placement/    # Company application pipeline & SDE readiness
│   │   │   ├── notes/        # Markdown concept logs & cheat-sheets
│   │   │   └── settings/     # Custom productivity weights & user preferences
│   │   ├── api/              # Full REST API routes for all modules
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── layout/           # Navbar, Sidebar, Shell with toast notifications
│   │   ├── dashboard/        # Stat cards, pace widgets, quick actions
│   │   ├── playlists/        # PlaylistCard, VideoPlayerModal, SyncResultModal
│   │   ├── timer/            # Interactive StudyTimer
│   │   ├── tasks/            # TaskBoard
│   │   ├── habits/           # HabitGrid
│   │   ├── analytics/        # StudyAnalyticsView
│   │   └── ui/               # Card, Button, Badge, Modal, Progress
│   ├── lib/
│   │   ├── db.ts             # Prisma client export
│   │   ├── auth.ts           # User session management
│   │   ├── youtube.ts        # YouTube Data API v3 & resilient metadata extraction
│   │   ├── sync.ts           # Data integrity synchronization engine
│   │   ├── planner.ts        # Target date pace calculation & study hour metrics
│   │   ├── validation.ts     # Request payload validators
│   │   └── ai/
│   │       ├── provider.ts   # AIProvider interface
│   │       └── ruleEngine.ts # Rule-based deterministic study plan generator
│   └── types/
│       └── index.ts          # Core domain TypeScript interfaces
├── public/
├── .env.example
├── package.json
├── next.config.mjs
├── tsconfig.json
└── README.md
```

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
# SQLite Local Database
DATABASE_URL="file:./dev.db"

# Optional: Official YouTube Data API v3 Key (offline fallback used if empty)
YOUTUBE_API_KEY=""
```

### 3. Initialize Database & Seed Demo Data
```bash
npm run db:push
npm run db:seed
```

### 4. Run Automated Playlist Synchronization Test
Validates the complete 20 -> 27 video synchronization workflow:
```bash
npm run test:sync
```

### 5. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to access Study OS.
