/* ==========================================================================
   CareerX - Skill Gap Analysis View (Clean & Minimal)
   ========================================================================== */

import { studentStore } from '../data/studentProfile.js';
import { RadarChart } from '../components/radarChart.js';
import { router } from '../router.js';

export class SkillGapView {
  constructor(container) {
    this.container = container;
    this.radar = null;
  }

  render() {
    const career = studentStore.getCurrentCareer();
    const dims = career.radarDimensions;

    this.container.innerHTML = `
      <div class="container" style="padding-top:1.5rem;padding-bottom:3rem;">
        <div style="margin-bottom:1.5rem;">
          <div class="section-tag">Skill Intelligence</div>
          <h2>Skill Gap Analysis — ${career.title}</h2>
          <p>Comparing your competency profile against hiring expectations.</p>
        </div>

        <div class="skill-gap-layout">
          <!-- Radar Chart -->
          <div class="radar-chart-card">
            <h3 style="margin-bottom:1rem;font-size:1rem;">Competency Radar</h3>
            <div class="radar-svg-container" id="radar-svg-container"></div>
            <div class="radar-legend">
              <div class="radar-legend-item"><span class="legend-line current"></span> Your Profile</div>
              <div class="radar-legend-item"><span class="legend-line target"></span> ${career.title} Benchmark</div>
            </div>
          </div>

          <!-- Deficit Matrix -->
          <div class="deficit-matrix-card">
            <h3 style="margin-bottom:0.75rem;font-size:1rem;">Deficit Breakdown</h3>

            <div class="deficit-category">
              <div class="deficit-cat-title">Priority Focus Gaps</div>
              ${dims.filter(d => d.target - d.current > 30).map(d => this.renderSkillRow(d, 'critical')).join('')}
            </div>

            <div class="deficit-category">
              <div class="deficit-cat-title">Moderate Gaps</div>
              ${dims.filter(d => d.target - d.current > 5 && d.target - d.current <= 30).map(d => this.renderSkillRow(d, 'moderate')).join('')}
            </div>

            <div class="deficit-category">
              <div class="deficit-cat-title">Benchmark Met</div>
              ${dims.filter(d => d.current >= d.target - 5).map(d => this.renderSkillRow(d, 'strength')).join('')}
            </div>

            <button class="btn btn-primary" style="width:100%;margin-top:1rem;" id="sg-view-roadmap">
              View Personalized Roadmap →
            </button>
          </div>
        </div>

        <!-- Bridge Recommendations -->
        <div style="margin-top:2rem;">
          <h3 style="margin-bottom:1rem;font-size:1.05rem;">Recommended Bridge Actions</h3>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1rem;">
            <div class="glass-card">
              <div class="badge badge-active" style="margin-bottom:0.5rem;">Recommended Project</div>
              <h4 style="font-size:0.95rem;margin-bottom:0.25rem;">${career.recommendedProject.title}</h4>
              <p style="font-size:0.82rem;margin-bottom:0.75rem;color:var(--text-secondary);">${career.recommendedProject.desc}</p>
              <div style="display:flex;gap:0.4rem;">
                <span class="badge">${career.recommendedProject.xp}</span>
                <span class="badge badge-active">${career.recommendedProject.readinessBoost}</span>
              </div>
            </div>
            <div class="glass-card">
              <div class="badge" style="margin-bottom:0.5rem;">Recommended Course</div>
              <h4 style="font-size:0.95rem;margin-bottom:0.25rem;">${career.recommendedCourse.title}</h4>
              <p style="font-size:0.82rem;margin-bottom:0.75rem;color:var(--text-secondary);">${career.recommendedCourse.why}</p>
              <div style="display:flex;gap:0.4rem;align-items:center;flex-wrap:wrap;">
                <span class="badge">${career.recommendedCourse.provider}</span>
                <span style="font-size:0.75rem;color:var(--text-tertiary);">${career.recommendedCourse.duration} · ${career.recommendedCourse.rating}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const radarContainer = document.getElementById('radar-svg-container');
    if (radarContainer) {
      this.radar = new RadarChart(radarContainer, { size: 360 });
      this.radar.setData(dims);
    }

    document.getElementById('sg-view-roadmap')?.addEventListener('click', () => router.navigate('roadmap'));
  }

  renderSkillRow(d, type) {
    const gap = d.target - d.current;
    return `
      <div class="skill-gap-row">
        <div class="skill-row-top">
          <span class="skill-name">${d.name}</span>
          <span class="skill-levels">${d.current}% / ${d.target}%</span>
        </div>
        <div class="skill-progress-track">
          <div class="skill-progress-current" style="width:${d.current}%;"></div>
          <div class="skill-target-marker" style="left:${d.target}%;"></div>
        </div>
        ${type !== 'strength' ? `<div class="bridge-actions"><span class="bridge-tag">Delta: ${gap} pts (~${Math.ceil(gap / 12)} wks)</span></div>` : ''}
      </div>
    `;
  }
}
