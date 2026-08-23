/* ==========================================================================
   CareerX - Career Readiness Score Breakdown View
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
    const dialSVG = ReadinessDial.createRingSVG(profile.overallScore, 180, 12);

    this.container.innerHTML = `
      <div class="container" style="padding-top:2rem;padding-bottom:4rem;">
        <div style="margin-bottom:2rem;">
          <div class="section-tag"><span class="dot"></span> Career Intelligence Score</div>
          <h2>Readiness <span class="text-gradient">Score Breakdown</span></h2>
          <p>A 100-point index across 5 weighted dimensions. Each action you take updates this in real time.</p>
        </div>

        <!-- Hero Score Section -->
        <div class="glass-panel" style="padding:3rem;display:flex;gap:3rem;align-items:center;margin-bottom:2.5rem;flex-wrap:wrap;">
          <div style="display:flex;flex-direction:column;align-items:center;gap:0.75rem;">
            <div style="position:relative;width:180px;height:180px;display:flex;align-items:center;justify-content:center;">
              ${dialSVG}
              <div style="position:absolute;text-align:center;">
                <div style="font-family:var(--font-heading);font-size:3rem;font-weight:800;color:#fff;line-height:1;">${profile.overallScore}</div>
                <div style="font-size:0.85rem;color:var(--text-tertiary);">/ 100</div>
              </div>
            </div>
            <span class="badge badge-ai">${profile.readinessTier}</span>
          </div>

          <div style="flex:1;min-width:280px;">
            <h3 style="margin-bottom:0.5rem;">Career Readiness Index</h3>
            <p style="margin-bottom:1.5rem;">Targeting <strong style="color:#38bdf8;">${career.title}</strong> · ${career.matchScore}% role alignment</p>
            ${ReadinessDial.renderBreakdownBar('Technical Skills (Python, ML, Tools)', profile.scores.skills, 35, '💡')}
            ${ReadinessDial.renderBreakdownBar('Project Portfolio & Deployments', profile.scores.projects, 25, '🛠️')}
            ${ReadinessDial.renderBreakdownBar('Resume ATS Match Score', profile.scores.resume, 15, '📄')}
            ${ReadinessDial.renderBreakdownBar('Interview & Communication Readiness', profile.scores.interview, 15, '🎙️')}
            ${ReadinessDial.renderBreakdownBar('Certifications & Credentials', profile.scores.certifications, 10, '🏆')}
          </div>
        </div>

        <!-- What's Holding You Back -->
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:2rem;margin-bottom:2.5rem;">
          <div class="glass-card" style="border-left:3px solid var(--coral-gap);">
            <h4 style="margin-bottom:0.75rem;">🔴 Top Score Blockers</h4>
            <ul style="list-style:none;display:flex;flex-direction:column;gap:0.6rem;">
              <li style="font-size:0.88rem;color:var(--text-secondary);display:flex;gap:0.5rem;">
                <span style="color:var(--coral-gap);">✗</span> MLOps & Docker (48% · needs 85%) · -5.5 pts potential
              </li>
              <li style="font-size:0.88rem;color:var(--text-secondary);display:flex;gap:0.5rem;">
                <span style="color:var(--coral-gap);">✗</span> 4 missing ATS keywords on resume · -3.0 pts potential
              </li>
              <li style="font-size:0.88rem;color:var(--text-secondary);display:flex;gap:0.5rem;">
                <span style="color:var(--amber-reward);">◑</span> RAG / Vector DB depth (65% · needs 85%) · -2.5 pts
              </li>
            </ul>
          </div>

          <div class="glass-card" style="border-left:3px solid var(--emerald-growth);">
            <h4 style="margin-bottom:0.75rem;">🟢 Verified Strengths</h4>
            <ul style="list-style:none;display:flex;flex-direction:column;gap:0.6rem;">
              <li style="font-size:0.88rem;color:var(--text-secondary);display:flex;gap:0.5rem;">
                <span style="color:var(--emerald-growth);">✓</span> Python mastery (90%) · Exceeds benchmark
              </li>
              <li style="font-size:0.88rem;color:var(--text-secondary);display:flex;gap:0.5rem;">
                <span style="color:var(--emerald-growth);">✓</span> Math & Statistics (85%) · Top 8% of candidates
              </li>
              <li style="font-size:0.88rem;color:var(--text-secondary);display:flex;gap:0.5rem;">
                <span style="color:var(--emerald-growth);">✓</span> Deep Learning / PyTorch (82%) · Solid foundation
              </li>
            </ul>
          </div>
        </div>

        <!-- Readiness Projection Timeline -->
        <div class="glass-card" style="margin-bottom:2.5rem;">
          <h4 style="margin-bottom:1rem;">📈 Projected Score Timeline</h4>
          <div style="display:flex;gap:0;overflow-x:auto;">
            ${[
              { label: 'Today', score: profile.overallScore, color: '#38bdf8' },
              { label: '+1 Week', score: Math.min(99, profile.overallScore + 4), color: '#3b82f6' },
              { label: '+3 Weeks', score: Math.min(99, profile.overallScore + 10), color: '#8b5cf6' },
              { label: '+6 Weeks', score: Math.min(99, profile.overallScore + 16), color: '#10b981' },
            ].map(p => `
              <div style="flex:1;min-width:140px;text-align:center;padding:1.5rem 1rem;border-right:1px solid rgba(255,255,255,0.06);">
                <div style="font-family:var(--font-heading);font-size:2.2rem;font-weight:800;color:${p.color};">${p.score}</div>
                <div style="font-size:0.75rem;color:var(--text-tertiary);margin-top:0.25rem;">${p.label}</div>
              </div>
            `).join('')}
          </div>
          <p style="font-size:0.78rem;color:var(--text-tertiary);text-align:center;margin-top:0.75rem;">
            * Based on completing your current quest set and recommended bridge projects
          </p>
        </div>

        <!-- Mock Interview Mini Teaser -->
        <div class="glass-card" style="background:linear-gradient(135deg,rgba(139,92,246,0.1),rgba(17,26,48,0.9));border-color:rgba(139,92,246,0.35);text-align:center;padding:2.5rem;">
          <div style="font-size:2.5rem;margin-bottom:1rem;">🎙️</div>
          <h3 style="margin-bottom:0.75rem;">Boost Interview Score with Mock Practice</h3>
          <p style="max-width:540px;margin:0 auto 1.5rem;">AI-powered simulated interviews covering System Design, Coding, and ML fundamentals. Get scored and coached in real-time.</p>
          <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
            <button class="btn btn-primary btn-lg" id="score-start-interview">Start Mock Interview →</button>
            <button class="btn btn-glass" id="score-view-roadmap">View Full Roadmap</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('score-view-roadmap')?.addEventListener('click', () => router.navigate('roadmap'));
    document.getElementById('score-start-interview')?.addEventListener('click', () => {
      alert('🎙️ Mock Interview Simulator launching...\n\nQuestion: "Explain how Multi-Head Self-Attention works and describe how FlashAttention reduces memory complexity."\n\nTip: Use the STAR method with concrete benchmarks!');
    });
  }
}
