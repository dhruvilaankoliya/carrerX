/* ==========================================================================
   CareerX - Career Explorer Directory View (Clean & Minimal)
   ========================================================================== */

import { CAREERS_DATA } from '../data/careers.js';
import { studentStore } from '../data/studentProfile.js';

export class ExplorerView {
  constructor(container) {
    this.container = container;
    this.filterText = '';
  }

  render() {
    this.container.innerHTML = `
      <div class="container" style="padding-top:1.5rem;padding-bottom:3rem;">
        <div style="margin-bottom:1.5rem;">
          <div class="section-tag">Role Directory</div>
          <h2>Explore Engineering Careers</h2>
          <p>Compare compensation, skill requirements, and industry demand.</p>
        </div>

        <!-- Toolbar -->
        <div class="explorer-toolbar">
          <div class="search-input-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" class="search-input" id="career-search" placeholder="Search careers or skills..." />
          </div>
          <div class="tab-group">
            <button class="tab-btn active" data-filter="all">All</button>
            <button class="tab-btn" data-filter="AI & Data">AI & Data</button>
            <button class="tab-btn" data-filter="Software & Web">Software</button>
            <button class="tab-btn" data-filter="Cloud & DevOps">Cloud / DevOps</button>
            <button class="tab-btn" data-filter="Cyber & Security">Security</button>
          </div>
        </div>

        <!-- Career Grid -->
        <div class="careers-grid" id="careers-grid">
          ${this.renderCards(Object.values(CAREERS_DATA))}
        </div>

        <!-- Career Detail Modal -->
        <div class="modal-overlay" id="career-modal">
          <div class="modal-container" id="career-modal-container">
            <div class="modal-header" id="career-modal-header"></div>
            <div class="modal-body" id="career-modal-body"></div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  renderCards(careers) {
    const currentTarget = studentStore.profile.targetCareerId;
    return careers.map(c => `
      <div class="career-card ${c.id === currentTarget ? 'target-active' : ''}" data-career-id="${c.id}">
        <div>
          <div class="career-card-top">
            <div class="career-icon-box">${c.icon}</div>
            <span class="career-match-pill">${c.matchScore}% Match</span>
          </div>
          <h3 class="career-title">${c.title}</h3>
          <p class="career-desc">${c.description}</p>
          <div class="career-tags-cloud">
            ${c.requiredSkills.slice(0, 4).map(s => `<span class="tech-tag">${s}</span>`).join('')}
          </div>
        </div>
        <div>
          <div class="career-stats-row">
            <div class="career-stat-item">
              <span class="stat-label">Salary</span>
              <span class="stat-val">${c.salaryRange}</span>
            </div>
            <div class="career-stat-item" style="text-align:right;">
              <span class="stat-label">Demand</span>
              <span class="stat-val">${c.growthRate}</span>
            </div>
          </div>
          <div style="display:flex;gap:0.5rem;">
            <button class="btn btn-sm btn-glass open-career-modal" data-career-id="${c.id}" style="flex:1;">Details</button>
            ${c.id === currentTarget
              ? `<button class="btn btn-sm btn-glass" disabled style="flex:1;border-color:var(--accent);color:var(--accent);">Target Role</button>`
              : `<button class="btn btn-sm btn-primary set-target-btn" data-career-id="${c.id}" style="flex:1;">Set Target</button>`
            }
          </div>
        </div>
      </div>
    `).join('');
  }

  bindEvents() {
    document.getElementById('career-search')?.addEventListener('input', (e) => {
      this.filterText = e.target.value.toLowerCase();
      this.filterCards();
    });

    document.querySelectorAll('.tab-btn[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn[data-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.filterCards(btn.dataset.filter);
      });
    });

    document.addEventListener('click', (e) => {
      const setBtn = e.target.closest('.set-target-btn');
      if (setBtn) {
        studentStore.setTargetCareer(setBtn.dataset.careerId);
        this.render();
        return;
      }

      const modalBtn = e.target.closest('.open-career-modal');
      if (modalBtn) {
        this.openCareerModal(modalBtn.dataset.careerId);
        return;
      }

      if (e.target.id === 'career-modal') {
        this.closeModal();
      }
    });

    document.getElementById('career-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'career-modal') this.closeModal();
    });
  }

  filterCards(category = null) {
    const careers = Object.values(CAREERS_DATA).filter(c => {
      const textMatch = !this.filterText || 
        c.title.toLowerCase().includes(this.filterText) ||
        c.requiredSkills.some(s => s.toLowerCase().includes(this.filterText)) ||
        c.topTools.some(t => t.toLowerCase().includes(this.filterText));
      const catMatch = !category || category === 'all' || c.category === category;
      return textMatch && catMatch;
    });
    const grid = document.getElementById('careers-grid');
    if (grid) grid.innerHTML = this.renderCards(careers);
  }

  openCareerModal(careerId) {
    const c = CAREERS_DATA[careerId];
    if (!c) return;

    const header = document.getElementById('career-modal-header');
    const body = document.getElementById('career-modal-body');
    if (!header || !body) return;

    header.innerHTML = `
      <div style="display:flex;align-items:center;gap:0.75rem;">
        <span style="font-size:1.5rem;">${c.icon}</span>
        <div>
          <h3 style="font-size:1.1rem;margin:0;">${c.title}</h3>
          <div style="display:flex;gap:0.35rem;margin-top:0.25rem;">
            <span class="badge badge-active">${c.matchScore}% Match</span>
            <span class="badge">${c.demandLevel} Demand</span>
          </div>
        </div>
      </div>
      <button class="modal-close-btn" id="modal-close-x">✕</button>
    `;

    body.innerHTML = `
      <p style="margin-bottom:1.25rem;font-size:0.9rem;color:var(--text-secondary);">${c.description}</p>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:0.75rem;margin-bottom:1.25rem;">
        <div class="glass-card" style="padding:0.75rem;">
          <div style="font-size:0.7rem;color:var(--text-tertiary);text-transform:uppercase;">Salary Range</div>
          <div style="font-weight:600;font-size:0.95rem;color:var(--text-primary);">${c.salaryRange}</div>
        </div>
        <div class="glass-card" style="padding:0.75rem;">
          <div style="font-size:0.7rem;color:var(--text-tertiary);text-transform:uppercase;">Growth</div>
          <div style="font-weight:600;font-size:0.95rem;color:var(--text-primary);">${c.growthRate}</div>
        </div>
        <div class="glass-card" style="padding:0.75rem;">
          <div style="font-size:0.7rem;color:var(--text-tertiary);text-transform:uppercase;">Demand Level</div>
          <div style="font-weight:600;font-size:0.95rem;color:var(--text-primary);">${c.demandLevel}</div>
        </div>
      </div>

      <h4 style="margin-bottom:0.5rem;font-size:0.9rem;">Required Skills</h4>
      <div class="career-tags-cloud" style="margin-bottom:1.25rem;">
        ${c.requiredSkills.map(s => `<span class="tech-tag">${s}</span>`).join('')}
      </div>

      <h4 style="margin-bottom:0.5rem;font-size:0.9rem;">Ecosystem Tools</h4>
      <div class="career-tags-cloud" style="margin-bottom:1.25rem;">
        ${c.topTools.map(t => `<span class="tech-tag">${t}</span>`).join('')}
      </div>

      <h4 style="margin-bottom:0.5rem;font-size:0.9rem;">Progression Path</h4>
      <div style="display:flex;flex-direction:column;gap:0.4rem;margin-bottom:1.5rem;">
        ${c.growthPath.map((p, i) => `
          <div style="display:flex;align-items:center;gap:0.75rem;padding:0.6rem;background:var(--bg-primary);border:1px solid var(--border-color);border-radius:var(--radius-sm);">
            <span style="font-family:var(--font-mono);font-size:0.72rem;color:var(--text-tertiary);min-width:24px;">${(i+1).toString().padStart(2,'0')}</span>
            <div style="flex:1;font-weight:500;font-size:0.85rem;color:var(--text-primary);">${p.role}</div>
            <div style="text-align:right;">
              <div style="font-weight:600;color:var(--text-primary);font-size:0.82rem;">${p.salary}</div>
              <div style="font-size:0.68rem;color:var(--text-tertiary);">${p.timeline}</div>
            </div>
          </div>
        `).join('')}
      </div>

      <button class="btn btn-primary" style="width:100%;" id="modal-set-target-btn" data-career-id="${c.id}">
        Set as Target Career
      </button>
    `;

    document.getElementById('career-modal').classList.add('active');

    document.getElementById('modal-close-x')?.addEventListener('click', () => this.closeModal());
    document.getElementById('modal-set-target-btn')?.addEventListener('click', () => {
      studentStore.setTargetCareer(c.id);
      this.closeModal();
      this.render();
    });
  }

  closeModal() {
    document.getElementById('career-modal')?.classList.remove('active');
  }
}
