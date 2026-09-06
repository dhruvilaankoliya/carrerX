/* ==========================================================================
   CareerX - Homepage View (Landing Page Experience)
   ========================================================================== */

import { CareerConstellation } from '../components/constellation.js';
import { CAREERS_DATA } from '../data/careers.js';
import { router } from '../router.js';
import { aiMentor } from '../components/aiMentor.js';

export class HomeView {
  constructor(container) {
    this.container = container;
    this.constellationInstance = null;
    this.activeStep = 1;
  }

  render() {
    this.container.innerHTML = `
      <!-- 1. Hero Section -->
      <section class="hero-section" style="padding: 3rem 0 5rem; position: relative;">
        <div class="container">
          <div style="text-align: center; max-width: 880px; margin: 0 auto 2.5rem;">
            <div class="section-tag" style="margin-bottom: 1.25rem;">
              <span class="dot"></span> Next-Gen AI Career & Skill Intelligence
            </div>
            <h1 style="margin-bottom: 1.25rem; letter-spacing: -0.03em;">
              Discover Your Potential.<br/>
              <span class="text-gradient">Build the Career You're Meant For.</span>
            </h1>
            <p class="section-desc" style="font-size: 1.2rem; max-width: 720px; margin: 0 auto 2rem;">
              CareerX analyzes your strengths, maps industry skill gaps, and guides you along a personalized, gamified roadmap toward high-impact engineering careers.
            </p>
            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
              <button class="btn btn-primary btn-lg" id="hero-start-assessment-btn">
                ⚡ Start Free AI Assessment →
              </button>
              <button class="btn btn-glass btn-lg" id="hero-open-dashboard-btn">
                🚀 Open Student Command Center
              </button>
            </div>
          </div>

          <!-- Signature Visual: The Career Constellation Canvas -->
          <div class="constellation-wrapper">
            <div class="constellation-hud">
              <div class="constellation-legend">
                <div class="legend-item"><span class="legend-dot skill"></span> Current Skills</div>
                <div class="legend-item"><span class="legend-dot interest"></span> Passions</div>
                <div class="legend-item"><span class="legend-dot course"></span> Courses</div>
                <div class="legend-item"><span class="legend-dot project"></span> Projects</div>
                <div class="legend-item"><span class="legend-dot career"></span> Target Careers</div>
              </div>
              <div class="constellation-controls">
                <button class="hud-btn" id="constellation-reset-btn" title="Reset View">⟲</button>
                <button class="hud-btn" id="constellation-zoom-in-btn" title="Zoom In">+</button>
                <button class="hud-btn" id="constellation-zoom-out-btn" title="Zoom Out">−</button>
              </div>
            </div>

            <canvas id="hero-constellation-canvas" class="constellation-canvas"></canvas>

            <div id="constellation-tooltip" class="node-tooltip-card" style="display: none;">
              <div class="node-tooltip-type" id="tt-type" style="color: #06b6d4;">Skill Node</div>
              <div class="node-tooltip-title" id="tt-title">PyTorch & Neural Nets</div>
              <div class="node-tooltip-desc" id="tt-desc">Core framework for deep learning architectures and transformer training.</div>
              <div class="node-tooltip-meta">
                <span id="tt-match" style="color: #10b981; font-weight: 700;">88% Competency</span>
                <span style="color: var(--text-tertiary);">Drag or click node</span>
              </div>
            </div>
          </div>

          <!-- Micro-Metrics Ticker -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-top: 3rem;">
            <div class="glass-card" style="text-align: center;">
              <div style="font-family: var(--font-heading); font-size: 2.2rem; font-weight: 800; color: #38bdf8;">42,000+</div>
              <div style="font-size: 0.85rem; color: var(--text-secondary);">Skills & Competencies Modeled</div>
            </div>
            <div class="glass-card" style="text-align: center;">
              <div style="font-family: var(--font-heading); font-size: 2.2rem; font-weight: 800; color: #34d399;">94.8%</div>
              <div style="font-size: 0.85rem; color: var(--text-secondary);">Placement Readiness Match</div>
            </div>
            <div class="glass-card" style="text-align: center;">
              <div style="font-family: var(--font-heading); font-size: 2.2rem; font-weight: 800; color: #c084fc;">1,250+</div>
              <div style="font-size: 0.85rem; color: var(--text-secondary);">Verified Industry Roadmaps</div>
            </div>
            <div class="glass-card" style="text-align: center;">
              <div style="font-family: var(--font-heading); font-size: 2.2rem; font-weight: 800; color: #fbbf24;">4.9 / 5 ★</div>
              <div style="font-size: 0.85rem; color: var(--text-secondary);">Student Transformation Rating</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. Interactive 4-Step Journey ("How CareerX Works") -->
      <section class="section-spacing" style="background: rgba(11, 18, 34, 0.5); border-top: 1px solid rgba(255, 255, 255, 0.05); border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
        <div class="container">
          <div class="section-header">
            <div class="section-tag"><span class="dot"></span> How CareerX Works</div>
            <h2 class="section-title">An Intelligent 4-Step Transformation Journey</h2>
            <p class="section-desc">From uncertain student to job-ready engineering contender with verified proof of work.</p>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 2.5rem; align-items: center;">
            <div style="display: flex; flex-direction: column; gap: 1rem;" id="journey-tabs">
              <div class="glass-card journey-step-card active" data-step="1" style="cursor: pointer; border-left: 4px solid var(--cyan-ai);">
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.25rem;">
                  <span style="font-family: var(--font-mono); color: var(--cyan-ai); font-weight: 700;">STEP 01</span>
                  <h3 style="font-size: 1.15rem;">Deep AI Career Assessment</h3>
                </div>
                <p style="font-size: 0.88rem;">Multidimensional evaluation of your technical skills, problem-solving style, and dream career environment.</p>
              </div>

              <div class="glass-card journey-step-card" data-step="2" style="cursor: pointer;">
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.25rem;">
                  <span style="font-family: var(--font-mono); color: var(--electric-blue); font-weight: 700;">STEP 02</span>
                  <h3 style="font-size: 1.15rem;">Constellation & Skill Gap Mapping</h3>
                </div>
                <p style="font-size: 0.88rem;">Real-time radar comparison between your current proficiencies and top industry expectations.</p>
              </div>

              <div class="glass-card journey-step-card" data-step="3" style="cursor: pointer;">
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.25rem;">
                  <span style="font-family: var(--font-mono); color: var(--ultra-violet); font-weight: 700;">STEP 03</span>
                  <h3 style="font-size: 1.15rem;">Dynamic Gamified Learning Roadmap</h3>
                </div>
                <p style="font-size: 0.88rem;">Stage-by-stage milestones, vetted industry projects, and high-yield credentials with clear "why" context.</p>
              </div>

              <div class="glass-card journey-step-card" data-step="4" style="cursor: pointer;">
                <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 0.25rem;">
                  <span style="font-family: var(--font-mono); color: var(--emerald-growth); font-weight: 700;">STEP 04</span>
                  <h3 style="font-size: 1.15rem;">ATS Resume Audit & Job-Ready Launch</h3>
                </div>
                <p style="font-size: 0.88rem;">Line-by-line AI resume optimization, keyword gap remediation, and simulated technical mock interviews.</p>
              </div>
            </div>

            <!-- Dynamic Interactive Journey Preview Widget -->
            <div class="glass-panel" id="journey-preview-pane" style="padding: 2.5rem; min-height: 380px; display: flex; flex-direction: column; justify-content: center;">
              <!-- Injected by updateJourneyStep -->
            </div>
          </div>
        </div>
      </section>

      <!-- 3. AI Career Intelligence Spotlight Preview -->
      <section class="section-spacing">
        <div class="container">
          <div class="section-header">
            <div class="section-tag"><span class="dot"></span> AI Skill Intelligence</div>
            <h2 class="section-title">Unlike Any College Portal or Job Board</h2>
            <p class="section-desc">CareerX doesn't just show job listings. It understands your exact gaps and engineers your readiness.</p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 2rem;">
            <!-- Feature 1 -->
            <div class="glass-card" style="border-top: 2px solid var(--cyan-ai);">
              <div style="font-size: 2.5rem; margin-bottom: 1rem;">🎯</div>
              <h3 style="margin-bottom: 0.5rem;">Precision Skill Gap Radar</h3>
              <p style="margin-bottom: 1.25rem;">Instantly visualizes the delta between your current capabilities and hiring benchmarks at top tier companies.</p>
              <div style="background: rgba(0,0,0,0.3); border-radius: var(--radius-sm); padding: 0.75rem; font-size: 0.8rem; font-family: var(--font-mono); color: #38bdf8;">
                ✓ 8 Core Dimensions Analyzed<br/>
                ✓ Actionable 3-Day Bridge Projects
              </div>
            </div>

            <!-- Feature 2 -->
            <div class="glass-card" style="border-top: 2px solid var(--electric-blue);">
              <div style="font-size: 2.5rem; margin-bottom: 1rem;">🗺️</div>
              <h3 style="margin-bottom: 0.5rem;">Gamified Stage Roadmaps</h3>
              <p style="margin-bottom: 1.25rem;">Stage-by-stage learning pathways with XP rewards, milestone unlocks, and verifiable portfolio deliverables.</p>
              <div style="background: rgba(0,0,0,0.3); border-radius: var(--radius-sm); padding: 0.75rem; font-size: 0.8rem; font-family: var(--font-mono); color: #34d399;">
                ✓ Stage 1: Mathematical Foundations<br/>
                ✓ Stage 5: FAANG Mock Interview Ready
              </div>
            </div>

            <!-- Feature 3 -->
            <div class="glass-card" style="border-top: 2px solid var(--ultra-violet);">
              <div style="font-size: 2.5rem; margin-bottom: 1rem;">🤖</div>
              <h3 style="margin-bottom: 0.5rem;">Personal AI Career Mentor</h3>
              <p style="margin-bottom: 1.25rem;">A floating 24/7 conversational mentor that knows your profile, recommends high-yield projects, and audits resumes.</p>
              <div style="background: rgba(0,0,0,0.3); border-radius: var(--radius-sm); padding: 0.75rem; font-size: 0.8rem; font-family: var(--font-mono); color: #c084fc;">
                ✓ Context-Aware Recommendations<br/>
                ✓ Instant ATS Resume Re-writing
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. Trending Career Explorer Teaser -->
      <section class="section-spacing" style="background: rgba(11, 18, 34, 0.4);">
        <div class="container">
          <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 3rem; flex-wrap: wrap; gap: 1rem;">
            <div>
              <div class="section-tag"><span class="dot"></span> Explore High-Growth Roles</div>
              <h2>High-Impact Engineering Paths</h2>
              <p>Compare real salary ranges, demand trajectories, and required tool stacks.</p>
            </div>
            <button class="btn btn-glass" id="home-view-all-careers-btn">View All 16+ Careers →</button>
          </div>

          <div class="careers-grid">
            ${Object.values(CAREERS_DATA).slice(0, 3).map(c => `
              <div class="career-card" data-career="${c.id}">
                <div>
                  <div class="career-card-top">
                    <div class="career-icon-box">${c.icon}</div>
                    <span class="career-match-pill">${c.matchScore}% Fit</span>
                  </div>
                  <h3 class="career-title">${c.title}</h3>
                  <p class="career-desc">${c.description}</p>
                </div>
                <div>
                  <div class="career-stats-row">
                    <div class="career-stat-item">
                      <span class="stat-label">Avg. Salary</span>
                      <span class="stat-val" style="color: #38bdf8;">${c.salaryRange}</span>
                    </div>
                    <div class="career-stat-item" style="text-align: right;">
                      <span class="stat-label">Growth</span>
                      <span class="stat-val" style="color: #34d399;">${c.growthRate}</span>
                    </div>
                  </div>
                  <button class="btn btn-sm btn-glass explore-role-btn" data-career="${c.id}" style="width: 100%;">
                    Inspect Skill Requirements →
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- 5. Student Success Testimonials -->
      <section class="section-spacing">
        <div class="container">
          <div class="section-header">
            <div class="section-tag"><span class="dot"></span> Verified Student Stories</div>
            <h2 class="section-title">Built for Students Who Want to Stand Out</h2>
            <p class="section-desc">Hear how students transformed their trajectory from tier-3 colleges to global tech leaders.</p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.75rem;">
            <div class="glass-card">
              <div style="display: flex; gap: 0.35rem; color: #f59e0b; margin-bottom: 1rem;">★★★★★</div>
              <p style="font-style: italic; margin-bottom: 1.5rem; color: #cbd5e1;">
                "I was lost between doing generic web dev and ML tutorials. CareerX showed me my exact gap in Docker and FastAPI. After building the suggested RAG capstone, I landed an AI engineer internship at a top lab!"
              </p>
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div style="width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #06b6d4); display: flex; align-items: center; justify-content: center; font-weight: 700;">SN</div>
                <div>
                  <div style="font-weight: 700; font-size: 0.95rem; color: #ffffff;">Siddharth Nair</div>
                  <div style="font-size: 0.75rem; color: var(--text-tertiary);">Junior ML Engineer @ Scale AI</div>
                </div>
              </div>
            </div>

            <div class="glass-card">
              <div style="display: flex; gap: 0.35rem; color: #f59e0b; margin-bottom: 1rem;">★★★★★</div>
              <p style="font-style: italic; margin-bottom: 1.5rem; color: #cbd5e1;">
                "The Career Constellation made everything click. It wasn't just a list of courses — it showed me how my math interest connected to PyTorch and distributed inference. My readiness score jumped from 62 to 89."
              </p>
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div style="width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(135deg, #8b5cf6, #ec4899); display: flex; align-items: center; justify-content: center; font-weight: 700;">EL</div>
                <div>
                  <div style="font-weight: 700; font-size: 0.95rem; color: #ffffff;">Elena Lin</div>
                  <div style="font-size: 0.75rem; color: var(--text-tertiary);">Platform Engineer @ Datadog</div>
                </div>
              </div>
            </div>

            <div class="glass-card">
              <div style="display: flex; gap: 0.35rem; color: #f59e0b; margin-bottom: 1rem;">★★★★★</div>
              <p style="font-style: italic; margin-bottom: 1.5rem; color: #cbd5e1;">
                "The AI bullet rewriter alone is worth gold. It turned my vague bullet points into quantified impact metrics that passed recruiter ATS screenings in 48 hours."
              </p>
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div style="width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(135deg, #10b981, #3b82f6); display: flex; align-items: center; justify-content: center; font-weight: 700;">MK</div>
                <div>
                  <div style="font-weight: 700; font-size: 0.95rem; color: #ffffff;">Marcus Kim</div>
                  <div style="font-size: 0.75rem; color: var(--text-tertiary);">Cloud Architect @ Snowflake</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 6. Grand Final Call to Action -->
      <section style="padding: 5rem 0 7rem;">
        <div class="container">
          <div class="glass-panel" style="background: linear-gradient(135deg, rgba(30, 27, 75, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%); border: 1px solid rgba(6, 182, 212, 0.4); padding: 4rem 2rem; text-align: center; border-radius: var(--radius-xl); box-shadow: 0 0 50px rgba(6, 182, 212, 0.2);">
            <div class="section-tag"><span class="dot"></span> Ready to Take Command?</div>
            <h2 style="font-size: clamp(2rem, 3.5vw, 3rem); margin-bottom: 1rem;">
              Stop Wondering. <span class="text-gradient">Start Building Your Industry Edge.</span>
            </h2>
            <p style="font-size: 1.15rem; max-width: 640px; margin: 0 auto 2.5rem; color: var(--text-secondary);">
              Join thousands of ambitious students turning potential into top-tier tech placements with CareerX.
            </p>
            <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
              <button class="btn btn-primary btn-lg" id="final-cta-btn">
                ⚡ Take Free AI Career Assessment
              </button>
              <button class="btn btn-ai btn-lg" id="final-mentor-cta-btn">
                ✨ Ask AI Mentor a Question
              </button>
            </div>
          </div>
        </div>
      </section>
    `;

    this.initConstellation();
    this.updateJourneyStep(1);
    this.bindEvents();
  }

  initConstellation() {
    const canvas = document.getElementById('hero-constellation-canvas');
    if (!canvas) return;

    const tooltip = document.getElementById('constellation-tooltip');
    const ttType = document.getElementById('tt-type');
    const ttTitle = document.getElementById('tt-title');
    const ttDesc = document.getElementById('tt-desc');
    const ttMatch = document.getElementById('tt-match');

    this.constellationInstance = new CareerConstellation(canvas, {
      onNodeHover: (node, clientX, clientY) => {
        if (!node || !tooltip) {
          if (tooltip) tooltip.style.display = 'none';
          return;
        }

        ttType.innerText = `${node.type.toUpperCase()} NODE`;
        ttTitle.innerText = node.name;
        ttDesc.innerText = node.desc || 'Connected in your career constellation network.';
        ttMatch.innerText = node.match ? `${node.match}% Match` : 'Active Trajectory';
        tooltip.style.display = 'block';
      },
      onNodeClick: (node) => {
        if (node.type === 'career') {
          router.navigate('explorer');
        } else if (node.type === 'skill') {
          router.navigate('skill-gap');
        }
      }
    });

    // Constellation HUD buttons
    const resetBtn = document.getElementById('constellation-reset-btn');
    const zoomInBtn = document.getElementById('constellation-zoom-in-btn');
    const zoomOutBtn = document.getElementById('constellation-zoom-out-btn');

    if (resetBtn) resetBtn.onclick = () => this.constellationInstance.resetView();
    if (zoomInBtn) zoomInBtn.onclick = () => { this.constellationInstance.zoom = Math.min(2.4, this.constellationInstance.zoom * 1.2); };
    if (zoomOutBtn) zoomOutBtn.onclick = () => { this.constellationInstance.zoom = Math.max(0.6, this.constellationInstance.zoom * 0.8); };
  }

  updateJourneyStep(stepNumber) {
    this.activeStep = stepNumber;
    const pane = document.getElementById('journey-preview-pane');
    if (!pane) return;

    const stepCards = document.querySelectorAll('.journey-step-card');
    stepCards.forEach(c => {
      if (parseInt(c.getAttribute('data-step'), 10) === stepNumber) {
        c.classList.add('active');
        c.style.borderColor = 'var(--cyan-ai)';
      } else {
        c.classList.remove('active');
        c.style.borderColor = 'rgba(99, 102, 241, 0.2)';
      }
    });

    const stepPreviews = {
      1: `
        <div style="text-align: center;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🧠</div>
          <div class="badge badge-ai" style="margin-bottom: 0.75rem;">AI Cognitive Diagnostic</div>
          <h3 style="font-size: 1.5rem; margin-bottom: 0.75rem;">Deep Diagnostic Profiling</h3>
          <p style="font-size: 0.95rem; margin-bottom: 1.5rem;">
            Analyzes 5 core vectors: Mathematical Aptitude, Code Fluency, System Intuition, Work Environment Fit, and Domain Curiosity.
          </p>
          <div style="background: rgba(0,0,0,0.3); border-radius: var(--radius-md); padding: 1rem; text-align: left; font-size: 0.85rem; font-family: var(--font-mono); color: #38bdf8;">
            > Output: 92% Alignment with Machine Learning Engineering<br/>
            > Baseline Readiness: 81 / 100
          </div>
        </div>
      `,
      2: `
        <div style="text-align: center;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">⚡</div>
          <div class="badge badge-warning" style="margin-bottom: 0.75rem;">Skill Delta Analyzer</div>
          <h3 style="font-size: 1.5rem; margin-bottom: 0.75rem;">Dual Radar Gap Visualization</h3>
          <p style="font-size: 0.95rem; margin-bottom: 1.5rem;">
            Identifies that while your Python & Math are at 90%, your MLOps & Docker proficiency (48%) is the primary barrier to Tier-1 job offers.
          </p>
          <div style="background: rgba(0,0,0,0.3); border-radius: var(--radius-md); padding: 1rem; text-align: left; font-size: 0.85rem; font-family: var(--font-mono); color: #fb7185;">
            > Critical Gap: Docker Containerization (-37% vs FAANG Benchmark)<br/>
            > Suggested Fix: FastAPI + Docker Microservice Lab
          </div>
        </div>
      `,
      3: `
        <div style="text-align: center;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🗺️</div>
          <div class="badge badge-purple" style="margin-bottom: 0.75rem;">Gamified Stage Progression</div>
          <h3 style="font-size: 1.5rem; margin-bottom: 0.75rem;">Dynamic Learning Roadmap</h3>
          <p style="font-size: 0.95rem; margin-bottom: 1.5rem;">
            Breaks your journey into 5 clear stages with milestone checklists, project repos, and verifiable skill tokens.
          </p>
          <div style="background: rgba(0,0,0,0.3); border-radius: var(--radius-md); padding: 1rem; text-align: left; font-size: 0.85rem; font-family: var(--font-mono); color: #34d399;">
            > Current: Stage 3 (LLMs & RAG Pipelines - 68% Complete)<br/>
            > Next Unlock: Stage 4 (MLOps & Cloud Infrastructure)
          </div>
        </div>
      `,
      4: `
        <div style="text-align: center;">
          <div style="font-size: 3rem; margin-bottom: 1rem;">🚀</div>
          <div class="badge badge-success" style="margin-bottom: 0.75rem;">Placement Launchpad</div>
          <h3 style="font-size: 1.5rem; margin-bottom: 0.75rem;">ATS Resume & Mock Interview Prep</h3>
          <p style="font-size: 0.95rem; margin-bottom: 1.5rem;">
            Transforms resume bullets with quantifiable STAR metrics and simulates live 45-minute AI technical interviews with instant feedback.
          </p>
          <div style="background: rgba(0,0,0,0.3); border-radius: var(--radius-md); padding: 1rem; text-align: left; font-size: 0.85rem; font-family: var(--font-mono); color: #fbbf24;">
            > Resume ATS Match: 74 → 88/100<br/>
            > Interview Fluency Score: 82/100
          </div>
        </div>
      `
    };

    pane.innerHTML = stepPreviews[stepNumber] || stepPreviews[1];
  }

  bindEvents() {
    const startAssessmentBtn = document.getElementById('hero-start-assessment-btn');
    const openDashboardBtn = document.getElementById('hero-open-dashboard-btn');
    const finalCtaBtn = document.getElementById('final-cta-btn');
    const finalMentorBtn = document.getElementById('final-mentor-cta-btn');
    const viewAllCareersBtn = document.getElementById('home-view-all-careers-btn');

    if (startAssessmentBtn) startAssessmentBtn.onclick = () => router.navigate('assessment');
    if (openDashboardBtn) openDashboardBtn.onclick = () => router.navigate('dashboard');
    if (finalCtaBtn) finalCtaBtn.onclick = () => router.navigate('assessment');
    if (finalMentorBtn) finalMentorBtn.onclick = () => aiMentor.toggle(true);
    if (viewAllCareersBtn) viewAllCareersBtn.onclick = () => router.navigate('explorer');

    // Step cards click
    const stepCards = document.querySelectorAll('.journey-step-card');
    stepCards.forEach(card => {
      card.onclick = () => {
        const stepNum = parseInt(card.getAttribute('data-step'), 10);
        this.updateJourneyStep(stepNum);
      };
    });

    // Explore role buttons
    const exploreBtns = document.querySelectorAll('.explore-role-btn');
    exploreBtns.forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        router.navigate('explorer');
      };
    });
  }
}
