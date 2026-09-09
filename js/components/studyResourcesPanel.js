/* ==========================================================================
   CareerX - StudyResourcesPanel Component (Rich & Vibrant)
   Renders curated references with social proof for ATS missing keywords
   ========================================================================== */

import { studyResourcesStore } from '../data/studyResourcesData.js';

export class StudyResourcesPanel {
  constructor(containerElement, options = {}) {
    this.container = containerElement;
    this.missingKeywords = options.missingKeywords || [];
    this.targetRole = options.targetRole || 'Machine Learning Engineer';
    this.isUploaded = options.isUploaded || false;
    this.isCollapsed = false;
    this.unsubscribe = null;
  }

  setKeywords(keywords, targetRole, isUploaded = true) {
    this.missingKeywords = keywords || [];
    if (targetRole) this.targetRole = targetRole;
    this.isUploaded = isUploaded;
    this.render();
  }

  render() {
    if (!this.container) return;

    if (!this.unsubscribe) {
      this.unsubscribe = studyResourcesStore.subscribe(() => {
        this.renderContent();
      });
    }

    this.renderContent();
  }

  destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }

  renderContent() {
    if (!this.isUploaded) {
      this.container.innerHTML = `
        <div class="study-resources-panel glass-card" style="margin-top: 2rem;">
          <div class="panel-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 1rem; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.75rem;">
            <div style="display: flex; align-items: center; gap: 0.65rem;">
              <span style="font-size: 1.4rem;">📚</span>
              <div>
                <h3 style="font-size: 1.2rem; margin: 0; font-weight: 700;">
                  Recommended Study Resources <span class="text-gradient-cyan">for Skill Gaps</span>
                </h3>
                <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 0.2rem;">
                  Curated references, official docs & courses tailored to your missing ATS keywords
                </div>
              </div>
            </div>
            <span class="badge badge-warning">Awaiting Resume</span>
          </div>
          <div style="text-align: center; padding: 2.25rem 1.5rem; background: rgba(11, 18, 34, 0.55); border: 1.5px dashed rgba(99, 102, 241, 0.28); border-radius: var(--radius-md);">
            <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">📖</div>
            <h4 style="font-size: 1.05rem; font-weight: 700; color: #ffffff; margin-bottom: 0.35rem;">No Skill Gaps Detected Yet</h4>
            <p style="font-size: 0.85rem; color: var(--text-secondary); max-width: 460px; margin: 0 auto; line-height: 1.45;">
              Upload your resume document or paste your skills text above to automatically detect missing keywords and unlock curated study roadmaps with community popularity stats.
            </p>
          </div>
        </div>
      `;
      return;
    }

    const totalMissing = this.missingKeywords.length;

    if (totalMissing === 0) {
      this.container.innerHTML = `
        <div class="study-resources-panel glass-card" style="margin-top: 2rem;">
          <div class="panel-header" style="display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span style="font-size: 1.3rem;">📚</span>
              <h3 style="font-size: 1.15rem; margin: 0;">Recommended Study Resources</h3>
            </div>
            <span class="badge badge-success">✓ All Keywords Matched</span>
          </div>
          <p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.75rem;">
            Outstanding! Your resume currently satisfies all primary ATS keyword requirements for <strong>${this.targetRole}</strong>.
          </p>
        </div>
      `;
      return;
    }

    const typeBadges = {
      doc: '<span class="badge badge-ai">📄 Official Doc</span>',
      video: '<span class="badge badge-purple">🎥 Video Masterclass</span>',
      course: '<span class="badge badge-success">🎓 Course</span>',
      article: '<span class="badge badge-warning">📝 Deep Dive Article</span>'
    };

    this.container.innerHTML = `
      <div class="study-resources-panel glass-card" style="margin-top: 2rem;">
        <!-- Header -->
        <div class="panel-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 1rem; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.75rem;">
          <div style="display: flex; align-items: center; gap: 0.65rem;">
            <span style="font-size: 1.4rem;">📚</span>
            <div>
              <h3 style="font-size: 1.2rem; margin: 0; font-weight: 700;">
                Recommended Study Resources <span class="text-gradient-cyan">for Skill Gaps</span>
              </h3>
              <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 0.2rem;">
                Curated references to bridge <strong style="color: #fb7185;">${totalMissing} detected keyword gaps</strong> for <strong>${this.targetRole}</strong>
              </div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 0.65rem;">
            <span class="badge badge-danger">⚡ ${totalMissing} Gaps to Bridge</span>
            <button class="btn btn-sm btn-glass toggle-resources-btn" id="toggle-resources-collapse" title="Toggle Panel" style="padding: 0.35rem 0.75rem; font-size: 0.78rem;">
              ${this.isCollapsed ? 'Expand View ▼' : 'Collapse ▲'}
            </button>
          </div>
        </div>

        <!-- Panel Body -->
        <div class="panel-body" id="resources-panel-body" style="display: ${this.isCollapsed ? 'none' : 'block'};">
          <div class="study-skills-grid" style="display: flex; flex-direction: column; gap: 1.5rem;">
            ${this.missingKeywords.map(skill => {
              const meta = studyResourcesStore.getSkillMetadata(skill, this.targetRole);
              const resources = studyResourcesStore.getResourcesForSkill(skill);

              return `
                <div class="skill-resource-card" style="background: rgba(11, 18, 34, 0.75); border: 1px solid rgba(99, 102, 241, 0.22); border-radius: var(--radius-md); padding: 1.25rem; box-shadow: 0 4px 16px rgba(0,0,0,0.3);">
                  <!-- Skill Header -->
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; flex-wrap: wrap; gap: 0.5rem;">
                    <div>
                      <div style="display: flex; align-items: center; gap: 0.6rem;">
                        <h4 style="font-size: 1.05rem; font-weight: 700; color: #ffffff; margin: 0;">⚡ ${skill}</h4>
                        <span class="badge badge-warning" style="font-size: 0.72rem; padding: 0.2rem 0.55rem;">⏱ Est. ${meta.timeEst}</span>
                      </div>
                      <p style="font-size: 0.84rem; color: var(--text-secondary); margin-top: 0.4rem; line-height: 1.45;">
                        ${meta.roleContext}
                      </p>
                    </div>
                  </div>

                  <!-- References List -->
                  <div class="references-list" style="display: flex; flex-direction: column; gap: 0.65rem; margin-top: 0.85rem;">
                    ${resources.map((res, idx) => {
                      const isTopPopular = idx === 0;
                      return `
                        <div class="resource-item ${res.is_studied ? 'studied' : ''}" style="display: flex; justify-content: space-between; align-items: center; padding: 0.85rem 1rem; background: rgba(21, 34, 62, 0.6); border: 1px solid ${res.is_studied ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.08)'}; border-radius: var(--radius-sm); gap: 0.85rem; flex-wrap: wrap;">
                          
                          <!-- Left info -->
                          <div style="display: flex; align-items: center; gap: 0.75rem; flex: 1; min-width: 260px;">
                            ${typeBadges[res.resource_type] || '<span class="badge badge-ai">📄 Resource</span>'}
                            <div>
                              <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                                <a href="${res.resource_url}" target="_blank" rel="noopener noreferrer" class="resource-link" data-id="${res.id}" style="font-size: 0.9rem; font-weight: 600; color: #f8fafc; text-decoration: none;">
                                  ${res.resource_title} <span style="color: var(--cyan-ai);">↗</span>
                                </a>
                                ${isTopPopular ? `<span class="badge badge-ai" style="font-size: 0.68rem; padding: 0.15rem 0.45rem;">🔥 Most Popular</span>` : ''}
                              </div>
                              <div style="font-size: 0.75rem; color: var(--text-tertiary); margin-top: 0.2rem; display: flex; align-items: center; gap: 0.65rem;">
                                <span style="color: #94a3b8; font-weight: 500;">${res.provider}</span>
                                <span>•</span>
                                <span>${res.duration}</span>
                              </div>
                            </div>
                          </div>

                          <!-- Right Social Proof & Action -->
                          <div style="display: flex; align-items: center; gap: 0.85rem; flex-shrink: 0;">
                            <!-- Social Proof Indicator -->
                            <div class="social-proof-pill" style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; color: #94a3b8; background: rgba(11, 18, 34, 0.9); padding: 0.3rem 0.65rem; border-radius: var(--radius-full); border: 1px solid rgba(99, 102, 241, 0.25);" title="Total students who studied this">
                              <span style="display: inline-flex; align-items: center; justify-content: center; width: 16px; height: 16px; border-radius: 50%; background: linear-gradient(135deg, #06b6d4, #3b82f6); color: #fff; font-size: 9px;">👤</span>
                              <span>Studied by <strong style="color: #38bdf8;">${res.usage_count}</strong> users</span>
                            </div>

                            <!-- Action Button -->
                            <button class="btn btn-sm ${res.is_studied ? 'btn-glass' : 'btn-primary'} mark-studied-btn" data-id="${res.id}" style="${res.is_studied ? 'color: #34d399; border-color: rgba(16,185,129,0.4);' : ''} padding: 0.35rem 0.85rem; font-size: 0.78rem;">
                              ${res.is_studied ? '✓ Completed' : 'Mark as Studied'}
                            </button>
                          </div>

                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const toggleBtn = this.container.querySelector('#toggle-resources-collapse');
    if (toggleBtn) {
      toggleBtn.onclick = () => {
        this.isCollapsed = !this.isCollapsed;
        this.renderContent();
      };
    }

    const links = this.container.querySelectorAll('.resource-link');
    links.forEach(link => {
      link.onclick = () => {
        const id = link.dataset.id;
        if (id) {
          studyResourcesStore.recordResourceUsage(id);
        }
      };
    });

    const markBtns = this.container.querySelectorAll('.mark-studied-btn');
    markBtns.forEach(btn => {
      btn.onclick = () => {
        const id = btn.dataset.id;
        if (id) {
          studyResourcesStore.toggleMarkAsStudied(id);
        }
      };
    });
  }
}
