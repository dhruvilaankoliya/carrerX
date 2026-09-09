/* ==========================================================================
   CareerX - Career Readiness Score Breakdown View (Clean & Minimal)
   ========================================================================== */

import { studentStore } from '../data/studentProfile.js';
import { ReadinessDial } from '../components/readinessDial.js';
import { router } from '../router.js';

export class ScoreView {
  constructor(container) {
    this.container = container;
  }

  render() {
    const profile = studentStore.profile;
    const career  = studentStore.getCurrentCareer();
    const dialSVG = ReadinessDial.createRingSVG(profile.overallScore, 130, 8);

    this.container.innerHTML = `
      <div class="container" style="padding-top:1.5rem;padding-bottom:3rem;">
        <div style="margin-bottom:1.5rem;">
          <div class="section-tag">🏆 Readiness Index</div>
          <h2>Readiness <span class="text-gradient">Score Breakdown</span></h2>
          <p style="color:var(--text-secondary);">A comprehensive 100-point benchmark across 5 weighted engineering dimensions.</p>
        </div>

        <!-- Score Overview Section -->
        <div class="glass-card" style="padding:1.75rem;display:flex;gap:2rem;align-items:center;margin-bottom:1.5rem;flex-wrap:wrap;">
          <div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;">
            <div style="position:relative;width:130px;height:130px;display:flex;align-items:center;justify-content:center;">
              ${dialSVG}
              <div style="position:absolute;text-align:center;">
                <div style="font-family:var(--font-heading);font-size:2.2rem;font-weight:800;color:#ffffff;line-height:1;text-shadow:0 0 15px rgba(6, 182, 212, 0.4);">${profile.overallScore}</div>
                <div style="font-size:0.75rem;color:var(--text-tertiary);">/ 100</div>
              </div>
            </div>
            <span class="badge badge-purple">${profile.readinessTier}</span>
          </div>

          <div style="flex:1;min-width:260px;">
            <h3 style="margin-bottom:0.25rem;font-size:1.1rem;">Competency Breakdown</h3>
            <p style="margin-bottom:1rem;font-size:0.85rem;color:var(--text-secondary);">Targeting <strong>${career.title}</strong> · ${career.matchScore}% role alignment</p>
            ${ReadinessDial.renderBreakdownBar('Technical Skills (Python, ML, Tools)', profile.scores.skills, 35)}
            ${ReadinessDial.renderBreakdownBar('Project Portfolio & Deployments', profile.scores.projects, 25)}
            ${ReadinessDial.renderBreakdownBar('Resume ATS Match Score', profile.scores.resume, 15)}
            ${ReadinessDial.renderBreakdownBar('Interview & Communication Readiness', profile.scores.interview, 15)}
            ${ReadinessDial.renderBreakdownBar('Certifications & Credentials', profile.scores.certifications, 10)}
          </div>
        </div>

        <!-- Score Deficits and Strengths -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:1.25rem;margin-bottom:1.5rem;">
          <div class="glass-card">
            <h4 style="margin-bottom:0.75rem;font-size:0.95rem;">Priority Improvement Areas</h4>
            <ul style="list-style:none;display:flex;flex-direction:column;gap:0.5rem;">
              <li style="font-size:0.85rem;color:var(--text-secondary);display:flex;gap:0.5rem;">
                <span>•</span> MLOps & Docker (48% vs 85% target)
              </li>
              <li style="font-size:0.85rem;color:var(--text-secondary);display:flex;gap:0.5rem;">
                <span>•</span> 4 missing ATS keywords on resume
              </li>
              <li style="font-size:0.85rem;color:var(--text-secondary);display:flex;gap:0.5rem;">
                <span>•</span> RAG & Vector DB depth (65% vs 85% target)
              </li>
            </ul>
          </div>

          <div class="glass-card">
            <h4 style="margin-bottom:0.75rem;font-size:0.95rem;">Verified Proficiencies</h4>
            <ul style="list-style:none;display:flex;flex-direction:column;gap:0.5rem;">
              <li style="font-size:0.85rem;color:var(--text-secondary);display:flex;gap:0.5rem;">
                <span>✓</span> Python mastery (90%) · Exceeds benchmark
              </li>
              <li style="font-size:0.85rem;color:var(--text-secondary);display:flex;gap:0.5rem;">
                <span>✓</span> Mathematics & Statistics (85%)
              </li>
              <li style="font-size:0.85rem;color:var(--text-secondary);display:flex;gap:0.5rem;">
                <span>✓</span> Deep Learning & PyTorch (82%)
              </li>
            </ul>
          </div>
        </div>

        <!-- Readiness Projection Timeline -->
        <div class="glass-card" style="margin-bottom:1.5rem;">
          <h4 style="margin-bottom:0.75rem;font-size:0.95rem;">Projected Score Progression</h4>
          <div style="display:flex;gap:0;overflow-x:auto;">
            ${[
              { label: 'Current', score: profile.overallScore },
              { label: '+1 Week', score: Math.min(99, profile.overallScore + 4) },
              { label: '+3 Weeks', score: Math.min(99, profile.overallScore + 10) },
              { label: '+6 Weeks', score: Math.min(99, profile.overallScore + 16) },
            ].map(p => `
              <div style="flex:1;min-width:110px;text-align:center;padding:1rem 0.5rem;border-right:1px solid var(--border-color);">
                <div style="font-family:var(--font-heading);font-size:1.6rem;font-weight:600;color:var(--text-primary);">${p.score}</div>
                <div style="font-size:0.72rem;color:var(--text-secondary);margin-top:0.2rem;">${p.label}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Mock Practice Teaser -->
        <div class="glass-card" style="text-align:center;padding:1.75rem;">
          <h3 style="margin-bottom:0.5rem;font-size:1.05rem;">Practice Technical Assessments</h3>
          <p style="max-width:520px;margin:0 auto 1.25rem;font-size:0.85rem;color:var(--text-secondary);">
            Evaluate system design, code problem solving, and ML fundamentals with structured question sets.
          </p>
          <div style="display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap;">
            <button class="btn btn-primary" id="score-start-interview">Start Assessment</button>
            <button class="btn btn-glass" id="score-view-roadmap">View Roadmap</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('score-view-roadmap')?.addEventListener('click', () => router.navigate('roadmap'));
    document.getElementById('score-start-interview')?.addEventListener('click', () => {
      router.navigate('assessment');
    });
  }
}
