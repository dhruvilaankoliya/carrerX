/* ==========================================================================
   CareerX - Gamified Career Roadmap View
   ========================================================================== */

import { studentStore } from '../data/studentProfile.js';
import { router } from '../router.js';
import { aiMentor } from '../components/aiMentor.js';

const STATUS_CONFIG = {
  completed: { icon: '✓', label: 'Completed', color: 'var(--emerald-growth)', border: 'rgba(16,185,129,0.35)' },
  active:    { icon: '⚡', label: 'In Progress', color: 'var(--cyan-ai)', border: 'rgba(6,182,212,0.5)' },
  locked:    { icon: '🔒', label: 'Locked', color: 'var(--text-tertiary)', border: 'rgba(255,255,255,0.08)' },
};

const DELIVERABLE_STATUS = {
  done:        { icon: '✓', color: 'var(--emerald-growth)' },
  'in-progress': { icon: '⟳', color: 'var(--cyan-ai)' },
  pending:     { icon: '○', color: 'var(--amber-reward)' },
  locked:      { icon: '🔒', color: 'var(--text-tertiary)' },
};

export class RoadmapView {
  constructor(container) {
    this.container = container;
  }

  render() {
    const profile = studentStore.profile;
    const career  = studentStore.getCurrentCareer();
    const totalStages = profile.roadmapStages.length;
    const completedStages = profile.roadmapStages.filter(s => s.status === 'completed').length;

    this.container.innerHTML = `
      <div class="container" style="padding-top:2rem;padding-bottom:5rem;">
        <!-- Header Card -->
        <div class="roadmap-header-card">
          <div>
            <div class="section-tag" style="margin-bottom:0.5rem;"><span class="dot"></span> Personalized Journey</div>
            <h2 style="margin-bottom:0.25rem;">Your Career Roadmap</h2>
            <p style="font-size:0.9rem;">Target: <strong style="color:#38bdf8;">${career.title}</strong> · ${completedStages}/${totalStages} stages complete</p>
          </div>
          <div style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap;">
            <div style="text-align:center;">
              <div style="font-family:var(--font-heading);font-size:2rem;font-weight:800;color:#fff;">${Math.round((completedStages / totalStages) * 100)}%</div>
              <div style="font-size:0.75rem;color:var(--text-tertiary);">Overall Progress</div>
            </div>
            <button class="btn btn-primary" id="rm-mentor-btn">🤖 Ask AI Mentor</button>
          </div>
        </div>

        <!-- Timeline -->
        <div class="roadmap-timeline-container">
          ${profile.roadmapStages.map(stage => this.renderStage(stage)).join('')}
        </div>
      </div>
    `;

    document.getElementById('rm-mentor-btn')?.addEventListener('click', () => aiMentor.toggle(true));
  }

  renderStage(stage) {
    const cfg = STATUS_CONFIG[stage.status] || STATUS_CONFIG.locked;
    return `
      <div class="roadmap-stage-card ${stage.status === 'active' ? 'active-stage' : ''} ${stage.status === 'completed' ? 'completed-stage' : ''}"
           style="border-color:${cfg.border};">
        <div class="stage-marker-node">${cfg.icon}</div>

        <div class="stage-top-meta">
          <div class="stage-title-wrap">
            <div style="font-family:var(--font-mono);font-size:0.75rem;font-weight:700;color:${cfg.color};margin-bottom:0.2rem;">
              STAGE ${stage.number} · ${cfg.label.toUpperCase()}
            </div>
            <h3 style="color:${stage.status === 'locked' ? 'var(--text-secondary)' : '#ffffff'};">${stage.title}</h3>
          </div>
          <div style="text-align:right;flex-shrink:0;">
            ${stage.status !== 'locked' ? `<div style="font-family:var(--font-mono);font-size:1.4rem;font-weight:800;color:${cfg.color};">${stage.progress}%</div>` : ''}
            <div style="font-size:0.75rem;color:var(--text-tertiary);">${stage.timeEst}</div>
          </div>
        </div>

        <p style="font-size:0.88rem;color:${stage.status === 'locked' ? 'var(--text-tertiary)' : 'var(--text-secondary)'};margin-bottom:1rem;">${stage.summary}</p>

        ${stage.status !== 'locked' ? `
          <div class="stage-deliverables-grid">
            ${stage.deliverables.map(d => {
              const ds = DELIVERABLE_STATUS[d.status] || DELIVERABLE_STATUS.locked;
              return `
                <div class="deliverable-box">
                  <div class="deliverable-type">${d.type}</div>
                  <div class="deliverable-name" style="color:${d.status === 'done' ? '#ffffff' : 'var(--text-secondary)'};">
                    <span style="color:${ds.color};margin-right:0.35rem;">${ds.icon}</span>${d.name}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <div style="text-align:center;padding:1rem;color:var(--text-tertiary);font-size:0.85rem;">
            🔒 Complete previous stages to unlock this milestone
          </div>
        `}

        ${stage.status === 'active' ? `
          <div class="stage-footer-actions">
            <div style="display:flex;align-items:center;gap:0.75rem;">
              <div style="height:6px;width:160px;background:rgba(255,255,255,0.08);border-radius:99px;overflow:hidden;">
                <div style="width:${stage.progress}%;height:100%;background:linear-gradient(90deg,#06b6d4,#3b82f6);border-radius:99px;"></div>
              </div>
              <span style="font-size:0.78rem;color:var(--cyan-ai);">${stage.progress}% complete</span>
            </div>
            <button class="btn btn-sm btn-primary">Continue Stage →</button>
          </div>
        ` : ''}
      </div>
    `;
  }
}
