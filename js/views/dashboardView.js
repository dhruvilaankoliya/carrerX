/* ==========================================================================
   CareerX - Student Dashboard / Career Command Center View
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

    // Subscribe to state changes so readiness score updates live
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
    const dialSVG = ReadinessDial.createRingSVG(profile.overallScore, 130, 9);
    const completedQuests = profile.quests.filter(q => q.completed).length;

    return `
      <div class="container" style="padding-top: 2rem; padding-bottom: 4rem;">
        <!-- ─── Welcome Banner ─── -->
        <div class="dashboard-banner">
          <div class="banner-user-info">
            <div style="display:flex;align-items:center;gap:1rem;margin-bottom:0.5rem;">
              <div style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#3b82f6,#8b5cf6);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.1rem;color:#fff;flex-shrink:0;">AR</div>
              <div>
                <h1 style="font-size:1.7rem;margin:0;">Good morning, <span class="text-gradient">${profile.name}</span> 👋</h1>
                <p style="margin:0;font-size:0.85rem;">${profile.education}</p>
              </div>
            </div>
            <div class="banner-meta">
              <span class="badge badge-ai">🎯 Target: ${career.title}</span>
              <span class="badge badge-success">⬆ ${profile.scoreDelta}</span>
              <span class="badge badge-purple">⚡ ${profile.readinessTier}</span>
              <span style="font-size:0.82rem;color:var(--text-tertiary);">Level ${profile.level} • ${profile.xp.toLocaleString()} XP</span>
            </div>
          </div>
          <div class="banner-actions">
            <button class="btn btn-primary" id="db-open-mentor">✨ Ask AI Mentor</button>
            <button class="btn btn-glass" id="db-view-roadmap">View Roadmap →</button>
          </div>
        </div>

        <!-- ─── Readiness + Quick Dock ─── -->
        <div class="readiness-score-widget" style="margin-bottom:2rem;">
          <div class="readiness-dial-container">
            ${dialSVG}
            <div class="readiness-dial-text">
              <div class="readiness-score-val">${profile.overallScore}</div>
              <div class="readiness-score-denom">/100</div>
            </div>
          </div>
          <div style="flex:1;">
            <h3 style="margin-bottom:0.35rem;">Career Readiness Index</h3>
            <p style="font-size:0.85rem;margin-bottom:1rem;">Target: <strong style="color:#38bdf8;">${career.title}</strong> · ${career.matchScore}% Alignment</p>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:0.75rem;">
              ${ReadinessDial.renderBreakdownBar('Technical Skills', profile.scores.skills, 35, '💡')}
              ${ReadinessDial.renderBreakdownBar('Projects Portfolio', profile.scores.projects, 25, '🛠️')}
              ${ReadinessDial.renderBreakdownBar('Resume ATS Match', profile.scores.resume, 15, '📄')}
              ${ReadinessDial.renderBreakdownBar('Interview Prep', profile.scores.interview, 15, '🎙️')}
              ${ReadinessDial.renderBreakdownBar('Certifications', profile.scores.certifications, 10, '🏆')}
            </div>
          </div>
        </div>

        <!-- ─── Main 2-col Grid ─── -->
        <div class="dashboard-grid">
          <!-- Left column -->
          <div style="display:flex;flex-direction:column;gap:1.5rem;">

            <!-- AI Briefing -->
            <div class="ai-briefing-card">
              <div class="ai-briefing-header">
                <div style="display:flex;align-items:center;gap:0.65rem;">
                  <div style="width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,#06b6d4,#8b5cf6);display:flex;align-items:center;justify-content:center;">🧠</div>
                  <span style="font-weight:700;font-size:0.95rem;">AI Daily Briefing</span>
                </div>
                <span class="ai-badge-live"><span style="width:6px;height:6px;border-radius:50%;background:#10b981;"></span> Live Context</span>
              </div>
              <p class="ai-briefing-text">
                Your biggest blocker to Tier-1 job offers is <strong style="color:#fb7185;">Docker & MLOps proficiency (48%)</strong> vs. the required 85% benchmark.
                Completing the <strong style="color:#38bdf8;">Multimodal RAG Docker project</strong> this week will close this gap and boost your readiness by +4.5 points.
              </p>
              <button class="btn btn-ai btn-sm" id="db-mentor-fix">Get Fix Plan from AI Mentor →</button>
            </div>

            <!-- Today's Action Quests -->
            <div class="glass-card">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
                <h3>⚡ Today's Action Quests</h3>
                <span class="badge badge-warning">${completedQuests}/${profile.quests.length} Done</span>
              </div>
              <div class="quest-list">
                ${profile.quests.map(q => `
                  <div class="quest-item ${q.completed ? 'completed' : ''}" data-quest-id="${q.id}">
                    <div class="quest-left">
                      <div class="quest-checkbox">${q.completed ? '✓' : ''}</div>
                      <div>
                        <div style="font-weight:600;font-size:0.9rem;color:${q.completed ? 'var(--text-tertiary)' : '#ffffff'};">${q.title}</div>
                        <div style="font-size:0.75rem;color:var(--text-tertiary);">${q.category} • ${q.boost}</div>
                      </div>
                    </div>
                    <span class="quest-xp">+${q.xp} XP</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Right column -->
          <div style="display:flex;flex-direction:column;gap:1.5rem;">

            <!-- Top Career Matches -->
            <div class="glass-card">
              <h3 style="margin-bottom:1rem;">🎯 Your Career Match Rankings</h3>
              ${Object.values(CAREERS_DATA).map((c, i) => `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:0.65rem 0;border-bottom:1px solid rgba(255,255,255,0.05);">
                  <div style="display:flex;align-items:center;gap:0.65rem;">
                    <span style="font-size:1.2rem;">${c.icon}</span>
                    <div>
                      <div style="font-weight:600;font-size:0.88rem;color:#ffffff;">${c.title}</div>
                      <div style="font-size:0.72rem;color:var(--text-tertiary);">${c.salaryRange}</div>
                    </div>
                  </div>
                  <div style="text-align:right;">
                    <div style="font-weight:800;font-size:1rem;color:${c.matchScore >= 88 ? '#34d399' : c.matchScore >= 80 ? '#38bdf8' : '#fbbf24'};">${c.matchScore}%</div>
                    <div style="font-size:0.72rem;color:var(--text-tertiary);">match</div>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Recommended Next Action -->
            <div class="glass-card" style="background:linear-gradient(135deg,rgba(6,182,212,0.08),rgba(17,26,48,0.9));border-color:rgba(6,182,212,0.3);">
              <div class="badge badge-ai" style="margin-bottom:0.75rem;">🚀 High-Yield Next Step</div>
              <h3 style="margin-bottom:0.25rem;">${career.recommendedProject.title}</h3>
              <p style="font-size:0.85rem;margin-bottom:1rem;">${career.recommendedProject.desc}</p>
              <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:0.5rem;">
                <div style="display:flex;gap:0.5rem;">
                  <span class="badge badge-warning">${career.recommendedProject.xp}</span>
                  <span class="badge badge-success">${career.recommendedProject.readinessBoost}</span>
                </div>
                <button class="btn btn-sm btn-primary" id="db-start-project">Start Project →</button>
              </div>
            </div>

          </div>
        </div>

        <!-- ─── Quick Navigation Dock ─── -->
        <div class="quick-dock" style="margin-top:2rem;">
          <div class="dock-card" id="dock-skill-gap">
            <div class="dock-icon" style="background:rgba(6,182,212,0.15);">⚡</div>
            <div class="dock-title">Skill Gap</div>
            <div class="dock-desc">Radar Analysis</div>
          </div>
          <div class="dock-card" id="dock-roadmap">
            <div class="dock-icon" style="background:rgba(16,185,129,0.15);">🗺️</div>
            <div class="dock-title">Roadmap</div>
            <div class="dock-desc">Stage Progress</div>
          </div>
          <div class="dock-card" id="dock-resume">
            <div class="dock-icon" style="background:rgba(245,158,11,0.15);">📄</div>
            <div class="dock-title">Resume AI</div>
            <div class="dock-desc">ATS Optimizer</div>
          </div>
          <div class="dock-card" id="dock-score">
            <div class="dock-icon" style="background:rgba(139,92,246,0.15);">🏆</div>
            <div class="dock-title">Readiness</div>
            <div class="dock-desc">Score Breakdown</div>
          </div>
          <div class="dock-card" id="dock-explorer">
            <div class="dock-icon" style="background:rgba(99,102,241,0.15);">🔭</div>
            <div class="dock-title">Explorer</div>
            <div class="dock-desc">Browse Careers</div>
          </div>
          <div class="dock-card" id="dock-mentor">
            <div class="dock-icon" style="background:rgba(236,72,153,0.15);">🤖</div>
            <div class="dock-title">AI Mentor</div>
            <div class="dock-desc">Ask Anything</div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents(profile) {
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
