/* ==========================================================================
   CareerX - Multi-Step Career Assessment Wizard & Neural Engine
   ========================================================================== */

import { studentStore } from '../data/studentProfile.js';
import { router } from '../router.js';

export class AssessmentWizard {
  constructor(containerElement) {
    this.container = containerElement;
    this.currentStep = 1;
    this.totalSteps = 5;
    this.answers = {
      education: 'cs_eng',
      interests: ['ai_ml', 'backend'],
      workStyle: 'high_growth',
      skills: {
        'Python / Core Programming': 5,
        'Machine Learning / Data': 4,
        'Docker / Cloud Infrastructure': 2,
        'System Design & Architecture': 3,
        'Frontend & UI/UX': 2
      }
    };
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="assessment-container">
        <div class="assessment-wizard-card">
          <!-- Wizard Progress Bar -->
          <div class="wizard-progress">
            <div class="wizard-progress-bar" style="width: ${((this.currentStep - 1) / (this.totalSteps - 1)) * 100}%;"></div>
            <div class="step-node ${this.currentStep >= 1 ? (this.currentStep === 1 ? 'active' : 'completed') : ''}">1</div>
            <div class="step-node ${this.currentStep >= 2 ? (this.currentStep === 2 ? 'active' : 'completed') : ''}">2</div>
            <div class="step-node ${this.currentStep >= 3 ? (this.currentStep === 3 ? 'active' : 'completed') : ''}">3</div>
            <div class="step-node ${this.currentStep >= 4 ? (this.currentStep === 4 ? 'active' : 'completed') : ''}">4</div>
            <div class="step-node ${this.currentStep >= 5 ? 'active' : ''}">5</div>
          </div>

          <div id="step-content">
            ${this.renderCurrentStepContent()}
          </div>
        </div>
      </div>
    `;

    this.bindStepEvents();
  }

  renderCurrentStepContent() {
    if (this.currentStep === 1) {
      return `
        <div class="step-pane">
          <div class="section-tag"><span class="dot"></span> Step 1 of 5 • Background & Ambition</div>
          <h2>What is your current academic or professional background?</h2>
          <p>CareerX tailors your baseline roadmap according to where you are starting today.</p>

          <div class="option-grid">
            <div class="option-card ${this.answers.education === 'cs_eng' ? 'selected' : ''}" data-val="cs_eng">
              <div class="option-icon">🎓</div>
              <div class="option-title">Computer Science / IT Student</div>
              <div class="option-desc">Pursuing B.Tech/B.S. in CS, Data Science, or related engineering branch.</div>
            </div>
            <div class="option-card ${this.answers.education === 'stem_other' ? 'selected' : ''}" data-val="stem_other">
              <div class="option-icon">🔬</div>
              <div class="option-title">Other STEM / Non-CS Degree</div>
              <div class="option-desc">Electrical, Mechanical, Math, Physics, or Economics background.</div>
            </div>
            <div class="option-card ${this.answers.education === 'career_switcher' ? 'selected' : ''}" data-val="career_switcher">
              <div class="option-icon">🔄</div>
              <div class="option-title">Career Switcher / Fresher</div>
              <div class="option-desc">Looking to transition from another industry into high-paying modern tech roles.</div>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; margin-top: 2rem;">
            <button class="btn btn-primary btn-lg" id="next-step-btn">Continue to Interests →</button>
          </div>
        </div>
      `;
    }

    if (this.currentStep === 2) {
      return `
        <div class="step-pane">
          <div class="section-tag"><span class="dot"></span> Step 2 of 5 • Technical Passions</div>
          <h2>Which technical problem areas excite you the most?</h2>
          <p>Select the domains that give you genuine intellectual flow.</p>

          <div class="option-grid">
            <div class="option-card ${this.answers.interests.includes('ai_ml') ? 'selected' : ''}" data-val="ai_ml">
              <div class="option-icon">🧠</div>
              <div class="option-title">AI, Neural Nets & LLMs</div>
              <div class="option-desc">Training intelligent models, building RAG systems, and generative algorithms.</div>
            </div>
            <div class="option-card ${this.answers.interests.includes('backend') ? 'selected' : ''}" data-val="backend">
              <div class="option-icon">⚙️</div>
              <div class="option-title">High-Scale Backend & Systems</div>
              <div class="option-desc">Distributed databases, microservices, concurrency, and low latency.</div>
            </div>
            <div class="option-card ${this.answers.interests.includes('cloud') ? 'selected' : ''}" data-val="cloud">
              <div class="option-icon">☁️</div>
              <div class="option-title">Cloud, Kubernetes & DevOps</div>
              <div class="option-desc">Infrastructure automation, CI/CD pipelines, and multi-region reliability.</div>
            </div>
            <div class="option-card ${this.answers.interests.includes('cyber') ? 'selected' : ''}" data-val="cyber">
              <div class="option-icon">🛡️</div>
              <div class="option-title">Cybersecurity & Defense</div>
              <div class="option-desc">Penetration testing, cryptographic security, and application hardening.</div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; margin-top: 2rem;">
            <button class="btn btn-glass" id="prev-step-btn">← Back</button>
            <button class="btn btn-primary btn-lg" id="next-step-btn">Continue to Work Style →</button>
          </div>
        </div>
      `;
    }

    if (this.currentStep === 3) {
      return `
        <div class="step-pane">
          <div class="section-tag"><span class="dot"></span> Step 3 of 5 • Work Environment</div>
          <h2>What is your dream working environment & culture?</h2>
          <p>Different roles thrive in distinct company structures.</p>

          <div class="option-grid">
            <div class="option-card ${this.answers.workStyle === 'high_growth' ? 'selected' : ''}" data-val="high_growth">
              <div class="option-icon">🚀</div>
              <div class="option-title">High-Growth AI Startup</div>
              <div class="option-desc">Fast-paced, high autonomy, equity upside, wearing multiple technical hats.</div>
            </div>
            <div class="option-card ${this.answers.workStyle === 'big_tech' ? 'selected' : ''}" data-val="big_tech">
              <div class="option-icon">🏢</div>
              <div class="option-title">Tier-1 Tech Enterprise (FAANG+)</div>
              <div class="option-desc">Massive scale, structured mentorship, top compensation, deep specialization.</div>
            </div>
            <div class="option-card ${this.answers.workStyle === 'research' ? 'selected' : ''}" data-val="research">
              <div class="option-icon">🧪</div>
              <div class="option-title">AI Research Lab / R&D Center</div>
              <div class="option-desc">Publishing papers, testing cutting-edge paradigms, foundational research.</div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; margin-top: 2rem;">
            <button class="btn btn-glass" id="prev-step-btn">← Back</button>
            <button class="btn btn-primary btn-lg" id="next-step-btn">Rate Your Skills →</button>
          </div>
        </div>
      `;
    }

    if (this.currentStep === 4) {
      return `
        <div class="step-pane">
          <div class="section-tag"><span class="dot"></span> Step 4 of 5 • Skill Inventory</div>
          <h2>Rate your current comfort level across core technical areas:</h2>
          <p>Be honest — this helps CareerX identify your high-yield bridge opportunities.</p>

          <div style="margin: 1.5rem 0;">
            ${Object.entries(this.answers.skills).map(([skill, rating]) => `
              <div class="skill-rating-item">
                <span style="font-weight: 600; font-size: 0.95rem; color: #ffffff;">${skill}</span>
                <div class="star-rating" data-skill="${skill}">
                  ${[1, 2, 3, 4, 5].map(star => `
                    <button class="star-btn ${star <= rating ? 'active' : ''}" data-star="${star}">★</button>
                  `).join('')}
                </div>
              </div>
            `).join('')}
          </div>

          <div style="display: flex; justify-content: space-between; margin-top: 2rem;">
            <button class="btn btn-glass" id="prev-step-btn">← Back</button>
            <button class="btn btn-primary btn-lg" id="run-synthesis-btn">⚡ Run AI Career Neural Synthesis</button>
          </div>
        </div>
      `;
    }

    if (this.currentStep === 5) {
      return `
        <div class="synthesis-orb-container">
          <div class="neural-orb"></div>
          <h2>Synthesizing Your Career Intelligence Profile...</h2>
          <p>Cross-referencing your profile against 42,000+ real tech job requirements</p>
          <div id="synthesis-status" class="synthesis-status-line">Analyzing skill vector embeddings...</div>
        </div>
      `;
    }
  }

  bindStepEvents() {
    const nextBtn = document.getElementById('next-step-btn');
    const prevBtn = document.getElementById('prev-step-btn');
    const synthBtn = document.getElementById('run-synthesis-btn');

    if (nextBtn) {
      nextBtn.onclick = () => {
        this.currentStep++;
        this.render();
      };
    }

    if (prevBtn) {
      prevBtn.onclick = () => {
        this.currentStep--;
        this.render();
      };
    }

    // Step 1 Options
    const cards = this.container.querySelectorAll('.option-card');
    cards.forEach(card => {
      card.onclick = () => {
        const val = card.getAttribute('data-val');
        if (this.currentStep === 1) {
          this.answers.education = val;
        } else if (this.currentStep === 2) {
          if (this.answers.interests.includes(val)) {
            this.answers.interests = this.answers.interests.filter(i => i !== val);
          } else {
            this.answers.interests.push(val);
          }
        } else if (this.currentStep === 3) {
          this.answers.workStyle = val;
        }
        this.render();
      };
    });

    // Step 4 Star Ratings
    const starRatings = this.container.querySelectorAll('.star-rating');
    starRatings.forEach(ratingGroup => {
      const skillName = ratingGroup.getAttribute('data-skill');
      const stars = ratingGroup.querySelectorAll('.star-btn');
      stars.forEach(star => {
        star.onclick = () => {
          const starVal = parseInt(star.getAttribute('data-star'), 10);
          this.answers.skills[skillName] = starVal;
          this.render();
        };
      });
    });

    if (synthBtn) {
      synthBtn.onclick = () => {
        this.currentStep = 5;
        this.render();
        this.runNeuralSynthesis();
      };
    }
  }

  runNeuralSynthesis() {
    const statusEl = document.getElementById('synthesis-status');
    const messages = [
      'Analyzing skill vector embeddings...',
      'Mapping skill gap adjacency against 14,000+ top job postings...',
      'Optimizing gamified stage roadmap...',
      'Finalizing Readiness Index: 81 / 100 !'
    ];

    let idx = 0;
    const interval = setInterval(() => {
      idx++;
      if (statusEl && idx < messages.length) {
        statusEl.innerText = messages[idx];
      } else if (idx >= messages.length) {
        clearInterval(interval);
        this.showAssessmentResults();
      }
    }, 900);
  }

  showAssessmentResults() {
    const stepContent = document.getElementById('step-content');
    if (!stepContent) return;

    stepContent.innerHTML = `
      <div style="text-align: center; padding: 1rem 0;">
        <div style="width: 70px; height: 70px; border-radius: 50%; background: rgba(16, 185, 129, 0.15); border: 2px solid #10b981; color: #10b981; font-size: 2rem; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem;">
          ✓
        </div>
        <div class="section-tag"><span class="dot"></span> AI Synthesis Complete</div>
        <h2>Your Top Career Match: <span class="text-gradient">Machine Learning Engineer</span></h2>
        <p style="max-width: 600px; margin: 0.5rem auto 2rem;">
          Based on your strong math foundations and Python expertise, you are <strong style="color:#ffffff;">92% aligned</strong> with production ML Engineering.
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; max-width: 720px; margin: 0 auto 2.5rem; text-align: left;">
          <div class="glass-card">
            <div style="font-size: 0.75rem; color: var(--cyan-ai); font-weight: 700; text-transform: uppercase;">Match Score</div>
            <div style="font-family: var(--font-heading); font-size: 2rem; font-weight: 800; color: #ffffff;">92% Match</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">Top 5% of candidate pool</div>
          </div>
          <div class="glass-card">
            <div style="font-size: 0.75rem; color: var(--amber-reward); font-weight: 700; text-transform: uppercase;">Starting Readiness</div>
            <div style="font-family: var(--font-heading); font-size: 2rem; font-weight: 800; color: #ffffff;">81 / 100</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">Tier 1 Contender</div>
          </div>
          <div class="glass-card">
            <div style="font-size: 0.75rem; color: var(--emerald-growth); font-weight: 700; text-transform: uppercase;">Avg. Compensation</div>
            <div style="font-family: var(--font-heading); font-size: 2rem; font-weight: 800; color: #ffffff;">$145,000</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary);">High growth sector</div>
          </div>
        </div>

        <div style="display: flex; justify-content: center; gap: 1rem;">
          <button class="btn btn-primary btn-lg" id="apply-profile-btn">🚀 Open My Career Command Center</button>
        </div>
      </div>
    `;

    const applyBtn = document.getElementById('apply-profile-btn');
    if (applyBtn) {
      applyBtn.onclick = () => {
        studentStore.setTargetCareer('ml-engineer');
        router.navigate('dashboard');
      };
    }
  }
}
