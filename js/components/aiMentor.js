/* ==========================================================================
   CareerX - AI Career Mentor Intelligent Conversational Assistant
   ========================================================================== */

import { studentStore } from '../data/studentProfile.js';

export class AIMentor {
  constructor() {
    this.isOpen = false;
    this.messages = [
      {
        sender: 'ai',
        text: `👋 Hey **Alex**! I'm your **CareerX AI Mentor**. I'm currently tracking your progression toward **Machine Learning Engineer** (Readiness: 81/100). \n\nYour next high-yield opportunity is completing your **MLOps & Docker containerization capstone** to unlock Tier-1 company readiness (+4.5% boost). How can I assist your career journey today?`
      }
    ];

    this.promptBank = {
      'capstone': {
        prompt: 'Suggest a standout capstone project for my ML target',
        reply: `### 🚀 Recommended Capstone: Multimodal RAG Agent with Docker
Based on your current skill gap (MLOps at 48%, PyTorch at 88%), here is an industry-grade blueprint:

1. **Architecture**: Build a **FastAPI backend** that processes PDF/Audio documents with **Llama-3**, embeds them into a **Pinecone vector store**, and streams answers with citations.
2. **Containerization**: Write a multi-stage \`Dockerfile\` optimizing image size down to <500MB with GPU runtime support.
3. **CI/CD**: Add a GitHub Action workflow that runs automated unit tests and lints your model pipeline on every commit.

💡 **Impact**: Adding this to your resume will bridge 3 critical keyword gaps (Docker, FastAPI, Vector DBs) and raise your ATS match score from **74 to 88**!`
      },
      'ats': {
        prompt: 'How can I fix the missing keywords in my resume?',
        reply: `### 📄 High-Impact Resume Fixes for AI/ML Roles
Your resume currently scores **74/100** on top ATS systems.

**Critical Missing Keywords:**
- \`Docker\`, \`Kubernetes\`, \`FastAPI\`, \`Vector Search / Pinecone\`, \`CI/CD Pipelines\`

**Quick Action:**
In your *Projects* section, instead of writing *"Built a python model for document search"*, upgrade it to:
> *"Architected high-throughput RAG search engine with Llama-3 and Pinecone, deploying via Docker container on AWS with 99.4% endpoint availability."*

Click **Resume Intelligence** in the top navigation to see line-by-line AI re-writes!`
      },
      'interview': {
        prompt: 'What are the top interview questions for Junior ML Engineers?',
        reply: `### 🎙️ Top 4 Technical Interview Questions for ML Engineers

1. **Transformer Mechanics**: *"How does Multi-Head Self-Attention scale with sequence length, and how does FlashAttention optimize GPU memory bandwidth?"*
2. **MLOps & Latency**: *"How do you handle model latency spikes when deploying a large neural network to production under 2,000 QPS?"*
3. **Loss Functions**: *"When would you choose Focal Loss over standard Cross-Entropy for class-imbalanced datasets?"*
4. **System Design**: *"Design an end-to-end real-time recommendation system for an e-commerce platform with 10M active users."*

Would you like to simulate a 3-minute mock interview on any of these?`
      }
    };
  }

  renderDrawer() {
    return `
      <div id="ai-mentor-drawer" class="mentor-drawer ${this.isOpen ? 'open' : ''}">
        <div class="mentor-drawer-header">
          <div class="mentor-header-left">
            <div class="mentor-avatar-badge">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2">
                <path d="M12 2a8 8 0 0 0-8 8c0 3.37 2.1 6.25 5.09 7.41L9 22l3.5-1.5L16 22l-.09-4.59A8.001 8.001 0 0 0 12 2z"/>
              </svg>
            </div>
            <div>
              <div style="font-weight: 700; font-size: 1rem; color: #ffffff;">CareerX AI Mentor</div>
              <div style="font-size: 0.72rem; color: var(--cyan-ai); display: flex; align-items: center; gap: 0.35rem;">
                <span style="width: 6px; height: 6px; border-radius: 50%; background: #10b981;"></span> Context: Machine Learning Engineer
              </div>
            </div>
          </div>
          <button id="close-mentor-btn" class="modal-close-btn" aria-label="Close Mentor">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div id="mentor-chat-body" class="mentor-chat-body">
          ${this.renderMessages()}
        </div>

        <div class="mentor-chips-container">
          <button class="prompt-chip" data-key="capstone">🛠️ Standout Capstone Project</button>
          <button class="prompt-chip" data-key="ats">📄 Fix Missing Resume Keywords</button>
          <button class="prompt-chip" data-key="interview">🎙️ Top ML Interview Questions</button>
        </div>

        <div class="mentor-input-footer">
          <form id="mentor-form" class="mentor-input-form">
            <input type="text" id="mentor-input-field" class="mentor-input" placeholder="Ask your AI Mentor anything about your career path..." autocomplete="off" />
            <button type="submit" class="mentor-send-btn" aria-label="Send">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      </div>
    `;
  }

  renderMessages() {
    return this.messages.map(msg => `
      <div class="chat-message ${msg.sender}">
        <div class="msg-bubble">
          ${this.formatMarkdown(msg.text)}
        </div>
      </div>
    `).join('');
  }

  formatMarkdown(text) {
    let formatted = text
      .replace(/### (.*?)\n/g, '<h4 style="color:#38bdf8; margin: 0.5rem 0;">$1</h4>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code style="background:rgba(0,0,0,0.35); padding:2px 6px; border-radius:4px; font-family:monospace; color:#38bdf8;">$1</code>')
      .replace(/\n\n/g, '<p style="margin: 0.5rem 0;"></p>')
      .replace(/\n/g, '<br/>');
    return formatted;
  }

  toggle(openState) {
    this.isOpen = openState !== undefined ? openState : !this.isOpen;
    const drawer = document.getElementById('ai-mentor-drawer');
    if (drawer) {
      if (this.isOpen) drawer.classList.add('open');
      else drawer.classList.remove('open');
    }
  }

  bindEvents() {
    const closeBtn = document.getElementById('close-mentor-btn');
    if (closeBtn) {
      closeBtn.onclick = () => this.toggle(false);
    }

    const chips = document.querySelectorAll('.prompt-chip');
    chips.forEach(chip => {
      chip.onclick = () => {
        const key = chip.getAttribute('data-key');
        if (this.promptBank[key]) {
          this.handleUserMessage(this.promptBank[key].prompt, this.promptBank[key].reply);
        }
      };
    });

    const form = document.getElementById('mentor-form');
    const input = document.getElementById('mentor-input-field');
    if (form && input) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const query = input.value.trim();
        if (!query) return;
        input.value = '';
        this.handleUserCustomMessage(query);
      };
    }
  }

  handleUserMessage(userText, simulatedReply) {
    this.messages.push({ sender: 'user', text: userText });
    this.updateChatUI();

    setTimeout(() => {
      this.messages.push({ sender: 'ai', text: simulatedReply });
      this.updateChatUI();
    }, 600);
  }

  handleUserCustomMessage(userText) {
    this.messages.push({ sender: 'user', text: userText });
    this.updateChatUI();

    const currentCareer = studentStore.getCurrentCareer();
    setTimeout(() => {
      const genericReply = `### 🧠 AI Career Recommendation for ${currentCareer.title}

Regarding your query: *"**${userText}**"*, here is how it ties to your target roadmap:

- **Industry Expectation**: Engineering teams look for demonstrated capability with tools like \`${currentCareer.topTools.slice(0, 3).join(', ')}\`.
- **Actionable Next Step**: Check your **Skill Gap Analysis** tab to run a benchmark simulation against this specific domain.
- **Estimated ROI**: Completing this milestone will add approximately **+3.0%** to your total readiness score!`;

      this.messages.push({ sender: 'ai', text: genericReply });
      this.updateChatUI();
    }, 800);
  }

  updateChatUI() {
    const chatBody = document.getElementById('mentor-chat-body');
    if (chatBody) {
      chatBody.innerHTML = this.renderMessages();
      chatBody.scrollTop = chatBody.scrollHeight;
    }
  }
}

export const aiMentor = new AIMentor();
