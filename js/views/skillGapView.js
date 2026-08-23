/* ==========================================================================
   CareerX - Skill Gap Analysis View (Dual Radar + Deficit Matrix)
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
      <div class="container" style="padding-top:2rem;padding-bottom:4rem;">
        <div style="margin-bottom:2rem;">
          <div class="section-tag"><span class="dot"></span> Skill Intelligence</div>
          <h2>Skill Gap Analysis<span class="text-gradient"> — ${career.title}</span></h2>
          <p>Comparing your current competency profile against the industry benchmark for this role.</p>
        </div>

        <div class="skill-gap-layout">
          <!-- Radar Chart -->
          <div class="radar-chart-card">
            <h3 style="margin-bottom:1.5rem;">Competency Radar</h3>
            <div class="radar-svg-container" id="radar-svg-container"></div>
            <div class="radar-legend">
              <div class="radar-legend-item"><span class="legend-line current"></span> Your Profile</div>
              <div class="radar-legend-item"><span class="legend-line target"></span> ${career.title} Benchmark</div>
            </div>
          </div>

          <!-- Deficit Matrix -->
          <div class="deficit-matrix-card">
            <h3 style="margin-bottom:1rem;">Priority Deficit Matrix</h3>

            <div class="deficit-category">
              <div class="deficit-cat-title critical">🔴 Critical Gaps (Action Required)</div>
              ${dims.filter(d => d.target - d.current > 30).map(d => this.renderSkillRow(d, 'critical')).join('')}
            </div>

            <div class="deficit-category">
              <div class="deficit-cat-title moderate">🟡 Moderate Gaps (Bridge Projects)</div>
              ${dims.filter(d => d.target - d.current > 5 && d.target - d.current <= 30).map(d => this.renderSkillRow(d, 'moderate')).join('')}
            </div>

            <div class="deficit-category">
              <div class="deficit-cat-title strength">🟢 Strengths (Maintain & Showcase)</div>
              ${dims.filter(d => d.current >= d.target - 5).map(d => this.renderSkillRow(d, 'strength')).join('')}
            </div>

            <button class="btn btn-primary" style="width:100%;margin-top:1.5rem;" id="sg-view-roadmap">
              View Personalized Roadmap →
            </button>
          </div>
        </div>

        <!-- Bridge Recommendations -->
        <div style="margin-top:2.5rem;">
          <h3 style="margin-bottom:1.25rem;">🌉 High-Yield Bridge Recommendations</h3>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:1.5rem;">
            <div class="glass-card" style="border-left:3px solid var(--coral-gap);">
              <div class="badge badge-danger" style="margin-bottom:0.75rem;">Critical Priority</div>
              <h4>${career.recommendedProject.title}</h4>
              <p style="font-size:0.85rem;margin-bottom:0.75rem;">${career.recommendedProject.desc}</p>
              <div style="display:flex;gap:0.5rem;">
                <span class="badge badge-warning">${career.recommendedProject.xp}</span>
                <span class="badge badge-success">${career.recommendedProject.readinessBoost}</span>
              </div>
            </div>
            <div class="glass-card" style="border-left:3px solid var(--electric-blue);">
              <div class="badge badge-ai" style="margin-bottom:0.75rem;">Recommended Course</div>
              <h4>${career.recommendedCourse.title}</h4>
              <p style="font-size:0.85rem;margin-bottom:0.5rem;">${career.recommendedCourse.why}</p>
              <div style="display:flex;gap:0.5rem;align-items:center;flex-wrap:wrap;">
                <span class="badge badge-purple">${career.recommendedCourse.provider}</span>
                <span style="font-size:0.78rem;color:var(--text-tertiary);">${career.recommendedCourse.duration} · ${career.recommendedCourse.rating}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Init radar
    const radarContainer = document.getElementById('radar-svg-container');
    if (radarContainer) {
      this.radar = new RadarChart(radarContainer, { size: 420 });
      this.radar.setData(dims);
    }

    document.getElementById('sg-view-roadmap')?.addEventListener('click', () => router.navigate('roadmap'));
  }

  renderSkillRow(d, type) {
    const gap = d.target - d.current;
    const gapColors = { critical: 'var(--coral-gap)', moderate: 'var(--amber-reward)', strength: 'var(--emerald-growth)' };
    return `
      <div class="skill-gap-row">
        <div class="skill-row-top">
          <span class="skill-name">${d.name}</span>
          <span class="skill-levels" style="color:${gapColors[type]};">${d.current}% → ${d.target}%</span>
        </div>
        <div class="skill-progress-track">
          <div class="skill-progress-current" style="width:${d.current}%;"></div>
          <div class="skill-target-marker" style="left:${d.target}%;"></div>
        </div>
        ${type !== 'strength' ? `<div class="bridge-actions"><span class="bridge-tag">Gap: ${gap} pts — bridgeable in ~${Math.ceil(gap / 12)} weeks</span></div>` : ''}
      </div>
    `;
  }
}
