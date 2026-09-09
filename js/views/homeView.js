/* ==========================================================================
   CareerX - Homepage View (Clean & Minimal Experience)
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
      <section class="hero-section" style="padding: 2rem 0 3rem; position: relative;">
        <div class="container">
          <div style="text-align: left; max-width: 780px; margin: 0 0 2rem;">
            <div class="section-tag" style="margin-bottom: 0.75rem;">
              Career & Skill Intelligence
            </div>
            <h1 style="margin-bottom: 0.75rem;">
              Discover your strengths. Build your engineering career.
            </h1>
            <p class="section-desc" style="margin-bottom: 1.5rem;">
              CareerX analyzes technical proficiencies, identifies industry skill gaps, and generates structured learning roadmaps toward high-impact roles.
            </p>
            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
              <button class="btn btn-primary" id="hero-start-assessment-btn">
                Start Assessment
              </button>
              <button class="btn btn-glass" id="hero-open-dashboard-btn">
                Open Dashboard
              </button>
            </div>
          </div>

          <!-- The Career Constellation Canvas -->
          <div class="constellation-wrapper">
            <div class="constellation-hud">
              <div class="constellation-legend">
                <div class="legend-item"><span class="legend-dot skill"></span> Skills</div>
                <div class="legend-item"><span class="legend-dot interest"></span> Passions</div>
                <div class="legend-item"><span class="legend-dot course"></span> Courses</div>
                <div class="legend-item"><span class="legend-dot project"></span> Projects</div>
                <div class="legend-item"><span class="legend-dot career"></span> Careers</div>
              </div>
              <div class="constellation-controls">
                <button class="hud-btn" id="constellation-reset-btn" title="Reset View">⟲</button>
                <button class="hud-btn" id="constellation-zoom-in-btn" title="Zoom In">+</button>
                <button class="hud-btn" id="constellation-zoom-out-btn" title="Zoom Out">−</button>
              </div>
            </div>

            <canvas id="hero-constellation-canvas" class="constellation-canvas"></canvas>

            <div id="constellation-tooltip" class="node-tooltip-card" style="display: none;">
              <div class="node-tooltip-type" id="tt-type">Skill Node</div>
              <div class="node-tooltip-title" id="tt-title">PyTorch & Neural Nets</div>
              <div class="node-tooltip-desc" id="tt-desc">Core framework for deep learning architectures and transformer training.</div>
              <div class="node-tooltip-meta">
                <span id="tt-match" style="font-weight: 600; color: var(--text-primary);">88% Competency</span>
                <span style="color: var(--text-tertiary);">Click node to view</span>
              </div>
            </div>
          </div>

          <!-- Key Metrics Ticker -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1.5rem;">
            <div class="glass-card">
              <div style="font-family: var(--font-heading); font-size: 1.6rem; font-weight: 600; color: var(--text-primary);">42,000+</div>
              <div style="font-size: 0.8rem; color: var(--text-secondary);">Skills Modeled</div>
            </div>
            <div class="glass-card">
              <div style="font-family: var(--font-heading); font-size: 1.6rem; font-weight: 600; color: var(--text-primary);">94.8%</div>
              <div style="font-size: 0.8rem; color: var(--text-secondary);">Benchmark Alignment</div>
            </div>
            <div class="glass-card">
              <div style="font-family: var(--font-heading); font-size: 1.6rem; font-weight: 600; color: var(--text-primary);">1,250+</div>
              <div style="font-size: 0.8rem; color: var(--text-secondary);">Industry Roadmaps</div>
            </div>
            <div class="glass-card">
              <div style="font-family: var(--font-heading); font-size: 1.6rem; font-weight: 600; color: var(--text-primary);">4.9 / 5.0</div>
              <div style="font-size: 0.8rem; color: var(--text-secondary);">Student Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. Interactive 4-Step Journey -->
      <section class="section-spacing" style="background: var(--bg-surface); border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);">
        <div class="container">
          <div class="section-header">
            <div class="section-tag">Methodology</div>
            <h2 class="section-title">A 4-Step Structured Progression</h2>
            <p class="section-desc">Assess, analyze gaps, follow verified milestones, and audit deliverables.</p>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 1.5rem; align-items: start;">
            <div style="display: flex; flex-direction: column; gap: 0.75rem;" id="journey-tabs">
              <div class="glass-card journey-step-card active" data-step="1" style="cursor: pointer;">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                  <span style="font-family: var(--font-mono); color: var(--accent); font-weight: 600; font-size: 0.8rem;">01</span>
                  <h3 style="font-size: 0.95rem;">Career Assessment</h3>
                </div>
                <p style="font-size: 0.82rem;">Evaluation of technical abilities, problem solving, and role preferences.</p>
              </div>

              <div class="glass-card journey-step-card" data-step="2" style="cursor: pointer;">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                  <span style="font-family: var(--font-mono); color: var(--text-secondary); font-weight: 600; font-size: 0.8rem;">02</span>
                  <h3 style="font-size: 0.95rem;">Skill Gap Mapping</h3>
                </div>
                <p style="font-size: 0.82rem;">Radar comparison against industry hiring standards.</p>
              </div>

              <div class="glass-card journey-step-card" data-step="3" style="cursor: pointer;">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                  <span style="font-family: var(--font-mono); color: var(--text-secondary); font-weight: 600; font-size: 0.8rem;">03</span>
                  <h3 style="font-size: 0.95rem;">Structured Roadmap</h3>
                </div>
                <p style="font-size: 0.82rem;">Sequential stages, project requirements, and core milestones.</p>
              </div>

              <div class="glass-card journey-step-card" data-step="4" style="cursor: pointer;">
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                  <span style="font-family: var(--font-mono); color: var(--text-secondary); font-weight: 600; font-size: 0.8rem;">04</span>
                  <h3 style="font-size: 0.95rem;">Resume & Readiness Audit</h3>
                </div>
                <p style="font-size: 0.82rem;">Keyword optimization and ATS compatibility review.</p>
              </div>
            </div>

            <!-- Dynamic Journey Preview Widget -->
            <div class="glass-card" id="journey-preview-pane" style="padding: 1.5rem; min-height: 260px; display: flex; flex-direction: column; justify-content: center;">
              <!-- Injected by updateJourneyStep -->
            </div>
          </div>
        </div>
      </section>

      <!-- 3. AI Capabilities Section -->
      <section class="section-spacing">
        <div class="container">
          <div class="section-header">
            <div class="section-tag">Core Features</div>
            <h2 class="section-title">Engineered for Clear Direction</h2>
            <p class="section-desc">Practical tooling designed to prepare students for engineering roles.</p>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem;">
            <!-- Feature 1 -->
            <div class="glass-card">
              <h3 style="margin-bottom: 0.35rem; font-size: 1rem;">Skill Gap Radar</h3>
              <p style="margin-bottom: 1rem; font-size: 0.85rem;">Calculates the delta between current competencies and industry hiring benchmarks.</p>
              <div style="background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.65rem; font-size: 0.75rem; font-family: var(--font-mono); color: var(--text-secondary);">
                • 8 core competency dimensions<br/>
                • Priority deficit categorization
              </div>
            </div>

            <!-- Feature 2 -->
            <div class="glass-card">
              <h3 style="margin-bottom: 0.35rem; font-size: 1rem;">Milestone Roadmaps</h3>
              <p style="margin-bottom: 1rem; font-size: 0.85rem;">Sequential learning pathways with concrete project deliverables.</p>
              <div style="background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.65rem; font-size: 0.75rem; font-family: var(--font-mono); color: var(--text-secondary);">
                • Phase 1: Core foundations<br/>
                • Phase 5: Production capstone
              </div>
            </div>

            <!-- Feature 3 -->
            <div class="glass-card">
              <h3 style="margin-bottom: 0.35rem; font-size: 1rem;">AI Advisor & Resume Scanner</h3>
              <p style="margin-bottom: 1rem; font-size: 0.85rem;">Profile-aware recommendations and targeted ATS keyword analysis.</p>
              <div style="background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.65rem; font-size: 0.75rem; font-family: var(--font-mono); color: var(--text-secondary);">
                • Context-grounded feedback<br/>
                • Actionable bullet rewriting
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. Trending Career Explorer Teaser -->
      <section class="section-spacing" style="background: var(--bg-surface); border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);">
        <div class="container">
          <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
            <div>
              <div class="section-tag">Role Directory</div>
              <h2>High-Impact Engineering Careers</h2>
              <p>Explore target compensation, demand levels, and prerequisite skills.</p>
            </div>
            <button class="btn btn-glass" id="home-view-all-careers-btn">View All Roles →</button>
          </div>

          <div class="careers-grid">
            ${Object.values(CAREERS_DATA).slice(0, 3).map(c => `
              <div class="career-card" data-career="${c.id}">
                <div>
                  <div class="career-card-top">
                    <div class="career-icon-box">${c.icon}</div>
                    <span class="career-match-pill">${c.matchScore}% Match</span>
                  </div>
                  <h3 class="career-title">${c.title}</h3>
                  <p class="career-desc">${c.description}</p>
                </div>
                <div>
                  <div class="career-stats-row">
                    <div class="career-stat-item">
                      <span class="stat-label">Salary Range</span>
                      <span class="stat-val">${c.salaryRange}</span>
                    </div>
                    <div class="career-stat-item" style="text-align: right;">
                      <span class="stat-label">Market Demand</span>
                      <span class="stat-val">${c.growthRate}</span>
                    </div>
                  </div>
                  <button class="btn btn-sm btn-glass explore-role-btn" data-career="${c.id}" style="width: 100%;">
                    View Requirements →
                  </button>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- 5. CTA Section -->
      <section style="padding: 3rem 0;">
        <div class="container">
          <div class="glass-card" style="padding: 2.5rem 1.5rem; text-align: center;">
            <div class="section-tag" style="margin-bottom: 0.5rem;">Get Started</div>
            <h2 style="margin-bottom: 0.5rem;">
              Ready to evaluate your readiness?
            </h2>
            <p style="max-width: 580px; margin: 0 auto 1.5rem; color: var(--text-secondary);">
              Run a complete assessment to uncover skill gaps and generate a personalized roadmap.
            </p>
            <div style="display: flex; justify-content: center; gap: 0.75rem; flex-wrap: wrap;">
              <button class="btn btn-primary" id="final-cta-btn">
                Start Assessment
              </button>
              <button class="btn btn-glass" id="final-mentor-cta-btn">
                Ask AI Advisor
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
      onNodeHover: (node) => {
        if (!node || !tooltip) {
          if (tooltip) tooltip.style.display = 'none';
          return;
        }

        ttType.innerText = `${node.type.toUpperCase()} NODE`;
        ttTitle.innerText = node.name;
        ttDesc.innerText = node.desc || 'Connected in your career network.';
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
      const stepVal = parseInt(c.getAttribute('data-step'), 10);
      const stepSpan = c.querySelector('span');
      if (stepVal === stepNumber) {
        c.classList.add('active');
        c.style.borderColor = 'var(--accent)';
        if (stepSpan) stepSpan.style.color = 'var(--accent)';
      } else {
        c.classList.remove('active');
        c.style.borderColor = 'var(--border-color)';
        if (stepSpan) stepSpan.style.color = 'var(--text-secondary)';
      }
    });

    const stepPreviews = {
      1: `
        <div>
          <div class="badge" style="margin-bottom: 0.5rem;">Diagnostic Step</div>
          <h3 style="font-size: 1.15rem; margin-bottom: 0.5rem;">Diagnostic Profiling</h3>
          <p style="font-size: 0.88rem; margin-bottom: 1rem; color: var(--text-secondary);">
            Evaluates core vectors: Mathematics, Code Fluency, System Understanding, and Role Alignment.
          </p>
          <div style="background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.75rem; font-size: 0.8rem; font-family: var(--font-mono); color: var(--text-secondary);">
            Target: Machine Learning Engineering<br/>
            Baseline Readiness: 81 / 100
          </div>
        </div>
      `,
      2: `
        <div>
          <div class="badge" style="margin-bottom: 0.5rem;">Gap Analysis</div>
          <h3 style="font-size: 1.15rem; margin-bottom: 0.5rem;">Dual Radar Visualization</h3>
          <p style="font-size: 0.88rem; margin-bottom: 1rem; color: var(--text-secondary);">
            Identifies specific areas requiring bridge projects to meet benchmark standards.
          </p>
          <div style="background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.75rem; font-size: 0.8rem; font-family: var(--font-mono); color: var(--text-secondary);">
            Critical Focus: Docker Containerization<br/>
            Recommended: FastAPI + Docker Microservice Lab
          </div>
        </div>
      `,
      3: `
        <div>
          <div class="badge" style="margin-bottom: 0.5rem;">Milestones</div>
          <h3 style="font-size: 1.15rem; margin-bottom: 0.5rem;">Dynamic Roadmap</h3>
          <p style="font-size: 0.88rem; margin-bottom: 1rem; color: var(--text-secondary);">
            Divides learning progression into manageable stages with concrete project deliverables.
          </p>
          <div style="background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.75rem; font-size: 0.8rem; font-family: var(--font-mono); color: var(--text-secondary);">
            Current: Stage 3 (LLMs & RAG Pipelines - 68% Complete)<br/>
            Next: Stage 4 (MLOps & Cloud Infrastructure)
          </div>
        </div>
      `,
      4: `
        <div>
          <div class="badge" style="margin-bottom: 0.5rem;">Audit</div>
          <h3 style="font-size: 1.15rem; margin-bottom: 0.5rem;">Resume & Readiness Verification</h3>
          <p style="font-size: 0.88rem; margin-bottom: 1rem; color: var(--text-secondary);">
            Reviews resume impact metrics and verifies keyword match against targeted job descriptions.
          </p>
          <div style="background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-sm); padding: 0.75rem; font-size: 0.8rem; font-family: var(--font-mono); color: var(--text-secondary);">
            ATS Match Score: 88 / 100<br/>
            Verified Competencies: 14 / 16
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

    const stepCards = document.querySelectorAll('.journey-step-card');
    stepCards.forEach(card => {
      card.onclick = () => {
        const stepNum = parseInt(card.getAttribute('data-step'), 10);
        this.updateJourneyStep(stepNum);
      };
    });

    const exploreBtns = document.querySelectorAll('.explore-role-btn');
    exploreBtns.forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        router.navigate('explorer');
      };
    });
  }
}
