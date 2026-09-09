/* ==========================================================================
   CareerX - Resume Intelligence, ATS Scanner & Career Field Recommender
   Proper empty state on initial load, dynamic AI analysis on upload
   ========================================================================== */

import { studentStore } from '../data/studentProfile.js';
import { StudyResourcesPanel } from './studyResourcesPanel.js';
import { ResumeParser } from '../utils/resumeParser.js';

export class ResumeScanner {
  constructor(containerElement) {
    this.container = containerElement;
    this.auditData = studentStore.profile.resumeAudit;
    this.studyPanel = null;
    this.activeTab = 'upload'; // 'upload' | 'paste'
    this.isProcessing = false;
    this.statusMessage = '';
    this.errorMessage = '';
    this.uploadedFileName = '';
    this.careerRecommendations = [];
    this.bestFitCareer = null;
    this.lastAnalyzedText = '';

    // Restore recommendations only if already uploaded in session
    if (this.auditData && this.auditData.uploaded && this.auditData.foundKeywords && this.auditData.foundKeywords.length > 0) {
      const initialText = `Skills: ${this.auditData.foundKeywords.join(', ')}`;
      const initialAnalysis = ResumeParser.analyzeText(initialText, studentStore.profile.targetCareerId);
      this.careerRecommendations = initialAnalysis.careerRecommendations;
      this.bestFitCareer = initialAnalysis.bestFitCareer;
    }
  }

  destroy() {
    if (this.studyPanel) {
      this.studyPanel.destroy();
      this.studyPanel = null;
    }
  }

  render() {
    if (!this.container) return;

    const currentCareer = studentStore.getCurrentCareer();
    const isUploaded = !!(this.auditData && this.auditData.uploaded);

    // Dynamic ATS status badge & score
    const statusBadge = isUploaded
      ? `<span class="badge ${this.auditData.score >= 80 ? 'badge-success' : 'badge-warning'}">${this.auditData.status}</span>`
      : `<span class="badge badge-warning">Awaiting Resume</span>`;

    const scoreDisplay = isUploaded
      ? `${this.auditData.score}<span style="font-size: 1.3rem; color: var(--text-tertiary);">/100</span>`
      : `--<span style="font-size: 1.3rem; color: var(--text-tertiary);">/100</span>`;

    const scoreSubtitle = isUploaded
      ? (this.auditData.missingKeywords.length > 0
          ? `⚡ ${this.auditData.missingKeywords.length} critical skills missing for Tier-1 role matching`
          : '✓ Full keyword match for this role benchmark!')
      : 'Upload your resume to calculate your live ATS match score';

    const matchedKeywordsHTML = isUploaded
      ? (this.auditData.foundKeywords.length > 0
          ? `<div class="keyword-chips-wrap">${this.auditData.foundKeywords.map(kw => `<span class="kw-chip kw-found">✓ ${kw}</span>`).join('')}</div>`
          : `<div class="empty-state-notice"><span>⚠️</span> No matched skills detected in resume.</div>`)
      : `<div class="empty-state-notice"><span>📄</span> No resume uploaded yet. Select a file or paste text to detect skills.</div>`;

    const missingKeywordsHTML = isUploaded
      ? (this.auditData.missingKeywords.length > 0
          ? `<div class="keyword-chips-wrap">${this.auditData.missingKeywords.map(kw => `<span class="kw-chip kw-missing">+ ${kw}</span>`).join('')}</div>`
          : `<div class="empty-state-notice" style="color:#34d399; border-color:rgba(16,185,129,0.3);"><span>✓</span> No missing skills detected for this role!</div>`)
      : `<div class="empty-state-notice"><span>🔍</span> Skill gap deficit will appear after resume scan.</div>`;

    const rescanBtnHTML = isUploaded
      ? `<button class="btn btn-primary" id="rescan-resume-btn" style="width: 100%; margin-top: 0.85rem;">
           ${this.isProcessing ? '⚡ Analyzing...' : '⚡ Re-calculate ATS Alignment'}
         </button>`
      : `<button class="btn btn-primary" id="rescan-resume-btn" disabled style="width: 100%; margin-top: 0.85rem; opacity: 0.45; cursor: not-allowed;" title="Upload a resume first to enable re-calculation">
           ⚡ Re-calculate ATS Alignment
         </button>`;

    this.container.innerHTML = `
      <div class="resume-layout-grid">
        <!-- ─── ATS Score & Keywords Card ─── -->
        <div class="ats-score-card">
          <div class="ats-score-header">
            <div>
              <h3 style="font-size:1.15rem;margin-bottom:0.25rem;">
                ATS <span class="text-gradient-cyan">Match Analysis</span>
              </h3>
              <p style="font-size:0.85rem;color:var(--text-secondary);">Targeting: <strong style="color: #38bdf8;">${currentCareer.title}</strong></p>
            </div>
            ${statusBadge}
          </div>

          <div style="text-align: center; padding: 1rem 0; position: relative;">
            <div style="font-family: var(--font-heading); font-size: 3.4rem; font-weight: 800; color: #ffffff; line-height: 1; text-shadow: 0 0 20px rgba(6, 182, 212, 0.3);">
              ${scoreDisplay}
            </div>
            <div style="font-size: 0.85rem; color: ${isUploaded ? (this.auditData.missingKeywords.length > 0 ? '#fbbf24' : '#34d399') : 'var(--text-secondary)'}; margin-top: 0.5rem; font-weight: ${isUploaded ? '600' : '400'};">
              ${scoreSubtitle}
            </div>
          </div>

          ${this.statusMessage ? `
            <div style="padding: 0.65rem 0.85rem; background: rgba(6, 182, 212, 0.12); border: 1px solid rgba(6, 182, 212, 0.35); border-radius: var(--radius-sm); font-size: 0.82rem; color: #38bdf8;">
              ${this.statusMessage}
            </div>
          ` : ''}

          ${this.errorMessage ? `
            <div style="padding: 0.65rem 0.85rem; background: rgba(244, 63, 94, 0.12); border: 1px solid rgba(244, 63, 94, 0.35); border-radius: var(--radius-sm); font-size: 0.82rem; color: #fb7185;">
              ⚠️ ${this.errorMessage}
            </div>
          ` : ''}

          <!-- Matched Keywords -->
          <div class="keywords-section">
            <h4 style="font-size: 0.8rem; text-transform: uppercase; color: var(--emerald-growth); letter-spacing: 0.05em; display: flex; align-items: center; gap: 0.4rem;">
              <span>✓</span> Detected Skills in Resume ${isUploaded ? `(${this.auditData.foundKeywords.length})` : ''}
            </h4>
            ${matchedKeywordsHTML}
          </div>

          <!-- Missing Keywords -->
          <div class="keywords-section" style="margin-top: 0.5rem;">
            <h4 style="font-size: 0.8rem; text-transform: uppercase; color: var(--coral-gap); letter-spacing: 0.05em; display: flex; align-items: center; gap: 0.4rem;">
              <span>✗</span> Missing Target Keywords ${isUploaded ? `(${this.auditData.missingKeywords.length})` : ''}
            </h4>
            ${missingKeywordsHTML}
          </div>

          ${rescanBtnHTML}
        </div>

        <!-- ─── Upload & Bullet Optimizer Card ─── -->
        <div class="bullet-optimizer-card">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
            <div>
              <h3 style="font-size:1.15rem;margin-bottom:0.2rem;">
                AI <span class="text-gradient">Bullet Point Optimizer</span>
              </h3>
              <p style="font-size: 0.85rem; color: var(--text-secondary);">Transform passive descriptions into high-converting STAR impact metrics</p>
            </div>
            <div class="tab-group" style="padding: 0.2rem;">
              <button class="tab-btn ${this.activeTab === 'upload' ? 'active' : ''}" id="tab-btn-upload" style="padding: 0.25rem 0.65rem; font-size: 0.78rem;">Upload File</button>
              <button class="tab-btn ${this.activeTab === 'paste' ? 'active' : ''}" id="tab-btn-paste" style="padding: 0.25rem 0.65rem; font-size: 0.78rem;">Paste Text</button>
            </div>
          </div>

          <!-- Upload / Paste Panel -->
          ${this.activeTab === 'upload' ? `
            <div id="dropzone-box" style="background: rgba(11, 18, 34, 0.7); border: 1.5px dashed rgba(6, 182, 212, 0.4); border-radius: var(--radius-md); padding: 1.5rem; text-align: center; cursor: pointer; transition: all var(--transition-fast);">
              <div style="font-size: 1.8rem; margin-bottom: 0.35rem;">📄</div>
              <div style="font-size: 0.95rem; font-weight: 700; color: #ffffff; margin-bottom: 0.25rem;">
                ${this.uploadedFileName ? `Loaded: ${this.uploadedFileName}` : 'Click or Drag & Drop Resume Document'}
              </div>
              <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.85rem;">Supports .PDF, .DOCX, .TXT, or .MD</p>
              <input type="file" id="resume-upload-input" style="display: none;" accept=".pdf,.docx,.txt,.md,.json" />
              <button type="button" class="btn btn-sm btn-primary" id="select-file-btn">
                ${this.isProcessing ? '⚡ Parsing File...' : '📤 Select Resume File'}
              </button>
            </div>
          ` : `
            <div style="background: rgba(11, 18, 34, 0.7); border: 1px solid rgba(99, 102, 241, 0.25); border-radius: var(--radius-md); padding: 1rem;">
              <textarea id="resume-paste-input" placeholder="Paste your resume text, skills section, or project bullets here to parse keywords..." style="width: 100%; height: 95px; background: rgba(15, 23, 42, 0.9); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: var(--radius-sm); color: #ffffff; padding: 0.65rem; font-family: var(--font-body); font-size: 0.85rem; outline: none; resize: vertical;"></textarea>
              <div style="display: flex; justify-content: flex-end; margin-top: 0.5rem;">
                <button type="button" class="btn btn-sm btn-primary" id="analyze-pasted-btn">
                  ${this.isProcessing ? '⚡ Analyzing...' : '🚀 Scan & Recommend Field'}
                </button>
              </div>
            </div>
          `}

          <!-- Dynamic Loading / Bullets list / Empty state -->
          ${this.isProcessing ? `
            <div class="resume-loader-container">
              <div class="resume-spinner"></div>
              <h4 style="font-size: 1rem; font-weight: 700; color: #38bdf8; margin-bottom: 0.35rem;">Analyzing Resume with AI Engine...</h4>
              <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 1rem;">Parsing experience sections, cross-referencing industry skill taxonomy, and generating STAR bullet optimizations...</p>
              <div class="skeleton-line" style="width: 80%;"></div>
              <div class="skeleton-line" style="width: 60%;"></div>
            </div>
          ` : isUploaded ? `
            <div style="display: flex; flex-direction: column; gap: 1rem; margin-top: 0.5rem;">
              ${(this.auditData.bulletRewrites || []).map((item) => `
                <div class="bullet-comparison-item">
                  <div style="font-size: 0.85rem; font-weight: 700; color: #38bdf8; display: flex; align-items: center; gap: 0.35rem;">
                    <span>📍</span> ${item.section}
                  </div>

                  <!-- Red/Pink Tone for Before Block -->
                  <div class="bullet-box before">
                    <div class="bullet-tag-before">Before (Passive & Unquantified)</div>
                    "${item.original}"
                  </div>

                  <!-- Green Tone for After/Improved Block -->
                  <div class="bullet-box after">
                    <div class="bullet-tag-after">After (AI Enhanced • High-Impact STAR Metric)</div>
                    "${item.improved}"
                  </div>

                  <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                    <span style="font-size: 0.8rem; font-weight: 700; color: var(--emerald-growth);">
                      ⚡ ${item.impact}
                    </span>
                    <button class="btn btn-sm copy-bullet-btn" data-text="${encodeURIComponent(item.improved)}" style="padding: 0.35rem 0.85rem; font-size: 0.78rem;">
                      📋 Copy Optimized Bullet
                    </button>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : `
            <div class="bullet-empty-placeholder">
              <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">✨</div>
              <h4 style="font-size: 1.05rem; font-weight: 700; color: #ffffff; margin-bottom: 0.35rem;">No Bullets Optimized Yet</h4>
              <p style="font-size: 0.85rem; color: var(--text-secondary); max-width: 440px; margin: 0 auto; line-height: 1.45;">
                Upload your resume document or paste project bullet points to generate AI STAR-format high-impact rewrites.
              </p>
            </div>
          `}
        </div>
      </div>

      <!-- ─── Career Field Suitability & Recommendations Section ─── -->
      ${isUploaded ? `
        <div class="career-recommendation-panel" style="margin-top: 2rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 1rem; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.75rem;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.65rem;">
                <span style="font-size: 1.4rem;">🎯</span>
                <h3 style="font-size: 1.25rem; margin: 0; font-weight: 700;">
                  Career Field Match <span class="text-gradient">Recommendations</span>
                </h3>
              </div>
              <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem; line-height: 1.4;">
                We evaluated your detected skill profile across all engineering disciplines to find your highest-impact fit.
              </p>
            </div>
            ${this.bestFitCareer ? `
              <div style="background: rgba(139, 92, 246, 0.15); border: 1px solid rgba(139, 92, 246, 0.4); padding: 0.45rem 0.9rem; border-radius: var(--radius-md); text-align: right; box-shadow: 0 0 15px rgba(139, 92, 246, 0.2);">
                <div style="font-size: 0.72rem; color: #c084fc; text-transform: uppercase; font-weight: 700;">Top Recommended Path</div>
                <div style="font-size: 0.95rem; font-weight: 800; color: #ffffff;">${this.bestFitCareer.icon} ${this.bestFitCareer.title} (<span style="color: #38bdf8;">${this.bestFitCareer.matchScore}% Match</span>)</div>
              </div>
            ` : ''}
          </div>

          <!-- Career Suitability Cards Grid -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.25rem;">
            ${(this.careerRecommendations || []).map((rec, index) => {
              const isTop = index === 0;
              const isTarget = rec.id === currentCareer.id;

              return `
                <div class="career-rec-card glass-card" style="background: rgba(11, 18, 34, 0.85); border: 1px solid ${isTarget ? 'rgba(6, 182, 212, 0.5)' : isTop ? 'rgba(139, 92, 246, 0.4)' : 'rgba(99, 102, 241, 0.22)'}; border-radius: var(--radius-md); padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between; gap: 0.85rem; ${isTarget ? 'box-shadow: 0 0 20px rgba(6, 182, 212, 0.25);' : ''}">
                  <div>
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
                      <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-size: 1.5rem;">${rec.icon}</span>
                        <div>
                          <h4 style="font-size: 1rem; font-weight: 700; color: #ffffff; margin: 0;">${rec.title}</h4>
                          <span style="font-size: 0.75rem; color: var(--text-tertiary);">${rec.category}</span>
                        </div>
                      </div>
                      <div style="text-align: right;">
                        <span class="badge ${isTop ? 'badge-purple' : 'badge-ai'}" style="font-size: 0.8rem; font-weight: 700;">
                          ${rec.matchScore}% Fit
                        </span>
                      </div>
                    </div>

                    <!-- Matched Skills Bar -->
                    <div style="margin: 0.65rem 0;">
                      <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-secondary); margin-bottom: 0.3rem;">
                        <span>Skills Matched: <strong style="color: #38bdf8;">${rec.matchedCount}/${rec.totalRequired}</strong></span>
                        <span style="color: #34d399; font-weight: 600;">${rec.salaryRange}</span>
                      </div>
                      <div style="height: 6px; background: rgba(255, 255, 255, 0.08); border-radius: var(--radius-full); overflow: hidden;">
                        <div style="width: ${rec.matchScore}%; height: 100%; background: linear-gradient(90deg, #06b6d4, #3b82f6, #8b5cf6); border-radius: var(--radius-full);"></div>
                      </div>
                    </div>

                    <!-- Tag Summary -->
                    <div style="font-size: 0.78rem; color: var(--text-secondary); line-height: 1.5;">
                      ${rec.matchedSkills.length > 0 
                        ? `<div style="color: #34d399; font-weight: 600;">✓ Matched: ${rec.matchedSkills.slice(0, 3).join(', ')}</div>` 
                        : `<div style="color: var(--text-tertiary);">No direct core skills matched yet</div>`}
                      ${rec.missingSkills.length > 0
                        ? `<div style="color: #fb7185; margin-top: 0.2rem;">+ Missing to learn: ${rec.missingSkills.slice(0, 2).join(', ')}</div>`
                        : ''}
                    </div>
                  </div>

                  <!-- Action button -->
                  <div style="margin-top: 0.5rem;">
                    ${isTarget ? `
                      <button class="btn btn-sm btn-glass" disabled style="width: 100%; border-color: var(--cyan-ai); color: var(--cyan-ai); font-size: 0.8rem; font-weight: 700;">
                        ✓ Current Active Target
                      </button>
                    ` : `
                      <button class="btn btn-sm btn-primary switch-target-career-btn" data-career-id="${rec.id}" style="width: 100%; font-size: 0.8rem;">
                        🎯 Select As My Target Career
                      </button>
                    `}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : `
        <div class="career-recommendation-panel" style="margin-top: 2rem;">
          <div class="panel-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255, 255, 255, 0.08); padding-bottom: 1rem; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.75rem;">
            <div style="display: flex; align-items: center; gap: 0.65rem;">
              <span style="font-size: 1.4rem;">🎯</span>
              <div>
                <h3 style="font-size: 1.25rem; margin: 0; font-weight: 700;">
                  Career Field Match <span class="text-gradient">Recommendations</span>
                </h3>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.25rem; line-height: 1.4;">
                  Benchmark your competencies across all engineering disciplines to find your highest-impact fit.
                </p>
              </div>
            </div>
            <span class="badge badge-warning">Awaiting Resume</span>
          </div>
          <div style="text-align: center; padding: 2.25rem 1.5rem; background: rgba(11, 18, 34, 0.55); border: 1.5px dashed rgba(99, 102, 241, 0.28); border-radius: var(--radius-md);">
            <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">📊</div>
            <h4 style="font-size: 1.05rem; font-weight: 700; color: #ffffff; margin-bottom: 0.35rem;">Career Path Recommendations Awaiting Analysis</h4>
            <p style="font-size: 0.85rem; color: var(--text-secondary); max-width: 480px; margin: 0 auto; line-height: 1.45;">
              Upload your resume above to calculate real-time alignment scores across ML Engineer, DevOps / SRE, Full-Stack AI, Security, Data Analytics, and AI Product Management.
            </p>
          </div>
        </div>
      `}

      <!-- ─── Recommended Study Resources Mount ─── -->
      <div id="study-resources-mount"></div>
    `;

    // Mount StudyResourcesPanel with empty/populated state
    const mountPoint = this.container.querySelector('#study-resources-mount');
    if (mountPoint) {
      this.studyPanel = new StudyResourcesPanel(mountPoint, {
        missingKeywords: this.auditData.missingKeywords || [],
        targetRole: currentCareer.title,
        isUploaded: isUploaded
      });
      this.studyPanel.render();
    }

    this.bindEvents();
  }

  async processResumeText(rawText, sourceLabel = 'Resume') {
    if (!rawText || rawText.trim().length < 10) {
      this.errorMessage = 'Resume content was too short to analyze. Please provide a complete resume document or paste full experience & skills text.';
      this.statusMessage = '';
      this.isProcessing = false;
      this.render();
      return;
    }

    this.isProcessing = true;
    this.errorMessage = '';
    this.statusMessage = `Analyzing ${sourceLabel} across industry careers...`;
    this.lastAnalyzedText = rawText;
    this.render();

    // Visual feedback delay for AI parsing
    await new Promise(r => setTimeout(r, 650));

    try {
      const analysis = ResumeParser.analyzeText(rawText, studentStore.profile.targetCareerId);

      this.auditData.uploaded = true;
      this.auditData.score = analysis.score;
      this.auditData.status = analysis.status;
      this.auditData.foundKeywords = analysis.foundKeywords;
      this.auditData.missingKeywords = analysis.missingKeywords;
      this.auditData.bulletRewrites = analysis.bulletRewrites;
      this.careerRecommendations = analysis.careerRecommendations;
      this.bestFitCareer = analysis.bestFitCareer;

      studentStore.profile.scores.resume = analysis.score;
      studentStore.recalculateScores();
      studentStore.notify();

      this.statusMessage = `✓ Successfully scanned ${sourceLabel} (${analysis.foundKeywords.length} skills detected). Top match: ${this.bestFitCareer.title} (${this.bestFitCareer.matchScore}% fit)`;
      this.isProcessing = false;
      this.render();
    } catch (err) {
      this.errorMessage = `Error analyzing resume: ${err.message || 'Unknown error'}`;
      this.statusMessage = '';
      this.isProcessing = false;
      this.auditData.uploaded = false;
      this.render();
    }
  }

  bindEvents() {
    // Mode tabs
    const tabUpload = this.container.querySelector('#tab-btn-upload');
    const tabPaste = this.container.querySelector('#tab-btn-paste');

    if (tabUpload) {
      tabUpload.onclick = () => {
        this.activeTab = 'upload';
        this.render();
      };
    }

    if (tabPaste) {
      tabPaste.onclick = () => {
        this.activeTab = 'paste';
        this.render();
      };
    }

    // Select file button & dropzone click
    const selectFileBtn = this.container.querySelector('#select-file-btn');
    const fileInput = this.container.querySelector('#resume-upload-input');
    const dropzoneBox = this.container.querySelector('#dropzone-box');

    if (selectFileBtn && fileInput) {
      selectFileBtn.onclick = (e) => {
        e.stopPropagation();
        fileInput.click();
      };
    }

    if (dropzoneBox && fileInput) {
      dropzoneBox.onclick = () => fileInput.click();

      dropzoneBox.ondragover = (e) => {
        e.preventDefault();
        dropzoneBox.style.borderColor = 'var(--cyan-ai)';
      };

      dropzoneBox.ondragleave = () => {
        dropzoneBox.style.borderColor = 'rgba(6, 182, 212, 0.4)';
      };

      dropzoneBox.ondrop = async (e) => {
        e.preventDefault();
        dropzoneBox.style.borderColor = 'rgba(6, 182, 212, 0.4)';
        if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          const file = e.dataTransfer.files[0];
          this.uploadedFileName = file.name;
          const text = await ResumeParser.extractTextFromFile(file);
          this.processResumeText(text, file.name);
        }
      };
    }

    if (fileInput) {
      fileInput.onchange = async (e) => {
        const file = e.target.files && e.target.files[0];
        if (file) {
          this.uploadedFileName = file.name;
          const text = await ResumeParser.extractTextFromFile(file);
          this.processResumeText(text, file.name);
        }
      };
    }

    // Analyze pasted text
    const analyzePastedBtn = this.container.querySelector('#analyze-pasted-btn');
    const pasteTextarea = this.container.querySelector('#resume-paste-input');
    if (analyzePastedBtn && pasteTextarea) {
      analyzePastedBtn.onclick = () => {
        const text = pasteTextarea.value.trim();
        this.processResumeText(text, 'Pasted Text');
      };
    }

    // Switch target career button click
    const switchBtns = this.container.querySelectorAll('.switch-target-career-btn');
    switchBtns.forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const careerId = btn.dataset.careerId;
        if (careerId) {
          studentStore.setTargetCareer(careerId);
          if (this.auditData.uploaded && this.lastAnalyzedText) {
            const newAnalysis = ResumeParser.analyzeText(this.lastAnalyzedText, careerId);
            this.auditData.score = newAnalysis.score;
            this.auditData.status = newAnalysis.status;
            this.auditData.missingKeywords = newAnalysis.missingKeywords;
            this.careerRecommendations = newAnalysis.careerRecommendations;
            this.bestFitCareer = newAnalysis.bestFitCareer;
          }
          this.statusMessage = `✓ Target career switched to ${studentStore.getCurrentCareer().title}`;
          this.render();
        }
      };
    });

    // Copy bullet button
    const copyBtns = this.container.querySelectorAll('.copy-bullet-btn');
    copyBtns.forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const text = decodeURIComponent(btn.dataset.text);
        navigator.clipboard.writeText(text).then(() => {
          btn.innerText = '✓ Copied!';
          setTimeout(() => { btn.innerText = '📋 Copy Optimized Bullet'; }, 2000);
        });
      };
    });

    // Re-scan button
    const rescanBtn = this.container.querySelector('#rescan-resume-btn');
    if (rescanBtn && this.auditData.uploaded) {
      rescanBtn.onclick = () => {
        const textToAnalyze = this.lastAnalyzedText || (this.auditData.foundKeywords ? `Skills: ${this.auditData.foundKeywords.join(', ')}` : '');
        this.processResumeText(textToAnalyze, 'Current Resume Profile');
      };
    }
  }
}
