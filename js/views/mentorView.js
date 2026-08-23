/* ==========================================================================
   CareerX - AI Mentor Full-Page View
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
      <div class="container" style="padding-top:2rem;padding-bottom:4rem;">
        <div style="margin-bottom:2rem;">
          <div class="section-tag"><span class="dot"></span> Intelligent AI Guidance</div>
          <h2>AI Career <span class="text-gradient">Mentor</span></h2>
          <p>Context-aware advisor that knows your skill gaps, target career, and roadmap stage. Ask anything.</p>
        </div>

        <div style="display:grid;grid-template-columns:1fr 2fr;gap:2rem;align-items:start;">
          <!-- Context Panel -->
          <div style="display:flex;flex-direction:column;gap:1.5rem;">
            <div class="glass-card" style="border-color:rgba(6,182,212,0.3);">
              <h4 style="margin-bottom:1rem;color:#38bdf8;">🧠 AI Context Loaded</h4>
              <div style="display:flex;flex-direction:column;gap:0.75rem;font-size:0.85rem;">
                <div style="display:flex;justify-content:space-between;">
                  <span style="color:var(--text-tertiary);">Student</span>
                  <span style="color:#fff;font-weight:600;">${profile.name}</span>
                </div>
                <div style="display:flex;justify-content:space-between;">
                  <span style="color:var(--text-tertiary);">Target Role</span>
                  <span style="color:#38bdf8;font-weight:600;">${career.title}</span>
                </div>
                <div style="display:flex;justify-content:space-between;">
                  <span style="color:var(--text-tertiary);">Readiness</span>
                  <span style="color:#34d399;font-weight:600;">${profile.overallScore}/100</span>
                </div>
                <div style="display:flex;justify-content:space-between;">
                  <span style="color:var(--text-tertiary);">Stage</span>
                  <span style="color:#c084fc;font-weight:600;">Stage 3 (68%)</span>
                </div>
              </div>
            </div>

            <div class="glass-card">
              <h4 style="margin-bottom:0.75rem;">💡 Suggested Prompts</h4>
              <div style="display:flex;flex-direction:column;gap:0.5rem;">
                ${[
                  { key: 'capstone', label: '🛠️ What capstone should I build?', },
                  { key: 'ats',      label: '📄 How to fix resume keywords?', },
                  { key: 'interview', label: '🎙️ Top ML interview questions?', },
                ].map(p => `
                  <button class="btn btn-sm btn-glass mentor-chip-inline" data-key="${p.key}" style="text-align:left;justify-content:flex-start;">
                    ${p.label}
                  </button>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Expanded Chat Interface -->
          <div style="background:rgba(11,18,34,0.85);backdrop-filter:blur(16px);border:1px solid rgba(6,182,212,0.25);border-radius:var(--radius-xl);overflow:hidden;display:flex;flex-direction:column;min-height:600px;">
            <!-- Header -->
            <div style="padding:1.25rem 1.5rem;border-bottom:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;gap:0.75rem;background:rgba(7,11,20,0.4);">
              <div style="width:36px;height:36px;border-radius:9px;background:linear-gradient(135deg,#06b6d4,#8b5cf6);display:flex;align-items:center;justify-content:center;">🧠</div>
              <div>
                <div style="font-weight:700;color:#fff;">CareerX AI Mentor</div>
                <div style="font-size:0.72rem;color:var(--cyan-ai);display:flex;align-items:center;gap:0.35rem;">
                  <span style="width:6px;height:6px;border-radius:50%;background:#10b981;display:inline-block;"></span> 
                  Contextualised to ${career.title}
                </div>
              </div>
            </div>

            <!-- Messages -->
            <div id="mentor-inline-messages" style="flex:1;overflow-y:auto;padding:1.5rem;display:flex;flex-direction:column;gap:1rem;">
              ${aiMentor.renderMessages()}
            </div>

            <!-- Prompt Chips -->
            <div style="padding:0.5rem 1.5rem;border-top:1px solid rgba(255,255,255,0.05);display:flex;gap:0.5rem;overflow-x:auto;">
              ${Object.entries(aiMentor.promptBank).map(([k, p]) => `
                <button class="prompt-chip mentor-inline-chip" data-key="${k}">${p.prompt.substring(0, 30)}...</button>
              `).join('')}
            </div>

            <!-- Input -->
            <div style="padding:1rem 1.5rem 1.5rem;background:rgba(7,11,20,0.6);border-top:1px solid rgba(255,255,255,0.08);">
              <form id="mentor-inline-form" class="mentor-input-form">
                <input type="text" id="mentor-inline-input" class="mentor-input" placeholder="Ask about your career path, gaps, projects, interviews..." autocomplete="off"/>
                <button type="submit" class="mentor-send-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
    // Inline suggested prompts
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
          }, 600);
        }
      });
    });

    // Inline form submit
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
          }, 900);
        }
      });
    }
  }
}
