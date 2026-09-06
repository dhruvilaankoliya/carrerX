/* ==========================================================================
   CareerX - Resume Analysis View
   ========================================================================== */

import { ResumeScanner } from '../components/resumeScanner.js';

export class ResumeView {
  constructor(container) {
    this.container = container;
    this.scanner = null;
  }

  render() {
    this.container.innerHTML = `
      <div class="container" style="padding-top:2rem;padding-bottom:4rem;">
        <div style="margin-bottom:2rem;">
          <div class="section-tag"><span class="dot"></span> Resume Intelligence Engine</div>
          <h2>Resume <span class="text-gradient">AI Analysis & ATS Optimizer</span></h2>
          <p>Real-time ATS keyword gap detection, impact-metric bullet rewrites, and score tracking against your target role.</p>
        </div>
        <div id="resume-scanner-root"></div>
      </div>
    `;

    this.scanner = new ResumeScanner(document.getElementById('resume-scanner-root'));
    this.scanner.render();
  }
}
