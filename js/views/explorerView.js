/* ==========================================================================
   CareerX - Career Explorer Directory View
   ========================================================================== */

import { CAREERS_DATA } from '../data/careers.js';
import { studentStore } from '../data/studentProfile.js';
import { router } from '../router.js';

export class ExplorerView {
  constructor(container) {
    this.container = container;
    this.filterText = '';
  }

  render() {
    this.container.innerHTML = `
      <div class="container" style="padding-top:2rem;padding-bottom:4rem;">
        <div style="margin-bottom:2rem;">
          <div class="section-tag"><span class="dot"></span> Career Intelligence Database</div>
          <h2>Explore <span class="text-gradient">High-Growth Engineering Careers</span></h2>
          <p>Compare salary ranges, skill requirements, and growth trajectories. Click "Set as Target" to instantly recalibrate your roadmap and gap analysis.</p>
        </div>

        <!-- Toolbar -->
        <div class="explorer-toolbar">
          <div class="search-input-wrap">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input type="text" class="search-input" id="career-search" placeholder="Search careers, skills, or tools..." />
          </div>
          <div class="tab-group">
            <button class="tab-btn active" data-filter="all">All Paths</button>
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
      <div class="career-card ${c.id === currentTarget ? 'target-active' : ''}" data-career-id="${c.id}" style="cursor:pointer;">
        <div>
          <div class="career-card-top">
            <div class="career-icon-box">${c.icon}</div>
            <span class="career-match-pill">${c.matchScore}% Fit</span>
          </div>
          <h3 class="career-title">${c.title}</h3>
          <p class="career-desc">${c.description}</p>
          <div class="career-tags-cloud">
            ${c.requiredSkills.slice(0, 5).map(s => `<span class="tech-tag">${s}</span>`).join('')}
          </div>
        </div>
        <div>
          <div class="career-stats-row">
            <div class="career-stat-item">
              <span class="stat-label">Avg. Salary</span>
              <span class="stat-val" style="color:#38bdf8;font-size:0.82rem;">${c.salaryRange}</span>
            </div>
            <div class="career-stat-item" style="text-align:right;">
              <span class="stat-label">Growth</span>
              <span class="stat-val" style="color:#34d399;font-size:0.82rem;">${c.growthRate}</span>
            </div>
          </div>
          <div style="display:flex;gap:0.5rem;">
            <button class="btn btn-sm btn-glass open-career-modal" data-career-id="${c.id}" style="flex:1;">View Details</button>
            ${c.id === currentTarget
              ? `<button class="btn btn-sm btn-ai" disabled style="flex:1;">✓ Current Target</button>`
              : `<button class="btn btn-sm btn-primary set-target-btn" data-career-id="${c.id}" style="flex:1;">Set as Target</button>`
            }
          </div>
        </div>
      </div>
    `).join('');
  }

  bindEvents() {
    // Search
    document.getElementById('career-search')?.addEventListener('input', (e) => {
      this.filterText = e.target.value.toLowerCase();
      this.filterCards();
    });

    // Filter tabs
    document.querySelectorAll('.tab-btn[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn[data-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.filterCards(btn.dataset.filter);
      });
    });

    // Set target
    document.addEventListener('click', (e) => {
      const setBtn = e.target.closest('.set-target-btn');
      if (setBtn) {
        studentStore.setTargetCareer(setBtn.dataset.careerId);
        this.render(); // Re-render with updated target
        return;
      }

      const modalBtn = e.target.closest('.open-career-modal');
      if (modalBtn) {
        this.openCareerModal(modalBtn.dataset.careerId);
        return;
      }

      // Close modal on overlay click
      if (e.target.id === 'career-modal') {
        this.closeModal();
      }
    });

    // Close button
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
      <div style="display:flex;align-items:center;gap:1rem;">
        <span style="font-size:2rem;">${c.icon}</span>
        <div>
          <h3>${c.title}</h3>
          <div style="display:flex;gap:0.5rem;margin-top:0.3rem;">
            <span class="badge badge-ai">${c.matchScore}% Fit</span>
            <span class="badge badge-success">${c.demandLevel} Demand</span>
          </div>
        </div>
      </div>
      <button class="modal-close-btn" id="modal-close-x">✕</button>
    `;

    body.innerHTML = `
      <p style="margin-bottom:1.5rem;">${c.description}</p>

      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem;margin-bottom:1.5rem;">
        <div class="glass-card" style="padding:1rem;">
          <div style="font-size:0.72rem;color:var(--text-tertiary);text-transform:uppercase;">Salary Range</div>
          <div style="font-weight:800;color:#38bdf8;">${c.salaryRange}</div>
        </div>
        <div class="glass-card" style="padding:1rem;">
          <div style="font-size:0.72rem;color:var(--text-tertiary);text-transform:uppercase;">Growth</div>
          <div style="font-weight:800;color:#34d399;">${c.growthRate}</div>
        </div>
        <div class="glass-card" style="padding:1rem;">
          <div style="font-size:0.72rem;color:var(--text-tertiary);text-transform:uppercase;">Demand</div>
          <div style="font-weight:800;color:#c084fc;">${c.demandLevel}</div>
        </div>
      </div>

      <h4 style="margin-bottom:0.75rem;">Required Skills</h4>
      <div class="career-tags-cloud" style="margin-bottom:1.5rem;">
        ${c.requiredSkills.map(s => `<span class="tech-tag" style="font-size:0.82rem;padding:0.3rem 0.7rem;">${s}</span>`).join('')}
      </div>

      <h4 style="margin-bottom:0.75rem;">Top Tools & Ecosystem</h4>
      <div class="career-tags-cloud" style="margin-bottom:1.5rem;">
        ${c.topTools.map(t => `<span class="tech-tag" style="background:rgba(6,182,212,0.1);border-color:rgba(6,182,212,0.25);color:#38bdf8;">${t}</span>`).join('')}
      </div>

      <h4 style="margin-bottom:0.75rem;">Career Progression Path</h4>
      <div style="display:flex;flex-direction:column;gap:0.5rem;margin-bottom:2rem;">
        ${c.growthPath.map((p, i) => `
          <div style="display:flex;align-items:center;gap:1rem;padding:0.75rem;background:rgba(255,255,255,0.03);border-radius:var(--radius-md);">
            <span style="font-family:var(--font-mono);font-size:0.75rem;color:var(--cyan-ai);min-width:40px;">${(i+1).toString().padStart(2,'0')}</span>
            <div style="flex:1;font-weight:600;color:#fff;">${p.role}</div>
            <div style="text-align:right;">
              <div style="font-weight:700;color:#34d399;font-size:0.85rem;">${p.salary}</div>
              <div style="font-size:0.72rem;color:var(--text-tertiary);">${p.timeline}</div>
            </div>
          </div>
        `).join('')}
      </div>

      <button class="btn btn-primary" style="width:100%;" id="modal-set-target-btn" data-career-id="${c.id}">
        🎯 Set as My Target Career
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
