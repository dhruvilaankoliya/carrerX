# CareerX — Full-Stack AI-Powered Student Career Intelligence Platform

CareerX is a production-grade SaaS web application engineered to bridge the gap between college curricula and high-tier tech industry hiring expectations.

Every score, recommendation, skill graph, and roadmap is computed dynamically from real user data captured during multi-step onboarding, server-side resume parsing, and interactive problem-solving assessments.

---

## ⚡ Tech Stack

- **Frontend:** Next.js 14+ (App Router) + TypeScript + Tailwind CSS
- **UI & Motion:** Glassmorphic Cyber-Midnight Design Tokens, Framer Motion, Lucide React
- **Visualizations:** Interactive HTML5 Canvas Force-Directed Skill Relationship Graph, SVG Dual Radar Chart, SVG Circular Readiness Dial
- **Backend:** Next.js Route Handlers (API Routes)
- **Database & ORM:** Prisma ORM with SQLite (default zero-config local dev) / PostgreSQL compatible
- **Auth:** Multi-step registration, `bcryptjs` password hashing, Stateless JWT stored in HTTP-Only secure cookies
- **Resume Intelligence:** Server-side PDF/DOCX text extraction (`pdf-parse`, `mammoth`) + structured skill/project extractor (`/lib/ai/resumeExtractor.ts`)
- **Scoring Engine:** Pure, unit-testable scoring functions (`/lib/scoring/`) with academic year weighting
- **Localization:** Indian Rupee (INR) Lakhs Per Annum (`₹X LPA – ₹Y LPA`) formatters (`/lib/localization/currency.ts`)

---

## 🚀 Quickstart & Local Setup

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/dhruvilaankoliya/carrerX.git
cd carrerX
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Initialize Database & Seed Sample Profiles
```bash
npm run db:push
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Login Credentials (Pre-seeded)

- **Email:** `dhruvila@careerx.dev`
- **Password:** `CareerX@2026`
- **Target Role:** Machine Learning Engineer
- **Readiness Score:** 84/100 (Tier 1: Job-Ready Contender)

Or create a brand new account at `/signup` to test the progressive onboarding gate and locked states with **0 fabricated numbers**.

---

## 📁 Project Architecture

```
careerx/
├── app/
│   ├── layout.tsx             # Root layout with fonts, navigation, and floating AI mentor
│   ├── page.tsx               # Landing page with hero & trending roles
│   ├── signup/page.tsx        # 4-step interactive signup wizard with draft recovery
│   ├── login/page.tsx         # Secure login with remember-me & validation
│   ├── dashboard/page.tsx     # Career Command Center with real greeting & locked states
│   ├── resume/page.tsx        # Resume PDF parsing & dynamic question generation
│   ├── assessment/page.tsx    # Multi-section assessment (Tech, Aptitude, Puzzles, Mind Games)
│   ├── skill-graph/page.tsx   # Interactive force-directed Skill & Subject Relationship Graph
│   ├── roadmap/page.tsx       # Adaptive 5-phase personalized learning roadmap
│   ├── explorer/page.tsx      # Filterable Career Explorer with INR salaries & match %
│   ├── mentor/page.tsx        # Context-grounded AI Mentor workspace
│   └── api/                   # Route Handlers (Auth, Resume, Assessment, Target, Mentor)
├── components/
│   ├── Navbar.tsx             # Responsive sticky navigation bar with target switcher
│   ├── ForceGraph.tsx         # Interactive Canvas force-directed graph with physics & zoom/pan
│   ├── RadarChart.tsx         # Dynamic SVG dual competency radar chart
│   ├── ReadinessGauge.tsx     # Circular SVG animated score gauge
│   └── FloatingMentor.tsx     # Persistent floating conversational mentor drawer
├── lib/
│   ├── db.ts                  # Prisma Client singleton
│   ├── auth.ts                # Password hashing, JWT signing/verification
│   ├── ai/                    # Isolated AI/LLM service layer
│   ├── scoring/               # Pure, unit-testable scoring engine
│   ├── roadmap/               # 5-phase adaptive roadmap generator
│   ├── graph/                 # Force-directed topology builder
│   ├── taxonomy/              # 12+ career definitions & benchmark weights
│   └── localization/          # INR LPA currency formatters
├── prisma/
│   ├── schema.prisma          # Database models (User, Profile, Resume, Scores, Roadmap)
│   └── seed.ts                # Database seed script
├── DECISIONS.md               # Architecture and product decisions record
└── TESTING.md                 # Manual verification guide for zero static defaults
```

---

## 🧪 Testing & Verification

Refer to [TESTING.md](./TESTING.md) for step-by-step instructions on verifying:
1. The **No Static Defaults** constraint (fresh accounts show zero fabricated scores).
2. Dual resume parsing with distinct extracted outputs.
3. Multi-section assessment execution and pure scoring calculation.
4. Interactive force-directed graph navigation and milestone deliverable toggling.
