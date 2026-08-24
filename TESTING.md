# CareerX — Manual Verification & Testing Guide (TESTING.md)

This document provides a step-by-step guide to verify that all scores, recommendations, graphs, and roadmaps in CareerX are computed dynamically from real user data with **zero hardcoded demo names or fake static numbers**.

---

## 1. Verify "No Static Defaults" Constraint (Section 15)

### Test 1: Fresh User Registration (0 Fabricated Numbers)
1. Navigate to `/signup`.
2. Fill out all 4 steps for a new student (e.g. Name: `Aarav Sharma`, College: `IIT Bombay`, Year: `1st Year`, Skills: `C, Linux`).
3. Submit and verify redirection to `/dashboard`.
4. **Verification Criteria:**
   - The top banner greets the user by their real name: *"Good Evening, Aarav Sharma 👋"*.
   - Because the user has not uploaded a resume or completed the assessment, the Career Readiness Score displays a clean **Locked State Card** with a progress bar (20%) instead of a fake score like "87/100" or "Alex Rivera".
   - Search the entire page DOM — no fabricated percentages or hardcoded scores render.

### Test 2: Dual Resume Test (Different Resumes Produce Different Outputs)
1. **Student A (AI/ML Focus):** Upload a resume with `Python, PyTorch, Deep Learning, FastAPI, Docker, RAG`.
   - Result: Skill extraction detects ML tools; Initial Interest Estimate shows AI & Data at 85%+; dynamic questions ask about *PyTorch loss functions & RAG pipelines*.
2. **Student B (Cybersecurity Focus):** Upload a resume with `Wireshark, Kali Linux, OWASP, Metasploit, Cryptography`.
   - Result: Skill extraction detects Security tools; Initial Interest Estimate shows Cyber & Security at 85%+; dynamic questions ask about *API injection vulnerabilities & network traffic analysis*.
3. **Verification Criteria:** Both students receive visibly distinct extracted skill lists, interest distributions, and customized questions.

---

## 2. Verify Assessment & Pure Scoring Engine

1. From `/assessment`, complete Section A (Technical Interests), Section B (Cognitive Aptitude), Section C (Algorithmic Debugging Challenges), and Section D (Mind Games).
2. Submit the assessment.
3. Verify that `/dashboard` immediately transitions from the locked state to the **Verified Career Readiness Score** (e.g. 78/100).
4. Verify that:
   - Dimension subscores (Technical Skills, Projects, Resume, Problem Solving, Interest Alignment) reflect your actual answers.
   - The **Competency Radar** updates dynamically to reflect your known skills vs the target role benchmark.
   - The **Daily AI Briefing** references your actual top strength and biggest gap.

---

## 3. Verify Interactive Force-Directed Skill Graph

1. Navigate to `/skill-graph`.
2. Verify that:
   - Central node is your real name (*Aarav Sharma*).
   - Domain nodes connect to skills.
   - Your known skills appear in **Emerald Green** (Strong Skill) or **Cyan Blue** (Currently Learning).
   - Missing industry skills appear in **Coral Red** (Missing Skill) or **Amber Gold** (Recommended Next).
   - Zooming, panning, and clicking any node reveals its status card without page reload.

---

## 4. Verify Adaptive Roadmap & Target Switching

1. Navigate to `/roadmap`.
2. Verify the 5 phases: Phase 1 (Foundations) $\rightarrow$ Phase 2 (Core Specialization) $\rightarrow$ Phase 3 (Advanced Systems) $\rightarrow$ Phase 4 (MLOps & Cloud) $\rightarrow$ Phase 5 (Placement Launchpad).
3. Click any deliverable checkbox — observe instant progress percentage update and persistence.
4. Go to `/explorer` and switch target to *Cloud DevOps*.
5. Return to `/roadmap` — observe that the phase deliverables and titles have dynamically recalibrated to Cloud & Kubernetes benchmarks.

---

## 5. Verify Context-Grounded AI Mentor

1. Click the floating **AI Mentor** button in the bottom right corner (or visit `/mentor`).
2. Ask: *"What is the best capstone project I should build?"*
3. Verify that the response explicitly references your real name, your chosen target role, your current score tier, and your actual missing skill gap.
