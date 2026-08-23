/* ==========================================================================
   CareerX - Assessment View (wraps AssessmentWizard component)
   ========================================================================== */

import { AssessmentWizard } from '../components/assessmentWizard.js';

export class AssessmentView {
  constructor(container) {
    this.container = container;
    this.wizard = null;
  }

  render() {
    this.container.innerHTML = `
      <div style="padding-top:2rem;padding-bottom:4rem;">
        <div class="container" style="max-width:900px;">
          <div style="margin-bottom:2rem;text-align:center;">
            <div class="section-tag"><span class="dot"></span> AI Career Profiling</div>
            <h2>Deep <span class="text-gradient">Career Intelligence Assessment</span></h2>
            <p>Answer 5 curated questions and let our AI synthesize your perfect career trajectory in seconds.</p>
          </div>
        </div>
        <div id="assessment-wizard-root"></div>
      </div>
    `;

    this.wizard = new AssessmentWizard(document.getElementById('assessment-wizard-root'));
    this.wizard.render();
  }
}
