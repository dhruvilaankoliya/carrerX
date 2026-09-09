/* ==========================================================================
   CareerX - Structured Career Roadmap View (Clean & Minimal)
   ========================================================================== */

import { studentStore } from '../data/studentProfile.js';
import { aiMentor } from '../components/aiMentor.js';

const STATUS_CONFIG = {
  completed: { icon: '✓', label: 'Completed' },
  active:    { icon: '•', label: 'In Progress' },
  locked:    { icon: '—', label: 'Locked' },
};

const DELIVERABLE_STATUS = {
  done:        { icon: '✓' },
  'in-progress': { icon: '•' },
  pending:     { icon: '○' },
  locked:      { icon: '—' },
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
      <div class="container" style="padding-top:1.5rem;padding-bottom:3rem;">
        <!-- Header Card -->
        <div class="roadmap-header-card glass-panel">
          <div>
            <div class="section-tag" style="margin-bottom:0.35rem;">🗺️ Milestone Timeline</div>
            <h2 style="margin-bottom:0.2rem;font-size:1.35rem;">Career Roadmap — <span class="text-gradient">${career.title}</span></h2>
            <p style="font-size:0.85rem;color:var(--text-secondary);">Target: <strong style="color: #38bdf8;">${career.title}</strong> · ${completedStages}/${totalStages} stages completed</p>
          </div>
          <div style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap;">
            <div style="text-align:center;">
              <div style="font-family:var(--font-heading);font-size:1.8rem;font-weight:700;color:#ffffff;text-shadow:0 0 15px rgba(6, 182, 212, 0.4);">${Math.round((completedStages / totalStages) * 100)}%</div>
              <div style="font-size:0.72rem;color:var(--text-secondary);">Progress</div>
            </div>
            <button class="btn btn-primary" id="rm-mentor-btn">🤖 Ask AI Advisor</button>
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
      <div class="roadmap-stage-card ${stage.status === 'active' ? 'active-stage' : ''} ${stage.status === 'completed' ? 'completed-stage' : ''}">
        <div class="stage-marker-node">${cfg.icon}</div>

        <div class="stage-top-meta">
          <div class="stage-title-wrap">
            <div style="font-family:var(--font-mono);font-size:0.72rem;font-weight:600;color:var(--text-secondary);margin-bottom:0.15rem;">
              STAGE ${stage.number} · ${cfg.label.toUpperCase()}
            </div>
            <h3 style="font-size:1.05rem;color:var(--text-primary);">${stage.title}</h3>
          </div>
          <div style="text-align:right;flex-shrink:0;">
            ${stage.status !== 'locked' ? `<div style="font-family:var(--font-mono);font-size:1.1rem;font-weight:600;color:var(--text-primary);">${stage.progress}%</div>` : ''}
            <div style="font-size:0.72rem;color:var(--text-tertiary);">${stage.timeEst}</div>
          </div>
        </div>

        <p style="font-size:0.82rem;color:var(--text-secondary);margin-bottom:0.75rem;">${stage.summary}</p>

        ${stage.status !== 'locked' ? `
          <div class="stage-deliverables-grid">
            ${stage.deliverables.map(d => {
              const ds = DELIVERABLE_STATUS[d.status] || DELIVERABLE_STATUS.locked;
              return `
                <div class="deliverable-box">
                  <div class="deliverable-type">${d.type}</div>
                  <div class="deliverable-name">
                    <span style="margin-right:0.3rem;color:var(--text-secondary);">${ds.icon}</span>${d.name}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        ` : `
          <div style="text-align:center;padding:0.75rem;color:var(--text-tertiary);font-size:0.8rem;">
            Complete previous stages to unlock this milestone
          </div>
        `}

        ${stage.status === 'active' ? `
          <div class="stage-footer-actions">
            <div style="display:flex;align-items:center;gap:0.5rem;">
              <div style="height:4px;width:120px;background:var(--border-color);border-radius:2px;overflow:hidden;">
                <div style="width:${stage.progress}%;height:100%;background:var(--accent);border-radius:2px;"></div>
              </div>
              <span style="font-size:0.75rem;color:var(--text-secondary);">${stage.progress}% complete</span>
            </div>
            <button class="btn btn-sm btn-primary">Continue Stage →</button>
          </div>
        ` : ''}
      </div>
    `;
  }
}
