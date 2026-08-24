# CareerX — Architecture & Product Decisions (DECISIONS.md)

This document records the architectural and product decisions made during the build of CareerX.

---

## 1. Database & ORM Selection
- **Decision:** Use Prisma ORM with SQLite (`file:./dev.db`) by default for local development, with full PostgreSQL compatibility via Prisma schema.
- **Rationale:** Allows `npm run dev` and test suites to execute immediately without requiring an external PostgreSQL instance running, while maintaining full production portability to Supabase/Neon/PostgreSQL via the `DATABASE_URL` environment variable.

## 2. Authentication & Session Management
- **Decision:** Custom stateless JWT session stored in HTTP-Only, Secure, SameSite cookies with `bcryptjs` password hashing (salt rounds: 10).
- **Rationale:** Clean, zero-external-dependency auth layer that operates smoothly in Next.js 14 App Router (Route Handlers + Middleware) and exposes full user context to both Server and Client Components.

## 3. Progressive Onboarding Gate & Minimum Threshold
- **Decision:** Define a 6-stage progressive completeness state machine:
  1. `PROFILE_CREATED` (20% complete)
  2. `RESUME_PARSED` (40% complete)
  3. `RESUME_QUESTIONS_ANSWERED` (60% complete)
  4. `TECHNICAL_APTITUDE_COMPLETED` (80% complete)
  5. `MIND_GAMES_COMPLETED` (95% complete)
  6. `ANALYSIS_UNLOCKED` (100% complete)
- **Minimum Data Threshold:** To unlock the Career Readiness Index, Skill Gap Radar, and Personalized Roadmap, the student must reach at least `RESUME_PARSED` + at least 1 completed assessment section (Level 3+). Before this threshold, Dashboard renders clean progressive checklist cards with **0 fabricated or hardcoded numbers**.

## 4. AI & LLM Service Layer Isolation (`/lib/ai/`)
- **Decision:** All AI calls (resume extraction, dynamic question generation, mentor chat, career synthesis) are isolated behind typed client interfaces.
- **Resilience Strategy:** If `OPENAI_API_KEY` or `GEMINI_API_KEY` is not provided in `.env`, the system transparently utilizes an intelligent heuristic parser and NLP engine that extracts real skills, projects, and certifications from the user's actual uploaded text and generates personalized questions. This ensures 100% testability and reliability out of the box.

## 5. Pure Scoring Engine (`/lib/scoring/`)
- **Decision:** The scoring functions are pure, deterministic, and unit-testable.
- **Academic Year Weighting:**
  - **1st / 2nd Year Students:** Technical Skills (35%), Problem Solving (25%), Interest Alignment (20%), Learning Consistency (10%), Projects (5%), Resume (5%).
  - **3rd / 4th Year Students & Graduates:** Technical Skills (30%), Projects (20%), Problem Solving (15%), Interest Alignment (15%), Resume Quality (10%), Learning Consistency (10%).

## 6. Currency & Localization
- **Decision:** Indian Rupee (INR) Lakhs Per Annum (`₹X LPA – ₹Y LPA`) format across all career profiles, salary ranges, and ROI estimates, structured behind a localization utility (`/lib/localization/currency.ts`).
