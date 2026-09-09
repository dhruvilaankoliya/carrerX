/* ==========================================================================
   CareerX - AI Advisor Full-Page View (Clean & Minimal)
   ========================================================================== */

import { aiMentor } from '../components/aiMentor.js';
import { studentStore } from '../data/studentProfile.js';

export class MentorView {
  constructor(container) {
    this.container = container;
  }

  render() {
    const profile = studentStore.profile;
    const career  = studentStore.getCurrentCareer();

    this.container.innerHTML = `
      <div class="container" style="padding-top:1.5rem;padding-bottom:3rem;">
        <div style="margin-bottom:1.5rem;">
          <div class="section-tag">Advisory Workspace</div>
          <h2>AI Career Advisor</h2>
          <p>Context-aware assistance based on your current skill profile and roadmap progress.</p>
        </div>

        <div style="display:grid;grid-template-columns:1fr 2fr;gap:1.5rem;align-items:start;">
          <!-- Context Panel -->
          <div style="display:flex;flex-direction:column;gap:1.25rem;">
            <div class="glass-card">
              <h4 style="margin-bottom:0.75rem;font-size:0.95rem;">Active Profile Context</h4>
              <div style="display:flex;flex-direction:column;gap:0.5rem;font-size:0.82rem;">
                <div style="display:flex;justify-content:space-between;">
                  <span style="color:var(--text-tertiary);">Student</span>
                  <span style="color:var(--text-primary);font-weight:500;">${profile.name}</span>
                </div>
                <div style="display:flex;justify-content:space-between;">
                  <span style="color:var(--text-tertiary);">Target Role</span>
                  <span style="color:var(--text-primary);font-weight:500;">${career.title}</span>
                </div>
                <div style="display:flex;justify-content:space-between;">
                  <span style="color:var(--text-tertiary);">Readiness</span>
                  <span style="color:var(--text-primary);font-weight:500;">${profile.overallScore}/100</span>
                </div>
                <div style="display:flex;justify-content:space-between;">
                  <span style="color:var(--text-tertiary);">Stage</span>
                  <span style="color:var(--text-primary);font-weight:500;">Stage 3 (68%)</span>
                </div>
              </div>
            </div>

            <div class="glass-card">
              <h4 style="margin-bottom:0.75rem;font-size:0.95rem;">Suggested Queries</h4>
              <div style="display:flex;flex-direction:column;gap:0.4rem;">
                ${[
                  { key: 'capstone', label: 'Recommended capstone projects', },
                  { key: 'ats',      label: 'How to fix missing resume keywords', },
                  { key: 'interview', label: 'Top ML interview questions', },
                ].map(p => `
                  <button class="btn btn-sm btn-glass mentor-chip-inline" data-key="${p.key}" style="text-align:left;justify-content:flex-start;">
                    ${p.label}
                  </button>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Expanded Chat Interface -->
          <div style="background:var(--bg-secondary);border:1px solid var(--border-color);border-radius:var(--radius-md);overflow:hidden;display:flex;flex-direction:column;min-height:540px;">
            <!-- Header -->
            <div style="padding:1rem 1.25rem;border-bottom:1px solid var(--border-color);display:flex;align-items:center;gap:0.6rem;background:var(--bg-primary);">
              <div style="width:28px;height:28px;border-radius:var(--radius-sm);background:var(--accent);display:flex;align-items:center;justify-content:center;color:#fff;font-size:0.85rem;">🤖</div>
              <div>
                <div style="font-weight:600;font-size:0.9rem;color:var(--text-primary);">Advisor Assistant</div>
                <div style="font-size:0.72rem;color:var(--text-secondary);">
                  Grounded in ${career.title} path
                </div>
              </div>
            </div>

            <!-- Messages -->
            <div id="mentor-inline-messages" style="flex:1;overflow-y:auto;padding:1.25rem;display:flex;flex-direction:column;gap:0.85rem;">
              ${aiMentor.renderMessages()}
            </div>

            <!-- Prompt Chips -->
            <div style="padding:0.4rem 1.25rem;border-top:1px solid var(--border-color);display:flex;gap:0.4rem;overflow-x:auto;">
              ${Object.entries(aiMentor.promptBank).map(([k, p]) => `
                <button class="prompt-chip mentor-inline-chip" data-key="${k}">${p.prompt.substring(0, 28)}...</button>
              `).join('')}
            </div>

            <!-- Input -->
            <div style="padding:0.75rem 1.25rem 1rem;background:var(--bg-primary);border-top:1px solid var(--border-color);">
              <form id="mentor-inline-form" class="mentor-input-form">
                <input type="text" id="mentor-inline-input" class="mentor-input" placeholder="Ask about your gaps, projects, or roadmap..." autocomplete="off"/>
                <button type="submit" class="mentor-send-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    document.querySelectorAll('.mentor-chip-inline, .mentor-inline-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.key;
        if (aiMentor.promptBank[key]) {
          aiMentor.messages.push({ sender: 'user', text: aiMentor.promptBank[key].prompt });
          const msgEl = document.getElementById('mentor-inline-messages');
          if (msgEl) msgEl.innerHTML = aiMentor.renderMessages();

          setTimeout(() => {
            aiMentor.messages.push({ sender: 'ai', text: aiMentor.promptBank[key].reply });
            if (msgEl) {
              msgEl.innerHTML = aiMentor.renderMessages();
              msgEl.scrollTop = msgEl.scrollHeight;
            }
          }, 400);
        }
      });
    });

    const form = document.getElementById('mentor-inline-form');
    const input = document.getElementById('mentor-inline-input');
    if (form && input) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = input.value.trim();
        if (!query) return;
        input.value = '';
        aiMentor.handleUserCustomMessage(query);
        const msgEl = document.getElementById('mentor-inline-messages');
        if (msgEl) {
          msgEl.innerHTML = aiMentor.renderMessages();
          setTimeout(() => {
            if (msgEl) {
              msgEl.innerHTML = aiMentor.renderMessages();
              msgEl.scrollTop = msgEl.scrollHeight;
            }
          }, 500);
        }
      });
    }
  }
}
