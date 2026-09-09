/* ==========================================================================
   CareerX - Student Dashboard / Career Command Center (Clean & Minimal)
   ========================================================================== */

import { studentStore } from '../data/studentProfile.js';
import { CAREERS_DATA } from '../data/careers.js';
import { ReadinessDial } from '../components/readinessDial.js';
import { router } from '../router.js';
import { aiMentor } from '../components/aiMentor.js';

export class DashboardView {
  constructor(container) {
    this.container = container;
    this.unsubscribe = null;
  }

  render() {
    const profile = studentStore.profile;
    const career = studentStore.getCurrentCareer();
    this.container.innerHTML = this.buildHTML(profile, career);
    this.bindEvents(profile);

    this.unsubscribe = studentStore.subscribe((updated) => {
      const updatedCareer = studentStore.getCurrentCareer();
      this.container.innerHTML = this.buildHTML(updated, updatedCareer);
      this.bindEvents(updated);
    });
  }

  destroy() {
    if (this.unsubscribe) this.unsubscribe();
  }

  buildHTML(profile, career) {
    const dialSVG = ReadinessDial.createRingSVG(profile.overallScore, 100, 7);
    const completedQuests = profile.quests.filter(q => q.completed).length;

    return `
      <div class="container" style="padding-top: 1.5rem; padding-bottom: 3rem;">
        <!-- ─── Welcome Banner ─── -->
        <div class="dashboard-banner">
          <div class="banner-user-info">
            <div style="display:flex;align-items:center;gap:0.85rem;margin-bottom:0.5rem;">
              <div style="width:44px;height:44px;border-radius:var(--radius-md);background:linear-gradient(135deg, #06b6d4, #6366f1);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1rem;color:#fff;flex-shrink:0;box-shadow:0 0 15px rgba(6, 182, 212, 0.4);">AR</div>
              <div>
                <h1 style="font-size:1.45rem;margin:0;font-weight:800;">Good morning, <span class="text-gradient">${profile.name}</span></h1>
                <p style="margin:0;font-size:0.85rem;color:var(--text-secondary);">${profile.education}</p>
              </div>
            </div>
            <div class="banner-meta">
              <span class="badge badge-purple">🎯 Target: ${career.title}</span>
              <span class="badge badge-success">⚡ ${profile.scoreDelta}</span>
              <span class="badge badge-ai">🏆 ${profile.readinessTier}</span>
              <span style="font-size:0.82rem;color:var(--text-tertiary);font-weight:600;">Level ${profile.level} • ${profile.xp.toLocaleString()} XP</span>
            </div>
          </div>
          <div class="banner-actions">
            <button class="btn btn-primary" id="db-open-mentor">🤖 Ask AI Advisor</button>
            <button class="btn btn-glass" id="db-view-roadmap">View Roadmap →</button>
          </div>
        </div>

        <!-- ─── Readiness Widget ─── -->
        <div class="readiness-score-widget" style="margin-bottom:1.5rem;">
          <div class="readiness-dial-container">
            ${dialSVG}
            <div class="readiness-dial-text">
              <div class="readiness-score-val">${profile.overallScore}</div>
              <div class="readiness-score-denom">/100</div>
            </div>
          </div>
          <div style="flex:1;">
            <h3 style="margin-bottom:0.25rem;font-size:1.05rem;">Career Readiness Index</h3>
            <p style="font-size:0.82rem;margin-bottom:0.85rem;color:var(--text-secondary);">Target: <strong>${career.title}</strong> · ${career.matchScore}% Alignment</p>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:0.65rem;">
              ${ReadinessDial.renderBreakdownBar('Technical Skills', profile.scores.skills, 35)}
              ${ReadinessDial.renderBreakdownBar('Projects Portfolio', profile.scores.projects, 25)}
              ${ReadinessDial.renderBreakdownBar('Resume ATS Match', profile.scores.resume, 15)}
              ${ReadinessDial.renderBreakdownBar('Interview Prep', profile.scores.interview, 15)}
              ${ReadinessDial.renderBreakdownBar('Certifications', profile.scores.certifications, 10)}
            </div>
          </div>
        </div>

        <!-- ─── Main 2-col Grid ─── -->
        <div class="dashboard-grid">
          <!-- Left column -->
          <div style="display:flex;flex-direction:column;gap:1.25rem;">

            <!-- AI Briefing -->
            <div class="ai-briefing-card">
              <div class="ai-briefing-header">
                <div style="display:flex;align-items:center;gap:0.5rem;">
                  <span style="font-weight:600;font-size:0.9rem;">Daily Briefing</span>
                </div>
                <span class="ai-badge-live">Live</span>
              </div>
              <p class="ai-briefing-text">
                Your highest priority gap is <strong>Docker & MLOps proficiency (48%)</strong> against the 85% benchmark.
                Completing the <strong>Multimodal RAG Docker project</strong> will boost your readiness score.
              </p>
              <button class="btn btn-ai btn-sm" id="db-mentor-fix">View Recommended Plan →</button>
            </div>

            <!-- Today's Action Quests -->
            <div class="glass-card">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.75rem;">
                <h3 style="font-size:0.95rem;">Action Checklist</h3>
                <span class="badge">${completedQuests}/${profile.quests.length} Completed</span>
              </div>
              <div class="quest-list">
                ${profile.quests.map(q => `
                  <div class="quest-item ${q.completed ? 'completed' : ''}" data-quest-id="${q.id}">
                    <div class="quest-left">
                      <div class="quest-checkbox">${q.completed ? '✓' : ''}</div>
                      <div>
                        <div style="font-weight:500;font-size:0.85rem;color:${q.completed ? 'var(--text-tertiary)' : 'var(--text-primary)'};">${q.title}</div>
                        <div style="font-size:0.72rem;color:var(--text-tertiary);">${q.category} • ${q.boost}</div>
                      </div>
                    </div>
                    <span class="quest-xp">+${q.xp} XP</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Right column -->
          <div style="display:flex;flex-direction:column;gap:1.25rem;">

            <!-- Top Career Matches -->
            <div class="glass-card">
              <h3 style="margin-bottom:0.75rem;font-size:0.95rem;">Career Match Rankings</h3>
              ${Object.values(CAREERS_DATA).map((c) => `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:0.5rem 0;border-bottom:1px solid var(--border-color);">
                  <div style="display:flex;align-items:center;gap:0.5rem;">
                    <span>${c.icon}</span>
                    <div>
                      <div style="font-weight:500;font-size:0.85rem;color:var(--text-primary);">${c.title}</div>
                      <div style="font-size:0.7rem;color:var(--text-tertiary);">${c.salaryRange}</div>
                    </div>
                  </div>
                  <div style="text-align:right;">
                    <div style="font-weight:600;font-size:0.9rem;color:var(--text-primary);">${c.matchScore}%</div>
                    <div style="font-size:0.68rem;color:var(--text-tertiary);">match</div>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Recommended Next Action -->
            <div class="glass-card">
              <div class="badge badge-active" style="margin-bottom:0.5rem;">Recommended Project</div>
              <h3 style="margin-bottom:0.25rem;font-size:0.95rem;">${career.recommendedProject.title}</h3>
              <p style="font-size:0.82rem;margin-bottom:0.75rem;color:var(--text-secondary);">${career.recommendedProject.desc}</p>
              <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.5rem;">
                <div style="display:flex;gap:0.4rem;">
                  <span class="badge">${career.recommendedProject.xp}</span>
                  <span class="badge badge-active">${career.recommendedProject.readinessBoost}</span>
                </div>
                <button class="btn btn-sm btn-primary" id="db-start-project">Start Project →</button>
              </div>
            </div>

          </div>
        </div>

        <!-- ─── Quick Navigation Dock ─── -->
        <div class="quick-dock" style="margin-top:1.5rem;">
          <div class="dock-card" id="dock-skill-gap">
            <div class="dock-icon">⚡</div>
            <div class="dock-title">Skill Gap</div>
            <div class="dock-desc">Radar Analysis</div>
          </div>
          <div class="dock-card" id="dock-roadmap">
            <div class="dock-icon">🗺️</div>
            <div class="dock-title">Roadmap</div>
            <div class="dock-desc">Milestone Progress</div>
          </div>
          <div class="dock-card" id="dock-resume">
            <div class="dock-icon">📄</div>
            <div class="dock-title">Resume AI</div>
            <div class="dock-desc">ATS Optimizer</div>
          </div>
          <div class="dock-card" id="dock-score">
            <div class="dock-icon">🏆</div>
            <div class="dock-title">Readiness</div>
            <div class="dock-desc">Score Breakdown</div>
          </div>
          <div class="dock-card" id="dock-explorer">
            <div class="dock-icon">🔭</div>
            <div class="dock-title">Explorer</div>
            <div class="dock-desc">Browse Careers</div>
          </div>
          <div class="dock-card" id="dock-mentor">
            <div class="dock-icon">🤖</div>
            <div class="dock-title">AI Advisor</div>
            <div class="dock-desc">Chat Workspace</div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const $ = (id) => document.getElementById(id);
    const nav = (view) => router.navigate(view);

    $('db-open-mentor')?.addEventListener('click', () => aiMentor.toggle(true));
    $('db-view-roadmap')?.addEventListener('click', () => nav('roadmap'));
    $('db-mentor-fix')?.addEventListener('click', () => aiMentor.toggle(true));
    $('db-start-project')?.addEventListener('click', () => nav('roadmap'));
    $('dock-skill-gap')?.addEventListener('click', () => nav('skill-gap'));
    $('dock-roadmap')?.addEventListener('click', () => nav('roadmap'));
    $('dock-resume')?.addEventListener('click', () => nav('resume'));
    $('dock-score')?.addEventListener('click', () => nav('score'));
    $('dock-explorer')?.addEventListener('click', () => nav('explorer'));
    $('dock-mentor')?.addEventListener('click', () => aiMentor.toggle(true));

    document.querySelectorAll('.quest-item').forEach(el => {
      el.addEventListener('click', () => {
        studentStore.toggleQuest(el.dataset.questId);
      });
    });
  }
}
