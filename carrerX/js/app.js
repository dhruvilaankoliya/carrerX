/* ==========================================================================
   CareerX - Main Application Entry Point
   ========================================================================== */

import { router } from './router.js';
import { studentStore } from './data/studentProfile.js';
import { aiMentor } from './components/aiMentor.js';

// Views
import { HomeView }       from './views/homeView.js';
import { DashboardView }  from './views/dashboardView.js';
import { AssessmentView } from './views/assessmentView.js';
import { SkillGapView }   from './views/skillGapView.js';
import { RoadmapView }    from './views/roadmapView.js';
import { ExplorerView }   from './views/explorerView.js';
import { ResumeView }     from './views/resumeView.js';
import { ScoreView }      from './views/scoreView.js';
import { MentorView }     from './views/mentorView.js';

// ─── Register all routes ─────────────────────────────────────────────────────
router
  .register('home',       (el) => new HomeView(el))
  .register('dashboard',  (el) => new DashboardView(el))
  .register('assessment', (el) => new AssessmentView(el))
  .register('skill-gap',  (el) => new SkillGapView(el))
  .register('roadmap',    (el) => new RoadmapView(el))
  .register('explorer',   (el) => new ExplorerView(el))
  .register('resume',     (el) => new ResumeView(el))
  .register('score',      (el) => new ScoreView(el))
  .register('mentor',     (el) => new MentorView(el));

// ─── Bootstrap navbar ─────────────────────────────────────────────────────────
function buildNavbar() {
  const profile = studentStore.profile;
  const career  = studentStore.getCurrentCareer();

  const nav = document.getElementById('top-navbar');
  if (!nav) return;

  nav.innerHTML = `
    <div class="nav-container">
      <!-- Logo -->
      <a class="brand-logo" href="#home" id="logo-link">
        <div class="brand-icon" style="overflow:hidden; padding:0; background:transparent;">
          <img src="/logo.png" alt="CareerrX Logo" style="width:100%; height:100%; object-fit:cover; border-radius:8px;" />
        </div>
        CareerrX<span class="brand-badge">AI</span>
      </a>

      <!-- Nav Links -->
      <ul class="nav-links" id="main-nav-links">
        <li><a class="nav-link" data-route="home"       href="#home">Home</a></li>
        <li><a class="nav-link" data-route="dashboard"  href="#dashboard">Dashboard</a></li>
        <li><a class="nav-link" data-route="explorer"   href="#explorer">Career Explorer</a></li>
        <li><a class="nav-link" data-route="skill-gap"  href="#skill-gap">Skill Gap</a></li>
        <li><a class="nav-link" data-route="roadmap"    href="#roadmap">Roadmap</a></li>
        <li><a class="nav-link" data-route="resume"     href="#resume">Resume AI</a></li>
        <li><a class="nav-link" data-route="score"      href="#score">Readiness</a></li>
        <li><a class="nav-link" data-route="mentor"     href="#mentor">AI Mentor</a></li>
      </ul>

      <!-- Right Actions -->
      <div class="nav-actions">
        <div class="target-role-selector">
          <span class="role-pulse-dot"></span>
          <select id="target-role-select" title="Switch Target Career">
            <option value="ml-engineer"        ${profile.targetCareerId === 'ml-engineer'        ? 'selected' : ''}>ML Engineer</option>
            <option value="fullstack-architect" ${profile.targetCareerId === 'fullstack-architect' ? 'selected' : ''}>Full Stack Architect</option>
            <option value="cloud-devops"       ${profile.targetCareerId === 'cloud-devops'       ? 'selected' : ''}>Cloud DevOps</option>
            <option value="data-scientist"     ${profile.targetCareerId === 'data-scientist'     ? 'selected' : ''}>Data Scientist</option>
            <option value="cybersecurity"      ${profile.targetCareerId === 'cybersecurity'      ? 'selected' : ''}>Cybersecurity</option>
            <option value="ai-product-manager" ${profile.targetCareerId === 'ai-product-manager' ? 'selected' : ''}>AI Product Manager</option>
          </select>
          <span style="font-size:0.8rem;color:var(--cyan-ai);font-weight:700;">${profile.overallScore}</span>
        </div>
        <button class="btn btn-primary btn-sm" id="nav-start-assessment">Start Free Assessment</button>
        <button class="mobile-nav-toggle" id="mobile-toggle">☰</button>
      </div>
    </div>
  `;

  // Target role switcher — live recalculation
  const roleSelect = document.getElementById('target-role-select');
  if (roleSelect) {
    roleSelect.addEventListener('change', () => {
      studentStore.setTargetCareer(roleSelect.value);
      buildNavbar(); // Rebuild to reflect new score
      router.navigate(router.currentRoute); // Re-render current view
    });
  }

  document.getElementById('nav-start-assessment')?.addEventListener('click', () => router.navigate('assessment'));
  document.getElementById('logo-link')?.addEventListener('click', () => router.navigate('home'));

  // Nav links via data-route (prevent default hash nav and use router)
  document.querySelectorAll('.nav-link[data-route]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      router.navigate(link.dataset.route);
    });
  });

  // Scroll effect on navbar
  window.addEventListener('scroll', () => {
    const navbar = document.getElementById('top-navbar');
    if (navbar) {
      if (window.scrollY > 20) navbar.classList.add('scrolled');
      else navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  // Mobile toggle
  document.getElementById('mobile-toggle')?.addEventListener('click', () => {
    const links = document.getElementById('main-nav-links');
    if (links) links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
  });
}

// ─── Build AI Mentor floating drawer ─────────────────────────────────────────
function buildMentorDrawer() {
  const drawerMount = document.getElementById('mentor-drawer-mount');
  if (!drawerMount) return;
  drawerMount.innerHTML = aiMentor.renderDrawer();
  aiMentor.bindEvents();
}

// ─── Floating AI Mentor button click ─────────────────────────────────────────
function bindFloatingMentor() {
  document.getElementById('floating-ai-mentor')?.addEventListener('click', () => {
    aiMentor.toggle(true);
    buildMentorDrawer();
  });
}

// ─── Toast system ────────────────────────────────────────────────────────────
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const icons = { info: 'ℹ️', success: '✅', warning: '⚠️' };
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `${icons[type] || '✨'} ${message}`;
  container.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

// ─── App initialization ───────────────────────────────────────────────────────
function init() {
  buildNavbar();
  buildMentorDrawer();
  bindFloatingMentor();

  // Re-build navbar on store changes (score updates etc.)
  studentStore.subscribe(() => {
    buildNavbar();
    buildMentorDrawer();
  });

  // Start router
  router.start();

  // Expose toast globally for component use
  window.careerxToast = showToast;
}

document.addEventListener('DOMContentLoaded', init);
