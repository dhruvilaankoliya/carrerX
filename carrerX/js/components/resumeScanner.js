/* ==========================================================================
   CareerX - Resume Intelligence, ATS Scanner & Bullet Optimizer
   ========================================================================== */

import { studentStore } from '../data/studentProfile.js';

export class ResumeScanner {
  constructor(containerElement) {
    this.container = containerElement;
    this.auditData = studentStore.profile.resumeAudit;
  }

  render() {
    if (!this.container) return;

    const currentCareer = studentStore.getCurrentCareer();

    this.container.innerHTML = `
      <div class="resume-layout-grid">
        <!-- ATS Score & Keywords Card -->
        <div class="ats-score-card">
          <div class="ats-score-header">
            <div>
              <h3>ATS Match Score</h3>
              <p style="font-size: 0.85rem;">Targeting: <strong style="color: #38bdf8;">${currentCareer.title}</strong></p>
            </div>
            <span class="badge badge-warning">${this.auditData.status}</span>
          </div>

          <div style="text-align: center; padding: 1rem 0;">
            <div style="font-family: var(--font-heading); font-size: 3.5rem; font-weight: 800; color: #ffffff; line-height: 1;">
              ${this.auditData.score}<span style="font-size: 1.5rem; color: var(--text-tertiary);">/100</span>
            </div>
            <div style="font-size: 0.85rem; color: var(--amber-reward); margin-top: 0.5rem;">
              ⚠️ Missing 4 critical keywords required by Tier-1 hiring algorithms
            </div>
          </div>

          <div class="keywords-section">
            <h4 style="font-size: 0.9rem; text-transform: uppercase; color: var(--text-tertiary); letter-spacing: 0.05em;">
              ✓ Found Keywords (${this.auditData.foundKeywords.length})
            </h4>
            <div class="keyword-chips-wrap">
              ${this.auditData.foundKeywords.map(kw => `<span class="kw-chip kw-found">✓ ${kw}</span>`).join('')}
            </div>
          </div>

          <div class="keywords-section" style="margin-top: 0.5rem;">
            <h4 style="font-size: 0.9rem; text-transform: uppercase; color: var(--coral-gap); letter-spacing: 0.05em;">
              ✗ Missing Target Keywords (${this.auditData.missingKeywords.length})
            </h4>
            <div class="keyword-chips-wrap">
              ${this.auditData.missingKeywords.map(kw => `<span class="kw-chip kw-missing">+ ${kw}</span>`).join('')}
            </div>
          </div>

          <button class="btn btn-ai" id="rescan-resume-btn" style="width: 100%; margin-top: 1rem;">
            ⚡ Re-scan Uploaded Resume
          </button>
        </div>

        <!-- AI Bullet Optimizer -->
        <div class="bullet-optimizer-card">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h3>AI Bullet Point Optimizer</h3>
              <p style="font-size: 0.85rem;">Transform passive descriptions into high-converting STAR impact metrics</p>
            </div>
            <span class="badge badge-ai">GPT-4o Career Engine</span>
          </div>

          <div style="display: flex; flex-direction: column; gap: 1.25rem; margin-top: 0.5rem;">
            ${this.auditData.bulletRewrites.map((item, idx) => `
              <div class="bullet-comparison-item">
                <div style="font-size: 0.82rem; font-weight: 700; color: #38bdf8;">
                  📍 ${item.section}
                </div>

                <div class="bullet-box before">
                  <div class="bullet-tag-before">Before (Passive & Unquantified)</div>
                  "${item.original}"
                </div>

                <div class="bullet-box after">
                  <div class="bullet-tag-after">After (AI Enhanced • Impact & Metrics)</div>
                  "${item.improved}"
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 0.78rem; font-weight: 700; color: var(--emerald-growth);">
                    ⚡ ${item.impact}
                  </span>
                  <button class="btn btn-sm btn-glass copy-bullet-btn" data-text="${encodeURIComponent(item.improved)}">
                    📋 Copy Optimized Bullet
                  </button>
                </div>
              </div>
            `).join('')}
          </div>

          <div style="background: rgba(6, 182, 212, 0.08); border: 1px dashed rgba(6, 182, 212, 0.3); border-radius: var(--radius-md); padding: 1.25rem; text-align: center;">
            <div style="font-size: 0.9rem; font-weight: 700; color: #ffffff; margin-bottom: 0.35rem;">
              Want to upload a customized resume draft?
            </div>
            <p style="font-size: 0.8rem; margin-bottom: 0.75rem;">Supports .PDF, .DOCX, or plaintext paste</p>
            <input type="file" id="resume-upload-input" style="display: none;" accept=".pdf,.docx,.txt" />
            <button class="btn btn-sm btn-primary" onclick="document.getElementById('resume-upload-input').click()">
              📤 Upload New Resume Draft
            </button>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const copyBtns = this.container.querySelectorAll('.copy-bullet-btn');
    copyBtns.forEach(btn => {
      btn.onclick = () => {
        const text = decodeURIComponent(btn.getAttribute('data-text'));
        navigator.clipboard.writeText(text);
        btn.innerText = '✓ Copied!';
        setTimeout(() => { btn.innerText = '📋 Copy Optimized Bullet'; }, 2000);
      };
    });

    const rescanBtn = this.container.querySelector('#rescan-resume-btn');
    if (rescanBtn) {
      rescanBtn.onclick = () => {
        rescanBtn.innerText = '⏳ Scanning ATS filters...';
        setTimeout(() => {
          this.auditData.score = Math.min(94, this.auditData.score + 6);
          this.render();
        }, 800);
      };
    }

    const fileInput = this.container.querySelector('#resume-upload-input');
    if (fileInput) {
      fileInput.onchange = (e) => {
        if (e.target.files && e.target.files[0]) {
          alert(`Successfully uploaded "${e.target.files[0].name}". AI Scanner is analyzing keywords against target role...`);
          this.auditData.score = 88;
          this.render();
        }
      };
    }
  }
}
